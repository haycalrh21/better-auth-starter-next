"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { editSiswaSchema, type EditSiswaInput } from "../schema";
import { StatusSiswa } from "@/interface/enums";

/**
 * Edit student data with comprehensive validation
 */
export async function editSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    // Convert FormData values to proper types
    const data: EditSiswaInput = {
      ...rawData,
      tanggalLahir: rawData.tanggalLahir
        ? new Date(rawData.tanggalLahir as string)
        : undefined,
      tahunMasuk: rawData.tahunMasuk
        ? parseInt(rawData.tahunMasuk as string)
        : undefined,
      tanggalLulus: rawData.tanggalLulus
        ? new Date(rawData.tanggalLulus as string)
        : undefined,
      isProfileComplete: rawData.isProfileComplete === "true",
    } as EditSiswaInput;

    const parsed = editSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;
    const { id, ...updateData } = validData;

    // Check if student exists
    const existingStudent = await prisma.siswa.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    // Check for duplicate NISN if changed
    if (updateData.nisn && updateData.nisn !== existingStudent.nisn) {
      const existingNISN = await prisma.siswa.findFirst({
        where: {
          nisn: updateData.nisn,
          id: { not: id },
        },
      });

      if (existingNISN) {
        throw new APIError("BAD_REQUEST", {
          message: "NISN sudah digunakan oleh siswa lain",
        });
      }
    }

    // Check for duplicate NIK if changed
    if (updateData.nik && updateData.nik !== existingStudent.nik) {
      const existingNIK = await prisma.siswa.findFirst({
        where: {
          nik: updateData.nik,
          id: { not: id },
        },
      });

      if (existingNIK) {
        throw new APIError("BAD_REQUEST", {
          message: "NIK sudah digunakan oleh siswa lain",
        });
      }
    }

    // Prepare update data, filtering out undefined values
    const cleanUpdateData: any = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdateData[key] = value;
      }
    });

    // Update the student
    const updatedSiswa = await prisma.siswa.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        kelas: {
          where: { isActive: true },
          select: {
            id: true,
            namaKelas: true,
            tahunAjaran: true,
            semester: true,
          },
        },
      },
    });

    // Update user name if student name changed
    if (
      updateData.namaLengkap &&
      updateData.namaLengkap !== existingStudent.namaLengkap
    ) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: { name: updateData.namaLengkap },
      });
    }

    // Log the update
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa", {
      id,
      namaLengkap: updateData.namaLengkap || existingStudent.namaLengkap,
      changes: Object.keys(cleanUpdateData),
    });

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}`);

    return updatedSiswa;
  } catch (err) {
    console.error("❌ editSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal memperbarui siswa, coba lagi nanti");
  }
}

/**
 * Update student status (Active, Graduated, Transferred, etc.)
 */
export async function updateSiswaStatus(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());
    const id = rawData.id as string;
    const newStatus = rawData.status as StatusSiswa;
    const reason = rawData.reason as string;
    const tahunLulus = rawData.tahunLulus
      ? parseInt(rawData.tahunLulus as string)
      : undefined;
    const tanggalLulus = rawData.tanggalLulus
      ? new Date(rawData.tanggalLulus as string)
      : undefined;

    if (!id || !newStatus) {
      throw new APIError("BAD_REQUEST", {
        message: "ID siswa dan status baru harus diisi",
      });
    }

    // Check if student exists
    const existingStudent = await prisma.siswa.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    // Validate status change requirements
    if (
      (newStatus === StatusSiswa.KELUAR ||
        newStatus === StatusSiswa.PINDAH ||
        newStatus === StatusSiswa.DIKELUARKAN) &&
      (!reason || reason.length < 10)
    ) {
      throw new APIError("BAD_REQUEST", {
        message: "Alasan keluar/pindah/dikeluarkan minimal 10 karakter",
      });
    }

    if (newStatus === StatusSiswa.LULUS && !tahunLulus && !tanggalLulus) {
      throw new APIError("BAD_REQUEST", {
        message: "Tahun atau tanggal lulus harus diisi untuk status lulus",
      });
    }

    // Update the student status
    const updatedSiswa = await prisma.siswa.update({
      where: { id },
      data: {
        status: newStatus,
        alasanKeluar: reason,
        tahunLulus,
        tanggalLulus,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // If student is no longer active, remove from active classes
    if (newStatus !== StatusSiswa.AKTIF) {
      await prisma.siswa.update({
        where: { id },
        data: {
          kelas: {
            set: [], // Remove all class associations
          },
        },
      });
    }

    // Log the status change
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_status", {
      id,
      namaLengkap: existingStudent.namaLengkap,
      oldStatus: existingStudent.status,
      newStatus,
      reason,
    });

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}`);

    return updatedSiswa;
  } catch (err) {
    console.error("❌ updateSiswaStatus error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal memperbarui status siswa, coba lagi nanti");
  }
}

/**
 * Promote student to next grade
 */
export async function promoteSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());
    const id = rawData.id as string;
    const newGrade = parseInt(rawData.newGrade as string);
    const newJenjang = rawData.newJenjang as any;
    const newKelasId = rawData.newKelasId as string;

    if (!id || !newGrade) {
      throw new APIError("BAD_REQUEST", {
        message: "ID siswa dan tingkat baru harus diisi",
      });
    }

    // Check if student exists
    const existingStudent = await prisma.siswa.findUnique({
      where: { id },
      include: {
        kelas: {
          where: { isActive: true },
          select: {
            namaKelas: true,
            tahunAjaran: true,
          },
        },
      },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    // Validate grade progression
    // Note: tingkatSaatIni field doesn't exist in Prisma schema
    // Current grade would need to be calculated from current active kelas relation
    // const currentGrade = existingStudent.tingkatSaatIni;
    // if (currentGrade && newGrade !== currentGrade + 1) {
    //   throw new APIError("BAD_REQUEST", {
    //     message: "Kenaikan tingkat harus berurutan (contoh: 7 → 8)",
    //   });
    // }

    // Update student data - Note: these fields don't exist in current Prisma schema
    // const updateData: any = {
    //   tingkatSaatIni: newGrade,
    // };

    // if (newJenjang) {
    //   updateData.jenjangSaatIni = newJenjang;
    // }

    // For now, just return the existing student since the fields don't exist
    // const updatedSiswa = await prisma.siswa.update({
    //   where: { id },
    //   data: updateData,
    // });

    // If new class is specified, assign to it
    if (newKelasId) {
      await prisma.siswa.update({
        where: { id },
        data: {
          kelas: {
            connect: { id: newKelasId },
          },
        },
      });
    }

    // Log the promotion
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_promotion", {
      id,
      namaLengkap: existingStudent.namaLengkap,
      // Note: oldGrade would need to be calculated from kelas relations
      // oldGrade: currentGrade,
      newGrade,
      newKelasId,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");
    revalidatePath(`/admin/students/${id}`);

    return existingStudent;
  } catch (err) {
    console.error("❌ promoteSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal promosi siswa, coba lagi nanti");
  }
}
