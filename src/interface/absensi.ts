// Attendance (Absensi) Interface Definitions
// UI Form: Month selector, Class selection, Student names with radio buttons

export interface Absensi {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Time Period for UI
  bulan: number; // Month (1-12) for month selector
  tahun: number; // Year
  tanggal: Date; // Specific attendance date

  // Radio Button Selection: Hadir, Sakit, Izin, Alfa
  status: StatusAbsensi;
  keterangan?: string | null; // Required for SAKIT and IZIN

  // Relations
  siswaId: string;
  kelasId: string; // Class being taught by teacher
  guruId: string; // Teacher teaching this class

  // Populated relations
  siswa?: Siswa;
  kelas?: Kelas;
  guru?: Guru;
}

export interface AbsensiCreateInput {
  bulan: number;
  tahun: number;
  tanggal: Date;
  status: StatusAbsensi;
  keterangan?: string; // Required for SAKIT and IZIN
  siswaId: string;
  kelasId: string;
  guruId: string;
}

export interface AbsensiUpdateInput {
  id: string;
  status?: StatusAbsensi;
  keterangan?: string;
}

// For UI Form - Bulk attendance input for entire class
export interface BulkAbsensiInput {
  bulan: number;
  tahun: number;
  tanggal: Date;
  kelasId: string;
  guruId: string;
  absensiData: {
    siswaId: string;
    status: StatusAbsensi;
    keterangan?: string;
  }[];
}

// Filter for attendance queries
export interface AbsensiFilter {
  siswaId?: string;
  kelasId?: string;
  guruId?: string;
  bulan?: number;
  tahun?: number;
  status?: StatusAbsensi[];
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
}

// Attendance summary statistics
export interface AbsensiSummary {
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlfa: number;
  totalPertemuan: number;
  persentaseKehadiran: number;
}

// Monthly attendance report
export interface MonthlyAttendanceReport {
  bulan: number;
  tahun: number;
  kelasId: string;
  namaKelas: string;
  students: {
    siswaId: string;
    namaLengkap: string;
    attendanceData: {
      tanggal: Date;
      status: StatusAbsensi;
      keterangan?: string;
    }[];
    summary: AbsensiSummary;
  }[];
}

// Holiday validation interface
export interface HolidayValidation {
  isHoliday: boolean;
  holidayInfo?: {
    tanggalMulai: Date;
    tanggalSelesai?: Date;
    keterangan?: string;
    semester: string;
  };
}

// Attendance form for specific class and date
export interface AbsensiFormData {
  tanggal: Date;
  kelasId: string;
  attendanceRecords: {
    siswaId: string;
    status: StatusAbsensi;
    keterangan?: string;
  }[];
}

// Class with schedule information for teacher
export interface KelasWithJadwal {
  id: string;
  namaKelas: string;
  tahunAjaran: string;
  semester: string;
  jenjang: string;
  jurusan?: string;
  siswa: {
    id: string;
    namaLengkap: string;
    nisn?: string;
  }[];
  jadwal: {
    id: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    mataPelajaran?: {
      id: string;
      nama: string;
    };
  }[];
}

// Validation response for attendance submission
export interface AbsensiValidationResult {
  isValid: boolean;
  errors?: string[];
  holidayWarning?: string;
}

// Import types
import type { Siswa } from "./siswa";
import type { Kelas } from "./kelas";
import type { Guru } from "./guru";
import type { StatusAbsensi } from "./enums";

// Interface for attendance statistics used in class management
export interface AttendanceStats {
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlfa: number;
  totalPertemuan: number;
  persentaseKehadiran: number;
}

// Interface for class data with attendance statistics
export interface KelasWithAttendanceStats {
  id: string;
  nama: string;
  tingkat: number;
  jurusan?: string;
  mataPelajaran: string;
  jumlahSiswa: number;
  jadwal: {
    hari: string;
    jam: string;
  }[];
  waliKelas: string;
  tahunAjaran: string;
  semester: string;
  attendanceStats: AttendanceStats;
}
