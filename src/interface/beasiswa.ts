import { StatusBeasiswa } from "./enums";
import { Siswa } from "./siswa";

export interface Beasiswa {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nama: string;
  deskripsi?: string;
  nominal: number;
  mulaiBerlaku?: Date;
  selesaiBerlaku?: Date;
  status: StatusBeasiswa;
  siswaId: string;
  siswa: Siswa;
}

export interface BeasiswaCreateInput {
  id?: string;
  nama: string;
  deskripsi?: string;
  nominal: number;
  mulaiBerlaku?: Date;
  selesaiBerlaku?: Date;
  status?: StatusBeasiswa;
  siswaId: string;
}

export interface BeasiswaUpdateInput {
  nama?: string;
  deskripsi?: string;
  nominal?: number;
  mulaiBerlaku?: Date;
  selesaiBerlaku?: Date;
  status?: StatusBeasiswa;
  siswaId?: string;
}

export interface BeasiswaWithRelations extends Beasiswa {
  siswa: Siswa;
}
