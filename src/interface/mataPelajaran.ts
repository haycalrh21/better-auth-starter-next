export interface MataPelajaran {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nama: string;
  kode: string | null;
  deskripsi: string | null;
  guru?: {
    id: string;
    namaLengkap: string;
  } | null;
  guruId: string | null;
}

export interface MataPelajaranCreateInput {
  id?: string;
  nama: string;
  kode?: string | null;
  deskripsi?: string | null;
  guruId?: string | null;
}

export interface MataPelajaranUpdateInput {
  nama?: string;
  kode?: string | null;
  deskripsi?: string | null;
  guruId?: string | null;
}
