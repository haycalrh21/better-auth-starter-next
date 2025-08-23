"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Hari } from "@/interface/enums";
import type { KelasWithJadwal } from "@/interface/absensi";

export async function getAbsensiGuru() {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        message: "Anda harus login terlebih dahulu",
        data: null,
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        message: "Akses ditolak. Hanya guru yang dapat mengakses halaman ini",
        data: null,
      };
    }
    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: { userId: currentUser.id },
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
        message: "Data guru tidak ditemukan",
        data: null,
      };
    }

    // Get classes with their schedules and students
    const kelasWithJadwal = await prisma.kelas.findMany({
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
        jenjang: true,
        jurusan: true,
        siswa: {
          where: {
            status: "AKTIF",
          },
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
          orderBy: {
            namaLengkap: "asc",
          },
        },
        Jadwal: {
          where: {
            guruId: guru.id,
          },
          select: {
            id: true,
            hari: true,
            jamMulai: true,
            jamSelesai: true,
            mataPelajaran: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
          orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
        },
      },
      orderBy: {
        namaKelas: "asc",
      },
    });

    // Transform Jadwal to jadwal to match interface
    const kelas = kelasWithJadwal.map((k) => ({
      ...k,
      jadwal: k.Jadwal,
    })) as KelasWithJadwal[];

    // Calculate statistics
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get attendance data for all classes taught by this teacher
    const attendanceData = await prisma.absensi.findMany({
      where: {
        guruId: guru.id,
        bulan: currentMonth,
        tahun: currentYear,
      },
      select: {
        status: true,
        kelasId: true,
      },
    });

    // Calculate overall attendance statistics
    const totalHadir = attendanceData.filter(
      (a) => a.status === "HADIR"
    ).length;
    const totalSakit = attendanceData.filter(
      (a) => a.status === "SAKIT"
    ).length;
    const totalIzin = attendanceData.filter((a) => a.status === "IZIN").length;
    const totalAlfa = attendanceData.filter((a) => a.status === "ALFA").length;
    const totalPertemuan = attendanceData.length;

    const attendancePercentage = {
      hadir: totalPertemuan > 0 ? (totalHadir / totalPertemuan) * 100 : 0,
      sakit: totalPertemuan > 0 ? (totalSakit / totalPertemuan) * 100 : 0,
      izin: totalPertemuan > 0 ? (totalIzin / totalPertemuan) * 100 : 0,
      alfa: totalPertemuan > 0 ? (totalAlfa / totalPertemuan) * 100 : 0,
    };

    const stats = {
      totalKelas: kelas.length,
      totalSiswa: kelas.reduce((sum, kelas) => sum + kelas.siswa.length, 0),
      totalJadwal: kelas.reduce((sum, kelas) => sum + kelas.jadwal.length, 0),
      // Attendance statistics
      attendanceStats: {
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlfa,
        totalPertemuan,
        attendancePercentage,
      },
    };

    return {
      success: true,
      message: "Data berhasil dimuat",
      data: {
        guru,
        kelas,
        stats,
      },
    };
  } catch (error) {
    console.error("Error in getAbsensiGuru:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat data",
      data: null,
    };
  }
}
