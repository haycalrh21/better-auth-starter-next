"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { absensiDateSchema } from "../schema/absensiSchema";
import type { HolidayValidation } from "@/interface/absensi";

export async function validateAttendanceDate(input: {
  tanggal: Date;
  kelasId: string;
}) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        message: "Anda harus login terlebih dahulu",
        data: null,
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        message: "Akses ditolak. Hanya guru yang dapat mengakses halaman ini",
        data: null,
      };
    }
    // Validate input
    const validatedInput = absensiDateSchema.parse(input);
    const { tanggal, kelasId } = validatedInput;

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    if (!guru) {
      return {
        success: false,
        message: "Data guru tidak ditemukan",
        data: null,
      };
    }

    // Verify teacher teaches this class
    const teachesClass = await prisma.jadwal.findFirst({
      where: {
        guruId: guru.id,
        kelasId: kelasId,
      },
    });

    if (!teachesClass) {
      return {
        success: false,
        message: "Anda tidak mengajar di kelas ini",
        data: null,
      };
    }

    // Check if date falls within any holiday period
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
      orderBy: {
        tanggalMulai: "desc",
      },
    });

    const isHoliday = holidays.length > 0;
    let holidayInfo = undefined;

    if (isHoliday && holidays[0]) {
      holidayInfo = {
        tanggalMulai: holidays[0].tanggalMulai,
        tanggalSelesai: holidays[0].tanggalSelesai || undefined,
        keterangan: holidays[0].keterangan || undefined,
        semester: holidays[0].semester,
      };
    }

    // Check if attendance already exists for this date and class
    const existingAttendance = await prisma.absensi.findFirst({
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
      include: {
        siswa: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    const validationResult: HolidayValidation = {
      isHoliday,
      holidayInfo,
    };

    return {
      success: true,
      message: isHoliday
        ? "Perhatian: Tanggal yang dipilih bertepatan dengan libur"
        : "Tanggal valid untuk absensi",
      data: {
        validation: validationResult,
        hasExistingAttendance: !!existingAttendance,
        existingAttendanceCount: existingAttendance ? 1 : 0,
      },
    };
  } catch (error) {
    console.error("Error in validateAttendanceDate:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        message: "Data input tidak valid",
        data: null,
      };
    }

    return {
      success: false,
      message: "Terjadi kesalahan saat validasi tanggal",
      data: null,
    };
  }
}
