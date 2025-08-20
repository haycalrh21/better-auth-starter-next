import { Guru } from "./guru";
import { Jadwal } from "./jadwal";
import { KKM } from "./kkm";

export interface MataPelajaran {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nama: string;
  kode?: string;
  deskripsi?: string;
  guru?: Guru;
  guruId?: string;
  KKM: KKM[];
  Jadwal: Jadwal[];
}

export interface MataPelajaranCreateInput {
  id?: string;
  nama: string;
  kode?: string;
  deskripsi?: string;
  guruId?: string;
}

export interface MataPelajaranUpdateInput {
  nama?: string;
  kode?: string;
  deskripsi?: string;
  guruId?: string;
}

export interface MataPelajaranWithRelations extends MataPelajaran {
  guru?: Guru;
  KKM: KKM[];
  Jadwal: Jadwal[];
}
