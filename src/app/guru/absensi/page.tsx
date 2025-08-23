import { getAbsensiGuru } from "./actions/getAbsensiGuru";
import GuruLayout from "../layout/layout";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  School,
  Clock,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatTime = (time: string) => {
  return time;
};

const hariNames = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
};

export default async function AbsensiPage() {
  const result = await getAbsensiGuru();

  if (!result.success) {
    redirect("/guru/dashboard");
  }

  const data = result.data;
  if (!data) {
    redirect("/guru/dashboard");
  }

  const { guru, kelas, stats } = data;

  if (!guru) {
    redirect("/guru/dashboard");
  }

  return (
    <GuruLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Absensi Siswa
                </h1>
                <p className="text-muted-foreground text-sm">
                  Kelola absensi siswa di kelas yang Anda ampu
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Info and Quick Stats */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Teacher Info Card - Compact */}
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  Informasi Guru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {guru.namaLengkap || "-"}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {guru.nip && <span>NIP: {guru.nip}</span>}
                      {guru.bidangStudi && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {guru.bidangStudi}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Statistics - More Compact */}
            <div className="lg:col-span-8">
              <div className="grid gap-3 md:grid-cols-3 h-full">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-200 dark:border-green-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {stats.totalKelas}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Jumlah Kelas
                        </p>
                      </div>
                      <School className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {stats.totalSiswa}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Total Siswa
                        </p>
                      </div>
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-200 dark:border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {stats.totalJadwal}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Total Jadwal
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Attendance Analytics Section */}
          {stats.attendanceStats &&
            stats.attendanceStats.totalPertemuan > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <TrendingUp className="h-5 w-5" />
                    Analisis Kehadiran Bulan Ini
                  </CardTitle>
                  <CardDescription>
                    Data kehadiran siswa berdasarkan{" "}
                    {stats.attendanceStats.totalPertemuan} record absensi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Hadir */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.attendanceStats.attendancePercentage.hadir.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Hadir
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${stats.attendanceStats.attendancePercentage.hadir}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.attendanceStats.totalHadir} dari{" "}
                        {stats.attendanceStats.totalPertemuan}
                      </div>
                    </div>

                    {/* Sakit */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.attendanceStats.attendancePercentage.sakit.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Sakit
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${stats.attendanceStats.attendancePercentage.sakit}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.attendanceStats.totalSakit} dari{" "}
                        {stats.attendanceStats.totalPertemuan}
                      </div>
                    </div>

                    {/* Izin */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.attendanceStats.attendancePercentage.izin.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Izin
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${stats.attendanceStats.attendancePercentage.izin}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.attendanceStats.totalIzin} dari{" "}
                        {stats.attendanceStats.totalPertemuan}
                      </div>
                    </div>

                    {/* Alfa */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {stats.attendanceStats.attendancePercentage.alfa.toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Alfa
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${stats.attendanceStats.attendancePercentage.alfa}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.attendanceStats.totalAlfa} dari{" "}
                        {stats.attendanceStats.totalPertemuan}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Record Absensi:{" "}
                      <strong>{stats.attendanceStats.totalPertemuan}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Tingkat Kehadiran:{" "}
                      <strong className="text-green-600">
                        {stats.attendanceStats.attendancePercentage.hadir.toFixed(
                          1
                        )}
                        %
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Classes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Daftar Kelas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pilih kelas untuk mengisi absensi siswa
                </p>
              </div>
            </div>

            {kelas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tidak Ada Kelas</h3>
                  <p className="text-muted-foreground mb-4">
                    Anda belum memiliki jadwal mengajar di kelas manapun.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/guru/dashboard">Kembali ke Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kelas.map((kelasItem) => (
                  <Card
                    key={kelasItem.id}
                    className="group hover:shadow-md transition-all duration-200 hover:border-green-200 dark:hover:border-green-800"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md">
                            <BookOpen className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {kelasItem.namaKelas}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {kelasItem.tahunAjaran} • Semester{" "}
                              {kelasItem.semester}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                        >
                          {kelasItem.jenjang}
                          {kelasItem.jurusan && ` ${kelasItem.jurusan}`}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Students Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{kelasItem.siswa.length} siswa</span>
                      </div>

                      {/* Schedule Preview */}
                      {kelasItem.jadwal.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Jadwal Mengajar:
                          </p>
                          <div className="space-y-1">
                            {kelasItem.jadwal.slice(0, 2).map((jadwal) => (
                              <div
                                key={jadwal.id}
                                className="flex items-center gap-2 text-xs bg-muted/50 rounded p-1.5"
                              >
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {
                                    hariNames[
                                      jadwal.hari as keyof typeof hariNames
                                    ]
                                  }{" "}
                                  • {formatTime(jadwal.jamMulai)} -{" "}
                                  {formatTime(jadwal.jamSelesai)}
                                </span>
                                {jadwal.mataPelajaran && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0"
                                  >
                                    {jadwal.mataPelajaran.nama}
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {kelasItem.jadwal.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{kelasItem.jadwal.length - 2} jadwal lainnya
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Action Button */}
                      <Button
                        asChild
                        className="w-full group-hover:bg-green-600 group-hover:text-white"
                        variant="outline"
                      >
                        <Link href={`/guru/absensi/${kelasItem.id}`}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Isi Absensi
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
