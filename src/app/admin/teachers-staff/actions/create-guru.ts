"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { userCreateSchema, createGuruSchema } from "../schema";
import type { UserCreateInput, CreateGuruInput } from "../schema";

/**
 * Create a new teacher account with user and profile
 */
export async function createGuru(formData: FormData) {
  const data = Object.fromEntries(
    formData.entries()
  ) as unknown as UserCreateInput;

  const parsed = userCreateSchema.safeParse(data);
  if (!parsed.success) {
    throw new APIError("BAD_REQUEST", {
      message: parsed.error.issues.map((e) => e.message).join(", "),
    });
  }

  const validData = parsed.data;

  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const currentUser = session?.user;

    if (!currentUser) {
      throw new APIError("UNAUTHORIZED", { message: "Harus login dulu" });
    }

    // Check if user already has teacher profile
    const existingTeacher = await prisma.guru.findFirst({
      where: {
        OR: [
          { emailAlternatif: validData.email },
          {
            user: {
              email: validData.email,
            },
          },
        ],
      },
    });

    if (existingTeacher) {
      throw new Error("Email sudah terdaftar sebagai guru");
    }

    // Create user account
    const newUser = await auth.api.createUser({
      body: {
        email: validData.email,
        password: validData.password,
        name: validData.name,
        data: { role: validData.role || "GURU" },
      },
      headers: h,
    });

    // Create teacher profile
    const newTeacher = await prisma.guru.create({
      data: {
        namaLengkap: validData.name,
        emailAlternatif: validData.email,
        userId: newUser.user.id,
        isProfileComplete: false,
      },
    });

    // Log the action
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("guru", {
      id: newTeacher.id,
      name: validData.name,
      email: validData.email,
      userId: newUser.user.id,
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: {
        id: newTeacher.id,
        userId: newUser.user.id,
        namaLengkap: newTeacher.namaLengkap,
        email: validData.email,
      },
    };
  } catch (err) {
    if (err instanceof APIError && err.body?.code === "USER_ALREADY_EXISTS") {
      throw new Error("Email sudah terdaftar");
    }
    if (err instanceof Error) {
      throw err;
    }
    console.error("❌ createGuru error:", err);
    throw new Error("Registrasi gagal, coba lagi nanti");
  }
}

/**
 * Create a comprehensive teacher profile
 */
export async function createCompleteGuruProfile(data: CreateGuruInput) {
  const parsed = createGuruSchema.safeParse(data);
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

    // Check if userId exists and doesn't already have a teacher profile
    const existingUser = await prisma.user.findUnique({
      where: { id: validData.userId },
      include: {
        guru: true,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User tidak ditemukan",
      };
    }

    if (existingUser.guru) {
      return {
        success: false,
        error: "User sudah memiliki profil guru",
      };
    }

    // Check for duplicate NIP if provided
    if (validData.nip) {
      const existingNip = await prisma.guru.findFirst({
        where: {
          nip: validData.nip,
        },
      });

      if (existingNip) {
        return {
          success: false,
          error: "NIP sudah terdaftar",
        };
      }
    }

    // Check for duplicate NIK if provided
    if (validData.nik) {
      const existingNik = await prisma.guru.findFirst({
        where: {
          nik: validData.nik,
        },
      });

      if (existingNik) {
        return {
          success: false,
          error: "NIK sudah terdaftar",
        };
      }
    }

    // Create teacher profile
    const newTeacher = await prisma.guru.create({
      data: {
        ...validData,
        isProfileComplete: true,
      },
    });

    // Log the action
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("guru", {
      id: newTeacher.id,
      name: newTeacher.namaLengkap,
      nip: newTeacher.nip,
      userId: newTeacher.userId,
      action: "complete_profile",
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: newTeacher,
    };
  } catch (error) {
    console.error("❌ createCompleteGuruProfile error:", error);
    return {
      success: false,
      error: "Gagal membuat profil guru",
    };
  }
}

/**
 * Bulk create teachers from import data
 */
export async function bulkCreateGuru(teachersData: CreateGuruInput[]) {
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

    for (const teacherData of teachersData) {
      try {
        const result = await createCompleteGuruProfile(teacherData);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${teacherData.namaLengkap}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${teacherData.namaLengkap}: Gagal membuat profil`);
      }
    }

    // Log bulk action
    const logger = await UserLogger.create(currentUser.id);
    await logger.create("guru", {
      action: "bulk_create",
      total: teachersData.length,
      success: results.success,
      failed: results.failed,
    });

    revalidatePath("/admin/teachers-staff");

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("❌ bulkCreateGuru error:", error);
    return {
      success: false,
      error: "Gagal membuat profil guru secara bulk",
    };
  }
}
