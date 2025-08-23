"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Users,
  BookOpen,
  IdCard,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { GuruWithRelations } from "@/interface";

interface ViewGuruDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GuruWithRelations | null;
}

export function ViewGuruDialog({
  open,
  onOpenChange,
  item,
}: ViewGuruDialogProps) {
  if (!item) return null;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detail Guru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{item.namaLengkap}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {item.nip && (
                      <span className="flex items-center gap-1">
                        <IdCard className="h-4 w-4" />
                        NIP: {item.nip}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge
                  variant={item.isProfileComplete ? "default" : "secondary"}
                >
                  {item.isProfileComplete
                    ? "Profil Lengkap"
                    : "Profil Belum Lengkap"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIK</p>
                <p>{item.nik || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tempat, Tanggal Lahir
                </p>
                <p>
                  {item.tempatLahir || "-"}
                  {item.tanggalLahir && item.tempatLahir && ", "}
                  {formatDate(item.tanggalLahir)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Jenis Kelamin
                </p>
                <p>{item.jenisKelamin || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Agama
                </p>
                <p>{item.agama || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status Perkawinan
                </p>
                <p>{item.statusKawin || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Kontak & Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nomor HP
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {item.noHp || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Alternatif
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {item.emailAlternatif || "-"}
                  </p>
                </div>
              </div>

              {item.alamatLengkap && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Alamat Lengkap
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>
                      {item.alamatLengkap}
                      {(item.kelurahan ||
                        item.kecamatan ||
                        item.kabupatenKota ||
                        item.provinsi) && (
                        <span className="block text-sm text-muted-foreground mt-1">
                          {[
                            item.kelurahan,
                            item.kecamatan,
                            item.kabupatenKota,
                            item.provinsi,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          {item.kodePos && ` ${item.kodePos}`}
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Pendidikan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pendidikan Terakhir
                </p>
                <p>{item.pendidikanTerakhir || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Jurusan
                </p>
                <p>{item.jurusan || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Institusi
                </p>
                <p>{item.institusi || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tahun Lulus
                </p>
                <p>{item.tahunLulus || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Bidang Studi
                </p>
                <p>{item.bidangStudi || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Kepegawaian
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status Kepegawaian
                </p>
                <p>
                  {item.statusKepegawaian ? (
                    <Badge variant="outline">{item.statusKepegawaian}</Badge>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Golongan/Pangkat
                </p>
                <p>
                  {item.golongan && item.pangkat
                    ? `${item.golongan} - ${item.pangkat}`
                    : item.golongan || item.pangkat || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">TMT</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(item.tmt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Masa Kerja
                </p>
                <p>{item.masaKerja ? `${item.masaKerja} tahun` : "-"}</p>
              </div>
              {item.walikelas && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Wali Kelas
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {item.walikelas}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teaching Assignment */}
          {(item.kelas && item.kelas.length > 0) ||
          (item.mataPelajaran && item.mataPelajaran.length > 0) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Penugasan Mengajar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.kelas && item.kelas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Kelas yang Diampu
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.kelas.map((kelas) => (
                        <Badge
                          key={kelas.id}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {kelas.namaKelas}
                          <span className="text-xs text-muted-foreground">
                            ({kelas.tahunAjaran} - Sem {kelas.semester})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.mataPelajaran && item.mataPelajaran.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Mata Pelajaran
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.mataPelajaran.map((subject) => (
                        <Badge
                          key={subject.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          {subject.nama}
                          {subject.kode && (
                            <span className="text-xs text-muted-foreground">
                              ({subject.kode})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email Akun
                </p>
                <p>{item.user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Role
                </p>
                <p>
                  <Badge variant="outline">{item.user?.role || "-"}</Badge>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status Verifikasi
                </p>
                <p>
                  <Badge
                    variant={
                      item.user?.emailVerified ? "default" : "destructive"
                    }
                  >
                    {item.user?.emailVerified
                      ? "Terverifikasi"
                      : "Belum Verifikasi"}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bergabung
                </p>
                <p>{formatDate(item.user?.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
