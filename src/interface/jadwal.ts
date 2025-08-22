export interface Jadwal {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  hari: string; // SENIN, SELASA, RABU, KAMIS, JUMAT
  jamMulai: string;
  jamSelesai: string;
  kelasId: string;
  kelas: {
    id: string;
    namaKelas: string;
  };
  guruId: string;
  guru: {
    id: string;
    namaLengkap: string;
  };
  mataPelajaranId: string | null;
  mataPelajaran?: {
    id: string;
    nama: string;
  } | null;
}

export interface JadwalCreateInput {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelasId: string;
  guruId: string;
  mataPelajaranId?: string | null;
}

export interface JadwalUpdateInput {
  hari?: string;
  jamMulai?: string;
  jamSelesai?: string;
  kelasId?: string;
  guruId?: string;
  mataPelajaranId?: string | null;
}

export interface GenerateScheduleInput {
  kelasIds: string[];
  startTime?: string; // default: "07:00"
  endTime?: string; // default: "15:00"
  breakTimes?: {
    start: string;
    end: string;
    name: string;
  }[];
  lessonDuration?: number; // default: 45 minutes
}
