"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { bulkAbsensiSchema } from "../schema/absensiSchema";
import type { BulkAbsensiInput } from "../schema/absensiSchema";
import { StatusAbsensi } from "@/interface/enums";

export async function submitAbsensi(input: BulkAbsensiInput) {
  console.log("[submitAbsensi] Input received:", input);

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    console.log(
      "[submitAbsensi] Current user:",
      currentUser?.id,
      currentUser?.role
    );

    if (!currentUser) {
      console.log("[submitAbsensi] No user session");
      return {
        success: false,
        message: "Anda harus login terlebih dahulu",
        data: null,
      };
    }

    if (currentUser.role !== "GURU") {
      console.log("[submitAbsensi] User is not GURU:", currentUser.role);
      return {
        success: false,
        message: "Akses ditolak. Hanya guru yang dapat mengakses halaman ini",
        data: null,
      };
    }
    // Validate input
    console.log("[submitAbsensi] Validating input with schema");
    const validatedInput = bulkAbsensiSchema.parse(input);
    const { tanggal, kelasId, attendanceRecords } = validatedInput;
    console.log("[submitAbsensi] Validated input:", {
      tanggal,
      kelasId,
      attendanceRecords: attendanceRecords.length,
    });

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: { userId: currentUser.id },
      select: { id: true, namaLengkap: true },
    });

    console.log("[submitAbsensi] Teacher found:", guru?.id);

    if (!guru) {
      console.log(
        "[submitAbsensi] Teacher not found for user:",
        currentUser.id
      );
      return {
        success: false,
        message: "Data guru tidak ditemukan",
        data: null,
      };
    }

    // Verify teacher teaches this class
    console.log("[submitAbsensi] Checking if teacher teaches class:", kelasId);
    const teachesClass = await prisma.jadwal.findFirst({
      where: {
        guruId: guru.id,
        kelasId: kelasId,
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    console.log("[submitAbsensi] Teacher teaches class:", !!teachesClass);

    if (!teachesClass) {
      console.log("[submitAbsensi] Teacher does not teach this class");
      return {
        success: false,
        message: "Anda tidak mengajar di kelas ini",
        data: null,
      };
    }

    // Validate holiday conflict
    console.log("[submitAbsensi] Checking for holidays on:", tanggal);
    const holidays = await prisma.kalender.findMany({
      where: {
        tanggalMulai: {
          lte: tanggal,
        },
        OR: [
          {
            tanggalSelesai: {
              gte: tanggal,
            },
          },
          {
            tanggalSelesai: null,
            tanggalMulai: {
              lte: tanggal,
            },
          },
        ],
      },
    });

    console.log("[submitAbsensi] Holidays found:", holidays.length);

    if (holidays.length > 0) {
      console.log("[submitAbsensi] Cannot save on holiday:", holidays[0]);
      return {
        success: false,
        message: `Tidak dapat mengisi absensi pada tanggal libur: ${
          holidays[0]?.keterangan || "Hari libur"
        }`,
        data: null,
      };
    }

    // Verify all students belong to the class
    const classStudents = await prisma.siswa.findMany({
      where: {
        kelas: {
          some: {
            id: kelasId,
          },
        },
        status: "AKTIF",
      },
      select: {
        id: true,
      },
    });

    const classStudentIds = new Set(classStudents.map((s) => s.id));
    const invalidStudents = attendanceRecords.filter(
      (record) => !classStudentIds.has(record.siswaId)
    );

    if (invalidStudents.length > 0) {
      return {
        success: false,
        message: "Beberapa siswa tidak terdaftar di kelas ini",
        data: null,
      };
    }

    // Delete existing attendance for this date and class
    await prisma.absensi.deleteMany({
      where: {
        kelasId: kelasId,
        tanggal: {
          gte: new Date(
            tanggal.getFullYear(),
            tanggal.getMonth(),
            tanggal.getDate()
          ),
          lt: new Date(
            tanggal.getFullYear(),
            tanggal.getMonth(),
            tanggal.getDate() + 1
          ),
        },
      },
    });

    // Create attendance records
    const absensiData = attendanceRecords.map((record) => ({
      tanggal: tanggal,
      bulan: tanggal.getMonth() + 1,
      tahun: tanggal.getFullYear(),
      status: record.status,
      keterangan: record.keterangan || null,
      siswaId: record.siswaId,
      kelasId: kelasId,
      guruId: guru.id,
    }));

    console.log(
      "[submitAbsensi] Creating attendance records:",
      absensiData.length
    );
    console.log("[submitAbsensi] Sample record:", absensiData[0]);

    const result = await prisma.absensi.createMany({
      data: absensiData,
    });

    console.log("[submitAbsensi] Records created:", result.count);

    // Revalidate pages
    revalidatePath("/guru/absensi");
    revalidatePath(`/guru/absensi/${kelasId}`);

    console.log("[submitAbsensi] Success - returning result");
    return {
      success: true,
      message: `Absensi berhasil disimpan untuk ${result.count} siswa di kelas ${teachesClass.kelas.namaKelas}`,
      data: {
        count: result.count,
        tanggal: tanggal,
        kelas: teachesClass.kelas.namaKelas,
      },
    };
  } catch (error) {
    console.error("[submitAbsensi] Error occurred:", error);
    console.error(
      "[submitAbsensi] Error name:",
      error instanceof Error ? error.name : typeof error
    );
    console.error(
      "[submitAbsensi] Error message:",
      error instanceof Error ? error.message : String(error)
    );

    if (error instanceof Error && error.name === "ZodError") {
      console.error("[submitAbsensi] Zod validation error:", error);
      return {
        success: false,
        message: "Data input tidak valid. Periksa kembali form absensi",
        data: null,
      };
    }

    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan absensi",
      data: null,
    };
  }
}
