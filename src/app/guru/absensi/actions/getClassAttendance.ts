"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { MonthlyAttendanceReport } from "@/interface/absensi";

export async function getClassAttendance(
  kelasId: string,
  bulan?: number,
  tahun?: number
) {
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
      select: { id: true },
    });

    if (!guru) {
      return {
        success: false,
        message: "Data guru tidak ditemukan",
        data: null,
      };
    }

    // Verify teacher teaches this class
    const teachesClass = await prisma.jadwal.findFirst({
      where: {
        guruId: guru.id,
        kelasId: kelasId,
      },
      include: {
        kelas: {
          select: {
            id: true,
            namaKelas: true,
            tahunAjaran: true,
            semester: true,
          },
        },
      },
    });

    if (!teachesClass) {
      return {
        success: false,
        message: "Anda tidak mengajar di kelas ini",
        data: null,
      };
    }

    // Set default month and year if not provided
    const currentDate = new Date();
    const targetMonth = bulan || currentDate.getMonth() + 1;
    const targetYear = tahun || currentDate.getFullYear();

    // Get attendance data for the specified month
    const attendanceData = await prisma.absensi.findMany({
      where: {
        kelasId: kelasId,
        bulan: targetMonth,
        tahun: targetYear,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: "asc" }, { siswa: { namaLengkap: "asc" } }],
    });

    // Get all students in the class
    const classStudents = await prisma.siswa.findMany({
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
      },
      orderBy: {
        namaLengkap: "asc",
      },
    });

    // Group attendance by student
    const studentAttendanceMap = new Map();

    classStudents.forEach((student) => {
      studentAttendanceMap.set(student.id, {
        siswaId: student.id,
        namaLengkap: student.namaLengkap,
        nisn: student.nisn,
        attendanceData: [],
        summary: {
          totalHadir: 0,
          totalSakit: 0,
          totalIzin: 0,
          totalAlfa: 0,
          totalPertemuan: 0,
          persentaseKehadiran: 0,
        },
      });
    });

    // Process attendance data
    attendanceData.forEach((attendance) => {
      const studentData = studentAttendanceMap.get(attendance.siswaId);
      if (studentData) {
        studentData.attendanceData.push({
          tanggal: attendance.tanggal,
          status: attendance.status,
          keterangan: attendance.keterangan,
        });

        // Update summary
        studentData.summary.totalPertemuan++;
        switch (attendance.status) {
          case "HADIR":
            studentData.summary.totalHadir++;
            break;
          case "SAKIT":
            studentData.summary.totalSakit++;
            break;
          case "IZIN":
            studentData.summary.totalIzin++;
            break;
          case "ALFA":
            studentData.summary.totalAlfa++;
            break;
        }
      }
    });

    // Calculate attendance percentages
    studentAttendanceMap.forEach((studentData) => {
      if (studentData.summary.totalPertemuan > 0) {
        studentData.summary.persentaseKehadiran = Math.round(
          (studentData.summary.totalHadir /
            studentData.summary.totalPertemuan) *
            100
        );
      }
    });

    const monthlyReport: MonthlyAttendanceReport = {
      bulan: targetMonth,
      tahun: targetYear,
      kelasId: kelasId,
      namaKelas: teachesClass.kelas.namaKelas,
      students: Array.from(studentAttendanceMap.values()),
    };

    // Get unique attendance dates for this month
    const uniqueDates = [
      ...new Set(
        attendanceData.map((a) => a.tanggal.toISOString().split("T")[0])
      ),
    ].sort();

    return {
      success: true,
      message: "Data absensi berhasil dimuat",
      data: {
        report: monthlyReport,
        kelas: teachesClass.kelas,
        uniqueDates,
        totalSessions: uniqueDates.length,
      },
    };
  } catch (error) {
    console.error("Error in getClassAttendance:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat data absensi",
      data: null,
    };
  }
}
