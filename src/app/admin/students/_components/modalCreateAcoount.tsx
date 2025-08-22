"use client";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Eye, EyeOff } from "lucide-react";

import {
  UserCreateInput,
  userCreateSchema,
} from "@/app/admin/schemas/guruSchema";
import { objectToFormData } from "@/utils/objectToFormData";
import { createGuru } from "@/app/admin/teachers-staff/actions/create-guru";

export default function CreateAccountStudentsModal() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { role: "" as unknown as UserCreateInput["role"] },
  });

  async function onSubmit(data: UserCreateInput) {
    try {
      const formData = objectToFormData(data);
      await createGuru(formData);

      toast.success("Akun siswa berhasil dibuat");
      reset();
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal membuat akun");
      }
    }
  }

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Buat Akun Siswa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Buat Akun Siswa Baru
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk membuat akun siswa baru
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isSubmitting}
                placeholder="Masukkan nama lengkap siswa"
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                placeholder="contoh@email.com"
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isSubmitting}
                  placeholder="Masukkan password (minimal 6 karakter)"
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih role pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SISWA">Siswa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Membuat...
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
    </>
  );
}
