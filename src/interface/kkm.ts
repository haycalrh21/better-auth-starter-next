import { MataPelajaran } from "./mata-pelajaran";

export interface KKM {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  MataPelajaran: MataPelajaran;
  mataPelajaranId: string;
  nilai: number;
}

export interface KKMCreateInput {
  id?: string;
  mataPelajaranId: string;
  nilai: number;
}

export interface KKMUpdateInput {
  mataPelajaranId?: string;
  nilai?: number;
}

export interface KKMWithRelations extends KKM {
  MataPelajaran: MataPelajaran;
}

// Specific interface for table data that matches database return
export interface KKMTableData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  mataPelajaranId: string;
  nilai: number;
  MataPelajaran: {
    id: string;
    nama: string;
    kode: string | null;
    guru: {
      id: string;
      namaLengkap: string;
    } | null;
  };
}
