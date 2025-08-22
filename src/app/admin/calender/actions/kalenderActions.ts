"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { kalenderSchema } from "../schema/kalenderSchema";
import { validate } from "@/utils/validate";
import { ZodError } from "zod";

export async function getDataKalender() {
  try {
    const kalenderData = await prisma.kalender.findMany({
      orderBy: {
        tanggalMulai: "desc",
      },
    });
    return kalenderData;
  } catch (error) {
    console.error("Error fetching kalender data:", error);
    return [];
  }
}

export async function createKalender(formData: FormData) {
  try {
    // Extract data from FormData
    const rawData = {
      tanggalMulai: formData.get("tanggalMulai")
        ? new Date(formData.get("tanggalMulai") as string)
        : undefined,
      tanggalSelesai: formData.get("tanggalSelesai")
        ? new Date(formData.get("tanggalSelesai") as string)
        : undefined,
      semester: (formData.get("semester") as string) || undefined,
      keterangan: (formData.get("keterangan") as string) || undefined,
    };

    // Validate using Zod schema
    const validatedData = validate(kalenderSchema, rawData);

    // Create calendar entry in database
    const newKalender = await prisma.kalender.create({
      data: {
        tanggalMulai: validatedData.tanggalMulai,
        tanggalSelesai: validatedData.tanggalSelesai,
        semester: validatedData.semester,
        keterangan: validatedData.keterangan,
      },
    });

    // Revalidate paths
    revalidatePath("/admin/calender");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Kalender berhasil dibuat",
      data: newKalender,
    };
  } catch (error) {
    console.error("Error creating kalender:", error);

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
          : "Terjadi kesalahan saat membuat kalender",
    };
  }
}

export async function updateKalender(id: string, formData: FormData) {
  try {
    // Extract data from FormData
    const rawData = {
      tanggalMulai: formData.get("tanggalMulai")
        ? new Date(formData.get("tanggalMulai") as string)
        : undefined,
      tanggalSelesai: formData.get("tanggalSelesai")
        ? new Date(formData.get("tanggalSelesai") as string)
        : undefined,
      semester: (formData.get("semester") as string) || undefined,
      keterangan: (formData.get("keterangan") as string) || undefined,
    };

    // Validate using Zod schema
    const validatedData = validate(kalenderSchema, rawData);

    // Update calendar entry in database
    const updatedKalender = await prisma.kalender.update({
      where: { id },
      data: {
        tanggalMulai: validatedData.tanggalMulai,
        tanggalSelesai: validatedData.tanggalSelesai,
        semester: validatedData.semester,
        keterangan: validatedData.keterangan,
      },
    });

    // Revalidate paths
    revalidatePath("/admin/calender");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Kalender berhasil diperbarui",
      data: updatedKalender,
    };
  } catch (error) {
    console.error("Error updating kalender:", error);

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
          : "Terjadi kesalahan saat memperbarui kalender",
    };
  }
}

export async function deleteKalender(id: string) {
  try {
    await prisma.kalender.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/admin/calender");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Kalender berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting kalender:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus kalender",
    };
  }
}
