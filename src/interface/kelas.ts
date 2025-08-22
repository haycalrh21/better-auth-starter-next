import { Guru } from "./guru";
import { Jadwal } from "./jadwal";
import { Pembayaran } from "./pembayaran";
import { Siswa } from "./siswa";
import { Jenjang } from "./enums";

export interface Kelas {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Class Identity
  namaKelas: string; // e.g., "7A", "8B", "10 IPA 1", "11 IPS 2"
  tingkat: number; // Grade level: 7, 8, 9, 10, 11, 12
  seksi: string; // Class section: "A", "B", "C", etc.
  // Academic Period
  tahunAjaran: string; // Academic year: "2024/2025"
  semester: string; // Current semester: "1" or "2"
  // Program and School Level
  jenjang: Jenjang; // Education level: SMP or SMA
  jurusan?: string; // Program: "IPA", "IPS", "Bahasa" (for SMA only)
  // Status
  isActive: boolean; // Is this class currently active
  kapasitas: number; // Maximum students per class
  // Relations
  guru: Guru;
  guruId: string;
  siswa: Siswa[];
  Jadwal: Jadwal[];
  Pembayaran: Pembayaran[];
}

export interface KelasCreateInput {
  id?: string;
  namaKelas: string;
  tingkat: number;
  seksi: string;
  tahunAjaran: string;
  semester: string;
  jenjang: Jenjang;
  jurusan?: string;
  isActive?: boolean;
  kapasitas?: number;
  guruId: string;
}

export interface KelasUpdateInput {
  namaKelas?: string;
  tingkat?: number;
  seksi?: string;
  tahunAjaran?: string;
  semester?: string;
  jenjang?: Jenjang;
  jurusan?: string;
  isActive?: boolean;
  kapasitas?: number;
  guruId?: string;
}

export interface KelasWithRelations extends Kelas {
  guru: Guru;
  siswa: Siswa[];
  Jadwal: Jadwal[];
  Pembayaran: Pembayaran[];
}
