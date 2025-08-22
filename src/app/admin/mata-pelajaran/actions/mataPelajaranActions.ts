"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mataPelajaranSchema } from "../schema/mataPelajaranSchema";
import { validate } from "@/utils/validate";
import { ZodError } from "zod";

export async function getDataMataPelajaran() {
  try {
    const mataPelajaranData = await prisma.mataPelajaran.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });
    return mataPelajaranData;
  } catch (error) {
    console.error("Error fetching mata pelajaran data:", error);
    return [];
  }
}

export async function getDataGuru() {
  try {
    const guruData = await prisma.guru.findMany({
      orderBy: {
        namaLengkap: "asc",
      },
      select: {
        id: true,
        namaLengkap: true,
        bidangStudi: true,
      },
    });
    return guruData;
  } catch (error) {
    console.error("Error fetching guru data:", error);
    return [];
  }
}

export async function createMataPelajaran(formData: FormData) {
  try {
    // Extract data from FormData
    const rawData = {
      nama: (formData.get("nama") as string) || undefined,
      kode: (formData.get("kode") as string) || undefined,
      deskripsi: (formData.get("deskripsi") as string) || undefined,
      guruId: (formData.get("guruId") as string) || undefined,
    };

    // Validate using Zod schema
    const validatedData = validate(mataPelajaranSchema, rawData);

    // Create mata pelajaran entry in database
    const newMataPelajaran = await prisma.mataPelajaran.create({
      data: {
        nama: validatedData.nama,
        kode: validatedData.kode || null,
        deskripsi: validatedData.deskripsi || null,
        guruId: validatedData.guruId || null,
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    // Revalidate paths
    revalidatePath("/admin/mata-pelajaran");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Mata pelajaran berhasil dibuat",
      data: newMataPelajaran,
    };
  } catch (error) {
    console.error("Error creating mata pelajaran:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat mata pelajaran",
    };
  }
}

export async function updateMataPelajaran(id: string, formData: FormData) {
  try {
    // Extract data from FormData
    const rawData = {
      nama: (formData.get("nama") as string) || undefined,
      kode: (formData.get("kode") as string) || undefined,
      deskripsi: (formData.get("deskripsi") as string) || undefined,
      guruId: (formData.get("guruId") as string) || undefined,
    };

    // Validate using Zod schema
    const validatedData = validate(mataPelajaranSchema, rawData);

    // Update mata pelajaran entry in database
    const updatedMataPelajaran = await prisma.mataPelajaran.update({
      where: { id },
      data: {
        nama: validatedData.nama,
        kode: validatedData.kode || null,
        deskripsi: validatedData.deskripsi || null,
        guruId: validatedData.guruId || null,
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    // Revalidate paths
    revalidatePath("/admin/mata-pelajaran");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Mata pelajaran berhasil diperbarui",
      data: updatedMataPelajaran,
    };
  } catch (error) {
    console.error("Error updating mata pelajaran:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui mata pelajaran",
    };
  }
}

export async function deleteMataPelajaran(id: string) {
  try {
    await prisma.mataPelajaran.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/admin/mata-pelajaran");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Mata pelajaran berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting mata pelajaran:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus mata pelajaran",
    };
  }
}
