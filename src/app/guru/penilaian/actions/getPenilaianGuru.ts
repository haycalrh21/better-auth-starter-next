"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getPenilaianGuru() {
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

    // Get teacher's classes from schedule (jadwal)
    const kelas = await prisma.kelas.findMany({
      where: {
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
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: {
        namaKelas: "asc",
      },
    });

    // Get teacher's subjects (mata pelajaran)
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

    // Get assessments created by this teacher
    const penilaian = await prisma.penilaian.findMany({
      where: {
        guruId: guru.id,
      },
      include: {
        kelas: {
          select: {
            id: true,
            namaKelas: true,
          },
        },
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
    const totalPenilaian = penilaian.length;
    const penilaianByKategori = penilaian.reduce((acc, p) => {
      acc[p.kategori] = (acc[p.kategori] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average scores
    const avgScores = penilaian.map((p) => {
      const scores = p.nilaiSiswa.map((n) => n.nilai);
      const average =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
      return average;
    });

    const overallAverage =
      avgScores.length > 0
        ? avgScores.reduce((sum, avg) => sum + avg, 0) / avgScores.length
        : 0;

    const stats = {
      totalPenilaian,
      totalKelas: kelas.length,
      penilaianByKategori,
      overallAverage: Math.round(overallAverage * 100) / 100,
    };

    return {
      success: true,
      data: {
        guru,
        kelas,
        mataPelajaran,
        penilaian,
        stats,
      },
    };
  } catch (error) {
    console.error("❌ getPenilaianGuru error:", error);
    return {
      success: false,
      error: "Gagal mengambil data penilaian guru",
    };
  }
}
