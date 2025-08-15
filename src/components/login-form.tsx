"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import Link from "next/link";

export const LoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsPending(true);
    const formData = new FormData(evt.currentTarget);

    const result = await signInEmailAction(formData);

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
    } else {
      const successMessage = result.isAdmin
        ? "Welcome back, Admin!"
        : "Login successful. Good to have you back.";

      toast.success(successMessage);

      // Redirect based on role
      router.push(result.redirectTo || "/profile");
    }
  }

  return (
    <div className="flex items-center justify-center ">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm w-full space-y-4 bg-white p-6 rounded-xl shadow-md"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" required />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              tabIndex={-1}
              href="/auth/forgot-password"
              className="text-sm italic text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input type="password" id="password" name="password" required />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};
