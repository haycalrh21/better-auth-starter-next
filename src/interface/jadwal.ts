import { Hari } from "./enums";
import { Kelas } from "./kelas";
import { Guru } from "./guru";
import { MataPelajaran } from "./mata-pelajaran";

export interface Jadwal {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  hari: Hari;
  jamMulai: string;
  jamSelesai: string;
  kelasId: string;
  kelas: Kelas;
  guruId: string;
  guru: Guru;
  mataPelajaranId?: string;
  mataPelajaran?: MataPelajaran;
}

export interface JadwalCreateInput {
  id?: string;
  hari: Hari;
  jamMulai: string;
  jamSelesai: string;
  kelasId: string;
  guruId: string;
  mataPelajaranId?: string;
}

export interface JadwalUpdateInput {
  hari?: Hari;
  jamMulai?: string;
  jamSelesai?: string;
  kelasId?: string;
  guruId?: string;
  mataPelajaranId?: string;
}

export interface JadwalWithRelations extends Jadwal {
  kelas: Kelas;
  guru: Guru;
  mataPelajaran?: MataPelajaran;
}
