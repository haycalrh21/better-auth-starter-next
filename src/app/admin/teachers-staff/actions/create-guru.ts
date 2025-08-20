// create-guru.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLogger } from "@/utils/logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import {
  userCreateSchema,
  UserCreateInput,
} from "@/app/admin/schemas/guruSchema";
import { revalidatePath } from "next/cache";

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

    const newUser = await auth.api.createUser({
      body: {
        email: validData.email,
        password: validData.password,
        name: validData.name,
        data: { role: validData.role },
      },
      headers: h,
    });

    const logger = await UserLogger.create(currentUser.id);

    if (validData.role === "GURU") {
      await prisma.guru.create({
        data: {
          namaLengkap: validData.name,
          emailAlternatif: validData.email,
          userId: newUser.user.id,
        },
      });
      await logger.create("guru", {
        name: validData.name,
        email: validData.email,
      });
    } else if (validData.role === "SISWA") {
      await prisma.siswa.create({
        data: {
          namaLengkap: validData.name,
          emailAlternatif: validData.email,
          userId: newUser.user.id,
        },
      });
      await logger.create("siswa", {
        name: validData.name,
        email: validData.email,
      });
    }

    revalidatePath("/admin/teachers-staff");
  } catch (err) {
    if (err instanceof APIError && err.body?.code === "USER_ALREADY_EXISTS") {
      throw new Error("Email sudah terdaftar");
    }
    console.error("❌ createGuru error:", err);
    throw new Error("Registrasi gagal, coba lagi nanti");
  }
}
