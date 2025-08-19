// src/lib/actions.ts

"use server"; // Ini adalah instruksi kunci

import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { GuruFormValues } from "../../schemas/editGuruSchema";
// import { revalidatePath } from "next/cache";

export async function editGuru(id: string, data: GuruFormValues) {
  try {
    const updatedGuru = await prisma.guru.update({
      where: {
        id: id,
      },
      data: {
        namaLengkap: data.namaLengkap,
        nip: data.nip,
        nik: data.nik,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
        agama: data.agama,
        statusKawin: data.statusKawin,
        noHp: data.noHp,
        emailAlternatif: data.emailAlternatif,
        alamatLengkap: data.alamatLengkap,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kabupatenKota: data.kabupatenKota,
        provinsi: data.provinsi,
        kodePos: data.kodePos,
        pendidikanTerakhir: data.pendidikanTerakhir,
        jurusan: data.jurusan,
        tahunLulus: data.tahunLulus,
        institusi: data.institusi,
        statusKepegawaian: data.statusKepegawaian,
        golongan: data.golongan,
        pangkat: data.pangkat,
        tmt: data.tmt,
        bidangStudi: data.bidangStudi,
      },
    });

    revalidatePath("/admin/teachers-staff");
    return { success: true, guru: updatedGuru };
  } catch (error) {
    console.error("Gagal memperbarui data guru:", error);
    return { success: false, error: "Gagal memperbarui data guru." };
  }
}
