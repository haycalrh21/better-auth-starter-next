export type Gender = "LAKI_LAKI" | "PEREMPUAN";
export type Agama =
  | "ISLAM"
  | "KRISTEN"
  | "KATOLIK"
  | "HINDU"
  | "BUDDHA"
  | "KONGHUCU";

export type StatusKawin =
  | "BELUM_KAWIN"
  | "KAWIN"
  | "CERAI_HIDUP"
  | "CERAI_MATI";
export interface Guru {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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
  kelas: string | null;
  isProfileComplete: boolean;
  userId: string;
  user?: string;
}
