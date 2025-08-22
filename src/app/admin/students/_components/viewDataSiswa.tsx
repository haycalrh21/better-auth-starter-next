"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  Clock,
  IdCard,
  Heart,
  Home,
  School,
} from "lucide-react";
import { SiswaWithRelations, StatusSiswa, Gender, Agama } from "@/interface";

interface ViewSiswaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SiswaWithRelations | null;
}

export function ViewSiswaDialog({
  open,
  onOpenChange,
  item,
}: ViewSiswaDialogProps) {
  if (!item) return null;

  const kelasCount = item.kelas?.length || 0;
  const currentKelas = item.kelas?.[0]?.namaKelas || "Belum ada kelas";

  const getStatusBadge = (status: StatusSiswa) => {
    switch (status) {
      case StatusSiswa.AKTIF:
        return <Badge variant="default">Aktif</Badge>;
      case StatusSiswa.LULUS:
        return <Badge variant="secondary">Lulus</Badge>;
      case StatusSiswa.PINDAH:
        return <Badge variant="outline">Pindah</Badge>;
      case StatusSiswa.KELUAR:
        return <Badge variant="destructive">Keluar</Badge>;
      case StatusSiswa.DIKELUARKAN:
        return <Badge variant="destructive">Dikeluarkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGenderLabel = (gender?: Gender) => {
    switch (gender) {
      case "LAKI_LAKI":
        return "Laki-laki";
      case "PEREMPUAN":
        return "Perempuan";
      default:
        return "Tidak diketahui";
    }
  };

  const getAgamaLabel = (agama?: Agama) => {
    switch (agama) {
      case "ISLAM":
        return "Islam";
      case "KRISTEN":
        return "Kristen";
      case "KATOLIK":
        return "Katolik";
      case "HINDU":
        return "Hindu";
      case "BUDDHA":
        return "Buddha";
      case "KONGHUCU":
        return "Konghucu";
      default:
        return "Tidak diketahui";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detail Siswa {item.namaLengkap}
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang siswa {item.namaLengkap}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Nama Lengkap
              </div>
              <p className="text-lg font-semibold">{item.namaLengkap}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="h-4 w-4" />
                Status
              </div>
              {getStatusBadge(item.status)}
            </div>
          </div>

          <Separator />

          {/* Identity Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              Informasi Identitas
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NISN</p>
                <p className="font-medium">{item.nisn || "Belum diisi"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NIK</p>
                <p className="font-medium">{item.nik || "Belum diisi"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tempat Lahir</p>
                <p className="font-medium">
                  {item.tempatLahir || "Belum diisi"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                <p className="font-medium">
                  {item.tanggalLahir
                    ? new Date(item.tanggalLahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Belum diisi"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">
                  {getGenderLabel(item.jenisKelamin)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Agama</p>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <p className="font-medium">{getAgamaLabel(item.agama)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Informasi Kontak
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">No. HP</p>
                <p className="font-medium">{item.noHp || "Belum diisi"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <p className="font-medium">
                    {item.emailAlternatif || "Belum diisi"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Informasi Alamat
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Alamat Lengkap</p>
                <p className="font-medium">
                  {item.alamatLengkap || "Belum diisi"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kelurahan</p>
                  <p className="font-medium">
                    {item.kelurahan || "Belum diisi"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kecamatan</p>
                  <p className="font-medium">
                    {item.kecamatan || "Belum diisi"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Kabupaten/Kota
                  </p>
                  <p className="font-medium">
                    {item.kabupatenKota || "Belum diisi"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Provinsi</p>
                  <p className="font-medium">
                    {item.provinsi || "Belum diisi"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Kode Pos</p>
                <p className="font-medium">{item.kodePos || "Belum diisi"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <School className="h-4 w-4" />
              Informasi Akademik
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Kelas Saat Ini</p>
                <Badge variant="outline">{currentKelas}</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tahun Masuk</p>
                <p className="font-medium">
                  {item.tahunMasuk || "Belum diisi"}
                </p>
              </div>

              {item.tahunLulus && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tahun Lulus</p>
                  <p className="font-medium">{item.tahunLulus}</p>
                </div>
              )}

              {item.tanggalLulus && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tanggal Lulus</p>
                  <p className="font-medium">
                    {new Date(item.tanggalLulus).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {item.alasanKeluar && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Alasan Keluar</p>
                <p className="font-medium text-red-600">{item.alasanKeluar}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Informasi Orang Tua/Wali
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Ayah</p>
                <div className="space-y-1">
                  <p className="font-medium">
                    {item.namaAyah || "Belum diisi"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.pekerjaanAyah || "Pekerjaan belum diisi"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ibu</p>
                <div className="space-y-1">
                  <p className="font-medium">{item.namaIbu || "Belum diisi"}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.pekerjaanIbu || "Pekerjaan belum diisi"}
                  </p>
                </div>
              </div>

              {item.namaWali && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Wali</p>
                  <div className="space-y-1">
                    <p className="font-medium">{item.namaWali}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.pekerjaanWali || "Pekerjaan belum diisi"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {item.noHpOrtu && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  No. HP Orang Tua/Wali
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <p className="font-medium">{item.noHpOrtu}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Akun
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status Profil</p>
                <Badge
                  variant={item.isProfileComplete ? "default" : "secondary"}
                >
                  {item.isProfileComplete ? "Lengkap" : "Belum Lengkap"}
                </Badge>
              </div>

              {item.user && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Akun</p>
                  <p className="font-medium">{item.user.email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Informasi Waktu
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dibuat pada:</p>
                <p className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Terakhir diupdate:</p>
                <p className="font-medium">
                  {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
