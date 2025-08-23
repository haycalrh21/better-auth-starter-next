"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getProfileGuru() {
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

    // Get teacher data based on userId
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        kelas: {
          where: { isActive: true },
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
        },
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        Jadwal: {
          select: {
            id: true,
            hari: true,
            jamMulai: true,
            jamSelesai: true,
            kelas: {
              select: {
                namaKelas: true,
              },
            },
            mataPelajaran: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    return {
      success: true,
      data: guru,
    };
  } catch (error) {
    console.error("❌ getProfileGuru error:", error);
    return {
      success: false,
      error: "Gagal mengambil data profil guru",
    };
  }
}
