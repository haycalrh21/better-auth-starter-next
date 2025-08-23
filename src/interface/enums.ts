// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  GURU = "GURU",
  SISWA = "SISWA",
}

export enum Gender {
  LAKI_LAKI = "LAKI_LAKI",
  PEREMPUAN = "PEREMPUAN",
}

export enum Agama {
  ISLAM = "ISLAM",
  KRISTEN = "KRISTEN",
  KATOLIK = "KATOLIK",
  HINDU = "HINDU",
  BUDDHA = "BUDDHA",
  KONGHUCU = "KONGHUCU",
}

export enum StatusKawin {
  BELUM_KAWIN = "BELUM_KAWIN",
  KAWIN = "KAWIN",
  CERAI_HIDUP = "CERAI_HIDUP",
  CERAI_MATI = "CERAI_MATI",
}

export enum StatusBeasiswa {
  AKTIF = "AKTIF",
  NONAKTIF = "NONAKTIF",
  SELESAI = "SELESAI",
}

export enum TipePembayaran {
  SPP = "SPP",
  BUKU = "BUKU",
  EKSKUL = "EKSKUL",
  LAINNYA = "LAINNYA",
}

export enum StatusPembayaran {
  BELUM_BAYAR = "BELUM_BAYAR",
  SUDAH_BAYAR = "SUDAH_BAYAR",
  TERTUNDA = "TERTUNDA",
}

export enum MetodePembayaran {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT",
  E_WALLET = "E_WALLET",
}

export enum Hari {
  SENIN = "SENIN",
  SELASA = "SELASA",
  RABU = "RABU",
  KAMIS = "KAMIS",
  JUMAT = "JUMAT",
  SABTU = "SABTU",
}

export enum StatusSiswa {
  AKTIF = "AKTIF", // Currently enrolled and active
  LULUS = "LULUS", // Graduated successfully
  PINDAH = "PINDAH", // Transferred to another school
  KELUAR = "KELUAR", // Dropped out
  DIKELUARKAN = "DIKELUARKAN", // Expelled
  CUTI = "CUTI", // On leave/hiatus
}

export enum Jenjang {
  SMP = "SMP", // Sekolah Menengah Pertama (Junior High)
  SMA = "SMA", // Sekolah Menengah Atas (Senior High)
  SMK = "SMK", // Sekolah Menengah Kejuruan (Vocational High)
}

// ATTENDANCE STATUS ENUM (Radio Button Options)
export enum StatusAbsensi {
  HADIR = "HADIR", // Present - radio button option
  SAKIT = "SAKIT", // Sick - radio button option (requires keterangan)
  IZIN = "IZIN", // Permission - radio button option (requires keterangan)
  ALFA = "ALFA", // Absent - radio button option
}
