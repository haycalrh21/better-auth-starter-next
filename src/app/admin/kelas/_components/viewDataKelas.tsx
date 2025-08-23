"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Hash,
  Clock,
  MapPin,
  CalendarDays,
  Info,
  Loader2,
} from "lucide-react";
import { KelasWithRelations } from "@/interface/kelas";
import { Jenjang } from "@/interface/enums";
import { getDataJadwal } from "@/app/admin/jadwal/actions/jadwalActions";
import { toast } from "sonner";
import type { $Enums } from "@/generated/prisma";

type PrismaHari = $Enums.Hari;

interface JadwalItem {
  id: string;
  hari: PrismaHari;
  jamMulai: string;
  jamSelesai: string;
  kelas: { id: string; namaKelas: string };
  guru: { id: string; namaLengkap: string } | null;
  mataPelajaran: { id: string; nama: string } | null;
}

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
  const [scheduleData, setScheduleData] = useState<JadwalItem[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Fetch schedule data when dialog opens
  useEffect(() => {
    if (open && item) {
      loadScheduleData();
    }
  }, [open, item]);

  const loadScheduleData = async () => {
    if (!item) return;

    setIsLoadingSchedule(true);
    try {
      const allSchedules = await getDataJadwal();
      // Filter schedules for this specific class
      const classSchedules = allSchedules.filter(
        (schedule) => schedule.kelas.id === item.id
      );
      setScheduleData(classSchedules);
    } catch (error) {
      console.error("Error loading schedule data:", error);
      toast.error("Gagal memuat data jadwal");
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  if (!item) return null;

  const studentsCount = item.siswa?.length || 0;
  const capacity = item.kapasitas || 30;
  const utilizationPercentage = Math.round((studentsCount / capacity) * 100);

  // Group schedules by day
  const scheduleByDay = scheduleData.reduce((acc, schedule) => {
    if (!acc[schedule.hari]) {
      acc[schedule.hari] = [];
    }
    acc[schedule.hari].push(schedule);
    return acc;
  }, {} as Record<PrismaHari, JadwalItem[]>);

  // Sort schedules within each day by time
  Object.keys(scheduleByDay).forEach((day) => {
    scheduleByDay[day as PrismaHari].sort((a, b) =>
      a.jamMulai.localeCompare(b.jamMulai)
    );
  });

  const dayNames = {
    ["SENIN" as PrismaHari]: "Senin",
    ["SELASA" as PrismaHari]: "Selasa",
    ["RABU" as PrismaHari]: "Rabu",
    ["KAMIS" as PrismaHari]: "Kamis",
    ["JUMAT" as PrismaHari]: "Jumat",
    ["SABTU" as PrismaHari]: "Sabtu",
  };

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
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Data Kelas
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Jadwal Kelas
              </TabsTrigger>
            </TabsList>

            {/* Class Data Tab */}
            <TabsContent value="data" className="mt-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Informasi Dasar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-4 w-4" />
                          Nama Kelas
                        </div>
                        <p className="text-lg font-semibold">
                          {item.namaKelas}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <BookOpen className="h-4 w-4" />
                          Status
                        </div>
                        <Badge
                          variant={item.isActive ? "default" : "secondary"}
                        >
                          {item.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Informasi Akademik
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Jenjang</p>
                        <Badge variant="outline">
                          {item.jenjang === Jenjang.SMP ? "SMP" : "SMA"}
                        </Badge>
                      </div>

                      {item.jurusan && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Jurusan
                          </p>
                          <Badge variant="outline">{item.jurusan}</Badge>
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tahun Ajaran
                        </p>
                        <p className="font-medium">{item.tahunAjaran}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Semester
                        </p>
                        <p className="font-medium">Semester {item.semester}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teacher Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Wali Kelas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                {/* Students Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informasi Siswa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {studentsCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Jumlah Siswa
                        </p>
                      </div>

                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {capacity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kapasitas
                        </p>
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
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Informasi Waktu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dibuat pada:</p>
                        <p className="font-medium">
                          {new Date(item.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          Terakhir diupdate:
                        </p>
                        <p className="font-medium">
                          {new Date(item.updatedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Jadwal Pelajaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingSchedule ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">
                        Memuat jadwal...
                      </span>
                    </div>
                  ) : scheduleData.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Jadwal Belum Tersedia
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Jadwal pelajaran untuk kelas {item.namaKelas} belum
                        dibuat atau belum tersedia.
                      </p>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                          📋 <strong>Informasi:</strong> Silakan hubungi admin
                          untuk membuat jadwal pelajaran untuk kelas ini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Jadwal Pelajaran Kelas {item.namaKelas}
                        </h4>
                        <Badge variant="outline">
                          {scheduleData.length} Mata Pelajaran
                        </Badge>
                      </div>

                      {/* Daily Schedule */}
                      <div className="space-y-3">
                        {(
                          [
                            "SENIN",
                            "SELASA",
                            "RABU",
                            "KAMIS",
                            "JUMAT",
                          ] as PrismaHari[]
                        ).map((day) => {
                          const daySchedules = scheduleByDay[day] || [];
                          return (
                            <div key={day} className="border rounded-lg">
                              <div className="bg-muted/50 px-4 py-2 border-b">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium">
                                    {dayNames[day]}
                                  </h5>
                                  <span className="text-sm text-muted-foreground">
                                    {daySchedules.length} Mata Pelajaran
                                  </span>
                                </div>
                              </div>

                              <div className="p-4">
                                {daySchedules.length === 0 ? (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">
                                      Tidak ada jadwal
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {daySchedules.map((schedule, index) => {
                                      const isBreakTime =
                                        schedule.mataPelajaran?.nama
                                          ?.toLowerCase()
                                          .includes("istirahat");

                                      return (
                                        <div
                                          key={schedule.id}
                                          className={`flex items-center justify-between p-3 rounded-lg border ${
                                            isBreakTime
                                              ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50"
                                              : "bg-card"
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-sm font-medium">
                                              <Clock
                                                className={`h-4 w-4 ${
                                                  isBreakTime
                                                    ? "text-orange-600"
                                                    : "text-muted-foreground"
                                                }`}
                                              />
                                              {schedule.jamMulai} -{" "}
                                              {schedule.jamSelesai}
                                            </div>
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            <div>
                                              <p
                                                className={`font-medium ${
                                                  isBreakTime
                                                    ? "text-orange-700 dark:text-orange-300"
                                                    : ""
                                                }`}
                                              >
                                                {isBreakTime ? (
                                                  <span className="flex items-center gap-2">
                                                    ☕{" "}
                                                    {schedule.mataPelajaran?.nama?.includes(
                                                      "istirahat"
                                                    )
                                                      ? schedule.mataPelajaran
                                                          .nama
                                                      : "Istirahat"}
                                                  </span>
                                                ) : (
                                                  schedule.mataPelajaran
                                                    ?.nama || "Mata Pelajaran"
                                                )}
                                              </p>
                                              <p
                                                className={`text-sm ${
                                                  isBreakTime
                                                    ? "text-orange-600 dark:text-orange-400"
                                                    : "text-muted-foreground"
                                                }`}
                                              >
                                                {isBreakTime
                                                  ? ""
                                                  : schedule.guru
                                                      ?.namaLengkap ||
                                                    "Guru tidak tersedia"}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {isBreakTime ? (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
                                              >
                                                ⏱️ Istirahat
                                              </Badge>
                                            ) : (
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                📚 Pelajaran
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Schedule Summary */}
                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {scheduleData.length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total Jadwal
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {
                                  new Set(
                                    scheduleData
                                      .filter(
                                        (s) =>
                                          s.guru &&
                                          s.guru.id &&
                                          !s.mataPelajaran?.nama
                                            ?.toLowerCase()
                                            .includes("istirahat")
                                      )
                                      .map((s) => s.guru!.id)
                                  ).size
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total Guru
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-600">
                                {
                                  scheduleData.filter(
                                    (s) =>
                                      !s.mataPelajaran?.nama
                                        ?.toLowerCase()
                                        .includes("istirahat")
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Mata Pelajaran
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-orange-600">
                                {
                                  scheduleData.filter((s) =>
                                    s.mataPelajaran?.nama
                                      ?.toLowerCase()
                                      .includes("istirahat")
                                  ).length
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Waktu Istirahat
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-600">
                                {Object.keys(scheduleByDay).length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Hari Aktif
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Break Time Information */}
                      {scheduleData.some((s) =>
                        s.mataPelajaran?.nama
                          ?.toLowerCase()
                          .includes("istirahat")
                      ) && (
                        <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                              ☕ Informasi Waktu Istirahat
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <p className="text-sm text-orange-600 dark:text-orange-400">
                                📋 <strong>Catatan Penting:</strong> Waktu
                                istirahat adalah periode bebas dimana tidak ada
                                kegiatan pembelajaran formal.
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h5 className="font-medium text-orange-700 dark:text-orange-300">
                                    🚫 Tidak Ada Guru Pengawas
                                  </h5>
                                  <p className="text-sm text-orange-600 dark:text-orange-400">
                                    Selama waktu istirahat, tidak ada guru yang
                                    ditugaskan khusus untuk mengawas kelas.
                                    Siswa bebas melakukan aktivitas sesuai
                                    aturan sekolah.
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="font-medium text-orange-700 dark:text-orange-300">
                                    ⏱️ Jadwal Istirahat
                                  </h5>
                                  <div className="space-y-1">
                                    {scheduleData
                                      .filter((s) =>
                                        s.mataPelajaran?.nama
                                          ?.toLowerCase()
                                          .includes("istirahat")
                                      )
                                      .map((breakSchedule) => (
                                        <div
                                          key={breakSchedule.id}
                                          className="text-sm"
                                        >
                                          <span className="font-medium text-orange-700 dark:text-orange-300">
                                            {dayNames[breakSchedule.hari]}
                                          </span>
                                          <span className="text-orange-600 dark:text-orange-400 ml-2">
                                            {breakSchedule.jamMulai} -{" "}
                                            {breakSchedule.jamSelesai}
                                            {breakSchedule.mataPelajaran?.nama?.includes(
                                              "Pagi"
                                            ) && " (Istirahat Pagi)"}
                                            {breakSchedule.mataPelajaran?.nama?.includes(
                                              "Siang"
                                            ) && " (Istirahat Siang)"}
                                            {!breakSchedule.mataPelajaran?.nama?.includes(
                                              "Pagi"
                                            ) &&
                                              !breakSchedule.mataPelajaran?.nama?.includes(
                                                "Siang"
                                              ) &&
                                              " (Istirahat)"}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                  💡 <strong>Tips:</strong> Siswa diharapkan
                                  menggunakan waktu istirahat untuk
                                  beristirahat, makan, atau melakukan aktivitas
                                  positif lainnya di area yang diizinkan.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
