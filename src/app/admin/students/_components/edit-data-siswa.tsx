"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { editSiswa } from "../actions/editSiswa";
import { editSiswaSchema, type EditSiswaInput } from "../schema";
import { Agama, Gender, SiswaWithRelations } from "@/interface";

interface EditSiswaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SiswaWithRelations | null;
}

export function EditSiswaDialog({
  open,
  onOpenChange,
  item,
}: EditSiswaDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditSiswaInput>({
    resolver: zodResolver(editSiswaSchema),
    defaultValues: {
      id: "",
      namaLengkap: "",
      nisn: "",
      nik: "",
      tempatLahir: "",
      tanggalLahir: undefined,
      jenisKelamin: undefined,
      agama: undefined,
      noHp: "",
      emailAlternatif: "",
      alamatLengkap: "",
      kelurahan: "",
      kecamatan: "",
      kabupatenKota: "",
      provinsi: "",
      kodePos: "",
      tahunMasuk: undefined,
      namaAyah: "",
      namaIbu: "",
      namaWali: "",
      pekerjaanAyah: "",
      pekerjaanIbu: "",
      pekerjaanWali: "",
      noHpOrtu: "",
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        id: item.id,
        namaLengkap: item.namaLengkap,
        nisn: item.nisn || "",
        nik: item.nik || "",
        tempatLahir: item.tempatLahir || "",
        tanggalLahir: item.tanggalLahir
          ? new Date(item.tanggalLahir)
          : undefined,
        jenisKelamin: item.jenisKelamin || undefined,
        agama: item.agama || undefined,
        noHp: item.noHp || "",
        emailAlternatif: item.emailAlternatif || "",
        alamatLengkap: item.alamatLengkap || "",
        kelurahan: item.kelurahan || "",
        kecamatan: item.kecamatan || "",
        kabupatenKota: item.kabupatenKota || "",
        provinsi: item.provinsi || "",
        kodePos: item.kodePos || "",
        tahunMasuk: item.tahunMasuk || undefined,
        namaAyah: item.namaAyah || "",
        namaIbu: item.namaIbu || "",
        namaWali: item.namaWali || "",
        pekerjaanAyah: item.pekerjaanAyah || "",
        pekerjaanIbu: item.pekerjaanIbu || "",
        pekerjaanWali: item.pekerjaanWali || "",
        noHpOrtu: item.noHpOrtu || "",
      });
    }
  }, [item, form]);

  async function onSubmit(data: EditSiswaInput) {
    if (!item) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      await editSiswa(formData);
      toast.success("Data siswa berhasil diupdate");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Edit siswa error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupdate data siswa"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>
            Ubah informasi siswa {item?.namaLengkap}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="namaLengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap siswa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nisn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NISN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor Induk Siswa Nasional"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor Induk Kependudukan"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tempatLahir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Lahir</FormLabel>
                      <FormControl>
                        <Input placeholder="Tempat lahir" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tanggalLahir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Lahir</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP", { locale: id })
                              ) : (
                                <span>Pilih Tanggal</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1945-01-01") ||
                              date > new Date("2010-12-31")
                            }
                            captionLayout="dropdown"
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tahunMasuk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Masuk</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1950}
                          max={new Date().getFullYear() + 1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jenisKelamin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                          <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agama</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih agama" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ISLAM">Islam</SelectItem>
                          <SelectItem value="KRISTEN">Kristen</SelectItem>
                          <SelectItem value="KATOLIK">Katolik</SelectItem>
                          <SelectItem value="HINDU">Hindu</SelectItem>
                          <SelectItem value="BUDDHA">Buddha</SelectItem>
                          <SelectItem value="KONGHUCU">Konghucu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Kontak</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="noHp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. HP</FormLabel>
                      <FormControl>
                        <Input placeholder="Nomor HP siswa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAlternatif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email alternatif"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Alamat</h3>

              <FormField
                control={form.control}
                name="alamatLengkap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Alamat lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kelurahan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelurahan</FormLabel>
                      <FormControl>
                        <Input placeholder="Kelurahan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kecamatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan</FormLabel>
                      <FormControl>
                        <Input placeholder="Kecamatan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kabupatenKota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kabupaten/Kota</FormLabel>
                      <FormControl>
                        <Input placeholder="Kabupaten/Kota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provinsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <FormControl>
                        <Input placeholder="Provinsi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kodePos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="Kode pos (5 digit)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Parent/Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Orang Tua/Wali</h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="namaAyah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ayah</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama ayah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namaIbu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ibu</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama ibu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namaWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Wali</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama wali (opsional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pekerjaanAyah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Ayah</FormLabel>
                      <FormControl>
                        <Input placeholder="Pekerjaan ayah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pekerjaanIbu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Ibu</FormLabel>
                      <FormControl>
                        <Input placeholder="Pekerjaan ibu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pekerjaanWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Wali</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pekerjaan wali (opsional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="noHpOrtu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. HP Orang Tua/Wali</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor HP orang tua/wali" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
