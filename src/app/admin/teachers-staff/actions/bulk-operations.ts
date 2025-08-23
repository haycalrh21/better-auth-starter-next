"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { bulkGuruSchema } from "../schema";
import type { BulkGuruInput } from "../schema";

/**
 * Process bulk operations for teachers
 */
export async function processBulkGuruOperations(data: BulkGuruInput) {
  const parsed = bulkGuruSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const validData = parsed.data;
  const { operation, teacherIds } = validData;

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    let result;
    switch (operation) {
      case "assign_class":
        result = await bulkAssignClass(validData);
        break;
      case "assign_subject":
        result = await bulkAssignSubject(validData);
        break;
      case "update_status":
        result = await bulkUpdateStatus(validData);
        break;
      case "export":
        result = await bulkExportGuru(validData);
        break;
      default:
        return {
          success: false,
          error: "Operasi tidak dikenali",
        };
    }

    // Log the bulk operation
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("guru", {
      action: `bulk_${operation}`,
      total: teacherIds.length,
      operation,
      ...result.data,
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/kelas");
    revalidatePath("/admin/mata-pelajaran");

    return result;
  } catch (error) {
    console.error("❌ processBulkGuruOperations error:", error);
    return {
      success: false,
      error: "Gagal memproses operasi bulk",
    };
  }
}

/**
 * Bulk assign teachers to class
 */
async function bulkAssignClass(data: BulkGuruInput) {
  const { teacherIds, kelasId } = data;

  if (!kelasId) {
    return {
      success: false,
      error: "ID kelas wajib untuk operasi assign class",
    };
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    already_assigned: 0,
  };

  // Check if class exists
  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    include: {
      guru: {
        select: { id: true, namaLengkap: true },
      },
    },
  });

  if (!kelas) {
    return {
      success: false,
      error: "Kelas tidak ditemukan",
    };
  }

  const currentTeacherIds = kelas.guru ? [kelas.guru.id] : [];

  for (const teacherId of teacherIds) {
    try {
      // Check if teacher is already assigned to this class
      if (currentTeacherIds.includes(teacherId)) {
        results.already_assigned++;
        continue;
      }

      // Check if teacher exists and is active
      const teacher = await prisma.guru.findUnique({
        where: { id: teacherId },
        include: { user: true },
      });

      if (!teacher || !teacher.user) {
        results.failed++;
        results.errors.push(
          `Guru ${teacherId}: Tidak ditemukan atau tidak aktif`
        );
        continue;
      }

      // Assign teacher to class
      await prisma.kelas.update({
        where: { id: kelasId },
        data: {
          guru: {
            connect: { id: teacherId },
          },
        },
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Guru ${teacherId}: Gagal menugaskan ke kelas`);
    }
  }

  return {
    success: true,
    data: results,
    message: `Berhasil menugaskan ${results.success} guru ke kelas ${kelas.namaKelas}`,
  };
}

/**
 * Bulk assign subject to teachers
 */
async function bulkAssignSubject(data: BulkGuruInput) {
  const { teacherIds, mataPelajaranId } = data;

  if (!mataPelajaranId) {
    return {
      success: false,
      error: "ID mata pelajaran wajib untuk operasi assign subject",
    };
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    already_assigned: 0,
  };

  // Check if subject exists
  const mataPelajaran = await prisma.mataPelajaran.findUnique({
    where: { id: mataPelajaranId },
    include: {
      guru: {
        select: { id: true, namaLengkap: true },
      },
    },
  });

  if (!mataPelajaran) {
    return {
      success: false,
      error: "Mata pelajaran tidak ditemukan",
    };
  }

  const currentTeacherIds = mataPelajaran.guru ? [mataPelajaran.guru.id] : [];

  for (const teacherId of teacherIds) {
    try {
      // Check if teacher is already assigned to this subject
      if (currentTeacherIds.includes(teacherId)) {
        results.already_assigned++;
        continue;
      }

      // Check if teacher exists and is active
      const teacher = await prisma.guru.findUnique({
        where: { id: teacherId },
        include: { user: true },
      });

      if (!teacher || !teacher.user) {
        results.failed++;
        results.errors.push(
          `Guru ${teacherId}: Tidak ditemukan atau tidak aktif`
        );
        continue;
      }

      // Assign subject to teacher
      await prisma.mataPelajaran.update({
        where: { id: mataPelajaranId },
        data: {
          guru: {
            connect: { id: teacherId },
          },
        },
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Guru ${teacherId}: Gagal menugaskan mata pelajaran`);
    }
  }

  return {
    success: true,
    data: results,
    message: `Berhasil menugaskan mata pelajaran ${mataPelajaran.nama} ke ${results.success} guru`,
  };
}

/**
 * Bulk update employment status
 */
async function bulkUpdateStatus(data: BulkGuruInput) {
  const { teacherIds, newStatusKepegawaian, newGolongan, newPangkat } = data;

  if (!newStatusKepegawaian && !newGolongan && !newPangkat) {
    return {
      success: false,
      error: "Minimal satu field status harus diisi untuk update status",
    };
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  const updateData: any = {};
  if (newStatusKepegawaian) updateData.statusKepegawaian = newStatusKepegawaian;
  if (newGolongan) updateData.golongan = newGolongan;
  if (newPangkat) updateData.pangkat = newPangkat;

  for (const teacherId of teacherIds) {
    try {
      // Check if teacher exists
      const teacher = await prisma.guru.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        results.failed++;
        results.errors.push(`Guru ${teacherId}: Tidak ditemukan`);
        continue;
      }

      // Update teacher status
      await prisma.guru.update({
        where: { id: teacherId },
        data: updateData,
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Guru ${teacherId}: Gagal memperbarui status`);
    }
  }

  return {
    success: true,
    data: results,
    message: `Berhasil memperbarui status ${results.success} guru`,
  };
}

/**
 * Bulk export teachers data
 */
async function bulkExportGuru(data: BulkGuruInput) {
  const {
    teacherIds,
    exportFormat = "xlsx",
    includePersonalData = true,
    includeEmploymentData = true,
    includeEducationData = true,
  } = data;

  try {
    // Get teachers data with all relations
    const teachers = await prisma.guru.findMany({
      where: {
        id: { in: teacherIds },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
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
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
    });

    if (teachers.length === 0) {
      return {
        success: false,
        error: "Tidak ada data guru untuk diekspor",
      };
    }

    // Prepare export data based on inclusion settings
    const exportData = teachers.map((teacher) => {
      const data: any = {
        id: teacher.id,
        namaLengkap: teacher.namaLengkap,
        nip: teacher.nip || "-",
      };

      if (includePersonalData) {
        data.nik = teacher.nik || "-";
        data.tempatLahir = teacher.tempatLahir || "-";
        data.tanggalLahir = teacher.tanggalLahir
          ? teacher.tanggalLahir.toISOString().split("T")[0]
          : "-";
        data.jenisKelamin = teacher.jenisKelamin || "-";
        data.agama = teacher.agama || "-";
        data.statusKawin = teacher.statusKawin || "-";
        data.alamatLengkap = teacher.alamatLengkap || "-";
        data.noHp = teacher.noHp || "-";
        data.emailAlternatif = teacher.emailAlternatif || "-";
      }

      if (includeEmploymentData) {
        data.statusKepegawaian = teacher.statusKepegawaian || "-";
        data.golongan = teacher.golongan || "-";
        data.pangkat = teacher.pangkat || "-";
        data.tmt = teacher.tmt ? teacher.tmt.toISOString().split("T")[0] : "-";
        data.masaKerja = teacher.masaKerja || "-";
        data.bidangStudi = teacher.bidangStudi || "-";
        data.walikelas = teacher.walikelas || "-";
      }

      if (includeEducationData) {
        data.pendidikanTerakhir = teacher.pendidikanTerakhir || "-";
        data.jurusan = teacher.jurusan || "-";
        data.tahunLulus = teacher.tahunLulus || "-";
        data.institusi = teacher.institusi || "-";
      }

      // Add class and subject information
      data.kelas =
        teacher.kelas?.map((k: any) => k.namaKelas).join(", ") || "-";
      data.mataPelajaran =
        teacher.mataPelajaran?.map((m: any) => m.nama).join(", ") || "-";
      data.email = teacher.user?.email || "-";
      data.isProfileComplete = teacher.isProfileComplete ? "Ya" : "Tidak";
      data.createdAt = teacher.createdAt.toISOString().split("T")[0];

      return data;
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `guru_export_${timestamp}.${exportFormat}`;

    return {
      success: true,
      data: {
        teachers: exportData,
        count: teachers.length,
        exportFormat,
        filename,
        timestamp,
      },
      message: `Data ${teachers.length} guru berhasil disiapkan untuk ekspor`,
    };
  } catch (error) {
    console.error("❌ bulkExportGuru error:", error);
    return {
      success: false,
      error: "Gagal mengekspor data guru",
    };
  }
}

/**
 * Get available classes for bulk assignment
 */
export async function getAvailableClasses() {
  try {
    const classes = await prisma.kelas.findMany({
      where: { isActive: true },
      select: {
        id: true,
        namaKelas: true,
        tahunAjaran: true,
        semester: true,
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: [
        { tahunAjaran: "desc" },
        { semester: "desc" },
        { namaKelas: "asc" },
      ],
    });

    return {
      success: true,
      data: classes,
    };
  } catch (error) {
    console.error("❌ getAvailableClasses error:", error);
    return {
      success: false,
      error: "Gagal mengambil data kelas",
    };
  }
}

/**
 * Get available subjects for bulk assignment
 */
export async function getAvailableSubjects() {
  try {
    const subjects = await prisma.mataPelajaran.findMany({
      select: {
        id: true,
        nama: true,
        kode: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return {
      success: true,
      data: subjects,
    };
  } catch (error) {
    console.error("❌ getAvailableSubjects error:", error);
    return {
      success: false,
      error: "Gagal mengambil data mata pelajaran",
    };
  }
}
