"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, User, GraduationCap } from "lucide-react";
import { SiswaWithRelations } from "@/interface";
import { deleteSiswa } from "../actions/delete-siswa";

interface DeleteSiswaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SiswaWithRelations | null;
}

type FormData = {
  id: string;
  reason: string;
  transferData: boolean;
};

type FormErrors = {
  reason?: string;
};

export default function DeleteSiswaDialog({
  open,
  onOpenChange,
  item,
}: DeleteSiswaDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    id: "",
    reason: "",
    transferData: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        reason: "",
        transferData: false,
      });
      setErrors({});
    }
  }, [item]);

  const kelasCount = item?.kelas?.length || 0;
  const kelasNames = item?.kelas?.map((k) => k.namaKelas).join(", ") || "";

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate reason (optional but if provided must be at least 10 characters)
    if (formData.reason && formData.reason.trim().length < 10) {
      newErrors.reason = "Alasan penghapusan minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, value.toString());
        }
      });

      await deleteSiswa(submitData);
      toast.success("Siswa berhasil dihapus");
      onOpenChange(false);

      // Reset form
      setFormData({
        id: "",
        reason: "",
        transferData: false,
      });
      setErrors({});
    } catch (error) {
      console.error("Delete siswa error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus siswa"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      reason: "",
      transferData: false,
    });
    setErrors({});
    onOpenChange(false);
  };

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Hapus Siswa
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Anda akan menghapus siswa <strong>{item?.namaLengkap}</strong>
                </span>
              </div>
              {item?.nisn && (
                <div className="text-sm text-muted-foreground">
                  NISN: {item.nisn}
                </div>
              )}
              {kelasCount > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    ⚠️ Siswa terdaftar di {kelasCount} kelas: {kelasNames}
                  </span>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Alasan Penghapusan (Opsional)</Label>
            <Textarea
              placeholder="Jelaskan alasan penghapusan siswa..."
              className="resize-none"
              rows={3}
              value={formData.reason}
              onChange={(e) => updateFormData("reason", e.target.value)}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="transferData"
              checked={formData.transferData}
              onCheckedChange={(checked) =>
                updateFormData("transferData", checked as boolean)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="transferData"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pertahankan data akademik
              </Label>
              <p className="text-xs text-muted-foreground">
                Centang untuk mempertahankan riwayat akademik siswa (pembayaran,
                beasiswa) meskipun dihapus
              </p>
            </div>
          </div>

          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              <strong>Peringatan:</strong> Siswa akan dinonaktifkan dan status
              diubah menjadi "KELUAR".
              {kelasCount > 0 && (
                <span className="block mt-1">
                  Siswa akan dikeluarkan dari semua kelas yang diikuti.
                </span>
              )}
              <span className="block mt-1">
                Akun pengguna akan dinonaktifkan tetapi dapat dipulihkan nanti.
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Menghapus..." : "Hapus Siswa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
