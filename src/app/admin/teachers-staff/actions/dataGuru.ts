import { prisma } from "@/lib/prisma";
import { Gender, Agama, StatusKawin } from "@/interface/enums";
import { GuruFilterInput } from "../schema";

/**
 * Get all teachers with comprehensive relations
 */
export async function getDataGuru() {
  const data = await prisma.guru.findMany({
    orderBy: [
      { statusKepegawaian: "asc" },
      { namaLengkap: "asc" },
      { createdAt: "desc" },
    ],
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
          _count: {
            select: {
              siswa: true,
            },
          },
        },
      },
      mataPelajaran: {
        select: {
          id: true,
          nama: true,
          kode: true,
        },
      },
      _count: {
        select: {
          Jadwal: true,
        },
      },
    },
  });
  return data;
}

/**
 * Get teachers with filtering and pagination
 */
export async function getFilteredGuru(filters: GuruFilterInput) {
  const {
    search,
    statusKepegawaian,
    bidangStudi,
    golongan,
    pangkat,
    pendidikanTerakhir,
    hasKelas,
    hasMataPelajaran,
    jenisKelamin,
    agama,
    statusKawin,
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
      { nip: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
      { emailAlternatif: { contains: search, mode: "insensitive" } },
      { bidangStudi: { contains: search, mode: "insensitive" } },
    ];
  }

  if (statusKepegawaian) {
    whereClause.statusKepegawaian = {
      contains: statusKepegawaian,
      mode: "insensitive",
    };
  }

  if (bidangStudi) {
    whereClause.bidangStudi = {
      contains: bidangStudi,
      mode: "insensitive",
    };
  }

  if (golongan) {
    whereClause.golongan = {
      contains: golongan,
      mode: "insensitive",
    };
  }

  if (pangkat) {
    whereClause.pangkat = {
      contains: pangkat,
      mode: "insensitive",
    };
  }

  if (pendidikanTerakhir) {
    whereClause.pendidikanTerakhir = {
      contains: pendidikanTerakhir,
      mode: "insensitive",
    };
  }

  if (jenisKelamin) {
    whereClause.jenisKelamin = jenisKelamin;
  }

  if (agama) {
    whereClause.agama = agama;
  }

  if (statusKawin) {
    whereClause.statusKawin = statusKawin;
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

  if (hasMataPelajaran !== undefined) {
    if (hasMataPelajaran) {
      whereClause.mataPelajaran = {
        some: {},
      };
    } else {
      whereClause.mataPelajaran = {
        none: {},
      };
    }
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === "namaLengkap") {
    orderBy.namaLengkap = sortOrder;
  } else if (sortBy === "nip") {
    orderBy.nip = sortOrder;
  } else if (sortBy === "statusKepegawaian") {
    orderBy.statusKepegawaian = sortOrder;
  } else if (sortBy === "masaKerja") {
    orderBy.masaKerja = sortOrder;
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.guru.findMany({
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
            _count: {
              select: {
                siswa: true,
              },
            },
          },
        },
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        _count: {
          select: {
            Jadwal: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.guru.count({ where: whereClause }),
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
 * Get teacher statistics for dashboard
 */
export async function getGuruStatistics(tahunAjaran?: string) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Build where clause for active academic year
  const kelasWhereClause = tahunAjaran
    ? { tahunAjaran, isActive: true }
    : { isActive: true };

  const [
    totalTeachers,
    activeTeachers,
    teachersWithClass,
    teachersWithoutClass,
    pnsTeachers,
    nonPnsTeachers,
    newTeachersThisYear,
    teachersByEducation,
    teachersByGender,
    teachersByStatus,
  ] = await Promise.all([
    // Total teachers
    prisma.guru.count(),

    // Active teachers (have profile complete and user account active)
    prisma.guru.count({
      where: {
        isProfileComplete: true,
        user: {
          emailVerified: true,
        },
      },
    }),

    // Teachers with active class assignments
    prisma.guru.count({
      where: {
        kelas: {
          some: kelasWhereClause,
        },
      },
    }),

    // Teachers without class assignments
    prisma.guru.count({
      where: {
        kelas: {
          none: kelasWhereClause,
        },
      },
    }),

    // PNS teachers
    prisma.guru.count({
      where: {
        statusKepegawaian: {
          contains: "PNS",
        },
      },
    }),

    // Non-PNS teachers
    prisma.guru.count({
      where: {
        statusKepegawaian: {
          not: {
            contains: "PNS",
          },
        },
      },
    }),

    // New teachers this year
    prisma.guru.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
    }),

    // Teachers by education level
    prisma.guru.groupBy({
      by: ["pendidikanTerakhir"],
      _count: {
        _all: true,
      },
      where: {
        pendidikanTerakhir: {
          not: null,
        },
      },
    }),

    // Teachers by gender
    prisma.guru.groupBy({
      by: ["jenisKelamin"],
      _count: {
        _all: true,
      },
      where: {
        jenisKelamin: {
          not: null,
        },
      },
    }),

    // Teachers by employment status
    prisma.guru.groupBy({
      by: ["statusKepegawaian"],
      _count: {
        _all: true,
      },
      where: {
        statusKepegawaian: {
          not: null,
        },
      },
    }),
  ]);

  return {
    total: totalTeachers,
    active: activeTeachers,
    withClass: teachersWithClass,
    withoutClass: teachersWithoutClass,
    pns: pnsTeachers,
    nonPns: nonPnsTeachers,
    newThisYear: newTeachersThisYear,
    byEducation: teachersByEducation,
    byGender: teachersByGender,
    byStatus: teachersByStatus,
    classAssignmentRate:
      totalTeachers > 0 ? (teachersWithClass / totalTeachers) * 100 : 0,
    profileCompleteRate:
      totalTeachers > 0 ? (activeTeachers / totalTeachers) * 100 : 0,
  };
}

/**
 * Get teachers without class assignments
 */
export async function getUnassignedTeachers(
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause =
    tahunAjaran && semester
      ? {
          kelas: {
            none: {
              tahunAjaran,
              semester,
              isActive: true,
            },
          },
          isProfileComplete: true,
        }
      : {
          kelas: {
            none: {
              isActive: true,
            },
          },
          isProfileComplete: true,
        };

  return await prisma.guru.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      mataPelajaran: {
        select: {
          nama: true,
          kode: true,
        },
      },
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });
}

/**
 * Get available classes for teacher assignment
 */
export async function getAvailableKelasForGuru(
  guruId?: string,
  excludeCurrentAssignments?: boolean,
  tahunAjaran?: string,
  semester?: string
) {
  const whereClause: any = {
    isActive: true,
  };

  if (tahunAjaran) {
    whereClause.tahunAjaran = tahunAjaran;
  }

  if (semester) {
    whereClause.semester = semester;
  }

  if (excludeCurrentAssignments && guruId) {
    whereClause.guru = {
      none: {
        id: guruId,
      },
    };
  }

  return await prisma.kelas.findMany({
    where: whereClause,
    include: {
      guru: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      _count: {
        select: {
          siswa: true,
        },
      },
    },
    orderBy: [{ jenjang: "asc" }, { namaKelas: "asc" }],
  });
}

/**
 * Get available subjects for teacher assignment
 */
export async function getAvailableMataPelajaran() {
  return await prisma.mataPelajaran.findMany({
    orderBy: [{ nama: "asc" }],
    include: {
      guru: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
    },
  });
}

/**
 * Get teacher by ID with full relations
 */
export async function getGuruById(id: string) {
  return await prisma.guru.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      kelas: {
        include: {
          _count: {
            select: {
              siswa: true,
            },
          },
        },
      },
      mataPelajaran: {
        select: {
          id: true,
          nama: true,
          kode: true,
        },
      },
      Jadwal: {
        include: {
          kelas: {
            select: {
              namaKelas: true,
            },
          },
          mataPelajaran: {
            select: {
              nama: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Check if teacher can be deleted
 */
export async function canDeleteGuru(id: string) {
  const teacher = await prisma.guru.findUnique({
    where: { id },
    include: {
      kelas: {
        where: { isActive: true },
        select: {
          id: true,
          namaKelas: true,
        },
      },
      Jadwal: {
        where: {
          createdAt: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          hari: true,
          jamMulai: true,
          jamSelesai: true,
        },
      },
    },
  });

  if (!teacher) {
    return { canDelete: false, reason: "Guru tidak ditemukan" };
  }

  if (teacher.kelas.length > 0) {
    return {
      canDelete: false,
      reason: "Guru masih memiliki kelas aktif",
      details: `Masih mengajar ${teacher.kelas.length} kelas`,
    };
  }

  if (teacher.Jadwal.length > 0) {
    return {
      canDelete: false,
      reason: "Guru masih memiliki jadwal mengajar",
      details: `Masih memiliki ${teacher.Jadwal.length} jadwal mendatang`,
    };
  }

  return { canDelete: true, reason: null };
}

/**
 * Get teachers for dropdown/select options
 */
export async function getGuruOptions() {
  return await prisma.guru.findMany({
    where: {
      isProfileComplete: true,
    },
    select: {
      id: true,
      namaLengkap: true,
      nip: true,
      bidangStudi: true,
      statusKepegawaian: true,
    },
    orderBy: {
      namaLengkap: "asc",
    },
  });
}

/**
 * Get employment status options (for filtering)
 */
export async function getEmploymentStatusOptions() {
  const result = await prisma.guru.groupBy({
    by: ["statusKepegawaian"],
    where: {
      statusKepegawaian: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    value: item.statusKepegawaian!,
    label: item.statusKepegawaian!,
    count: item._count._all,
  }));
}

/**
 * Get subject area options (for filtering)
 */
export async function getSubjectAreaOptions() {
  const result = await prisma.guru.groupBy({
    by: ["bidangStudi"],
    where: {
      bidangStudi: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    value: item.bidangStudi!,
    label: item.bidangStudi!,
    count: item._count._all,
  }));
}
