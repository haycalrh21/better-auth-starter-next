// Assessment (Penilaian) Interface Definitions
// Categories: "Umum", "UTS", "UAS", "Ulangan Harian" (no enums, just strings)

export interface Penilaian {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Assessment Info
  nama: string; // Assessment name
  kategori: string; // "Umum", "UTS", "UAS", "Ulangan Harian"
  tanggalPenilaian: Date; // Assessment date
  nilaiMaksimal: number; // Maximum score (default 100)

  // Relations
  kelasId: string; // Class being assessed
  guruId: string; // Teacher creating assessment

  // Populated relations
  kelas?: Kelas;
  guru?: Guru;
  nilaiSiswa?: NilaiSiswa[];
}

export interface PenilaianCreateInput {
  nama: string;
  kategori: string; // "Umum", "UTS", "UAS", "Ulangan Harian"
  tanggalPenilaian: Date;
  nilaiMaksimal?: number; // Default 100
  kelasId: string;
  guruId: string;
}

export interface PenilaianUpdateInput {
  id: string;
  nama?: string;
  kategori?: string;
  tanggalPenilaian?: Date;
  nilaiMaksimal?: number;
}

// Individual Student Score
export interface NilaiSiswa {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  nilai: number; // Numeric score

  // Relations
  siswaId: string;
  penilaianId: string;

  // Populated relations
  siswa?: Siswa;
  penilaian?: Penilaian;
}

export interface NilaiSiswaCreateInput {
  nilai: number;
  siswaId: string;
  penilaianId: string;
}

export interface NilaiSiswaUpdateInput {
  id: string;
  nilai?: number;
}

// Bulk score input for entire class
export interface BulkNilaiInput {
  penilaianId: string;
  nilaiData: {
    siswaId: string;
    nilai: number;
  }[];
}

// Filter for assessments
export interface PenilaianFilter {
  kelasId?: string;
  guruId?: string;
  kategori?: string[]; // Filter by categories
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
}

// Assessment statistics
export interface PenilaianStats {
  totalAssessments: number;
  byCategory: Record<string, number>; // Count by category
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

// Class assessment report
export interface ClassAssessmentReport {
  kelasId: string;
  namaKelas: string;
  assessments: {
    penilaianId: string;
    nama: string;
    kategori: string;
    tanggalPenilaian: Date;
    students: {
      siswaId: string;
      namaLengkap: string;
      nilai: number;
    }[];
    stats: {
      rataRata: number;
      nilaiTertinggi: number;
      nilaiTerendah: number;
    };
  }[];
}

// Student grade report
export interface StudentGradeReport {
  siswaId: string;
  namaLengkap: string;
  kelasId: string;
  namaKelas: string;
  grades: {
    penilaianId: string;
    nama: string;
    kategori: string;
    tanggalPenilaian: Date;
    nilai: number;
    nilaiMaksimal: number;
    persentase: number;
  }[];
  summary: {
    totalAssessments: number;
    rataRata: number;
    byCategory: Record<
      string,
      {
        count: number;
        average: number;
      }
    >;
  };
}

// Import types
import type { Siswa } from "./siswa";
import type { Kelas } from "./kelas";
import type { Guru } from "./guru";
