"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  editGuruSchema,
  updateEmploymentStatusSchema,
  assignTeacherToClassSchema,
  assignSubjectToTeacherSchema,
} from "../schema";
import type {
  EditGuruInput,
  UpdateEmploymentStatusInput,
  AssignTeacherToClassInput,
  AssignSubjectToTeacherInput,
} from "../schema";

/**
 * Edit teacher profile
 */
export async function editGuru(data: EditGuruInput) {
  const parsed = editGuruSchema.safeParse(data);
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

    // Check if teacher exists
    const existingGuru = await prisma.guru.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingGuru) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    // Check for duplicate NIP if provided and different from current
    if (updateData.nip && updateData.nip !== existingGuru.nip) {
      const existingNip = await prisma.guru.findFirst({
        where: {
          nip: updateData.nip,
          id: { not: id },
        },
      });

      if (existingNip) {
        return {
          success: false,
          error: "NIP sudah terdaftar",
        };
      }
    }

    // Check for duplicate NIK if provided and different from current
    if (updateData.nik && updateData.nik !== existingGuru.nik) {
      const existingNik = await prisma.guru.findFirst({
        where: {
          nik: updateData.nik,
          id: { not: id },
        },
      });

      if (existingNik) {
        return {
          success: false,
          error: "NIK sudah terdaftar",
        };
      }
    }

    // Check for duplicate email if provided and different from current
    if (
      updateData.emailAlternatif &&
      updateData.emailAlternatif !== existingGuru.emailAlternatif
    ) {
      const existingEmail = await prisma.guru.findFirst({
        where: {
          emailAlternatif: updateData.emailAlternatif,
          id: { not: id },
        },
      });

      if (existingEmail) {
        return {
          success: false,
          error: "Email sudah terdaftar",
        };
      }
    }

    // Calculate if profile should be marked as complete
    const isProfileComplete = !!(
      (updateData.namaLengkap ?? existingGuru.namaLengkap) &&
      (updateData.tempatLahir ?? existingGuru.tempatLahir) &&
      (updateData.tanggalLahir ?? existingGuru.tanggalLahir) &&
      (updateData.jenisKelamin ?? existingGuru.jenisKelamin) &&
      (updateData.agama ?? existingGuru.agama) &&
      (updateData.noHp ?? existingGuru.noHp) &&
      (updateData.alamatLengkap ?? existingGuru.alamatLengkap) &&
      (updateData.pendidikanTerakhir ?? existingGuru.pendidikanTerakhir)
    );

    // Update teacher profile
    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: {
        ...updateData,
        isProfileComplete: isProfileComplete || existingGuru.isProfileComplete,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
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
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: updatedGuru,
    };
  } catch (error) {
    console.error("❌ editGuru error:", error);
    return {
      success: false,
      error: "Gagal memperbarui data guru",
    };
  }
}

/**
 * Update employment status
 */
export async function updateEmploymentStatus(
  data: UpdateEmploymentStatusInput
) {
  const parsed = updateEmploymentStatusSchema.safeParse(data);
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

    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: updatedGuru,
    };
  } catch (error) {
    console.error("❌ updateEmploymentStatus error:", error);
    return {
      success: false,
      error: "Gagal memperbarui status kepegawaian",
    };
  }
}

/**
 * Assign teacher to class
 */
export async function assignTeacherToClass(data: AssignTeacherToClassInput) {
  const parsed = assignTeacherToClassSchema.safeParse(data);
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

    // Check if teacher and class exist
    const [teacher, kelas] = await Promise.all([
      prisma.guru.findUnique({ where: { id: validData.guruId } }),
      prisma.kelas.findUnique({ where: { id: validData.kelasId } }),
    ]);

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    if (!kelas) {
      return {
        success: false,
        error: "Kelas tidak ditemukan",
      };
    }

    // Check if already assigned
    const existingAssignment = await prisma.kelas.findFirst({
      where: {
        id: validData.kelasId,
        guruId: validData.guruId,
      },
    });

    if (existingAssignment) {
      return {
        success: false,
        error: "Guru sudah ditugaskan ke kelas ini",
      };
    }

    // Assign teacher to class
    await prisma.kelas.update({
      where: { id: validData.kelasId },
      data: {
        guruId: validData.guruId,
      },
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/kelas");

    return {
      success: true,
      message: "Guru berhasil ditugaskan ke kelas",
    };
  } catch (error) {
    console.error("❌ assignTeacherToClass error:", error);
    return {
      success: false,
      error: "Gagal menugaskan guru ke kelas",
    };
  }
}

/**
 * Assign subject to teacher
 */
export async function assignSubjectToTeacher(
  data: AssignSubjectToTeacherInput
) {
  const parsed = assignSubjectToTeacherSchema.safeParse(data);
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

    // Check if teacher and subject exist
    const [teacher, mataPelajaran] = await Promise.all([
      prisma.guru.findUnique({ where: { id: validData.guruId } }),
      prisma.mataPelajaran.findUnique({
        where: { id: validData.mataPelajaranId },
      }),
    ]);

    if (!teacher) {
      return {
        success: false,
        error: "Guru tidak ditemukan",
      };
    }

    if (!mataPelajaran) {
      return {
        success: false,
        error: "Mata pelajaran tidak ditemukan",
      };
    }

    // Check if already assigned
    const existingAssignment = await prisma.mataPelajaran.findFirst({
      where: {
        id: validData.mataPelajaranId,
        guruId: validData.guruId,
      },
    });

    if (existingAssignment) {
      return {
        success: false,
        error: "Guru sudah ditugaskan untuk mata pelajaran ini",
      };
    }

    // Assign subject to teacher
    await prisma.mataPelajaran.update({
      where: { id: validData.mataPelajaranId },
      data: {
        guruId: validData.guruId,
      },
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/mata-pelajaran");

    return {
      success: true,
      message: "Mata pelajaran berhasil ditugaskan ke guru",
    };
  } catch (error) {
    console.error("❌ assignSubjectToTeacher error:", error);
    return {
      success: false,
      error: "Gagal menugaskan mata pelajaran ke guru",
    };
  }
}

/**
 * Remove teacher from class
 */
export async function removeTeacherFromClass(guruId: string, kelasId: string) {
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

    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        guruId: null,
      },
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/kelas");

    return {
      success: true,
      message: "Guru berhasil dihapus dari kelas",
    };
  } catch (error) {
    console.error("❌ removeTeacherFromClass error:", error);
    return {
      success: false,
      error: "Gagal menghapus guru dari kelas",
    };
  }
}

/**
 * Remove subject from teacher
 */
export async function removeSubjectFromTeacher(
  guruId: string,
  mataPelajaranId: string
) {
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

    await prisma.mataPelajaran.update({
      where: { id: mataPelajaranId },
      data: {
        guruId: null,
      },
    });

    revalidatePath("/admin/teachers-staff");
    revalidatePath("/admin/mata-pelajaran");

    return {
      success: true,
      message: "Mata pelajaran berhasil dihapus dari guru",
    };
  } catch (error) {
    console.error("❌ removeSubjectFromTeacher error:", error);
    return {
      success: false,
      error: "Gagal menghapus mata pelajaran dari guru",
    };
  }
}

/**
 * Bulk update teachers
 */
export async function bulkUpdateGuru(
  teacherIds: string[],
  updateData: Partial<EditGuruInput>
) {
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

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const teacherId of teacherIds) {
      try {
        const result = await editGuru({ id: teacherId, ...updateData });
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${teacherId}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${teacherId}: Gagal memperbarui`);
      }
    }

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("❌ bulkUpdateGuru error:", error);
    return {
      success: false,
      error: "Gagal memperbarui guru secara bulk",
    };
  }
}
