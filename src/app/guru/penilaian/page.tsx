import { getPenilaianGuru } from "./actions/getPenilaianGuru";
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
  BookOpen,
  Users,
  BarChart3,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  School,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  } catch {
    return "-";
  }
};

const kategoriLabels = {
  Umum: "Umum",
  UTS: "Ujian Tengah Semester",
  UAS: "Ujian Akhir Semester",
  "Ulangan Harian": "Ulangan Harian",
};

export default async function PenilaianPage() {
  const result = await getPenilaianGuru();

  if (!result.success) {
    redirect("/guru/dashboard");
  }

  const data = result.data;
  if (!data) {
    redirect("/guru/dashboard");
  }

  const { guru, kelas, mataPelajaran, penilaian, stats } = data;

  if (!guru) {
    redirect("/guru/dashboard");
  }

  // Calculate class-specific statistics
  const classStats = kelas.map((kelasItem: any) => {
    const classPenilaian = penilaian.filter(
      (p: any) => p.kelasId === kelasItem.id
    );
    const totalNilai = classPenilaian.reduce(
      (acc: number, p: any) => acc + p.nilaiSiswa.length,
      0
    );
    const avgScores = classPenilaian.map((p: any) => {
      const scores = p.nilaiSiswa.map((n: any) => n.nilai);
      return scores.length > 0
        ? scores.reduce((sum: number, score: number) => sum + score, 0) /
            scores.length
        : 0;
    });
    const classAverage =
      avgScores.length > 0
        ? avgScores.reduce((sum: number, avg: number) => sum + avg, 0) /
          avgScores.length
        : 0;

    return {
      ...kelasItem,
      totalPenilaian: classPenilaian.length,
      totalNilai,
      rataRata: Math.round(classAverage * 100) / 100,
    };
  });

  return (
    <GuruLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Penilaian Siswa
                </h1>
                <p className="text-muted-foreground text-sm">
                  Kelola penilaian dan nilai siswa di kelas yang Anda ampu
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
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Informasi Guru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
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
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {stats.totalKelas}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Jumlah Kelas
                        </p>
                      </div>
                      <School className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-200 dark:border-green-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {stats.totalPenilaian}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Total Penilaian
                        </p>
                      </div>
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-200 dark:border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {stats.overallAverage > 0
                            ? stats.overallAverage
                            : "-"}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Rata-rata Nilai
                        </p>
                      </div>
                      <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Classes List - More Compact */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Daftar Kelas ({kelas.length})
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {kelas.length} kelas aktif
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Klik pada kelas untuk mengelola penilaian siswa
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {kelas && kelas.length > 0 ? (
                    <div className="space-y-2">
                      {classStats.map((kelasItem: any) => (
                        <Link
                          key={kelasItem.id}
                          href={`/guru/penilaian/${kelasItem.id}`}
                        >
                          <Card className="transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer group">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                                      <School className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">
                                          {kelasItem.namaKelas}
                                        </h3>
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-1 py-0"
                                        >
                                          S{kelasItem.semester}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {kelasItem.tahunAjaran}
                                        {kelasItem.jurusan &&
                                          ` • ${kelasItem.jurusan}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        Siswa:
                                      </span>
                                      <span className="font-medium">
                                        {kelasItem._count?.siswa || 0}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        Penilaian:
                                      </span>
                                      <span className="font-medium">
                                        {kelasItem.totalPenilaian}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        Rata-rata:
                                      </span>
                                      <span className="font-medium">
                                        {kelasItem.rataRata > 0
                                          ? kelasItem.rataRata
                                          : "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <School className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">
                        Belum ada kelas
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Anda belum ditugaskan mengajar di kelas manapun
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="lg:col-span-1 space-y-4">
              {/* Subject List - Compact */}
              {mataPelajaran && mataPelajaran.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      Mata Pelajaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {mataPelajaran.slice(0, 3).map((mapel: any) => (
                      <div
                        key={mapel.id}
                        className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-700"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {mapel.nama}
                          </p>
                          {mapel.kode && (
                            <p className="text-xs text-muted-foreground">
                              {mapel.kode}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {mataPelajaran.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        +{mataPelajaran.length - 3} mata pelajaran lainnya
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Category Statistics - More Compact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    Statistik Kategori
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {Object.entries(kategoriLabels).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-xs text-muted-foreground truncate">
                        {label.split(" ")[0]} {/* Show first word only */}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        {stats.penilaianByKategori[key] || 0}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Help - Compact */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700 dark:from-blue-900/50 dark:to-blue-800/50">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Petunjuk
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Klik kelas untuk kelola penilaian siswa
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
