"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";

import { KKMFormValues, kkmSchema } from "../schema/kkmSchema";
import {
  createKKM,
  updateKKM,
  getAvailableMataPelajaran,
  getMataPelajaranForEdit,
} from "../actions/kkmActions";
import { objectToFormData } from "@/utils/objectToFormData";
import type { KKM, KKMTableData } from "@/interface/kkm";

interface KKMModalProps {
  kkmData?: KKMTableData;
  isEdit?: boolean;
}

export default function KKMModal({ kkmData, isEdit = false }: KKMModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mataPelajaranList, setMataPelajaranList] = React.useState<
    { id: string; nama: string; kode: string | null }[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<KKMFormValues>({
    resolver: zodResolver(kkmSchema),
  });

  // Load mata pelajaran data when modal opens
  React.useEffect(() => {
    if (open) {
      const loadMataPelajaranData = async () => {
        try {
          let data;
          if (isEdit && kkmData?.mataPelajaranId) {
            // For edit mode, get available mata pelajaran plus current one
            data = await getMataPelajaranForEdit(kkmData.mataPelajaranId);
          } else {
            // For create mode, only get mata pelajaran that don't have KKM yet
            data = await getAvailableMataPelajaran();
          }

          setMataPelajaranList(data);

          // Show helpful message if no mata pelajaran available for create
          if (!isEdit && data.length === 0) {
            toast.info(
              "Semua mata pelajaran sudah memiliki KKM. Silakan edit yang sudah ada jika diperlukan."
            );
          }
        } catch (error) {
          console.error("Error loading mata pelajaran data:", error);
          toast.error("Gagal memuat data mata pelajaran");
        }
      };
      loadMataPelajaranData();
    }
  }, [open, isEdit, kkmData?.mataPelajaranId]);

  // Initialize form data for editing
  React.useEffect(() => {
    if (open && isEdit && kkmData) {
      reset({
        mataPelajaranId: kkmData.mataPelajaranId || "",
        nilai: kkmData.nilai || 0,
      });
    }
  }, [open, isEdit, kkmData, reset]);

  const onSubmit: SubmitHandler<KKMFormValues> = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = objectToFormData(data);

      let result;
      if (isEdit && kkmData?.id) {
        result = await updateKKM(kkmData.id, formData);
      } else {
        result = await createKKM(formData);
      }

      if (result.success) {
        toast.success(result.message);
        handleClose();
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting KKM:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      {isEdit ? (
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah KKM
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit KKM" : "Tambah KKM Baru"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui data Kriteria Ketuntasan Minimal (KKM)."
                : "Tambahkan Kriteria Ketuntasan Minimal (KKM) untuk mata pelajaran."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Mata Pelajaran Select */}
            <div className="space-y-2">
              <Label htmlFor="mataPelajaranId">Mata Pelajaran *</Label>
              {!isEdit && mataPelajaranList.length === 0 ? (
                <div className="border rounded-md p-3 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    🚫 Semua mata pelajaran sudah memiliki KKM
                  </p>
                  <p className="text-xs text-gray-400">
                    Silakan edit KKM yang sudah ada jika diperlukan
                  </p>
                </div>
              ) : (
                <Select
                  onValueChange={(value) => setValue("mataPelajaranId", value)}
                  defaultValue={isEdit ? kkmData?.mataPelajaranId : ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {mataPelajaranList.map((mataPelajaran) => (
                      <SelectItem
                        key={mataPelajaran.id}
                        value={mataPelajaran.id}
                      >
                        {mataPelajaran.kode
                          ? `${mataPelajaran.kode} - ${mataPelajaran.nama}`
                          : mataPelajaran.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.mataPelajaranId && (
                <p className="text-sm text-red-500">
                  {errors.mataPelajaranId.message}
                </p>
              )}
              {!isEdit && mataPelajaranList.length > 0 && (
                <p className="text-xs text-green-600">
                  ✓ {mataPelajaranList.length} mata pelajaran tersedia untuk KKM
                  baru
                </p>
              )}
            </div>

            {/* Nilai KKM */}
            <div className="space-y-2">
              <Label htmlFor="nilai">Nilai KKM *</Label>
              <Input
                id="nilai"
                type="number"
                min="1"
                max="100"
                placeholder="Masukkan nilai KKM (1-100)"
                {...register("nilai", { valueAsNumber: true })}
              />
              {errors.nilai && (
                <p className="text-sm text-red-500">{errors.nilai.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Nilai KKM harus berupa angka antara 1-100
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || (!isEdit && mataPelajaranList.length === 0)
                }
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Perbarui" : "Simpan"} KKM
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
