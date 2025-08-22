"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteKelasSchema, type DeleteKelasInput } from "../schema";

/**
 * Delete a class with automatic student disconnection
 */
export async function deleteKelas(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const data = Object.fromEntries(formData.entries());

    // Simplified data structure - no transfer logic
    const parsedData = {
      id: data.id as string,
      reason: data.reason as string,
    };

    if (!parsedData.id) {
      throw new APIError("BAD_REQUEST", {
        message: "ID kelas wajib diisi",
      });
    }

    // Get class details with relations
    const existingClass = await prisma.kelas.findUnique({
      where: { id: parsedData.id },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
        },
        _count: {
          select: {
            siswa: true,
            Jadwal: true,
            Pembayaran: true,
          },
        },
        Jadwal: {
          select: {
            id: true,
          },
        },
        Pembayaran: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingClass) {
      throw new APIError("NOT_FOUND", {
        message: "Kelas tidak ditemukan",
      });
    }

    // Check if class has active schedules
    if (existingClass._count.Jadwal > 0) {
      throw new APIError("BAD_REQUEST", {
        message:
          "Tidak dapat menghapus kelas yang memiliki jadwal aktif. Hapus jadwal terlebih dahulu.",
      });
    }

    // Start transaction for deletion
    const result = await prisma.$transaction(async (tx) => {
      // Always disconnect students from the class being deleted
      if (existingClass.siswa.length > 0) {
        await tx.kelas.update({
          where: { id: parsedData.id },
          data: {
            siswa: {
              disconnect: existingClass.siswa.map((s) => ({ id: s.id })),
            },
          },
        });
      }

      // Handle related records
      // Delete payments related to this class
      if (existingClass._count.Pembayaran > 0) {
        await tx.pembayaran.deleteMany({
          where: { kelasId: parsedData.id },
        });
      }

      // Delete the class
      const deletedClass = await tx.kelas.delete({
        where: { id: parsedData.id },
      });

      return {
        deletedClass: existingClass,
        disconnectedStudents: existingClass.siswa.length,
      };
    });

    // Log the deletion
    const logger = await UserLogger.create(currentUser.id);
    await logger.delete("kelas", {
      id: parsedData.id,
      namaKelas: existingClass.namaKelas,
      guru: existingClass.guru?.namaLengkap || "No teacher assigned",
      studentCount: existingClass._count.siswa,
      disconnectedStudents: result.disconnectedStudents,
      reason: parsedData.reason || "Class deletion",
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");
    revalidatePath("/admin/students");

    return result;
  } catch (err) {
    console.error("❌ deleteKelas error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal menghapus kelas, coba lagi nanti");
  }
}

/**
 * Soft delete (deactivate) a class
 */
export async function deactivateKelas(kelasId: string, reason?: string) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    // Get class details
    const existingClass = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        guru: {
          select: {
            namaLengkap: true,
          },
        },
        _count: {
          select: {
            siswa: true,
          },
        },
      },
    });

    if (!existingClass) {
      throw new APIError("NOT_FOUND", {
        message: "Kelas tidak ditemukan",
      });
    }

    if (!existingClass.isActive) {
      throw new APIError("BAD_REQUEST", {
        message: "Kelas sudah tidak aktif",
      });
    }

    // Deactivate the class
    const deactivatedClass = await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Log the deactivation
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("kelas", {
      action: "deactivate",
      id: kelasId,
      namaKelas: existingClass.namaKelas,
      guru: existingClass.guru?.namaLengkap || "No teacher assigned",
      studentCount: existingClass._count.siswa,
      reason: reason || "Manual deactivation",
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return deactivatedClass;
  } catch (err) {
    console.error("❌ deactivateKelas error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal menonaktifkan kelas, coba lagi nanti");
  }
}
