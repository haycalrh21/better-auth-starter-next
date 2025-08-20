"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type KelasData = {
  siswa: string[]; // array nama siswa
  guru: string | null; // nama guru
};

export type SaveKelasInput = {
  hasilKelas: KelasData[];
  tahunAjaran: string;
  semester: string;
  jurusan?: string;
};

export async function saveRandomKelas(input: SaveKelasInput) {
  try {
    const { hasilKelas, tahunAjaran, semester, jurusan } = input;

    // Validasi input
    if (!hasilKelas || hasilKelas.length === 0) {
      return {
        success: false,
        error: "Data kelas tidak boleh kosong",
      };
    }

    // Ambil data siswa dan guru dari database untuk mapping
    const allSiswa = await prisma.siswa.findMany({
      select: { id: true, namaLengkap: true, emailAlternatif: true },
    });

    const allGuru = await prisma.guru.findMany({
      select: { id: true, namaLengkap: true, emailAlternatif: true },
    });

    // Buat mapping nama ke ID
    const siswaMap = new Map();
    allSiswa.forEach((siswa) => {
      const nama = siswa.namaLengkap || siswa.emailAlternatif || "";
      if (nama) siswaMap.set(nama, siswa.id);
    });

    const guruMap = new Map();
    allGuru.forEach((guru) => {
      const nama = guru.namaLengkap || guru.emailAlternatif || "";
      if (nama) guruMap.set(nama, guru.id);
    });

    // Proses setiap kelas
    const createdKelas = [];
    for (let i = 0; i < hasilKelas.length; i++) {
      const kelasData = hasilKelas[i];
      const namaKelas = `${jurusan || "Umum"} ${i + 1}`;

      // Cari guru ID
      const guruId = kelasData.guru ? guruMap.get(kelasData.guru) : null;

      if (!guruId) {
        console.warn(
          `Guru tidak ditemukan untuk kelas ${namaKelas}: ${kelasData.guru}`
        );
        continue; // Skip kelas ini jika guru tidak ditemukan
      }

      // Cari siswa IDs
      const siswaIds = kelasData.siswa
        .map((namaSiswa) => siswaMap.get(namaSiswa))
        .filter(Boolean); // Remove undefined values

      if (siswaIds.length === 0) {
        console.warn(`Tidak ada siswa ditemukan untuk kelas ${namaKelas}`);
        continue; // Skip kelas ini jika tidak ada siswa
      }

      // Create kelas di database
      const newKelas = await prisma.kelas.create({
        data: {
          namaKelas,
          tahunAjaran,
          semester,
          jurusan: jurusan || "Umum",
          guruId,
          siswa: {
            connect: siswaIds.map((id) => ({ id })),
          },
        },
        include: {
          guru: {
            select: { namaLengkap: true },
          },
          siswa: {
            select: { namaLengkap: true },
          },
        },
      });

      createdKelas.push(newKelas);
    }

    // Revalidate pages
    revalidatePath("/admin");
    revalidatePath("/admin/kelas");
    revalidatePath("/admin/siswa");
    revalidatePath("/admin/guru");

    return {
      success: true,
      message: `Berhasil membuat ${createdKelas.length} kelas`,
      data: createdKelas,
    };
  } catch (error) {
    console.error("Error saving kelas:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan kelas",
    };
  }
}
