"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteGuruSchema } from "../schema";
import type { DeleteGuruInput } from "../schema";
import { canDeleteGuru } from "./dataGuru";

/**
 * Delete teacher with safety checks
 */
export async function deleteGuru(data: DeleteGuruInput) {
  const parsed = deleteGuruSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const validData = parsed.data;
  const { id, reason, transferData } = validData;

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

    // Check if teacher can be deleted
    const deleteCheck = await canDeleteGuru(id);
    if (!deleteCheck.canDelete) {
      return {
        success: false,
        error: deleteCheck.reason!,
        details: deleteCheck.details,
      };
    }

    // Get teacher data before deletion
    const teacher = await prisma.guru.findUnique({
      where: { id },
      include: {
        user: true,
        kelas: true,
        mataPelajaran: true,
        Jadwal: true,
      },
    });

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    // Perform deletion in transaction
    await prisma.$transaction(async (tx) => {
      // If transferData is false, remove all relations
      if (!transferData) {
        // Remove teacher from all classes they're assigned to
        await tx.kelas.updateMany({
          where: {
            guruId: id,
          },
          data: {
            guruId: null,
          },
        });

        // Delete all schedules
        await tx.jadwal.deleteMany({
          where: {
            guruId: id,
          },
        });

        // Disconnect from all subjects
        await tx.mataPelajaran.updateMany({
          where: {
            guruId: id,
          },
          data: {
            guruId: null,
          },
        });
      }

      // Delete teacher profile
      await tx.guru.delete({
        where: { id },
      });

      // Delete user account
      await tx.user.delete({
        where: { id: teacher.userId },
      });
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/kelas");
    revalidatePath("/admin/mata-pelajaran");
    revalidatePath("/admin/jadwal");

    return {
      success: true,
      message: "Guru berhasil dihapus",
      data: {
        deletedTeacher: {
          id: teacher.id,
          name: teacher.namaLengkap,
          nip: teacher.nip,
        },
      },
    };
  } catch (error) {
    console.error("❌ deleteGuru error:", error);
    return {
      success: false,
      error: "Gagal menghapus guru",
    };
  }
}

/**
 * Soft delete teacher (deactivate)
 */
export async function deactivateGuru(id: string, reason?: string) {
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

    // Check if teacher exists
    const teacher = await prisma.guru.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    // Deactivate user account
    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        emailVerified: false, // This effectively deactivates the account
      },
    });

    // Mark profile as incomplete to prevent login
    await prisma.guru.update({
      where: { id },
      data: {
        isProfileComplete: false,
      },
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      message: "Guru berhasil dinonaktifkan",
    };
  } catch (error) {
    console.error("❌ deactivateGuru error:", error);
    return {
      success: false,
      error: "Gagal menonaktifkan guru",
    };
  }
}

/**
 * Reactivate teacher
 */
export async function reactivateGuru(id: string) {
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

    // Check if teacher exists
    const teacher = await prisma.guru.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    // Reactivate user account
    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        emailVerified: true,
      },
    });

    // Check if profile is complete enough to reactivate
    const isProfileComplete = !!(
      teacher.namaLengkap &&
      teacher.tempatLahir &&
      teacher.tanggalLahir &&
      teacher.jenisKelamin &&
      teacher.agama &&
      teacher.noHp &&
      teacher.alamatLengkap &&
      teacher.pendidikanTerakhir
    );

    await prisma.guru.update({
      where: { id },
      data: {
        isProfileComplete,
      },
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      message: "Guru berhasil diaktifkan kembali",
      warning: !isProfileComplete
        ? "Profil belum lengkap, mohon lengkapi data"
        : undefined,
    };
  } catch (error) {
    console.error("❌ reactivateGuru error:", error);
    return {
      success: false,
      error: "Gagal mengaktifkan kembali guru",
    };
  }
}

/**
 * Bulk delete teachers
 */
export async function bulkDeleteGuru(
  teacherIds: string[],
  reason?: string,
  transferData: boolean = false
) {
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

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      warnings: [] as string[],
    };

    for (const teacherId of teacherIds) {
      try {
        // Check if teacher can be deleted
        const deleteCheck = await canDeleteGuru(teacherId);
        if (!deleteCheck.canDelete) {
          results.failed++;
          results.warnings.push(`${teacherId}: ${deleteCheck.reason}`);
          continue;
        }

        const result = await deleteGuru({
          id: teacherId,
          reason,
          transferData,
        });

        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${teacherId}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${teacherId}: Gagal menghapus`);
      }
    }

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("❌ bulkDeleteGuru error:", error);
    return {
      success: false,
      error: "Gagal menghapus guru secara bulk",
    };
  }
}
