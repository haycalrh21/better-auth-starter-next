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
import { AlertTriangle } from "lucide-react";
import { KelasWithRelations } from "@/interface/kelas";
import { deleteKelas } from "../actions/delete-kelas";

interface DeleteKelasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KelasWithRelations | null;
}

type FormData = {
  id: string;
  reason: string;
};

type FormErrors = {
  reason?: string;
};

export function DeleteKelasDialog({
  open,
  onOpenChange,
  item,
}: DeleteKelasDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    id: "",
    reason: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        reason: "",
      });
      setErrors({});
    }
  }, [item]);

  const studentsCount = item?.siswa?.length || 0;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate reason if provided (minimum 10 characters)
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

      await deleteKelas(submitData);
      toast.success("Kelas berhasil dihapus");
      onOpenChange(false);

      // Reset form
      setFormData({
        id: "",
        reason: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Delete kelas error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus kelas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      reason: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
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
            Hapus Kelas
          </DialogTitle>
          <DialogDescription>
            Anda akan menghapus kelas <strong>{item?.namaKelas}</strong>
            {studentsCount > 0 && (
              <span className="block mt-1 text-amber-600">
                ⚠️ Kelas ini memiliki {studentsCount} siswa yang akan terputus
                dari kelas
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Alasan Penghapusan (Opsional)</Label>
            <Textarea
              placeholder="Jelaskan alasan penghapusan kelas..."
              className="resize-none"
              rows={3}
              value={formData.reason}
              onChange={(e) => updateFormData("reason", e.target.value)}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
              {studentsCount > 0 && (
                <span className="block mt-1">
                  Siswa dalam kelas ini akan terputus dari kelas dan perlu
                  ditambahkan ke kelas lain secara manual.
                </span>
              )}
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
              {isLoading ? "Menghapus..." : "Hapus Kelas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
