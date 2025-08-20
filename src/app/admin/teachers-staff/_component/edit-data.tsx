"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { GuruFormValues, guruSchema } from "../../schemas/editGuruSchema";
import { editGuru } from "../../teachers-staff/actions/editGuru";
import { Agama, Gender, Guru, StatusKawin } from "@/interface";

// Asumsikan tipe ini ada di proyek Anda

interface EditGuruDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Guru | null;
  //   onSave: (editedItem: Guru) => void; // onSave adalah bagian dari props?
}
export function EditGuruDialog({
  open,
  onOpenChange,
  item,
}: EditGuruDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GuruFormValues>({
    resolver: zodResolver(guruSchema),
  });

  const watchedForm = watch();

  React.useEffect(() => {
    if (open && item) {
      reset({
        namaLengkap: item.namaLengkap,
        nip: item.nip ?? "",
        nik: item.nik ?? "",
        tempatLahir: item.tempatLahir ?? "",
        noHp: item.noHp ?? "",
        emailAlternatif: item.emailAlternatif ?? "",
        alamatLengkap: item.alamatLengkap ?? "",
        kelurahan: item.kelurahan ?? "",
        kecamatan: item.kecamatan ?? "",
        kabupatenKota: item.kabupatenKota ?? "",
        provinsi: item.provinsi ?? "",
        kodePos: item.kodePos ?? "",
        pendidikanTerakhir: item.pendidikanTerakhir ?? "",
        jurusan: item.jurusan ?? "",
        institusi: item.institusi ?? "",
        statusKepegawaian: item.statusKepegawaian ?? "",
        golongan: item.golongan ?? "",
        pangkat: item.pangkat ?? "",
        bidangStudi: item.bidangStudi ?? "",

        tanggalLahir: item.tanggalLahir
          ? new Date(item.tanggalLahir)
          : undefined,
        tmt: item.tmt ? new Date(item.tmt) : undefined,
        tahunLulus: item.tahunLulus ?? undefined,

        jenisKelamin: item.jenisKelamin ?? undefined,
        agama: item.agama ?? undefined,
        statusKawin: item.statusKawin ?? undefined,
      });
    }
  }, [open, item, reset]);

  // ... (kode yang sama)

  const onSubmit: SubmitHandler<GuruFormValues> = async (data) => {
    if (!item) return;

    setIsSaving(true);
    try {
      const result = await editGuru(item.id, data);
      if (result.success) {
        // HAPUS BARIS INI
        onOpenChange(false);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ... (sisa kode yang sama)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Guru</DialogTitle>
          <DialogDescription>
            Ubah informasi guru di sini. Klik simpan saat selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Nama Lengkap */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaLengkap" className="text-right">
              Nama Lengkap
            </Label>
            <div className="col-span-3">
              <Input id="namaLengkap" {...register("namaLengkap")} />
              {errors.namaLengkap && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.namaLengkap.message}
                </p>
              )}
            </div>
          </div>

          {/* NIP */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nip" className="text-right">
              NIP
            </Label>
            <div className="col-span-3">
              <Input id="nip" {...register("nip")} />
              {errors.nip && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.nip.message}
                </p>
              )}
            </div>
          </div>

          {/* NIK */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nik" className="text-right">
              NIK
            </Label>
            <div className="col-span-3">
              <Input id="nik" {...register("nik")} />
              {errors.nik && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.nik.message}
                </p>
              )}
            </div>
          </div>

          {/* Tempat Lahir */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tempatLahir" className="text-right">
              Tempat Lahir
            </Label>
            <div className="col-span-3">
              <Input id="tempatLahir" {...register("tempatLahir")} />
              {errors.tempatLahir && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tempatLahir.message}
                </p>
              )}
            </div>
          </div>

          {/* Tanggal Lahir */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tanggalLahir" className="text-right">
              Tanggal Lahir
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedForm.tanggalLahir && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedForm.tanggalLahir ? (
                      format(watchedForm.tanggalLahir, "PPP", { locale: id })
                    ) : (
                      <span>Pilih Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedForm.tanggalLahir}
                    disabled={(date) =>
                      date < new Date("1945-01-01") ||
                      date > new Date("2005-12-31")
                    }
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) {
                        setValue("tanggalLahir", date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.tanggalLahir && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tanggalLahir.message}
                </p>
              )}
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jenisKelamin" className="text-right">
              Jenis Kelamin
            </Label>
            <div className="col-span-3">
              <Select
                value={watchedForm.jenisKelamin}
                onValueChange={(value) =>
                  setValue("jenisKelamin", value as Gender)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                  <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenisKelamin && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.jenisKelamin.message}
                </p>
              )}
            </div>
          </div>

          {/* Agama */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agama" className="text-right">
              Agama
            </Label>
            <div className="col-span-3">
              <Select
                value={watchedForm.agama}
                onValueChange={(value) => setValue("agama", value as Agama)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Agama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISLAM">Islam</SelectItem>
                  <SelectItem value="KRISTEN">Kristen</SelectItem>
                  <SelectItem value="KATOLIK">Katolik</SelectItem>
                  <SelectItem value="HINDU">Hindu</SelectItem>
                  <SelectItem value="BUDDHA">Buddha</SelectItem>
                  <SelectItem value="KONGHUCU">Konghucu</SelectItem>
                </SelectContent>
              </Select>
              {errors.agama && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.agama.message}
                </p>
              )}
            </div>
          </div>

          {/* Status Kawin */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="statusKawin" className="text-right">
              Status Kawin
            </Label>
            <div className="col-span-3">
              <Select
                value={watchedForm.statusKawin}
                onValueChange={(value) =>
                  setValue("statusKawin", value as StatusKawin)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status Kawin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELUM_KAWIN">Belum Kawin</SelectItem>
                  <SelectItem value="KAWIN">Kawin</SelectItem>
                  <SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem>
                  <SelectItem value="CERAI_MATI">Cerai Mati</SelectItem>
                </SelectContent>
              </Select>
              {errors.statusKawin && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.statusKawin.message}
                </p>
              )}
            </div>
          </div>

          {/* No. HP */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="noHp" className="text-right">
              No. HP
            </Label>
            <div className="col-span-3">
              <Input id="noHp" {...register("noHp")} />
              {errors.noHp && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.noHp.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Alternatif */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="emailAlternatif" className="text-right">
              Email Alternatif
            </Label>
            <div className="col-span-3">
              <Input
                id="emailAlternatif"
                {...register("emailAlternatif")}
                disabled
              />
              {errors.emailAlternatif && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emailAlternatif.message}
                </p>
              )}
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alamatLengkap" className="text-right">
              Alamat Lengkap
            </Label>
            <div className="col-span-3">
              <Input id="alamatLengkap" {...register("alamatLengkap")} />
              {errors.alamatLengkap && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.alamatLengkap.message}
                </p>
              )}
            </div>
          </div>

          {/* Kelurahan */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelurahan" className="text-right">
              Kelurahan
            </Label>
            <div className="col-span-3">
              <Input id="kelurahan" {...register("kelurahan")} />
              {errors.kelurahan && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kelurahan.message}
                </p>
              )}
            </div>
          </div>

          {/* Kecamatan */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kecamatan" className="text-right">
              Kecamatan
            </Label>
            <div className="col-span-3">
              <Input id="kecamatan" {...register("kecamatan")} />
              {errors.kecamatan && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kecamatan.message}
                </p>
              )}
            </div>
          </div>

          {/* Kabupaten/Kota */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kabupatenKota" className="text-right">
              Kabupaten/Kota
            </Label>
            <div className="col-span-3">
              <Input id="kabupatenKota" {...register("kabupatenKota")} />
              {errors.kabupatenKota && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kabupatenKota.message}
                </p>
              )}
            </div>
          </div>

          {/* Provinsi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provinsi" className="text-right">
              Provinsi
            </Label>
            <div className="col-span-3">
              <Input id="provinsi" {...register("provinsi")} />
              {errors.provinsi && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.provinsi.message}
                </p>
              )}
            </div>
          </div>

          {/* Kode Pos */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kodePos" className="text-right">
              Kode Pos
            </Label>
            <div className="col-span-3">
              <Input id="kodePos" {...register("kodePos")} />
              {errors.kodePos && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kodePos.message}
                </p>
              )}
            </div>
          </div>

          {/* Pendidikan Terakhir */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pendidikanTerakhir" className="text-right">
              Pendidikan Terakhir
            </Label>
            <div className="col-span-3">
              <Input
                id="pendidikanTerakhir"
                {...register("pendidikanTerakhir")}
              />
              {errors.pendidikanTerakhir && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pendidikanTerakhir.message}
                </p>
              )}
            </div>
          </div>

          {/* Jurusan */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jurusan" className="text-right">
              Jurusan
            </Label>
            <div className="col-span-3">
              <Input id="jurusan" {...register("jurusan")} />
              {errors.jurusan && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.jurusan.message}
                </p>
              )}
            </div>
          </div>

          {/* Tahun Lulus */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tahunLulus" className="text-right">
              Tahun Lulus
            </Label>
            <div className="col-span-3">
              <Input
                id="tahunLulus"
                type="number"
                {...register("tahunLulus", { valueAsNumber: true })}
              />
              {errors.tahunLulus && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tahunLulus.message}
                </p>
              )}
            </div>
          </div>

          {/* Institusi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="institusi" className="text-right">
              Institusi
            </Label>
            <div className="col-span-3">
              <Input id="institusi" {...register("institusi")} />
              {errors.institusi && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.institusi.message}
                </p>
              )}
            </div>
          </div>

          {/* Status Kepegawaian */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="statusKepegawaian" className="text-right">
              Status Kepegawaian
            </Label>
            <div className="col-span-3">
              <Input
                id="statusKepegawaian"
                {...register("statusKepegawaian")}
              />
              {errors.statusKepegawaian && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.statusKepegawaian.message}
                </p>
              )}
            </div>
          </div>

          {/* Golongan */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="golongan" className="text-right">
              Golongan
            </Label>
            <div className="col-span-3">
              <Input id="golongan" {...register("golongan")} />
              {errors.golongan && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.golongan.message}
                </p>
              )}
            </div>
          </div>

          {/* Pangkat */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pangkat" className="text-right">
              Pangkat
            </Label>
            <div className="col-span-3">
              <Input id="pangkat" {...register("pangkat")} />
              {errors.pangkat && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pangkat.message}
                </p>
              )}
            </div>
          </div>

          {/* TMT (Terhitung Mulai Tugas) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tmt" className="text-right">
              TMT
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedForm.tmt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedForm.tmt ? (
                      format(watchedForm.tmt, "PPP", { locale: id })
                    ) : (
                      <span>Pilih Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedForm.tmt}
                    disabled={(d) =>
                      d.getMonth() !== new Date().getMonth() ||
                      d.getFullYear() !== new Date().getFullYear()
                    }
                    onSelect={(date) => {
                      if (date) {
                        setValue("tmt", date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.tmt && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tmt.message}
                </p>
              )}
            </div>
          </div>

          {/* Bidang Studi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bidangStudi" className="text-right">
              Bidang Studi
            </Label>
            <div className="col-span-3">
              <Input id="bidangStudi" {...register("bidangStudi")} />
              {errors.bidangStudi && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.bidangStudi.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              type="button"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
