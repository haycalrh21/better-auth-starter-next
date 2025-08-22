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
  Users,
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Hash,
  Clock,
  MapPin,
} from "lucide-react";
import { KelasWithRelations } from "@/interface/kelas";
import { Jenjang } from "@/interface/enums";

interface ViewKelasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KelasWithRelations | null;
}

export function ViewKelasDialog({
  open,
  onOpenChange,
  item,
}: ViewKelasDialogProps) {
  if (!item) return null;

  const studentsCount = item.siswa?.length || 0;
  const capacity = item.kapasitas || 30;
  const utilizationPercentage = Math.round((studentsCount / capacity) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Detail Kelas {item.namaKelas}
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang kelas {item.namaKelas}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4" />
                Nama Kelas
              </div>
              <p className="text-lg font-semibold">{item.namaKelas}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Status
              </div>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informasi Akademik
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Jenjang</p>
                <Badge variant="outline">
                  {item.jenjang === Jenjang.SMP ? "SMP" : "SMA"}
                </Badge>
              </div>

              {item.jurusan && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Jurusan</p>
                  <Badge variant="outline">{item.jurusan}</Badge>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                <p className="font-medium">{item.tahunAjaran}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="font-medium">Semester {item.semester}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Teacher Information */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Wali Kelas
            </h3>

            <div className="rounded-lg border p-3">
              <p className="font-medium">{item.guru.namaLengkap}</p>
              {item.guru.nip && (
                <p className="text-sm text-muted-foreground">
                  NIP: {item.guru.nip}
                </p>
              )}
              {item.guru.emailAlternatif && (
                <p className="text-sm text-muted-foreground">
                  {item.guru.emailAlternatif}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Students Information */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Informasi Siswa
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {studentsCount}
                </p>
                <p className="text-sm text-muted-foreground">Jumlah Siswa</p>
              </div>

              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{capacity}</p>
                <p className="text-sm text-muted-foreground">Kapasitas</p>
              </div>

              <div className="rounded-lg border p-3 text-center">
                <p
                  className={`text-2xl font-bold ${
                    utilizationPercentage > 90
                      ? "text-red-600"
                      : utilizationPercentage > 70
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {utilizationPercentage}%
                </p>
                <p className="text-sm text-muted-foreground">Terisi</p>
              </div>
            </div>

            {/* Student List Preview */}
            {studentsCount > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Daftar Siswa:</p>
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  <div className="p-3 space-y-2">
                    {item.siswa.slice(0, 10).map((siswa, index) => (
                      <div
                        key={siswa.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {index + 1}. {siswa.namaLengkap}
                        </span>
                        {siswa.nisn && (
                          <span className="text-muted-foreground">
                            {siswa.nisn}
                          </span>
                        )}
                      </div>
                    ))}
                    {studentsCount > 10 && (
                      <p className="text-xs text-muted-foreground italic">
                        ... dan {studentsCount - 10} siswa lainnya
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
