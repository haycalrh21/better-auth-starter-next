import { Guru } from "./guru";
import { Jadwal } from "./jadwal";
import { Pembayaran } from "./pembayaran";
import { Siswa } from "./siswa";

export interface Kelas {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  namaKelas: string;
  tahunAjaran: string;
  jurusan?: string;
  semester: string;
  guru: Guru;
  guruId: string;
  siswa: Siswa[];
  Jadwal: Jadwal[];
  Pembayaran: Pembayaran[];
}

export interface KelasCreateInput {
  id?: string;
  namaKelas: string;
  tahunAjaran: string;
  jurusan?: string;
  semester: string;
  guruId: string;
}

export interface KelasUpdateInput {
  namaKelas?: string;
  tahunAjaran?: string;
  jurusan?: string;
  semester?: string;
  guruId?: string;
}

export interface KelasWithRelations extends Kelas {
  guru: Guru;
  siswa: Siswa[];
  Jadwal: Jadwal[];
  Pembayaran: Pembayaran[];
}
