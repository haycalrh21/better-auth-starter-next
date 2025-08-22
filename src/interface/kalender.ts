export interface Kalender {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  semester: string;
  keterangan: string | null;
}

export interface KalenderCreateInput {
  id?: string;
  tanggalMulai: Date;
  tanggalSelesai?: Date | null;
  semester: string;
  keterangan?: string | null;
}

export interface KalenderUpdateInput {
  tanggalMulai?: Date;
  tanggalSelesai?: Date | null;
  semester?: string;
  keterangan?: string | null;
}
