import { getKelasDetail } from "./actions/getKelasDetail";
import GuruLayout from "../../layout/layout";
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
  ArrowLeft,
  GraduationCap,
  Calendar,
  Award,
  BarChart3,
  Plus,
  School,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import StudentList from "./_components/student-list";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    kelasId: string;
  }>;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  } catch {
    return "-";
  }
};

export default async function KelasDetailPage({ params }: PageProps) {
  const { kelasId } = await params;
  const result = await getKelasDetail(kelasId);

  if (!result.success) {
    redirect("/guru/penilaian");
  }

  const data = result.data;
  if (!data) {
    redirect("/guru/penilaian");
  }

  const { guru, kelas, siswa, penilaian, mataPelajaran, stats } = data;

  if (!guru || !kelas) {
    redirect("/guru/penilaian");
  }

  return (
    <GuruLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-4">
          {/* Header Section - Compact */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <Link href="/guru/penilaian">
                <Button variant="outline" size="sm" className="h-8">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Kembali
                </Button>
              </Link>
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Penilaian Kelas {kelas.namaKelas}
                </h1>
                <p className="text-muted-foreground text-xs">
                  {kelas.tahunAjaran} • Semester {kelas.semester}
                  {kelas.jurusan && ` • ${kelas.jurusan}`}
                </p>
              </div>
            </div>
          </div>

          {/* Class Info and Quick Stats - Optimized */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Class Info Card - Compact */}
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <School className="h-4 w-4 text-blue-600" />
                  Informasi Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium">Kelas</p>
                    <p className="font-semibold">{kelas.namaKelas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Tahun</p>
                    <p className="font-semibold">{kelas.tahunAjaran}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">
                      Semester
                    </p>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {kelas.semester}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Jurusan</p>
                    <p className="font-semibold truncate">
                      {kelas.jurusan || "-"}
                    </p>
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
                          {stats.rataRata > 0 ? stats.rataRata : "-"}
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

          {/* Main Content Area - Optimized Layout */}
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Student List - Main Content */}
            <div className="lg:col-span-3">
              <StudentList
                siswa={siswa}
                kelas={kelas}
                mataPelajaran={mataPelajaran}
                penilaian={penilaian}
              />
            </div>

            {/* Sidebar - Assessments and Actions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Assessment List - Compact */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      Penilaian
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {penilaian.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {penilaian.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-xs font-semibold mb-1">
                        Belum ada penilaian
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Buat penilaian pertama
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {penilaian.slice(0, 4).map((assessment: any) => (
                        <div
                          key={assessment.id}
                          className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-700"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium truncate">
                                {assessment.nama}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {assessment.mataPelajaran?.nama}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0 h-4"
                                >
                                  {assessment.kategori}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {assessment._count?.nilaiSiswa || 0} siswa
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {penilaian.length > 4 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{penilaian.length - 4} penilaian lainnya
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions - Compact */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700 dark:from-blue-900/50 dark:to-blue-800/50">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h3 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Tindakan Cepat
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Pilih siswa untuk tambah/edit nilai secara individual
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
