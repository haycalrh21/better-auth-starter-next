// src/lib/actions.ts

"use server"; // Ini adalah instruksi kunci

import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";

export async function deleteKelas(id: string) {
  console.log("Deleting Guru with ID:", id);
  try {
    const deletedGuru = await prisma.kelas.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/admin/kelas/pembagian-kelas");
    return { success: true, guru: deletedGuru };
  } catch (error) {
    console.error("Gagal memperbarui data guru:", error);
    return { success: false, error: "Gagal memperbarui data guru." };
  }
}
