"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";

export async function signInEmailAction(formData: FormData) {
  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your password" };

  try {
    console.log("🔐 Attempting sign in for:", email);

    const response = await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });

    console.log("✅ Sign in response:", response);

    // Langsung cek ke database untuk mendapatkan role user
    const dbUser = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, role: true, email: true, name: true },
    });

    console.log("🗄️ User from database:", dbUser);

    const userRole = dbUser?.role;
    const isAdmin = userRole === "ADMIN";

    console.log("🔍 Is Admin check:", {
      userRole,
      isAdmin,
      email,
    });

    const redirectTo = isAdmin ? "/admin/dashboard" : "/profile";
    console.log("🚀 Redirecting to:", redirectTo);

    return {
      error: null,
      isAdmin,
      redirectTo,
    };
  } catch (err) {
    console.error("❌ Sign in error:", err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      console.dir(err, { depth: 5 });
      switch (errCode) {
        case "EMAIL_NOT_VERIFIED":
          redirect("/auth/verify?error=email_not_verified");
        default:
          return { error: err.message };
      }
    }

    return { error: "Internal Server Error" };
  }
}
