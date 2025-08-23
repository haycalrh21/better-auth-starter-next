"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Mail, Lock, User, Shield, Loader2 } from "lucide-react";

import { UserCreateInput, userCreateSchema } from "../schema";
import { objectToFormData } from "@/utils/objectToFormData";
import { createGuru } from "../actions/create-guru";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CreateAccountModalComponent() {
  // persist open state across hot reload
  const openRef = useRef(false);
  const [open, setOpen] = useState(openRef.current);

  const handleOpenChange = (val: boolean) => {
    openRef.current = val; // simpan di ref supaya ga ilang pas HMR
    setOpen(val);
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      role: "GURU" as const,
    },
  });

  async function onSubmit(data: UserCreateInput) {
    try {
      const formData = objectToFormData(data);
      const result = await createGuru(formData);

      if (result && result.success) {
        toast.success(
          "Akun guru berhasil dibuat! Silakan lengkapi profil selanjutnya."
        );
      } else {
        toast.success(
          "Akun guru berhasil dibuat! Silakan lengkapi profil selanjutnya."
        );
      }

      reset({ role: "GURU" });
      handleOpenChange(false); // nutup modal
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal membuat akun guru. Silakan coba lagi.");
      }
    }
  }

  return (
    <div>
      <Button
        onClick={() => handleOpenChange(true)}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Tambah Guru
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Buat Akun Guru Baru
            </DialogTitle>
            <DialogDescription>
              Lengkapi form berikut untuk membuat akun guru baru. Guru dapat
              melengkapi profil setelah login.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informasi Akun
                </CardTitle>
                <CardDescription className="text-sm">
                  Data dasar untuk pembuatan akun guru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isSubmitting}
                    placeholder="Masukkan nama lengkap guru"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isSubmitting}
                    placeholder="contoh@sekolah.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    disabled={isSubmitting}
                    placeholder="Minimal 6 karakter"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Role *
                  </Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Pilih role pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GURU">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Guru</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Information Note */}
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📝 Catatan:</strong> Setelah akun dibuat, guru dapat
                login dan melengkapi profil lengkap termasuk data personal,
                pendidikan, dan kepegawaian.
              </p>
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Buat Akun
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
