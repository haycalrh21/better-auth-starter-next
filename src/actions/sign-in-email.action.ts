"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";

type UserRole = "ADMIN" | "GURU" | "SISWA";

export async function signInEmailAction(formData: FormData) {
  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your password" };

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: { email, password },
    });

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!dbUser) return { error: "User not found" };

    // Pastikan role sesuai enum
    const role: UserRole =
      dbUser.role === "ADMIN"
        ? "ADMIN"
        : dbUser.role === "GURU"
        ? "GURU"
        : "SISWA";

    // Tambahkan /dashboard di URL
    const redirectTo = `/${role.toLowerCase()}/dashboard`; // /admin/dashboard, /guru/dashboard, /siswa/dashboard

    return { error: null, redirectTo, role };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      if (errCode === "EMAIL_NOT_VERIFIED") {
        redirect("/auth/verify?error=email_not_verified");
      }
      return { error: err.message };
    }
    return { error: "Internal Server Error" };
  }
}
