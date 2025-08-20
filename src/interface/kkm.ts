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
