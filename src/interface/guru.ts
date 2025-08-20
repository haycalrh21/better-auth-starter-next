import { Gender, Agama, StatusKawin } from "./enums";
import { Jadwal } from "./jadwal";
import { Kelas } from "./kelas";
import { MataPelajaran } from "./mata-pelajaran";
import { User } from "./user";

export interface Guru {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  namaLengkap: string;
  nip?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  statusKawin?: StatusKawin;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  tahunLulus?: number;
  institusi?: string;
  statusKepegawaian?: string;
  golongan?: string;
  pangkat?: string;
  tmt?: Date;
  masaKerja?: number;
  bidangStudi?: string;
  walikelas?: string;
  isProfileComplete: boolean;
  userId: string;
  kelas: Kelas[];
  mataPelajaran: MataPelajaran[];
  user: User;
  Jadwal: Jadwal[];
}

export interface GuruCreateInput {
  id?: string;
  namaLengkap: string;
  nip?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  statusKawin?: StatusKawin;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  tahunLulus?: number;
  institusi?: string;
  statusKepegawaian?: string;
  golongan?: string;
  pangkat?: string;
  tmt?: Date;
  masaKerja?: number;
  bidangStudi?: string;
  walikelas?: string;
  isProfileComplete?: boolean;
  userId: string;
}

export interface GuruUpdateInput {
  namaLengkap?: string;
  nip?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  statusKawin?: StatusKawin;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  tahunLulus?: number;
  institusi?: string;
  statusKepegawaian?: string;
  golongan?: string;
  pangkat?: string;
  tmt?: Date;
  masaKerja?: number;
  bidangStudi?: string;
  walikelas?: string;
  isProfileComplete?: boolean;
  userId?: string;
}

// ADDED: Interface untuk data guru tanpa relasi (dari Prisma findMany tanpa include)
export interface GuruBasic {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  namaLengkap: string;
  nip: string | null;
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  jenisKelamin: Gender | null;
  agama: Agama | null;
  statusKawin: StatusKawin | null;
  noHp: string | null;
  emailAlternatif: string | null;
  alamatLengkap: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupatenKota: string | null;
  provinsi: string | null;
  kodePos: string | null;
  pendidikanTerakhir: string | null;
  jurusan: string | null;
  tahunLulus: number | null;
  institusi: string | null;
  statusKepegawaian: string | null;
  golongan: string | null;
  pangkat: string | null;
  tmt: Date | null;
  masaKerja: number | null;
  bidangStudi: string | null;
  walikelas: string | null;
  isProfileComplete: boolean;
}

export interface GuruWithRelations extends Guru {
  kelas: Kelas[];
  mataPelajaran: MataPelajaran[];
  user: User;
  Jadwal: Jadwal[];
}
