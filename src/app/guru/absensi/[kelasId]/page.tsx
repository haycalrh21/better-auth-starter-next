import { getAbsensiGuru } from "../actions/getAbsensiGuru";
import GuruLayout from "../../layout/layout";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardCheck, Calendar, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceForm } from "../_components/attendance-form";
import { AttendanceHistory } from "../_components/attendance-history";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kelasId: string }>;
}

export default async function ClassAttendancePage({ params }: PageProps) {
  const { kelasId } = await params;

  const result = await getAbsensiGuru();

  if (!result.success) {
    redirect("/guru/dashboard");
  }

  const data = result.data;
  if (!data) {
    redirect("/guru/dashboard");
  }

  const { guru, kelas } = data;

  if (!guru) {
    redirect("/guru/dashboard");
  }

  // Find the specific class
  const selectedClass = kelas.find((k) => k.id === kelasId);

  if (!selectedClass) {
    redirect("/guru/absensi");
  }

  return (
    <GuruLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header with Breadcrumb */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/guru/absensi" className="hover:text-foreground">
                Absensi
              </Link>
              <span>/</span>
              <span className="text-foreground">{selectedClass.namaKelas}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/guru/absensi">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Kembali
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      Absensi Kelas {selectedClass.namaKelas}
                    </h1>
                    <p className="text-muted-foreground">
                      {selectedClass.tahunAjaran} • Semester{" "}
                      {selectedClass.semester} • {selectedClass.jenjang}
                      {selectedClass.jurusan && ` ${selectedClass.jurusan}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Info Card */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <ClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Informasi Kelas</CardTitle>
                    <CardDescription>
                      Detail kelas dan siswa yang terdaftar
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  {selectedClass.siswa.length} Siswa
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Siswa</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedClass.siswa.length} siswa aktif
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jadwal Mengajar</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedClass.jadwal.length} jadwal per minggu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Guru Pengampu</p>
                    <p className="text-sm text-muted-foreground">
                      {guru.namaLengkap}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Preview */}
              {selectedClass.jadwal.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium mb-2">Jadwal Mengajar:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClass.jadwal.map((jadwal) => (
                      <Badge
                        key={jadwal.id}
                        variant="outline"
                        className="text-xs bg-white dark:bg-gray-900"
                      >
                        {jadwal.hari} • {jadwal.jamMulai}-{jadwal.jamSelesai}
                        {jadwal.mataPelajaran &&
                          ` • ${jadwal.mataPelajaran.nama}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Attendance Form and History */}
          <Tabs defaultValue="form" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Isi Absensi
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Riwayat Absensi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4">
              <AttendanceForm kelas={selectedClass} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <AttendanceHistory
                kelasId={selectedClass.id}
                namaKelas={selectedClass.namaKelas}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </GuruLayout>
  );
}
