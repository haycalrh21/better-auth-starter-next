"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { StarIcon } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export const MagicLinkLoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<HTMLDetailsElement>(null);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get("email"));

    if (!email) return toast.error("Please enter your email.");

    await signIn.magicLink({
      email,
      name: email.split("@")[0],
      callbackURL: "/profile",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Check your email for the magic link!");
          if (ref.current) ref.current.open = false;
        },
      },
    });
  }

  return (
    <div className="w-full flex justify-center">
      <details
        ref={ref}
        className="w-full max-w-sm rounded-md border border-purple-600 overflow-hidden"
      >
        <summary className="flex gap-2 items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-600/80 transition cursor-pointer">
          Try Magic Link <StarIcon size={16} />
        </summary>

        <form onSubmit={handleSubmit} className="px-4 py-3">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <div className="flex gap-2 items-center">
            <Input type="email" id="email" name="email" required />
            <Button disabled={isPending}>Send</Button>
          </div>
        </form>
      </details>
    </div>
  );
};
