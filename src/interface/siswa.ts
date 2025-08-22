import { Gender, Agama, StatusSiswa, Jenjang } from "./enums";
import { User } from "./user";
import { Beasiswa } from "./beasiswa";
import { Kelas } from "./kelas";
import { Pembayaran } from "./pembayaran";

export interface Siswa {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  namaLengkap: string;
  nisn?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  statsuSiswa?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  tahunMasuk?: number;
  tingkatSaatIni?: number; // Current grade level (7-12)
  jenjangSaatIni?: Jenjang; // Current education level

  // Student Status and Graduation Tracking
  status: StatusSiswa;
  tahunLulus?: number; // Year of graduation
  tanggalLulus?: Date; // Exact graduation date
  alasanKeluar?: string; // Reason for leaving (if not graduated)

  namaAyah?: string;
  namaIbu?: string;
  namaWali?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  pekerjaanWali?: string;
  noHpOrtu?: string;
  isProfileComplete: boolean;
  userId: string;
  user?: User;
  Beasiswa?: Beasiswa[];
  kelas?: Kelas[];
  Pembayaran?: Pembayaran[];
}

export interface SiswaCreateInput {
  id?: string;
  namaLengkap: string;
  nisn?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  statsuSiswa?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  tahunMasuk?: number;
  namaAyah?: string;
  namaIbu?: string;
  namaWali?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  pekerjaanWali?: string;
  noHpOrtu?: string;
  isProfileComplete?: boolean;
  userId: string;
}

export interface SiswaUpdateInput {
  namaLengkap?: string;
  nisn?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;
  jenisKelamin?: Gender;
  agama?: Agama;
  noHp?: string;
  emailAlternatif?: string;
  alamatLengkap?: string;
  kelurahan?: string;
  statsuSiswa?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  tahunMasuk?: number;
  namaAyah?: string;
  namaIbu?: string;
  namaWali?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  pekerjaanWali?: string;
  noHpOrtu?: string;
  isProfileComplete?: boolean;
  userId?: string;
}

// FIXED: Interface untuk data siswa tanpa relasi (dari Prisma findMany tanpa include)
export interface SiswaBasic {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  namaLengkap: string;
  nisn: string | null;
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  jenisKelamin: Gender | null; // CHANGED: Removed undefined
  agama: Agama | null;
  noHp: string | null;
  emailAlternatif: string | null;
  alamatLengkap: string | null;
  kelurahan: string | null;
  statsuSiswa: string | null;
  kecamatan: string | null;
  kabupatenKota: string | null;
  provinsi: string | null;
  kodePos: string | null;
  tahunMasuk: number | null;
  namaAyah: string | null;
  namaIbu: string | null;
  namaWali: string | null;
  pekerjaanAyah: string | null;
  pekerjaanIbu: string | null;
  pekerjaanWali: string | null;
  noHpOrtu: string | null;
  isProfileComplete: boolean;
}

export interface SiswaWithRelations extends Siswa {
  user: User;
  Beasiswa: Beasiswa[];
  kelas: Kelas[];
  Pembayaran: Pembayaran[];
}
