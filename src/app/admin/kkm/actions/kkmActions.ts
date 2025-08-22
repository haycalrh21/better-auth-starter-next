"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { kkmSchema } from "../schema/kkmSchema";
import { validate } from "@/utils/validate";
import { ZodError } from "zod";

// Get all KKM data with relations
export async function getDataKKM() {
  try {
    const kkmData = await prisma.kKM.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        MataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
            guru: {
              select: {
                id: true,
                namaLengkap: true,
              },
            },
          },
        },
      },
    });
    return kkmData;
  } catch (error) {
    console.error("Error fetching KKM data:", error);
    return [];
  }
}

// Get mata pelajaran data for dropdown (all)
export async function getDataMataPelajaran() {
  try {
    const mataPelajaranData = await prisma.mataPelajaran.findMany({
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        nama: true,
        kode: true,
      },
    });
    return mataPelajaranData;
  } catch (error) {
    console.error("Error fetching mata pelajaran data:", error);
    return [];
  }
}

// Get mata pelajaran that don't have KKM yet (for create modal)
export async function getAvailableMataPelajaran() {
  try {
    // First, get all mata pelajaran IDs that already have KKM
    const existingKKMs = await prisma.kKM.findMany({
      select: {
        mataPelajaranId: true,
      },
    });

    const usedMataPelajaranIds = existingKKMs.map((kkm) => kkm.mataPelajaranId);

    // Then get mata pelajaran that are NOT in the used list
    const availableMataPelajaran = await prisma.mataPelajaran.findMany({
      where: {
        id: {
          notIn: usedMataPelajaranIds,
        },
      },
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        nama: true,
        kode: true,
      },
    });

    return availableMataPelajaran;
  } catch (error) {
    console.error("Error fetching available mata pelajaran:", error);
    return [];
  }
}

// Get mata pelajaran for edit modal (includes current + available)
export async function getMataPelajaranForEdit(currentMataPelajaranId: string) {
  try {
    // Get all mata pelajaran IDs that already have KKM (excluding current)
    const existingKKMs = await prisma.kKM.findMany({
      where: {
        mataPelajaranId: {
          not: currentMataPelajaranId,
        },
      },
      select: {
        mataPelajaranId: true,
      },
    });

    const usedMataPelajaranIds = existingKKMs.map((kkm) => kkm.mataPelajaranId);

    // Get mata pelajaran that are available OR is the current one
    const mataPelajaran = await prisma.mataPelajaran.findMany({
      where: {
        OR: [
          {
            id: {
              notIn: usedMataPelajaranIds,
            },
          },
          {
            id: currentMataPelajaranId,
          },
        ],
      },
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        nama: true,
        kode: true,
      },
    });

    return mataPelajaran;
  } catch (error) {
    console.error("Error fetching mata pelajaran for edit:", error);
    return [];
  }
}

// Create KKM entry
export async function createKKM(formData: FormData) {
  try {
    const rawData = {
      mataPelajaranId: (formData.get("mataPelajaranId") as string) || undefined,
      nilai: parseInt((formData.get("nilai") as string) || "0"),
    };

    const validatedData = validate(kkmSchema, rawData);

    // Double-check if KKM already exists for this mata pelajaran
    const existingKKM = await prisma.kKM.findFirst({
      where: {
        mataPelajaranId: validatedData.mataPelajaranId,
      },
      include: {
        MataPelajaran: {
          select: {
            nama: true,
            kode: true,
          },
        },
      },
    });

    if (existingKKM) {
      const mataPelajaranName = existingKKM.MataPelajaran.kode
        ? `${existingKKM.MataPelajaran.kode} - ${existingKKM.MataPelajaran.nama}`
        : existingKKM.MataPelajaran.nama;

      return {
        success: false,
        error: `KKM untuk mata pelajaran "${mataPelajaranName}" sudah ada dengan nilai ${existingKKM.nilai}. Silakan edit yang sudah ada atau pilih mata pelajaran lain.`,
      };
    }

    const newKKM = await prisma.kKM.create({
      data: {
        mataPelajaranId: validatedData.mataPelajaranId,
        nilai: validatedData.nilai,
      },
      include: {
        MataPelajaran: {
          select: {
            nama: true,
            kode: true,
          },
        },
      },
    });

    revalidatePath("/admin/kkm");
    revalidatePath("/admin");

    return {
      success: true,
      message: "KKM berhasil dibuat",
      data: newKKM,
    };
  } catch (error) {
    console.error("Error creating KKM:", error);

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
          : "Terjadi kesalahan saat membuat KKM",
    };
  }
}

// Update KKM entry
export async function updateKKM(id: string, formData: FormData) {
  try {
    const rawData = {
      mataPelajaranId: (formData.get("mataPelajaranId") as string) || undefined,
      nilai: parseInt((formData.get("nilai") as string) || "0"),
    };

    const validatedData = validate(kkmSchema, rawData);

    // Check if another KKM with same mata pelajaran exists (excluding current one)
    const existingKKM = await prisma.kKM.findFirst({
      where: {
        mataPelajaranId: validatedData.mataPelajaranId,
        id: {
          not: id,
        },
      },
      include: {
        MataPelajaran: {
          select: {
            nama: true,
            kode: true,
          },
        },
      },
    });

    if (existingKKM) {
      const mataPelajaranName = existingKKM.MataPelajaran.kode
        ? `${existingKKM.MataPelajaran.kode} - ${existingKKM.MataPelajaran.nama}`
        : existingKKM.MataPelajaran.nama;

      return {
        success: false,
        error: `KKM untuk mata pelajaran "${mataPelajaranName}" sudah ada dengan nilai ${existingKKM.nilai}. Silakan pilih mata pelajaran lain.`,
      };
    }

    const updatedKKM = await prisma.kKM.update({
      where: { id },
      data: {
        mataPelajaranId: validatedData.mataPelajaranId,
        nilai: validatedData.nilai,
      },
      include: {
        MataPelajaran: {
          select: {
            nama: true,
            kode: true,
          },
        },
      },
    });

    revalidatePath("/admin/kkm");
    revalidatePath("/admin");

    return {
      success: true,
      message: "KKM berhasil diperbarui",
      data: updatedKKM,
    };
  } catch (error) {
    console.error("Error updating KKM:", error);

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
          : "Terjadi kesalahan saat memperbarui KKM",
    };
  }
}

// Delete KKM entry
export async function deleteKKM(id: string) {
  try {
    await prisma.kKM.delete({
      where: { id },
    });

    revalidatePath("/admin/kkm");
    revalidatePath("/admin");

    return {
      success: true,
      message: "KKM berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting KKM:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus KKM",
    };
  }
}
