"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { StatusAbsensi } from "@/interface/enums";

// Schema for bulk attendance input
const bulkAbsensiSchema = z.object({
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020).max(2030),
  tanggal: z.date(),
  kelasId: z.string().min(1, "Kelas harus dipilih"),
  absensiData: z.array(
    z.object({
      siswaId: z.string().min(1, "ID siswa harus ada"),
      status: z.nativeEnum(StatusAbsensi),
      keterangan: z.string().optional(),
    })
  ),
});

// Schema for updating single attendance
const updateAbsensiSchema = z.object({
  id: z.string().min(1, "ID absensi harus ada"),
  status: z.nativeEnum(StatusAbsensi).optional(),
  keterangan: z.string().optional(),
});

// Schema for getting attendance by month and class
const getAttendanceSchema = z.object({
  kelasId: z.string().min(1, "Kelas harus dipilih"),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020).max(2030),
});

type BulkAbsensiInput = z.infer<typeof bulkAbsensiSchema>;
type UpdateAbsensiInput = z.infer<typeof updateAbsensiSchema>;
type GetAttendanceInput = z.infer<typeof getAttendanceSchema>;

export async function saveBulkAbsensi(data: BulkAbsensiInput) {
  const parsed = bulkAbsensiSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const validData = parsed.data;

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat menginput absensi",
      };
    }

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    // Verify teacher has schedule for this class
    const kelas = await prisma.kelas.findFirst({
      where: {
        id: validData.kelasId,
        Jadwal: {
          some: {
            guruId: guru.id,
          },
        },
        isActive: true,
      },
    });

    if (!kelas) {
      return {
        success: false,
        error:
          "Akses ditolak. Anda tidak memiliki jadwal mengajar di kelas ini",
      };
    }

    // Validate that SAKIT and IZIN status have keterangan
    const invalidData = validData.absensiData.filter(
      (item) =>
        (item.status === StatusAbsensi.SAKIT ||
          item.status === StatusAbsensi.IZIN) &&
        (!item.keterangan || item.keterangan.trim() === "")
    );

    if (invalidData.length > 0) {
      return {
        success: false,
        error: "Status SAKIT dan IZIN harus dilengkapi dengan keterangan",
      };
    }

    // Save attendance using upsert to handle updates
    const operations = validData.absensiData.map((item) =>
      prisma.absensi.upsert({
        where: {
          siswaId_kelasId_tanggal: {
            siswaId: item.siswaId,
            kelasId: validData.kelasId,
            tanggal: validData.tanggal,
          },
        },
        update: {
          status: item.status,
          keterangan: item.keterangan || null,
          bulan: validData.bulan,
          tahun: validData.tahun,
        },
        create: {
          bulan: validData.bulan,
          tahun: validData.tahun,
          tanggal: validData.tanggal,
          status: item.status,
          keterangan: item.keterangan || null,
          siswaId: item.siswaId,
          kelasId: validData.kelasId,
          guruId: guru.id,
        },
      })
    );

    await prisma.$transaction(operations);

    revalidatePath("/guru/absensi");

    return {
      success: true,
      message: `Berhasil menyimpan absensi ${validData.absensiData.length} siswa`,
    };
  } catch (error) {
    console.error("❌ saveBulkAbsensi error:", error);
    return {
      success: false,
      error: "Gagal menyimpan data absensi",
    };
  }
}

export async function updateAbsensi(data: UpdateAbsensiInput) {
  const parsed = updateAbsensiSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const validData = parsed.data;
  const { id, ...updateData } = validData;

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat mengedit absensi",
      };
    }

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    // Check if attendance exists and belongs to teacher
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        id,
        guruId: guru.id,
      },
    });

    if (!existingAbsensi) {
      return {
        success: false,
        error: "Data absensi tidak ditemukan atau akses ditolak",
      };
    }

    // Validate that SAKIT and IZIN status have keterangan
    if (
      (updateData.status === StatusAbsensi.SAKIT ||
        updateData.status === StatusAbsensi.IZIN) &&
      (!updateData.keterangan || updateData.keterangan.trim() === "")
    ) {
      return {
        success: false,
        error: "Status SAKIT dan IZIN harus dilengkapi dengan keterangan",
      };
    }

    // Update attendance
    const updatedAbsensi = await prisma.absensi.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
          select: {
            namaLengkap: true,
            nisn: true,
          },
        },
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    revalidatePath("/guru/absensi");

    return {
      success: true,
      data: updatedAbsensi,
    };
  } catch (error) {
    console.error("❌ updateAbsensi error:", error);
    return {
      success: false,
      error: "Gagal memperbarui data absensi",
    };
  }
}

export async function getAttendanceByMonthClass(data: GetAttendanceInput) {
  const parsed = getAttendanceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const validData = parsed.data;

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat mengakses data ini",
      };
    }

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    // Verify teacher has schedule for this class
    const kelas = await prisma.kelas.findFirst({
      where: {
        id: validData.kelasId,
        Jadwal: {
          some: {
            guruId: guru.id,
          },
        },
        isActive: true,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
          orderBy: {
            namaLengkap: "asc",
          },
        },
      },
    });

    if (!kelas) {
      return {
        success: false,
        error:
          "Akses ditolak. Anda tidak memiliki jadwal mengajar di kelas ini",
      };
    }

    // Get attendance data for the month
    const attendance = await prisma.absensi.findMany({
      where: {
        kelasId: validData.kelasId,
        bulan: validData.bulan,
        tahun: validData.tahun,
        guruId: guru.id,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ tanggal: "asc" }, { siswa: { namaLengkap: "asc" } }],
    });

    return {
      success: true,
      data: {
        kelas,
        attendance,
        month: validData.bulan,
        year: validData.tahun,
      },
    };
  } catch (error) {
    console.error("❌ getAttendanceByMonthClass error:", error);
    return {
      success: false,
      error: "Gagal mengambil data absensi",
    };
  }
}

export async function deleteAbsensi(id: string) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: "Harus login dulu",
      };
    }

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat menghapus absensi",
      };
    }

    // Get teacher data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!guru) {
      return {
        success: false,
        error: "Data guru tidak ditemukan",
      };
    }

    // Check if attendance exists and belongs to teacher
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        id,
        guruId: guru.id,
      },
    });

    if (!existingAbsensi) {
      return {
        success: false,
        error: "Data absensi tidak ditemukan atau akses ditolak",
      };
    }

    // Delete attendance
    await prisma.absensi.delete({
      where: { id },
    });

    revalidatePath("/guru/absensi");

    return {
      success: true,
      message: "Data absensi berhasil dihapus",
    };
  } catch (error) {
    console.error("❌ deleteAbsensi error:", error);
    return {
      success: false,
      error: "Gagal menghapus data absensi",
    };
  }
}
