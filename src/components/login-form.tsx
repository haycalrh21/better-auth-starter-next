"use client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInEmailAction } from "@/actions/sign-in-email.action";

type UserRole = "ADMIN" | "GURU" | "SISWA";
type SignInResult = {
  error: string | null;
  redirectTo?: string;
  role?: UserRole;
};

export const LoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsPending(true);
    const formData = new FormData(evt.currentTarget);

    // Panggil action server
    const rawResult = await signInEmailAction(formData);

    // Casting role ke enum yang aman
    const result: SignInResult = {
      error: rawResult.error ?? null,
      redirectTo: rawResult.redirectTo,
      role:
        rawResult.role === "ADMIN" ||
        rawResult.role === "GURU" ||
        rawResult.role === "SISWA"
          ? rawResult.role
          : undefined,
    };

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    // Toast sesuai role
    const successMessage =
      result.role === "ADMIN"
        ? "Welcome back, Admin!"
        : result.role === "GURU"
        ? "Welcome back, Teacher!"
        : "Login successful. Good to have you back.";

    toast.success(successMessage);

    // Redirect sesuai role, fallback "/"
    const redirectTo =
      result.redirectTo ??
      (result.role ? `/${result.role.toLowerCase()}` : "/");
    router.push(redirectTo);

    setIsPending(false);
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Signing in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
