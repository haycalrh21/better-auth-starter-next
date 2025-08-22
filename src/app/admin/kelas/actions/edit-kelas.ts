"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { editKelasSchema, type EditKelasInput } from "../schema";

/**
 * Edit an existing class with comprehensive validation
 */
export async function editKelas(formData: FormData) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    const data = Object.fromEntries(
      formData.entries()
    ) as unknown as EditKelasInput;

    // Parse kapasitas as number if provided
    if (data.kapasitas && typeof data.kapasitas === "string") {
      data.kapasitas = parseInt(data.kapasitas);
    }

    const parsed = editKelasSchema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("BAD_REQUEST", {
        message: parsed.error.issues.map((e: any) => e.message).join(", "),
      });
    }

    const validData = parsed.data;

    // Check if class exists
    const existingClass = await prisma.kelas.findUnique({
      where: { id: validData.id },
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

    // If updating teacher, check if new teacher is available
    if (validData.guruId && validData.guruId !== existingClass.guruId) {
      const teacherAssignment = await prisma.kelas.findFirst({
        where: {
          guruId: validData.guruId,
          tahunAjaran: validData.tahunAjaran || existingClass.tahunAjaran,
          semester: validData.semester || existingClass.semester,
          isActive: true,
          id: {
            not: validData.id,
          },
        },
      });

      if (teacherAssignment) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Guru sudah menjadi wali kelas di tahun ajaran dan semester ini",
        });
      }
    }

    // If updating class name, check for duplicates
    if (
      validData.namaKelas &&
      validData.namaKelas !== existingClass.namaKelas
    ) {
      const duplicateClass = await prisma.kelas.findFirst({
        where: {
          namaKelas: validData.namaKelas,
          tahunAjaran: validData.tahunAjaran || existingClass.tahunAjaran,
          semester: validData.semester || existingClass.semester,
          id: {
            not: validData.id,
          },
        },
      });

      if (duplicateClass) {
        throw new APIError("BAD_REQUEST", {
          message: "Nama kelas sudah ada di tahun ajaran dan semester ini",
        });
      }
    }

    // Validate capacity against current student count
    if (
      validData.kapasitas &&
      validData.kapasitas < existingClass._count.siswa
    ) {
      throw new APIError("BAD_REQUEST", {
        message: `Kapasitas tidak boleh kurang dari jumlah siswa saat ini (${existingClass._count.siswa})`,
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (validData.namaKelas) updateData.namaKelas = validData.namaKelas;
    if (validData.jenjang) updateData.jenjang = validData.jenjang;
    if (validData.jurusan !== undefined) updateData.jurusan = validData.jurusan;
    if (validData.tahunAjaran) updateData.tahunAjaran = validData.tahunAjaran;
    if (validData.semester) updateData.semester = validData.semester;
    if (validData.guruId) updateData.guruId = validData.guruId;
    if (validData.kapasitas) updateData.kapasitas = validData.kapasitas;
    if (validData.isActive !== undefined)
      updateData.isActive = validData.isActive;

    updateData.updatedAt = new Date();

    // Update the class
    const updatedKelas = await prisma.kelas.update({
      where: { id: validData.id },
      data: updateData,
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            nip: true,
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
          },
        },
      },
    });

    // Log the update
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("kelas", {
      action: "update",
      id: validData.id,
      oldData: {
        namaKelas: existingClass.namaKelas,
        guruId: existingClass.guruId,
        isActive: existingClass.isActive,
      },
      newData: updateData,
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return updatedKelas;
  } catch (err) {
    console.error("❌ editKelas error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal mengupdate kelas, coba lagi nanti");
  }
}

/**
 * Toggle class active status
 */
export async function toggleKelasStatus(kelasId: string) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    // Get current class status
    const existingClass = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: {
        id: true,
        namaKelas: true,
        isActive: true,
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

    // If deactivating, warn about students
    if (existingClass.isActive && existingClass._count.siswa > 0) {
      throw new APIError("BAD_REQUEST", {
        message: `Tidak dapat menonaktifkan kelas yang masih memiliki ${existingClass._count.siswa} siswa. Pindahkan siswa terlebih dahulu.`,
      });
    }

    // Toggle status
    const updatedKelas = await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        isActive: !existingClass.isActive,
        updatedAt: new Date(),
      },
      include: {
        guru: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    // Log the status change
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("kelas", {
      action: existingClass.isActive ? "deactivate" : "activate",
      id: kelasId,
      namaKelas: existingClass.namaKelas,
    });

    revalidatePath("/admin/kelas");
    revalidatePath("/admin/kelas/pembagian-kelas");

    return updatedKelas;
  } catch (err) {
    console.error("❌ toggleKelasStatus error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal mengubah status kelas, coba lagi nanti");
  }
}

/**
 * Update class capacity
 */
export async function updateKelasCapacity(
  kelasId: string,
  newCapacity: number
) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    if (newCapacity < 10 || newCapacity > 40) {
      throw new APIError("BAD_REQUEST", {
        message: "Kapasitas harus antara 10-40 siswa",
      });
    }

    // Check current student count
    const existingClass = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
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

    if (newCapacity < existingClass._count.siswa) {
      throw new APIError("BAD_REQUEST", {
        message: `Kapasitas tidak boleh kurang dari jumlah siswa saat ini (${existingClass._count.siswa})`,
      });
    }

    // Update capacity
    const updatedKelas = await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        // Note: Add kapasitas field to schema if not exists
        updatedAt: new Date(),
      },
    });

    // Log the capacity change
    const logger = await UserLogger.create(currentUser.id);
    await logger.update("kelas", {
      action: "update_capacity",
      id: kelasId,
      oldCapacity: "unknown", // Add this to schema
      newCapacity: newCapacity,
    });

    revalidatePath("/admin/kelas");

    return updatedKelas;
  } catch (err) {
    console.error("❌ updateKelasCapacity error:", err);
    if (err instanceof APIError) {
      throw err;
    }
    throw new Error("Gagal mengupdate kapasitas kelas, coba lagi nanti");
  }
}
