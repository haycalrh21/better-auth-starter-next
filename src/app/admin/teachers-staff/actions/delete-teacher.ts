// src/lib/actions.ts

"use server"; // Ini adalah instruksi kunci

import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";

export async function deleteGuru(id: string) {
  console.log("Deleting Guru with ID:", id);
  try {
    const deletedGuru = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/admin/teachers-staff");
    return { success: true, guru: deletedGuru };
  } catch (error) {
    console.error("Gagal memperbarui data guru:", error);
    return { success: false, error: "Gagal memperbarui data guru." };
  }
}
