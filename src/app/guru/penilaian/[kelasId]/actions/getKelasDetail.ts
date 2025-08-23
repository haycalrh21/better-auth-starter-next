"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getKelasDetail(kelasId: string) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat mengakses halaman ini",
      };
    }

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
        namaLengkap: true,
        nip: true,
        bidangStudi: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    // Get class details and verify teacher has schedule for this class
    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        Jadwal: {
          some: {
            guruId: guru.id,
          },
        },
        isActive: true,
      },
      select: {
        id: true,
        namaKelas: true,
        tahunAjaran: true,
        semester: true,
        jenjang: true,
        jurusan: true,
        isActive: true,
      },
    });

    if (!kelas) {
      return {
        success: false,
        error:
          "Kelas tidak ditemukan atau Anda tidak memiliki jadwal mengajar di kelas ini",
      };
    }

    // Get students in this class
    const siswa = await prisma.siswa.findMany({
      where: {
        kelas: {
          some: {
            id: kelasId,
          },
        },
        status: "AKTIF",
      },
      select: {
        id: true,
        namaLengkap: true,
        nisn: true,
        jenisKelamin: true,
        tahunMasuk: true,
      },
      orderBy: {
        namaLengkap: "asc",
      },
    });

    // Get teacher's subjects
    const mataPelajaran = await prisma.mataPelajaran.findMany({
      where: {
        guruId: guru.id,
      },
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    // Get assessments for this class
    const penilaian = await prisma.penilaian.findMany({
      where: {
        kelasId: kelasId,
        guruId: guru.id,
      },
      include: {
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        nilaiSiswa: {
          include: {
            siswa: {
              select: {
                id: true,
                namaLengkap: true,
                nisn: true,
              },
            },
          },
        },
        _count: {
          select: {
            nilaiSiswa: true,
          },
        },
      },
      orderBy: {
        tanggalPenilaian: "desc",
      },
    });

    // Calculate statistics
    const totalSiswa = siswa.length;
    const totalPenilaian = penilaian.length;

    // Calculate average scores
    const avgScores = penilaian.map((p) => {
      const scores = p.nilaiSiswa.map((n) => n.nilai);
      return scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    });

    const rataRata =
      avgScores.length > 0
        ? Math.round(
            (avgScores.reduce((sum, avg) => sum + avg, 0) / avgScores.length) *
              100
          ) / 100
        : 0;

    // Assessment by category
    const penilaianByKategori = penilaian.reduce((acc, p) => {
      acc[p.kategori] = (acc[p.kategori] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalSiswa,
      totalPenilaian,
      rataRata,
      penilaianByKategori,
    };

    return {
      success: true,
      data: {
        guru,
        kelas,
        siswa,
        mataPelajaran,
        penilaian,
        stats,
      },
    };
  } catch (error) {
    console.error("❌ getKelasDetail error:", error);
    return {
      success: false,
      error: "Gagal mengambil data kelas",
    };
  }
}
