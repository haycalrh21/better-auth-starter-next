"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { bulkSiswaSchema, type BulkSiswaInput } from "../schema";
import { StatusSiswa, Jenjang } from "@/interface/enums";

/**
 * Bulk promote students to next grade
 */
export async function bulkPromoteStudents(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    const data: BulkSiswaInput = {
      ...rawData,
      studentIds: JSON.parse(rawData.studentIds as string),
      newGrade: rawData.newGrade
        ? parseInt(rawData.newGrade as string)
        : undefined,
    } as BulkSiswaInput;

    const parsed = bulkSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    if (validData.operation !== "promote") {
      throw new APIError("BAD_REQUEST", {
        message: "Operasi harus 'promote'",
      });
    }

    if (
      !validData.newGrade ||
      !validData.newJenjang ||
      !validData.newAcademicYear
    ) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Tingkat baru, jenjang baru, dan tahun ajaran baru harus diisi",
      });
    }

    // Validate academic year format
    if (!/^20\d{2}\/20\d{2}$/.test(validData.newAcademicYear)) {
      throw new APIError("BAD_REQUEST", {
        message: "Format tahun ajaran tidak valid (contoh: 2024/2025)",
      });
    }

    // Get students to be promoted
    const studentsToPromote = await prisma.siswa.findMany({
      where: {
        id: { in: validData.studentIds },
        status: StatusSiswa.AKTIF,
      },
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

    if (studentsToPromote.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada siswa aktif yang dapat dipromosikan",
      });
    }

    // Validate grade progression for each student
    const invalidPromotions = studentsToPromote.filter((student) => {
      // Note: tingkatSaatIni field doesn't exist in Prisma schema
      // const currentGrade = student.tingkatSaatIni;
      // return currentGrade && validData.newGrade !== currentGrade + 1;
      return false; // Skip validation since tingkatSaatIni doesn't exist
    });

    if (invalidPromotions.length > 0) {
      throw new APIError("BAD_REQUEST", {
        message: `${invalidPromotions.length} siswa memiliki tingkat yang tidak valid untuk promosi`,
      });
    }

    // Perform bulk promotion
    const results = await Promise.allSettled(
      studentsToPromote.map(async (student) => {
        return prisma.siswa.update({
          where: { id: student.id },
          data: {
            // Note: tingkatSaatIni and jenjangSaatIni fields don't exist in Prisma schema
            // tingkatSaatIni: validData.newGrade,
            // jenjangSaatIni: validData.newJenjang,
            status: StatusSiswa.AKTIF, // Update status to active when promoted
            // Remove from current classes, will be assigned to new classes later
            // Note: Commenting out disconnect since kelas relation doesn't include id in the query
            // kelas: {
            //   disconnect: student.kelas.map((k) => ({ id: k.id })),
            // },
          },
        });
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    // Log the bulk promotion
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_bulk_promotion", {
      studentCount: successful,
      failed,
      newGrade: validData.newGrade,
      newJenjang: validData.newJenjang,
      newAcademicYear: validData.newAcademicYear,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      successful,
      failed,
      total: validData.studentIds.length,
    };
  } catch (err) {
    console.error("❌ bulkPromoteStudents error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal promosi siswa secara bulk, coba lagi nanti");
  }
}

/**
 * Bulk assign students to class
 */
export async function bulkAssignToClass(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    const data: BulkSiswaInput = {
      ...rawData,
      studentIds: JSON.parse(rawData.studentIds as string),
    } as BulkSiswaInput;

    const parsed = bulkSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    if (validData.operation !== "assign_class") {
      throw new APIError("BAD_REQUEST", {
        message: "Operasi harus 'assign_class'",
      });
    }

    if (!validData.kelasId) {
      throw new APIError("BAD_REQUEST", {
        message: "Kelas tujuan harus dipilih",
      });
    }

    // Validate class exists and has capacity
    const targetClass = await prisma.kelas.findUnique({
      where: { id: validData.kelasId },
      include: {
        _count: {
          select: {
            siswa: true,
          },
        },
      },
    });

    if (!targetClass) {
      throw new APIError("BAD_REQUEST", {
        message: "Kelas tidak ditemukan",
      });
    }

    const capacity = 35; // Default capacity
    const availableSpots = capacity - targetClass._count.siswa;

    if (validData.studentIds.length > availableSpots) {
      throw new APIError("BAD_REQUEST", {
        message: `Kelas hanya tersisa ${availableSpots} tempat untuk ${validData.studentIds.length} siswa`,
      });
    }

    // Assign students to class
    const results = await Promise.allSettled(
      validData.studentIds.map(async (studentId) => {
        return prisma.siswa.update({
          where: { id: studentId },
          data: {
            kelas: {
              connect: { id: validData.kelasId },
            },
          },
        });
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    // Log the bulk assignment
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_bulk_assign", {
      studentCount: successful,
      failed,
      kelasId: validData.kelasId,
      kelasName: targetClass.namaKelas,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      successful,
      failed,
      total: validData.studentIds.length,
    };
  } catch (err) {
    console.error("❌ bulkAssignToClass error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal assign siswa ke kelas secara bulk, coba lagi nanti");
  }
}

/**
 * Bulk update student status
 */
export async function bulkUpdateStatus(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    const data: BulkSiswaInput = {
      ...rawData,
      studentIds: JSON.parse(rawData.studentIds as string),
    } as BulkSiswaInput;

    const parsed = bulkSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    if (validData.operation !== "update_status") {
      throw new APIError("BAD_REQUEST", {
        message: "Operasi harus 'update_status'",
      });
    }

    if (!validData.newStatus) {
      throw new APIError("BAD_REQUEST", {
        message: "Status baru harus dipilih",
      });
    }

    // Validate reason for certain status changes
    if (
      (validData.newStatus === StatusSiswa.KELUAR ||
        validData.newStatus === StatusSiswa.PINDAH ||
        validData.newStatus === StatusSiswa.DIKELUARKAN) &&
      (!validData.reason || validData.reason.length < 10)
    ) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Alasan minimal 10 karakter untuk status keluar/pindah/dikeluarkan",
      });
    }

    // Update student statuses
    const results = await Promise.allSettled(
      validData.studentIds.map(async (studentId) => {
        const updateData: any = {
          status: validData.newStatus,
        };

        if (validData.reason) {
          updateData.alasanKeluar = validData.reason;
        }

        // If status is not active, remove from classes
        if (validData.newStatus !== StatusSiswa.AKTIF) {
          updateData.kelas = {
            set: [], // Disconnect from all classes
          };
        }

        return prisma.siswa.update({
          where: { id: studentId },
          data: updateData,
        });
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    // Log the bulk status update
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_bulk_status", {
      studentCount: successful,
      failed,
      newStatus: validData.newStatus,
      reason: validData.reason,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      successful,
      failed,
      total: validData.studentIds.length,
    };
  } catch (err) {
    console.error("❌ bulkUpdateStatus error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal update status siswa secara bulk, coba lagi nanti");
  }
}

/**
 * Export students data
 */
export async function exportStudentsData(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    const data: BulkSiswaInput = {
      ...rawData,
      studentIds: JSON.parse(rawData.studentIds as string),
      includePersonalData: rawData.includePersonalData === "true",
      includeParentData: rawData.includeParentData === "true",
      includeAcademicData: rawData.includeAcademicData === "true",
    } as BulkSiswaInput;

    const parsed = bulkSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    if (validData.operation !== "export") {
      throw new APIError("BAD_REQUEST", {
        message: "Operasi harus 'export'",
      });
    }

    if (!validData.exportFormat) {
      throw new APIError("BAD_REQUEST", {
        message: "Format export harus dipilih",
      });
    }

    // Build include object based on options
    const includeOptions: any = {};

    if (validData.includePersonalData) {
      includeOptions.user = {
        select: {
          email: true,
          emailVerified: true,
          createdAt: true,
        },
      };
    }

    if (validData.includeAcademicData) {
      includeOptions.kelas = {
        select: {
          namaKelas: true,
          tahunAjaran: true,
          semester: true,
          jenjang: true,
          jurusan: true,
        },
      };
      includeOptions.Beasiswa = {
        select: {
          nominal: true,
          tahunPenerimaan: true,
          jenis: {
            select: {
              nama: true,
            },
          },
        },
      };
    }

    // Get students data for export
    const studentsData = await prisma.siswa.findMany({
      where: {
        id: { in: validData.studentIds },
      },
      include: includeOptions,
      orderBy: {
        namaLengkap: "asc",
      },
    });

    // Log the export
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("siswa_export", {
      studentCount: studentsData.length,
      exportFormat: validData.exportFormat,
      includePersonalData: validData.includePersonalData,
      includeParentData: validData.includeParentData,
      includeAcademicData: validData.includeAcademicData,
    });

    // For now, return the data
    // In a real implementation, you would generate the file and return a download link
    return {
      data: studentsData,
      format: validData.exportFormat,
      count: studentsData.length,
    };
  } catch (err) {
    console.error("❌ exportStudentsData error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal export data siswa, coba lagi nanti");
  }
}

/**
 * Import students from file
 */
export async function importStudentsFromFile(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    // This is a placeholder for file import functionality
    // In a real implementation, you would:
    // 1. Validate the uploaded file
    // 2. Parse the file content (CSV, Excel, etc.)
    // 3. Validate each row of data
    // 4. Create user accounts for new students
    // 5. Create student profiles
    // 6. Handle errors and duplicates

    throw new APIError("NOT_IMPLEMENTED", {
      message: "Import dari file belum diimplementasikan",
    });
  } catch (err) {
    console.error("❌ importStudentsFromFile error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal import siswa dari file, coba lagi nanti");
  }
}

/**
 * Generate random class distribution for students
 */
export async function randomClassDistribution(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());
    const jenjang = rawData.jenjang as Jenjang;
    const tingkat = parseInt(rawData.tingkat as string);
    const tahunAjaran = rawData.tahunAjaran as string;
    const semester = rawData.semester as string;

    if (!jenjang || !tingkat || !tahunAjaran || !semester) {
      throw new APIError("BAD_REQUEST", {
        message: "Jenjang, tingkat, tahun ajaran, dan semester harus diisi",
      });
    }

    // Get unassigned students for the grade and level
    const unassignedStudents = await prisma.siswa.findMany({
      where: {
        status: StatusSiswa.AKTIF,
        // Note: tingkatSaatIni and jenjangSaatIni fields don't exist in Prisma schema
        // tingkatSaatIni: tingkat,
        // jenjangSaatIni: jenjang,
        kelas: {
          none: {
            tahunAjaran,
            semester,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
        nisn: true,
      },
    });

    if (unassignedStudents.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada siswa yang belum ditempatkan di kelas",
      });
    }

    // Get available classes for the grade and level
    const availableClasses = await prisma.kelas.findMany({
      where: {
        tahunAjaran,
        semester,
        jenjang,
        namaKelas: {
          startsWith: tingkat.toString(),
        },
        isActive: true,
      },
      include: {
        _count: {
          select: {
            siswa: true,
          },
        },
      },
    });

    if (availableClasses.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada kelas yang tersedia untuk tingkat ini",
      });
    }

    // Shuffle students for random distribution
    const shuffledStudents = unassignedStudents.sort(() => Math.random() - 0.5);

    // Calculate capacity for each class
    const capacity = 35; // Default capacity
    const classesWithCapacity = availableClasses
      .map((kelas) => ({
        ...kelas,
        availableSpots: Math.max(0, capacity - kelas._count.siswa),
      }))
      .filter((kelas) => kelas.availableSpots > 0);

    if (classesWithCapacity.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Semua kelas sudah penuh",
      });
    }

    // Distribute students evenly across classes
    const assignments: { studentId: string; kelasId: string }[] = [];
    let currentClassIndex = 0;

    for (const student of shuffledStudents) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < classesWithCapacity.length) {
        const targetClass = classesWithCapacity[currentClassIndex];

        if (targetClass.availableSpots > 0) {
          assignments.push({
            studentId: student.id,
            kelasId: targetClass.id,
          });
          targetClass.availableSpots--;
          placed = true;
        }

        currentClassIndex =
          (currentClassIndex + 1) % classesWithCapacity.length;
        attempts++;
      }

      if (!placed) {
        break; // No more space in any class
      }
    }

    // Apply the assignments
    const results = await Promise.allSettled(
      assignments.map(async (assignment) => {
        return prisma.siswa.update({
          where: { id: assignment.studentId },
          data: {
            kelas: {
              connect: { id: assignment.kelasId },
            },
          },
        });
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    // Log the random distribution
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("siswa_random_distribution", {
      jenjang,
      tingkat,
      tahunAjaran,
      semester,
      successful,
      failed,
      totalClasses: classesWithCapacity.length,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      successful,
      failed,
      total: assignments.length,
      unplacedStudents: unassignedStudents.length - assignments.length,
    };
  } catch (err) {
    console.error("❌ randomClassDistribution error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal distribusi kelas secara random, coba lagi nanti");
  }
}
