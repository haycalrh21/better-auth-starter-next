"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { editGuruSchema } from "@/app/admin/teachers-staff/schema";
import type { EditGuruInput } from "@/app/admin/teachers-staff/schema";

export async function editProfileGuru(data: EditGuruInput) {
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

    if (currentUser.role !== "GURU") {
      return {
        success: false,
        error: "Akses ditolak. Hanya guru yang dapat mengedit profil ini",
      };
    }

    // Check if teacher exists and belongs to current user
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

    // Ensure teacher can only edit their own profile
    if (existingGuru.userId !== currentUser.id) {
      return {
        success: false,
        error: "Akses ditolak. Anda hanya dapat mengedit profil sendiri",
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

    // Calculate if profile should be marked as complete using nullish coalescing
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
            emailVerified: true,
            createdAt: true,
          },
        },
        kelas: {
          where: { isActive: true },
          select: {
            id: true,
            namaKelas: true,
            tahunAjaran: true,
            semester: true,
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
      },
    });

    revalidatePath("/guru/profile");

    return {
      success: true,
      data: updatedGuru,
    };
  } catch (error) {
    console.error("❌ editProfileGuru error:", error);
    return {
      success: false,
      error: "Gagal memperbarui profil guru",
    };
  }
}
