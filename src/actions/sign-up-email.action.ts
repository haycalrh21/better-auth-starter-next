"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";

export async function signUpEmailAction(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  if (!name) return { error: "Please enter your name" };

  const email = formData.get("email")?.toString()?.trim();
  if (!email) return { error: "Please enter your email" };

  const password = formData.get("password")?.toString();
  if (!password) return { error: "Please enter your password" };

  const appRole = formData.get("role")?.toString() as
    | "ADMIN"
    | "GURU"
    | "SISWA";
  if (!appRole || !["ADMIN", "GURU", "SISWA"].includes(appRole)) {
    return { error: "Please select a valid role" };
  }

  try {
    // Mapping ke role bawaan Better Auth
    let betterAuthRole: "ADMIN" | "USER";
    if (appRole === "ADMIN") {
      betterAuthRole = "ADMIN";
    } else {
      betterAuthRole = "USER";
    }

    await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: betterAuthRole, // sesuai tipe Better Auth
        data: {
          role: appRole, // simpan role asli aplikasi
        },
      },
    });

    return { error: null, success: true };
  } catch (err) {
    console.error("Sign up error:", err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "An account with this email already exists" };
        case "INVALID_EMAIL":
          return { error: "Please enter a valid email address" };
        default:
          return { error: err.message || "Registration failed" };
      }
    }

    return { error: "Something went wrong. Please try again later." };
  }
}
