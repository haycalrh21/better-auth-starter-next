import { LoginForm } from "@/components/login-form";

import { ModeToggle } from "@/components/ui/dark-mode-toggle";

export default function Page() {
  return (
    <div className="h-screen w-full flex items-center justify-center  px-4">
      <div className="w-full max-w-md rounded-2xl shadow-xl  p-6 md:p-8 space-y-6">
        <ModeToggle />
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold ">Login</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
