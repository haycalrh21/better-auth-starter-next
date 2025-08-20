export interface Kalender {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tanggal: Date;
  keterangan?: string;
}

export interface KalenderCreateInput {
  id?: string;
  tanggal: Date;
  keterangan?: string;
}

export interface KalenderUpdateInput {
  tanggal?: Date;
  keterangan?: string;
}
