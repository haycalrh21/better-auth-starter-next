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
import {
  AlertTriangle,
  User,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react";
import { GuruWithRelations } from "@/interface";
import { deleteGuru } from "../actions/delete-guru";

interface DeleteGuruDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GuruWithRelations | null;
}

type FormData = {
  id: string;
  reason: string;
  transferData: boolean;
};

type FormErrors = {
  reason?: string;
};

export default function DeleteGuruDialog({
  open,
  onOpenChange,
  item,
}: DeleteGuruDialogProps) {
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

  const kelasCount = item?.kelas?.filter((k) => k.isActive).length || 0;
  const kelasNames =
    item?.kelas
      ?.filter((k) => k.isActive)
      .map((k) => k.namaKelas)
      .join(", ") || "";
  const subjectCount = item?.mataPelajaran?.length || 0;
  const subjectNames = item?.mataPelajaran?.map((s) => s.nama).join(", ") || "";

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
      const result = await deleteGuru({
        id: formData.id,
        reason: formData.reason || undefined,
        transferData: formData.transferData,
      });

      if (result.success) {
        toast.success("Guru berhasil dihapus");
        onOpenChange(false);

        // Reset form
        setFormData({
          id: "",
          reason: "",
          transferData: false,
        });
        setErrors({});
      } else {
        toast.error(result.error || "Gagal menghapus guru");
      }
    } catch (error) {
      console.error("Delete guru error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus guru"
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
            Hapus Guru
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Anda akan menghapus guru <strong>{item?.namaLengkap}</strong>
                </span>
              </div>
              {item?.nip && (
                <div className="text-sm text-muted-foreground">
                  NIP: {item.nip}
                </div>
              )}
              {item?.statusKepegawaian && (
                <div className="text-sm text-muted-foreground">
                  Status: {item.statusKepegawaian}
                </div>
              )}
              {kelasCount > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Users className="h-4 w-4" />
                  <span>
                    ⚠️ Guru mengajar {kelasCount} kelas: {kelasNames}
                  </span>
                </div>
              )}
              {subjectCount > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    📚 Mengampu {subjectCount} mata pelajaran: {subjectNames}
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
              placeholder="Jelaskan alasan penghapusan guru..."
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
                Pertahankan data pengajaran
              </Label>
              <p className="text-xs text-muted-foreground">
                Centang untuk mempertahankan riwayat pengajaran guru (jadwal,
                penugasan) meskipun dihapus
              </p>
            </div>
          </div>

          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              <strong>Peringatan:</strong> Guru akan dihapus dari sistem.
              {kelasCount > 0 && (
                <span className="block mt-1">
                  Guru akan dilepas dari semua kelas yang diampu.
                </span>
              )}
              {subjectCount > 0 && (
                <span className="block mt-1">
                  Penugasan mata pelajaran akan dihapus.
                </span>
              )}
              <span className="block mt-1">
                Akun pengguna akan dihapus permanen dan tidak dapat dipulihkan.
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
              {isLoading ? "Menghapus..." : "Hapus Guru"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
