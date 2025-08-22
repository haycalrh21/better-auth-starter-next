import { prisma } from "@/lib/prisma";
import { StatusSiswa, Jenjang, Gender, Agama } from "@/interface/enums";
import { SiswaFilterInput } from "../schema";

/**
 * Get all students with comprehensive relations
 */
export async function getDataSiswa() {
  const data = await prisma.siswa.findMany({
    orderBy: [{ status: "asc" }, { namaLengkap: "asc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      },
      kelas: {
        select: {
          id: true,
          namaKelas: true,
          tahunAjaran: true,
          semester: true,
          jenjang: true,
          jurusan: true,
          isActive: true,
          guru: {
            select: {
              namaLengkap: true,
            },
          },
        },
      },
      _count: {
        select: {
          Beasiswa: true,
          Pembayaran: true,
        },
      },
    },
  });
  return data;
}

/**
 * Get students with filtering and pagination
 */
export async function getFilteredSiswa(filters: SiswaFilterInput) {
  const {
    search,
    jenjang,
    tingkat,
    status,
    kelasId,
    tahunMasuk,
    hasKelas,
    gender,
    agama,
    page,
    limit,
    sortBy,
    sortOrder,
  } = filters;

  // Build where clause
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { namaLengkap: { contains: search, mode: "insensitive" } },
      { nisn: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
      { emailAlternatif: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    whereClause.status = status;
  }

  if (jenjang) {
    whereClause.jenjangSaatIni = jenjang;
  }

  if (tingkat) {
    whereClause.tingkatSaatIni = tingkat;
  }

  if (gender) {
    whereClause.jenisKelamin = gender;
  }

  if (agama) {
    whereClause.agama = agama;
  }

  if (tahunMasuk) {
    whereClause.tahunMasuk = tahunMasuk;
  }

  if (kelasId) {
    whereClause.kelas = {
      some: {
        id: kelasId,
        isActive: true,
      },
    };
  }

  if (hasKelas !== undefined) {
    if (hasKelas) {
      whereClause.kelas = {
        some: {
          isActive: true,
        },
      };
    } else {
      whereClause.kelas = {
        none: {
          isActive: true,
        },
      };
    }
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === "namaLengkap") {
    orderBy.namaLengkap = sortOrder;
  } else if (sortBy === "nisn") {
    orderBy.nisn = sortOrder;
  } else if (sortBy === "tahunMasuk") {
    orderBy.tahunMasuk = sortOrder;
  } else if (sortBy === "tingkatSaatIni") {
    orderBy.tingkatSaatIni = sortOrder;
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.siswa.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
          },
        },
        kelas: {
          where: { isActive: true },
          select: {
            id: true,
            namaKelas: true,
            tahunAjaran: true,
            semester: true,
            jenjang: true,
            jurusan: true,
            guru: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
        _count: {
          select: {
            Beasiswa: true,
            Pembayaran: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.siswa.count({ where: whereClause }),
  ]);

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

/**
 * Get students by class
 */
export async function getSiswaByKelas(kelasId: string) {
  const data = await prisma.siswa.findMany({
    where: {
      kelas: {
        some: {
          id: kelasId,
          isActive: true,
        },
      },
      status: StatusSiswa.AKTIF,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      kelas: {
        where: { isActive: true },
        select: {
          id: true,
          namaKelas: true,
          tahunAjaran: true,
          semester: true,
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
 * Get single student with full details
 */
export async function getSiswaById(id: string) {
  const data = await prisma.siswa.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          sessions: {
            select: {
              id: true,
              createdAt: true,
              expiresAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      },
      kelas: {
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
              emailAlternatif: true,
            },
          },
        },
        orderBy: {
          tahunAjaran: "desc",
        },
      },
      Beasiswa: {
        orderBy: {
          createdAt: "desc",
        },
      },
      Pembayaran: {
        include: {
          kelas: {
            select: {
              namaKelas: true,
              tahunAjaran: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          Beasiswa: true,
          Pembayaran: true,
        },
      },
    },
  });
  return data;
}

/**
 * Get unassigned students (not in any active class)
 */
export async function getUnassignedStudents(
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause: any = {
    status: StatusSiswa.AKTIF,
    kelas: {
      none: {
        isActive: true,
        ...(tahunAjaran && { tahunAjaran }),
        ...(semester && { semester }),
      },
    },
  };

  const data = await prisma.siswa.findMany({
    where: whereClause,
    select: {
      id: true,
      namaLengkap: true,
      nisn: true,
      emailAlternatif: true,
      tahunMasuk: true,
    },
    orderBy: [{ namaLengkap: "asc" }],
  });
  return data;
}

/**
 * Get students for promotion
 */
export async function getStudentsForPromotion(
  fromGrade: number,
  jenjang: Jenjang,
  tahunAjaran: string
) {
  const data = await prisma.siswa.findMany({
    where: {
      status: StatusSiswa.AKTIF,
      kelas: {
        some: {
          tahunAjaran,
          isActive: true,
          // Note: We'll need to calculate grade from kelas.namaKelas
          // since tingkatSaatIni doesn't exist in schema
        },
      },
    },
    include: {
      kelas: {
        where: {
          tahunAjaran,
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
 * Get student statistics
 */
export async function getSiswaStatistics(
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause: any = {};

  if (tahunAjaran && semester) {
    whereClause.kelas = {
      some: {
        tahunAjaran,
        semester,
        isActive: true,
      },
    };
  }

  const totalSiswa = await prisma.siswa.count({
    where: {
      ...whereClause,
      status: StatusSiswa.AKTIF,
    },
  });

  const siswaByStatus = await prisma.siswa.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  // Note: jenjangSaatIni field doesn't exist in Prisma schema
  // We would need to calculate this from current kelas relations
  const siswaByJenjang: any[] = [];

  // For now, return empty statistics for jenjang
  // const siswaByJenjang = await prisma.siswa.groupBy({
  //   by: ["jenjangSaatIni"],
  //   where: {
  //     ...whereClause,
  //     status: StatusSiswa.AKTIF,
  //     jenjangSaatIni: { not: null },
  //   },
  //   _count: {
  //     id: true,
  //   },
  // });

  const siswaByGender = await prisma.siswa.groupBy({
    by: ["jenisKelamin"],
    where: {
      ...whereClause,
      status: StatusSiswa.AKTIF,
      jenisKelamin: { not: null },
    },
    _count: {
      id: true,
    },
  });

  // Note: tingkatSaatIni field doesn't exist in Prisma schema
  // We would need to calculate this from current kelas relations
  const siswaByTingkat: any[] = [];

  // For now, return empty statistics for tingkat
  // const siswaByTingkat = await prisma.siswa.groupBy({
  //   by: ["tingkatSaatIni"],
  //   where: {
  //     ...whereClause,
  //     status: StatusSiswa.AKTIF,
  //     tingkatSaatIni: { not: null },
  //   },
  //   _count: {
  //     id: true,
  //   },
  //   orderBy: {
  //     tingkatSaatIni: "asc",
  //   },
  // });

  const unassignedStudents = await prisma.siswa.count({
    where: {
      status: StatusSiswa.AKTIF,
      kelas: {
        none: {
          isActive: true,
          ...(tahunAjaran && { tahunAjaran }),
          ...(semester && { semester }),
        },
      },
    },
  });

  const graduatedThisYear = await prisma.siswa.count({
    where: {
      status: StatusSiswa.LULUS,
      tahunLulus: new Date().getFullYear(),
    },
  });

  return {
    totalSiswa,
    siswaByStatus,
    siswaByJenjang,
    siswaByGender,
    siswaByTingkat,
    unassignedStudents,
    graduatedThisYear,
  };
}

/**
 * Get students by academic year
 */
export async function getSiswaByAcademicYear(
  tahunAjaran: string,
  semester?: string
) {
  const whereClause: any = {
    kelas: {
      some: {
        tahunAjaran,
        isActive: true,
        ...(semester && { semester }),
      },
    },
  };

  const data = await prisma.siswa.findMany({
    where: whereClause,
    include: {
      kelas: {
        where: {
          tahunAjaran,
          isActive: true,
          ...(semester && { semester }),
        },
        select: {
          id: true,
          namaKelas: true,
          semester: true,
          jenjang: true,
          jurusan: true,
        },
      },
    },
    orderBy: [{ namaLengkap: "asc" }],
  });

  return data;
}

/**
 * Get available classes for student assignment
 */
export async function getAvailableKelasForSiswa(
  jenjang?: Jenjang,
  tingkat?: number,
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause: any = {
    isActive: true,
    ...(jenjang && { jenjang }),
    ...(tingkat && { namaKelas: { startsWith: tingkat.toString() } }),
    ...(tahunAjaran && { tahunAjaran }),
    ...(semester && { semester }),
  };

  const data = await prisma.kelas.findMany({
    where: whereClause,
    include: {
      guru: {
        select: {
          namaLengkap: true,
        },
      },
      _count: {
        select: {
          siswa: true,
        },
      },
    },
    orderBy: {
      namaKelas: "asc",
    },
  });

  // Transform to include capacity info
  return data.map((kelas) => ({
    ...kelas,
    kapasitas: 35, // Default capacity
    availableSpots: Math.max(0, 35 - kelas._count.siswa),
  }));
}
