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

import { editSiswa } from "../actions/editSiswa";
import { SiswaFormValues, siswaSchema } from "../schema/editSiswaSchema";
import { objectToFormData } from "@/utils/objectToFormData";
import { Agama, Gender, SiswaBasic } from "@/interface";

interface EditSiswaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SiswaBasic | null;
}

export function EditSiswaDialog({
  open,
  onOpenChange,
  item,
}: EditSiswaDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SiswaFormValues>({
    resolver: zodResolver(siswaSchema),
  });

  const watchedForm = watch();
  console.log(item?.tanggalLahir, "tanggalLahir");

  React.useEffect(() => {
    if (open && item) {
      reset({
        namaLengkap: item.namaLengkap,
        nisn: item.nisn ?? "",
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

        namaAyah: item.namaAyah ?? "",
        namaIbu: item.namaIbu ?? "",
        namaWali: item.namaWali ?? "",
        pekerjaanAyah: item.pekerjaanAyah ?? "",
        pekerjaanIbu: item.pekerjaanIbu ?? "",
        pekerjaanWali: item.pekerjaanWali ?? "",
        noHpOrtu: item.noHpOrtu ?? "",

        tanggalLahir: item.tanggalLahir
          ? new Date(item.tanggalLahir)
          : undefined,
        tahunMasuk: item.tahunMasuk ?? undefined,

        jenisKelamin: item.jenisKelamin ?? undefined,
        agama: item.agama ?? undefined,
      });
    }
  }, [open, item, reset]);

  const onSubmit: SubmitHandler<SiswaFormValues> = async (data) => {
    if (!item) return;

    setIsSaving(true);
    try {
      const formData = objectToFormData(data);
      const result = await editSiswa(item.id, formData);
      if (result.success) {
        console.log(result, "formData");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>
            Ubah informasi siswa di sini. Klik simpan saat selesai.
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

          {/* NISN */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nisn" className="text-right">
              NISN
            </Label>
            <div className="col-span-3">
              <Input id="nisn" {...register("nisn")} />
              {errors.nisn && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.nisn.message}
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
                type="email"
                {...register("emailAlternatif")}
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

          {/* Kelas */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelas" className="text-right">
              Kelas
            </Label>
            <div className="col-span-3">
              <Input id="kelas" {...register("kelas")} />
              {errors.kelas && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kelas.message}
                </p>
              )}
            </div>
          </div>

          {/* Tahun Masuk */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tahunMasuk" className="text-right">
              Tahun Masuk
            </Label>
            <div className="col-span-3">
              <Input
                id="tahunMasuk"
                type="number"
                {...register("tahunMasuk", { valueAsNumber: true })}
              />
              {errors.tahunMasuk && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tahunMasuk.message}
                </p>
              )}
            </div>
          </div>

          {/* Nama Ayah */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaAyah" className="text-right">
              Nama Ayah
            </Label>
            <div className="col-span-3">
              <Input id="namaAyah" {...register("namaAyah")} />
              {errors.namaAyah && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.namaAyah.message}
                </p>
              )}
            </div>
          </div>

          {/* Nama Ibu */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaIbu" className="text-right">
              Nama Ibu
            </Label>
            <div className="col-span-3">
              <Input id="namaIbu" {...register("namaIbu")} />
              {errors.namaIbu && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.namaIbu.message}
                </p>
              )}
            </div>
          </div>

          {/* Nama Wali */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaWali" className="text-right">
              Nama Wali
            </Label>
            <div className="col-span-3">
              <Input id="namaWali" {...register("namaWali")} />
              {errors.namaWali && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.namaWali.message}
                </p>
              )}
            </div>
          </div>

          {/* Pekerjaan Ayah */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pekerjaanAyah" className="text-right">
              Pekerjaan Ayah
            </Label>
            <div className="col-span-3">
              <Input id="pekerjaanAyah" {...register("pekerjaanAyah")} />
              {errors.pekerjaanAyah && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pekerjaanAyah.message}
                </p>
              )}
            </div>
          </div>

          {/* Pekerjaan Ibu */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pekerjaanIbu" className="text-right">
              Pekerjaan Ibu
            </Label>
            <div className="col-span-3">
              <Input id="pekerjaanIbu" {...register("pekerjaanIbu")} />
              {errors.pekerjaanIbu && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pekerjaanIbu.message}
                </p>
              )}
            </div>
          </div>

          {/* Pekerjaan Wali */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pekerjaanWali" className="text-right">
              Pekerjaan Wali
            </Label>
            <div className="col-span-3">
              <Input id="pekerjaanWali" {...register("pekerjaanWali")} />
              {errors.pekerjaanWali && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pekerjaanWali.message}
                </p>
              )}
            </div>
          </div>

          {/* No. HP Orang Tua/Wali */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="noHpOrtu" className="text-right">
              No. HP Ortu/Wali
            </Label>
            <div className="col-span-3">
              <Input id="noHpOrtu" {...register("noHpOrtu")} />
              {errors.noHpOrtu && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.noHpOrtu.message}
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
