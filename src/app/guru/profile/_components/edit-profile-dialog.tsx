"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Loader2,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  editGuruSchema,
  type EditGuruInput,
} from "@/app/admin/teachers-staff/schema";
import { editProfileGuru } from "../actions/editProfileGuru";
import { Agama, Gender, Guru, StatusKawin } from "@/interface";

interface EditProfileGuruDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guru: any | null;
  onSuccess?: () => void;
}

export function EditProfileGuruDialog({
  open,
  onOpenChange,
  guru,
  onSuccess,
}: EditProfileGuruDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<EditGuruInput>({
    resolver: zodResolver(editGuruSchema),
    defaultValues: {
      id: guru?.id || "",
      namaLengkap: guru?.namaLengkap || "",
      nip: guru?.nip || "",
      nik: guru?.nik || "",
      tempatLahir: guru?.tempatLahir || "",
      noHp: guru?.noHp || "",
      emailAlternatif: guru?.emailAlternatif || "",
      alamatLengkap: guru?.alamatLengkap || "",
      kelurahan: guru?.kelurahan || "",
      kecamatan: guru?.kecamatan || "",
      kabupatenKota: guru?.kabupatenKota || "",
      provinsi: guru?.provinsi || "",
      kodePos: guru?.kodePos || "",
      pendidikanTerakhir: guru?.pendidikanTerakhir || "",
      jurusan: guru?.jurusan || "",
      institusi: guru?.institusi || "",
      statusKepegawaian: guru?.statusKepegawaian || "",
      golongan: guru?.golongan || "",
      pangkat: guru?.pangkat || "",
      bidangStudi: guru?.bidangStudi || "",
      tanggalLahir: guru?.tanggalLahir
        ? new Date(guru.tanggalLahir)
        : undefined,
      tmt: guru?.tmt ? new Date(guru.tmt) : undefined,
      tahunLulus: guru?.tahunLulus || undefined,
      jenisKelamin: guru?.jenisKelamin || undefined,
      agama: guru?.agama || undefined,
      statusKawin: guru?.statusKawin || undefined,
    },
  });

  React.useEffect(() => {
    if (open && guru) {
      // Only reset if the form values are different from current guru data
      const currentValues = form.getValues();
      if (currentValues.id !== guru.id) {
        form.reset({
          id: guru.id,
          namaLengkap: guru.namaLengkap || "",
          nip: guru.nip || "",
          nik: guru.nik || "",
          tempatLahir: guru.tempatLahir || "",
          noHp: guru.noHp || "",
          emailAlternatif: guru.emailAlternatif || "",
          alamatLengkap: guru.alamatLengkap || "",
          kelurahan: guru.kelurahan || "",
          kecamatan: guru.kecamatan || "",
          kabupatenKota: guru.kabupatenKota || "",
          provinsi: guru.provinsi || "",
          kodePos: guru.kodePos || "",
          pendidikanTerakhir: guru.pendidikanTerakhir || "",
          jurusan: guru.jurusan || "",
          institusi: guru.institusi || "",
          statusKepegawaian: guru.statusKepegawaian || "",
          golongan: guru.golongan || "",
          pangkat: guru.pangkat || "",
          bidangStudi: guru.bidangStudi || "",
          tanggalLahir: guru.tanggalLahir
            ? new Date(guru.tanggalLahir)
            : undefined,
          tmt: guru.tmt ? new Date(guru.tmt) : undefined,
          tahunLulus: guru.tahunLulus || undefined,
          jenisKelamin: guru.jenisKelamin || undefined,
          agama: guru.agama || undefined,
          statusKawin: guru.statusKawin || undefined,
        });
      }
    }
  }, [open, guru, form]);

  const onSubmit = async (data: EditGuruInput) => {
    if (!guru) return;

    setIsSaving(true);
    try {
      const result = await editProfileGuru(data);
      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profil Guru
          </DialogTitle>
          <DialogDescription>
            Perbarui informasi profil Anda untuk meningkatkan kelengkapan data.
            Gunakan tab-tab berikut untuk navigasi yang lebih mudah. Data yang
            ditandai (*) wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger
                    value="personal"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    value="address"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="flex items-center gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Pendidikan
                  </TabsTrigger>
                  <TabsTrigger
                    value="employment"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Kepegawaian
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informasi Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="namaLengkap"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Lengkap *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Masukkan nama lengkap"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIP</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nomor Induk Pegawai"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                          name="noHp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. HP</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nomor telepon/HP"
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
                                <Input
                                  placeholder="Kota tempat lahir"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                        format(field.value, "PPP", {
                                          locale: id,
                                        })
                                      ) : (
                                        <span>Pilih Tanggal</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                          name="jenisKelamin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jenis Kelamin</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="LAKI_LAKI">
                                    Laki-laki
                                  </SelectItem>
                                  <SelectItem value="PEREMPUAN">
                                    Perempuan
                                  </SelectItem>
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
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih agama" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ISLAM">Islam</SelectItem>
                                  <SelectItem value="KRISTEN">
                                    Kristen
                                  </SelectItem>
                                  <SelectItem value="KATOLIK">
                                    Katolik
                                  </SelectItem>
                                  <SelectItem value="HINDU">Hindu</SelectItem>
                                  <SelectItem value="BUDDHA">Buddha</SelectItem>
                                  <SelectItem value="KONGHUCU">
                                    Konghucu
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="statusKawin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status Kawin</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih status kawin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BELUM_KAWIN">
                                    Belum Kawin
                                  </SelectItem>
                                  <SelectItem value="KAWIN">Kawin</SelectItem>
                                  <SelectItem value="CERAI_HIDUP">
                                    Cerai Hidup
                                  </SelectItem>
                                  <SelectItem value="CERAI_MATI">
                                    Cerai Mati
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emailAlternatif"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Alternatif</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Email alternatif"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Address Information Tab */}
                <TabsContent value="address" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Informasi Alamat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="alamatLengkap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat Lengkap</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Alamat lengkap tempat tinggal"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="kelurahan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kelurahan</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nama kelurahan"
                                  {...field}
                                />
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
                                <Input
                                  placeholder="Nama kecamatan"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="kabupatenKota"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kabupaten/Kota</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Kabupaten atau kota"
                                  {...field}
                                />
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
                                <Input placeholder="Nama provinsi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="kodePos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kode Pos</FormLabel>
                              <FormControl>
                                <Input placeholder="Kode pos" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Education Information Tab */}
                <TabsContent value="education" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Informasi Pendidikan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pendidikanTerakhir"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pendidikan Terakhir</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="S1, S2, D3, SMA, dll"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="jurusan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jurusan</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Jurusan/Program studi"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="institusi"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institusi</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nama universitas/sekolah"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tahunLulus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tahun Lulus</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Tahun kelulusan"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value ? parseInt(value, 10) : undefined
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bidangStudi"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bidang Studi</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Bidang studi/mata pelajaran"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Employment Information Tab */}
                <TabsContent value="employment" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Informasi Kepegawaian
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="statusKepegawaian"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status Kepegawaian</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="PNS, PPPK, Honorer, dll"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="golongan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Golongan</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="III/a, IV/b, dll"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pangkat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pangkat</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Penata Muda, Penata, dll"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tmt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TMT (Terhitung Mulai Tugas)</FormLabel>
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
                                        format(field.value, "PPP", {
                                          locale: id,
                                        })
                                      ) : (
                                        <span>Pilih Tanggal</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date()}
                                    captionLayout="dropdown"
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
