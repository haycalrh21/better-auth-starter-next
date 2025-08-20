export type Gender = "LAKI_LAKI" | "PEREMPUAN";
export type Agama =
  | "ISLAM"
  | "KRISTEN"
  | "KATOLIK"
  | "HINDU"
  | "BUDDHA"
  | "KONGHUCU";

export interface Siswa {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  namaLengkap: string;
  nisn: string | null;
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  jenisKelamin: Gender | null;
  agama: Agama | null;
  noHp: string | null;
  emailAlternatif: string | null;
  alamatLengkap: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupatenKota: string | null;
  provinsi: string | null;
  kodePos: string | null;
  kelas: string | null;
  tahunMasuk: number | null;
  namaAyah: string | null;
  namaIbu: string | null;
  namaWali: string | null;
  pekerjaanAyah: string | null;
  pekerjaanIbu: string | null;
  pekerjaanWali: string | null;
  noHpOrtu: string | null;
  isProfileComplete: boolean;
  userId: string;
  user?: string;
}
