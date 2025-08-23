"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for creating assessment
const createPenilaianSchema = z.object({
  nama: z.string().min(1, "Nama penilaian harus diisi"),
  kategori: z.enum(["Umum", "UTS", "UAS", "Ulangan Harian"], {
    message: "Kategori harus dipilih",
  }),
  tanggalPenilaian: z.date({
    message: "Tanggal penilaian harus diisi",
  }),
  nilaiMaksimal: z.number().min(1, "Nilai maksimal minimal 1").default(100),
  kelasId: z.string().min(1, "Kelas harus dipilih"),
  mataPelajaranId: z.string().min(1, "Mata pelajaran harus dipilih"),
});

// Schema for updating assessment
const updatePenilaianSchema = z.object({
  id: z.string().min(1, "ID penilaian harus ada"),
  nama: z.string().min(1, "Nama penilaian harus diisi").optional(),
  kategori: z.enum(["Umum", "UTS", "UAS", "Ulangan Harian"]).optional(),
  tanggalPenilaian: z.date().optional(),
  nilaiMaksimal: z.number().min(1, "Nilai maksimal minimal 1").optional(),
  mataPelajaranId: z.string().min(1, "Mata pelajaran harus dipilih").optional(),
});

// Schema for bulk student scores
const bulkNilaiSchema = z.object({
  penilaianId: z.string().min(1, "ID penilaian harus ada"),
  nilaiData: z.array(
    z.object({
      siswaId: z.string().min(1, "ID siswa harus ada"),
      nilai: z.number().min(0, "Nilai tidak boleh negatif"),
    })
  ),
});

type CreatePenilaianInput = z.infer<typeof createPenilaianSchema>;
type UpdatePenilaianInput = z.infer<typeof updatePenilaianSchema>;
type BulkNilaiInput = z.infer<typeof bulkNilaiSchema>;

export async function createPenilaian(data: CreatePenilaianInput) {
  const parsed = createPenilaianSchema.safeParse(data);
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
        error: "Akses ditolak. Hanya guru yang dapat membuat penilaian",
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

    // Create assessment
    const penilaian = await prisma.penilaian.create({
      data: {
        ...validData,
        guruId: guru.id,
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    revalidatePath("/guru/penilaian");

    return {
      success: true,
      data: penilaian,
    };
  } catch (error) {
    console.error("❌ createPenilaian error:", error);
    return {
      success: false,
      error: "Gagal membuat penilaian",
    };
  }
}

export async function updatePenilaian(data: UpdatePenilaianInput) {
  const parsed = updatePenilaianSchema.safeParse(data);
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
        error: "Akses ditolak. Hanya guru yang dapat mengedit penilaian",
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

    // Check if assessment exists and belongs to teacher
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: {
        id,
        guruId: guru.id,
      },
    });

    if (!existingPenilaian) {
      return {
        success: false,
        error: "Penilaian tidak ditemukan atau akses ditolak",
      };
    }

    // Update assessment
    const updatedPenilaian = await prisma.penilaian.update({
      where: { id },
      data: updateData,
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
        _count: {
          select: {
            nilaiSiswa: true,
          },
        },
      },
    });

    revalidatePath("/guru/penilaian");

    return {
      success: true,
      data: updatedPenilaian,
    };
  } catch (error) {
    console.error("❌ updatePenilaian error:", error);
    return {
      success: false,
      error: "Gagal memperbarui penilaian",
    };
  }
}

export async function saveBulkNilai(data: BulkNilaiInput) {
  const parsed = bulkNilaiSchema.safeParse(data);
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
        error: "Akses ditolak. Hanya guru yang dapat menginput nilai",
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

    // Check if assessment exists and belongs to teacher
    const penilaian = await prisma.penilaian.findFirst({
      where: {
        id: validData.penilaianId,
        guruId: guru.id,
      },
    });

    if (!penilaian) {
      return {
        success: false,
        error: "Penilaian tidak ditemukan atau akses ditolak",
      };
    }

    // Validate scores against maximum value
    const invalidScores = validData.nilaiData.filter(
      (item) => item.nilai > penilaian.nilaiMaksimal
    );

    if (invalidScores.length > 0) {
      return {
        success: false,
        error: `Nilai tidak boleh melebihi nilai maksimal (${penilaian.nilaiMaksimal})`,
      };
    }

    // Save scores using upsert to handle updates
    const operations = validData.nilaiData.map((item) =>
      prisma.nilaiSiswa.upsert({
        where: {
          siswaId_penilaianId: {
            siswaId: item.siswaId,
            penilaianId: validData.penilaianId,
          },
        },
        update: {
          nilai: item.nilai,
        },
        create: {
          nilai: item.nilai,
          siswaId: item.siswaId,
          penilaianId: validData.penilaianId,
        },
      })
    );

    await prisma.$transaction(operations);

    revalidatePath("/guru/penilaian");

    return {
      success: true,
      message: `Berhasil menyimpan ${validData.nilaiData.length} nilai siswa`,
    };
  } catch (error) {
    console.error("❌ saveBulkNilai error:", error);
    return {
      success: false,
      error: "Gagal menyimpan nilai siswa",
    };
  }
}

export async function deletePenilaian(id: string) {
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
        error: "Akses ditolak. Hanya guru yang dapat menghapus penilaian",
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

    // Check if assessment exists and belongs to teacher
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: {
        id,
        guruId: guru.id,
      },
    });

    if (!existingPenilaian) {
      return {
        success: false,
        error: "Penilaian tidak ditemukan atau akses ditolak",
      };
    }

    // Delete assessment (scores will be deleted automatically due to cascade)
    await prisma.penilaian.delete({
      where: { id },
    });

    revalidatePath("/guru/penilaian");

    return {
      success: true,
      message: "Penilaian berhasil dihapus",
    };
  } catch (error) {
    console.error("❌ deletePenilaian error:", error);
    return {
      success: false,
      error: "Gagal menghapus penilaian",
    };
  }
}
