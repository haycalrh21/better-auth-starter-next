"use server";

import { prisma } from "@/lib/prisma";
import { StatusAbsensi } from "@/interface/enums";
import type {
  AttendanceStats,
  KelasWithAttendanceStats,
} from "@/interface/absensi";

export async function getKelasWithAttendance(userId: string) {
  try {
    // First, get the guru record using userId
    const guru = await prisma.guru.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        namaLengkap: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
        data: [],
      };
    }

    // Get current month and year for attendance stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get classes taught by this teacher from Jadwal (schedule) table
    // Following the specification that teachers can only select classes they actually teach
    const jadwalData = await prisma.jadwal.findMany({
      where: {
        guruId: guru.id,
      },
      include: {
        kelas: {
          include: {
            siswa: {
              where: {
                status: "AKTIF", // Only active students
              },
              select: {
                id: true,
                namaLengkap: true,
                nisn: true,
              },
            },
            guru: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
        mataPelajaran: {
          select: {
            nama: true,
          },
        },
      },
    });

    // Group jadwal by kelas to avoid duplicates
    const kelasMap = new Map<string, any>();

    jadwalData.forEach((jadwal) => {
      const kelasId = jadwal.kelas.id;
      if (!kelasMap.has(kelasId)) {
        kelasMap.set(kelasId, {
          ...jadwal.kelas,
          jadwal: [],
          mataPelajaran:
            jadwal.mataPelajaran?.nama || "Tidak ada mata pelajaran",
        });
      }

      // Add schedule to this class
      kelasMap.get(kelasId)!.jadwal.push({
        hari: jadwal.hari,
        jam: `${jadwal.jamMulai} - ${jadwal.jamSelesai}`,
      });
    });

    const uniqueKelas = Array.from(kelasMap.values());

    // Calculate attendance statistics for each class
    const kelasWithStats: KelasWithAttendanceStats[] = await Promise.all(
      uniqueKelas.map(async (kelas) => {
        // Get attendance data for this class in current month
        const attendanceData = await prisma.absensi.findMany({
          where: {
            kelasId: kelas.id,
            guruId: guru.id,
            bulan: currentMonth,
            tahun: currentYear,
          },
          select: {
            status: true,
          },
        });

        // Calculate statistics
        const totalHadir = attendanceData.filter(
          (a) => a.status === StatusAbsensi.HADIR
        ).length;
        const totalSakit = attendanceData.filter(
          (a) => a.status === StatusAbsensi.SAKIT
        ).length;
        const totalIzin = attendanceData.filter(
          (a) => a.status === StatusAbsensi.IZIN
        ).length;
        const totalAlfa = attendanceData.filter(
          (a) => a.status === StatusAbsensi.ALFA
        ).length;

        const totalPertemuan = attendanceData.length;
        const persentaseKehadiran =
          totalPertemuan > 0 ? (totalHadir / totalPertemuan) * 100 : 0;

        const attendanceStats: AttendanceStats = {
          totalHadir,
          totalSakit,
          totalIzin,
          totalAlfa,
          totalPertemuan,
          persentaseKehadiran,
        };

        return {
          id: kelas.id,
          nama: kelas.namaKelas,
          tingkat: kelas.tingkat,
          jurusan: kelas.jurusan || "-",
          mataPelajaran: kelas.mataPelajaran,
          jumlahSiswa: kelas.siswa.length,
          jadwal: kelas.jadwal,
          waliKelas: kelas.guru?.namaLengkap || "Belum ditentukan",
          tahunAjaran: kelas.tahunAjaran,
          semester: kelas.semester,
          attendanceStats,
        };
      })
    );

    return {
      success: true,
      data: kelasWithStats,
    };
  } catch (error) {
    console.error("Error fetching kelas with attendance:", error);
    return {
      success: false,
      error: "Gagal mengambil data kelas dengan statistik absensi",
      data: [],
    };
  }
}
