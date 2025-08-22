import { prisma } from "@/lib/prisma";

/**
 * Get all classes with comprehensive relations
 */
export async function getDataKelas() {
  const data = await prisma.kelas.findMany({
    orderBy: [{ jenjang: "asc" }, { namaKelas: "asc" }, { createdAt: "desc" }],
    include: {
      guru: {
        select: {
          id: true,
          namaLengkap: true,
          nip: true,
          emailAlternatif: true,
        },
      },
      siswa: {
        select: {
          id: true,
          namaLengkap: true,
          nisn: true,
        },
      },
      _count: {
        select: {
          siswa: true,
          Jadwal: true,
          Pembayaran: true,
        },
      },
      Jadwal: {
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
          mataPelajaran: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
  });
  return data;
}

/**
 * Get classes filtered by academic year and semester
 */
export async function getKelassByPeriod(tahunAjaran: string, semester: string) {
  const data = await prisma.kelas.findMany({
    where: {
      tahunAjaran,
      semester,
      isActive: true,
    },
    orderBy: [{ jenjang: "asc" }, { namaKelas: "asc" }],
    include: {
      guru: {
        select: {
          id: true,
          namaLengkap: true,
          nip: true,
        },
      },
      siswa: {
        select: {
          id: true,
          namaLengkap: true,
          nisn: true,
        },
      },
      _count: {
        select: {
          siswa: true,
        },
      },
    },
  });
  return data;
}

/**
 * Get single class with full details
 */
export async function getKelasById(id: string) {
  const data = await prisma.kelas.findUnique({
    where: { id },
    include: {
      guru: {
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tahunAjaran: true,
              semester: true,
            },
          },
        },
      },
      siswa: {
        include: {
          kelas: {
            select: {
              id: true,
              namaKelas: true,
              tahunAjaran: true,
              semester: true,
            },
          },
        },
      },
      _count: {
        select: {
          siswa: true,
          Jadwal: true,
          Pembayaran: true,
        },
      },
      Jadwal: {
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
          mataPelajaran: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
  });
  return data;
}

/**
 * Get available teachers for class assignment
 */
export async function getAvailableTeachers(
  tahunAjaran: string,
  semester: string
) {
  const data = await prisma.guru.findMany({
    where: {
      kelas: {
        none: {
          tahunAjaran,
          semester,
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      namaLengkap: true,
      nip: true,
      emailAlternatif: true,
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });
  return data;
}

/**
 * Get unassigned students for class assignment
 */
export async function getUnassignedStudents(
  tahunAjaran: string,
  semester: string
) {
  const data = await prisma.siswa.findMany({
    where: {
      status: "AKTIF",
      kelas: {
        none: {
          tahunAjaran,
          semester,
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      namaLengkap: true,
      nisn: true,
      emailAlternatif: true,
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });
  return data;
}

/**
 * Get students for promotion based on previous academic year
 */
export async function getStudentsForPromotion(
  fromTahunAjaran: string,
  fromGrade: number,
  jenjang: string
) {
  const data = await prisma.siswa.findMany({
    where: {
      status: "AKTIF",
      kelas: {
        some: {
          tahunAjaran: fromTahunAjaran,
          isActive: true,
          namaKelas: {
            startsWith: fromGrade.toString(),
          },
          jenjang: jenjang as any,
        },
      },
    },
    include: {
      kelas: {
        where: {
          tahunAjaran: fromTahunAjaran,
          isActive: true,
        },
        select: {
          id: true,
          namaKelas: true,
          jenjang: true,
          jurusan: true,
        },
      },
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });
  return data;
}

/**
 * Get existing classes with capacity information for student assignment
 */
export async function getExistingClassesWithCapacity(
  tahunAjaran: string,
  semester: string
) {
  const data = await prisma.kelas.findMany({
    where: {
      tahunAjaran,
      semester,
      isActive: true,
    },
    include: {
      siswa: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      namaKelas: "asc",
    },
  });

  // Transform data to include capacity calculations
  return data.map((kelas) => ({
    id: kelas.id,
    namaKelas: kelas.namaKelas,
    kapasitas: 35, // Default capacity
    currentStudents: kelas.siswa.length,
    availableSpots: Math.max(0, 35 - kelas.siswa.length),
  }));
}

/**
 * Get class statistics
 */
export async function getKelasStatistics(
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause =
    tahunAjaran && semester
      ? { tahunAjaran, semester, isActive: true }
      : { isActive: true };

  const totalKelas = await prisma.kelas.count({
    where: whereClause,
  });

  const kelasByJenjang = await prisma.kelas.groupBy({
    by: ["jenjang"],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  const totalSiswa = await prisma.siswa.count({
    where: {
      status: "AKTIF",
      kelas: {
        some: whereClause,
      },
    },
  });

  const totalGuru = await prisma.guru.count({
    where: {
      kelas: {
        some: whereClause,
      },
    },
  });

  return {
    totalKelas,
    kelasByJenjang,
    totalSiswa,
    totalGuru,
  };
}
