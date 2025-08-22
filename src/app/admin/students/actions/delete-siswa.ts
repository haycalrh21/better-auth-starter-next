"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteSiswaSchema, type DeleteSiswaInput } from "../schema";
import { StatusSiswa } from "@/interface/enums";

/**
 * Soft delete student (deactivate)
 */
export async function deleteSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());

    const data: DeleteSiswaInput = {
      ...rawData,
      transferData: rawData.transferData === "true",
    } as DeleteSiswaInput;

    const parsed = deleteSiswaSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    // Check if student exists
    const existingStudent = await prisma.siswa.findUnique({
      where: { id: validData.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        kelas: {
          select: {
            id: true,
            namaKelas: true,
          },
        },
        _count: {
          select: {
            Beasiswa: true,
            Pembayaran: true,
          },
        },
      },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    // Check if student has active academic records
    const hasActiveRecords =
      existingStudent._count.Beasiswa > 0 ||
      existingStudent._count.Pembayaran > 0;

    if (hasActiveRecords && !validData.transferData) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Siswa memiliki data akademik aktif. Pilih opsi transfer data atau hapus data akademik terlebih dahulu.",
      });
    }

    // Soft delete: Change status to KELUAR instead of hard delete
    const updatedSiswa = await prisma.siswa.update({
      where: { id: validData.id },
      data: {
        status: StatusSiswa.KELUAR,
        alasanKeluar: validData.reason || "Dihapus dari sistem",
        // Remove from active classes
        kelas: {
          set: [], // Disconnect from all classes
        },
      },
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

    // Optionally deactivate user account
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: {
        // Mark as inactive but don't delete
        // This allows for potential reactivation
        emailVerified: false,
      },
    });

    // Log the deletion
    const logger = await UserLogger.create(currentUser.id);
    await logger.delete("siswa", {
      id: validData.id,
      namaLengkap: existingStudent.namaLengkap,
      nisn: existingStudent.nisn,
      reason: validData.reason,
      transferData: validData.transferData,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return updatedSiswa;
  } catch (err) {
    console.error("❌ deleteSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal menghapus siswa, coba lagi nanti");
  }
}

/**
 * Hard delete student (permanent removal)
 * Only for admin with special permissions
 */
export async function permanentDeleteSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new APIError("FORBIDDEN", {
        message: "Hanya admin yang dapat melakukan penghapusan permanen",
      });
    }

    const rawData = Object.fromEntries(formData.entries());
    const id = rawData.id as string;
    const reason = rawData.reason as string;

    if (!id) {
      throw new APIError("BAD_REQUEST", {
        message: "ID siswa wajib ada",
      });
    }

    if (!reason || reason.length < 20) {
      throw new APIError("BAD_REQUEST", {
        message: "Alasan penghapusan permanen minimal 20 karakter",
      });
    }

    // Check if student exists
    const existingStudent = await prisma.siswa.findUnique({
      where: { id },
      include: {
        user: true,
        _count: {
          select: {
            Beasiswa: true,
            Pembayaran: true,
          },
        },
      },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    // Check if student has any records
    const hasRecords =
      existingStudent._count.Beasiswa > 0 ||
      existingStudent._count.Pembayaran > 0;

    if (hasRecords) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Tidak dapat menghapus permanen siswa yang memiliki data akademik. Hapus data akademik terlebih dahulu.",
      });
    }

    // Log before deletion (important for audit trail)
    const logger = await UserLogger.create(currentUser.id);
    await logger.delete("siswa_permanent", {
      id,
      namaLengkap: existingStudent.namaLengkap,
      nisn: existingStudent.nisn,
      userId: existingStudent.userId,
      reason,
    });

    // Delete student record
    await prisma.siswa.delete({
      where: { id },
    });

    // Delete user account
    await prisma.user.delete({
      where: { id: existingStudent.userId },
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      success: true,
      message: "Siswa berhasil dihapus secara permanen",
    };
  } catch (err) {
    console.error("❌ permanentDeleteSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal menghapus siswa secara permanen, coba lagi nanti");
  }
}

/**
 * Restore deleted student (reactivate)
 */
export async function restoreSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());
    const id = rawData.id as string;

    if (!id) {
      throw new APIError("BAD_REQUEST", {
        message: "ID siswa wajib ada",
      });
    }

    // Check if student exists and is inactive
    const existingStudent = await prisma.siswa.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      throw new APIError("NOT_FOUND", {
        message: "Siswa tidak ditemukan",
      });
    }

    if (existingStudent.status === StatusSiswa.AKTIF) {
      throw new APIError("BAD_REQUEST", {
        message: "Siswa sudah aktif",
      });
    }

    // Restore student
    const restoredSiswa = await prisma.siswa.update({
      where: { id },
      data: {
        status: StatusSiswa.AKTIF,
        alasanKeluar: null,
      },
    });

    // Reactivate user account
    await prisma.user.update({
      where: { id: existingStudent.userId },
      data: {
        emailVerified: true,
      },
    });

    // Log the restoration
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("siswa_restore", {
      id,
      namaLengkap: existingStudent.namaLengkap,
      nisn: existingStudent.nisn,
    });

    revalidatePath("/admin/students");

    return restoredSiswa;
  } catch (err) {
    console.error("❌ restoreSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal memulihkan siswa, coba lagi nanti");
  }
}

/**
 * Bulk delete students
 */
export async function bulkDeleteSiswa(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const rawData = Object.fromEntries(formData.entries());
    const studentIds = JSON.parse(rawData.studentIds as string) as string[];
    const reason = rawData.reason as string;

    if (!studentIds || studentIds.length === 0) {
      throw new APIError("BAD_REQUEST", {
        message: "Tidak ada siswa yang dipilih",
      });
    }

    if (studentIds.length > 50) {
      throw new APIError("BAD_REQUEST", {
        message: "Maksimal 50 siswa dapat dihapus sekaligus",
      });
    }

    if (!reason || reason.length < 10) {
      throw new APIError("BAD_REQUEST", {
        message: "Alasan penghapusan minimal 10 karakter",
      });
    }

    // Update all selected students
    const results = await Promise.allSettled(
      studentIds.map(async (studentId) => {
        return prisma.siswa.update({
          where: { id: studentId },
          data: {
            status: StatusSiswa.KELUAR,
            alasanKeluar: reason,
            kelas: {
              set: [], // Remove from all classes
            },
          },
          include: {
            user: {
              select: {
                name: true,
              },
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

    // Log the bulk deletion
    const logger = await UserLogger.create(currentUser.id);
    await logger.delete("siswa_bulk", {
      studentCount: successful,
      failed,
      reason,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/kelas");

    return {
      successful,
      failed,
      total: studentIds.length,
    };
  } catch (err) {
    console.error("❌ bulkDeleteSiswa error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal menghapus siswa secara bulk, coba lagi nanti");
  }
}
