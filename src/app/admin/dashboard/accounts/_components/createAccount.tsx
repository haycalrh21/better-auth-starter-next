"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAccountServerAction } from "../action";

export default function CreateAccount() {
  const [isPending, setIsPending] = useState(false);
  const [role, setRole] = useState("");

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!role) {
      toast.error("Please select a role");
      return;
    }

    setIsPending(true);

    const formData = new FormData(evt.currentTarget as HTMLFormElement);
    formData.append("role", role);

    const { error } = await createAccountServerAction(formData);

    setIsPending(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Registration complete. You're all set.");
      (evt.currentTarget as HTMLFormElement).reset();
      setRole("");
    }
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Create New Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GURU">GURU</SelectItem>
                <SelectItem value="SISWA">SISWA</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending || !role}
            className="w-full"
          >
            {isPending ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
