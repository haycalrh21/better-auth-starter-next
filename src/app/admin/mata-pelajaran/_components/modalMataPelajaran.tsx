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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  MataPelajaranFormValues,
  mataPelajaranSchema,
} from "../schema/mataPelajaranSchema";
import {
  createMataPelajaran,
  updateMataPelajaran,
  getDataGuru,
} from "../actions/mataPelajaranActions";
import { objectToFormData } from "@/utils/objectToFormData";
import type { MataPelajaran } from "@/interface/mataPelajaran";

interface MataPelajaranModalProps {
  mataPelajaranData?: MataPelajaran;
  isEdit?: boolean;
}

export default function MataPelajaranModal({
  mataPelajaranData,
  isEdit = false,
}: MataPelajaranModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [guruList, setGuruList] = React.useState<
    { id: string; namaLengkap: string; bidangStudi: string | null }[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MataPelajaranFormValues>({
    resolver: zodResolver(mataPelajaranSchema),
  });

  // Load guru data when modal opens
  React.useEffect(() => {
    if (open) {
      const loadGuruData = async () => {
        try {
          const data = await getDataGuru();
          setGuruList(data);
        } catch (error) {
          console.error("Error loading guru data:", error);
          toast.error("Gagal memuat data guru");
        }
      };
      loadGuruData();
    }
  }, [open]);

  // Initialize form data for editing
  React.useEffect(() => {
    if (open && isEdit && mataPelajaranData) {
      reset({
        nama: mataPelajaranData.nama || "",
        kode: mataPelajaranData.kode || "",
        deskripsi: mataPelajaranData.deskripsi || "",
        guruId: mataPelajaranData.guruId || "none",
      });
    }
  }, [open, isEdit, mataPelajaranData, reset]);

  const onSubmit: SubmitHandler<MataPelajaranFormValues> = async (data) => {
    setIsSubmitting(true);

    try {
      // Convert 'none' to empty string for server processing
      const processedData = {
        ...data,
        guruId: data.guruId === "none" ? "" : data.guruId,
      };

      const formData = objectToFormData(processedData);

      const result =
        isEdit && mataPelajaranData
          ? await updateMataPelajaran(mataPelajaranData.id, formData)
          : await createMataPelajaran(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan mata pelajaran");
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
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Ubah informasi mata pelajaran di sini."
                : "Isi formulir untuk menambahkan mata pelajaran baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nama Mata Pelajaran */}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Mata Pelajaran *</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama mata pelajaran"
                {...register("nama")}
              />
              {errors.nama && (
                <p className="text-sm text-red-500">{errors.nama.message}</p>
              )}
            </div>

            {/* Kode Mata Pelajaran */}
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Mata Pelajaran</Label>
              <Input
                id="kode"
                placeholder="Masukkan kode mata pelajaran (opsional)"
                {...register("kode")}
              />
              {errors.kode && (
                <p className="text-sm text-red-500">{errors.kode.message}</p>
              )}
            </div>

            {/* Guru Pengampu */}
            <div className="space-y-2">
              <Label>Guru Pengampu</Label>
              <Select
                onValueChange={(value) => setValue("guruId", value)}
                defaultValue={
                  isEdit && mataPelajaranData
                    ? mataPelajaranData.guruId || "none"
                    : "none"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru pengampu (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada guru</SelectItem>
                  {guruList.map((guru) => (
                    <SelectItem key={guru.id} value={guru.id}>
                      {guru.namaLengkap}
                      {guru.bidangStudi ? ` - ${guru.bidangStudi}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.guruId && (
                <p className="text-sm text-red-500">{errors.guruId.message}</p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                placeholder="Masukkan deskripsi mata pelajaran (opsional)"
                {...register("deskripsi")}
              />
              {errors.deskripsi && (
                <p className="text-sm text-red-500">
                  {errors.deskripsi.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Perbarui" : "Simpan"} Mata Pelajaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
