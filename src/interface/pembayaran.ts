import { TipePembayaran, StatusPembayaran, MetodePembayaran } from "./enums";
import { Siswa } from "./siswa";
import { Kelas } from "./kelas";

export interface Pembayaran {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tipe: TipePembayaran;
  jumlah: number;
  tanggal: Date;
  status: StatusPembayaran;
  metode?: MetodePembayaran;
  siswaId: string;
  siswa: Siswa;
  kelasId?: string;
  kelas?: Kelas;
}

export interface PembayaranCreateInput {
  id?: string;
  tipe: TipePembayaran;
  jumlah: number;
  tanggal: Date;
  status?: StatusPembayaran;
  metode?: MetodePembayaran;
  siswaId: string;
  kelasId?: string;
}

export interface PembayaranUpdateInput {
  tipe?: TipePembayaran;
  jumlah?: number;
  tanggal?: Date;
  status?: StatusPembayaran;
  metode?: MetodePembayaran;
  siswaId?: string;
  kelasId?: string;
}

export interface PembayaranWithRelations extends Pembayaran {
  siswa: Siswa;
  kelas?: Kelas;
}
