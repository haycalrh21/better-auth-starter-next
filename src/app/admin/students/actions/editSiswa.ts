// src/lib/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SiswaFormValues } from "../schema/editSiswaSchema";
import { formDataToObject } from "@/utils/objectToFormData";

export async function editSiswa(id: string, formData: FormData) {
  try {
    const data = formDataToObject<SiswaFormValues>(formData);

    const updatedSiswa = await prisma.siswa.update({
      where: { id },
      data: {
        namaLengkap: data.namaLengkap,
        nisn: data.nisn,
        nik: data.nik,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
        agama: data.agama,
        noHp: data.noHp,
        emailAlternatif: data.emailAlternatif,
        alamatLengkap: data.alamatLengkap,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kabupatenKota: data.kabupatenKota,
        provinsi: data.provinsi,
        kodePos: data.kodePos,

        tahunMasuk: data.tahunMasuk,
        namaAyah: data.namaAyah,
        namaIbu: data.namaIbu,
        namaWali: data.namaWali,
        pekerjaanAyah: data.pekerjaanAyah,
        pekerjaanIbu: data.pekerjaanIbu,
        pekerjaanWali: data.pekerjaanWali,
        noHpOrtu: data.noHpOrtu,
      },
    });

    revalidatePath("/admin/students"); // sesuaikan path dashboard siswa
    return { success: true, siswa: updatedSiswa };
  } catch (error) {
    console.error("Gagal memperbarui data siswa:", error);
    return { success: false, error: "Gagal memperbarui data siswa." };
  }
}
