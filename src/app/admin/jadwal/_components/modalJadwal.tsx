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

import { JadwalFormValues, jadwalSchema } from "../schema/jadwalSchema";
import {
  createJadwal,
  updateJadwal,
  getDataKelas,
  getDataGuru,
  getDataMataPelajaran,
} from "../actions/jadwalActions";
import { objectToFormData } from "@/utils/objectToFormData";
import type { Jadwal } from "@/interface/jadwal";

interface JadwalModalProps {
  jadwalData?: Jadwal;
  isEdit?: boolean;
}

export default function JadwalModal({
  jadwalData,
  isEdit = false,
}: JadwalModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [kelasList, setKelasList] = React.useState<
    { id: string; namaKelas: string }[]
  >([]);
  const [guruList, setGuruList] = React.useState<
    { id: string; namaLengkap: string }[]
  >([]);
  const [mataPelajaranList, setMataPelajaranList] = React.useState<
    { id: string; nama: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<JadwalFormValues>({
    resolver: zodResolver(jadwalSchema),
  });

  // Load data when modal opens
  React.useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const [kelas, guru, mataPelajaran] = await Promise.all([
            getDataKelas(),
            getDataGuru(),
            getDataMataPelajaran(),
          ]);
          setKelasList(kelas);
          setGuruList(guru);
          setMataPelajaranList(mataPelajaran);
        } catch (error) {
          console.error("Error loading data:", error);
          toast.error("Gagal memuat data");
        }
      };
      loadData();
    }
  }, [open]);

  // Initialize form data for editing
  React.useEffect(() => {
    if (open && isEdit && jadwalData) {
      reset({
        hari: jadwalData.hari || "",
        jamMulai: jadwalData.jamMulai || "",
        jamSelesai: jadwalData.jamSelesai || "",
        kelasId: jadwalData.kelasId || "",
        guruId: jadwalData.guruId || "",
        mataPelajaranId: jadwalData.mataPelajaranId || "none",
      });
    }
  }, [open, isEdit, jadwalData, reset]);

  const onSubmit: SubmitHandler<JadwalFormValues> = async (data) => {
    setIsSubmitting(true);

    try {
      // Convert 'none' to empty string for server processing
      const processedData = {
        ...data,
        mataPelajaranId:
          data.mataPelajaranId === "none" ? "" : data.mataPelajaranId,
      };

      const formData = objectToFormData(processedData);

      const result =
        isEdit && jadwalData
          ? await updateJadwal(jadwalData.id, formData)
          : await createJadwal(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const dayOptions = [
    { value: "SENIN", label: "Senin" },
    { value: "SELASA", label: "Selasa" },
    { value: "RABU", label: "Rabu" },
    { value: "KAMIS", label: "Kamis" },
    { value: "JUMAT", label: "Jumat" },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {isEdit ? "Edit Jadwal" : "Tambah Jadwal"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Ubah informasi jadwal di sini."
                : "Isi formulir untuk menambahkan jadwal baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hari */}
            <div className="space-y-2">
              <Label>Hari *</Label>
              <Select
                onValueChange={(value) => setValue("hari", value)}
                defaultValue={isEdit && jadwalData ? jadwalData.hari : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hari && (
                <p className="text-sm text-red-500">{errors.hari.message}</p>
              )}
            </div>

            {/* Jam Mulai dan Selesai */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jamMulai">Jam Mulai *</Label>
                <Input id="jamMulai" type="time" {...register("jamMulai")} />
                {errors.jamMulai && (
                  <p className="text-sm text-red-500">
                    {errors.jamMulai.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jamSelesai">Jam Selesai *</Label>
                <Input
                  id="jamSelesai"
                  type="time"
                  {...register("jamSelesai")}
                />
                {errors.jamSelesai && (
                  <p className="text-sm text-red-500">
                    {errors.jamSelesai.message}
                  </p>
                )}
              </div>
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <Label>Kelas *</Label>
              <Select
                onValueChange={(value) => setValue("kelasId", value)}
                defaultValue={isEdit && jadwalData ? jadwalData.kelasId : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id}>
                      {kelas.namaKelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelasId && (
                <p className="text-sm text-red-500">{errors.kelasId.message}</p>
              )}
            </div>

            {/* Guru */}
            <div className="space-y-2">
              <Label>Guru *</Label>
              <Select
                onValueChange={(value) => setValue("guruId", value)}
                defaultValue={isEdit && jadwalData ? jadwalData.guruId : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  {guruList.map((guru) => (
                    <SelectItem key={guru.id} value={guru.id}>
                      {guru.namaLengkap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.guruId && (
                <p className="text-sm text-red-500">{errors.guruId.message}</p>
              )}
            </div>

            {/* Mata Pelajaran */}
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select
                onValueChange={(value) => setValue("mataPelajaranId", value)}
                defaultValue={
                  isEdit && jadwalData
                    ? jadwalData.mataPelajaranId || "none"
                    : "none"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada mata pelajaran</SelectItem>
                  {mataPelajaranList.map((mataPelajaran) => (
                    <SelectItem key={mataPelajaran.id} value={mataPelajaran.id}>
                      {mataPelajaran.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mataPelajaranId && (
                <p className="text-sm text-red-500">
                  {errors.mataPelajaranId.message}
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
                {isEdit ? "Perbarui" : "Simpan"} Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
