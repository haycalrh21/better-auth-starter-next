import { ModeToggle } from "@/components/ui/dark-mode-toggle";
import React from "react";
import { RegisterForm } from "./_components/register-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function page() {
  const getAdmin = await prisma.user.findFirst({
    where: {
      email: "admin@gmail.com",
    },
    select: {
      id: true,
    },
  });

  const alreadyExists = Boolean(getAdmin);

  if (alreadyExists) {
    redirect("/");
  }
  return (
    <div className="h-screen w-full flex items-center justify-center  px-4">
      <div className="w-full max-w-md rounded-2xl shadow-xl  p-6 md:p-8 space-y-6">
        <ModeToggle />
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold ">Login</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
