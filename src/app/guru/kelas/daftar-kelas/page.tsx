import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Eye,
  BookOpen,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GuruLayout from "../../layout/layout";
import { StatusAbsensi } from "@/interface/enums";
import type {
  AttendanceStats,
  KelasWithAttendanceStats,
} from "@/interface/absensi";
import { getKelasWithAttendance } from "./actions/getKelasWithAttendance";

export default async function DaftarKelas() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "GURU") {
    redirect("/");
  }

  // Get teacher's user data to find guruId
  const user = session.user;
  if (!user?.id) {
    redirect("/auth/login");
  }

  // Get real class data with attendance statistics from database
  const result = await getKelasWithAttendance(user.id);

  if (!result.success) {
    console.error("Failed to fetch class data:", result.error);
    // Fallback to empty array if database query fails
  }

  const kelasData: KelasWithAttendanceStats[] = result.data || [];

  const totalSiswa = kelasData.reduce(
    (sum, kelas) => sum + kelas.jumlahSiswa,
    0
  );
  const totalJadwal = kelasData.reduce(
    (sum, kelas) => sum + kelas.jadwal.length,
    0
  );

  // Calculate overall attendance statistics
  const overallAttendanceStats = kelasData.reduce(
    (acc, kelas) => {
      const stats = kelas.attendanceStats;
      return {
        totalHadir: acc.totalHadir + stats.totalHadir,
        totalSakit: acc.totalSakit + stats.totalSakit,
        totalIzin: acc.totalIzin + stats.totalIzin,
        totalAlfa: acc.totalAlfa + stats.totalAlfa,
        totalPertemuan: acc.totalPertemuan + stats.totalPertemuan,
      };
    },
    {
      totalHadir: 0,
      totalSakit: 0,
      totalIzin: 0,
      totalAlfa: 0,
      totalPertemuan: 0,
    }
  );

  const overallAttendancePercentage =
    overallAttendanceStats.totalPertemuan > 0
      ? (overallAttendanceStats.totalHadir /
          overallAttendanceStats.totalPertemuan) *
        100
      : 0;

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Kelas yang Diampu
          </h1>
          <p className="text-muted-foreground">
            Kelola dan pantau kelas yang Anda ajar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kelasData.length}</div>
              <p className="text-xs text-muted-foreground">
                Kelas aktif semester ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSiswa}</div>
              <p className="text-xs text-muted-foreground">Siswa yang diajar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Jadwal
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJadwal}</div>
              <p className="text-xs text-muted-foreground">
                Jam pelajaran per minggu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tingkat Kehadiran
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallAttendancePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Rata-rata kehadiran bulan ini
              </p>
              <Progress
                value={overallAttendancePercentage}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Daftar Kelas */}
      </div>
    </GuruLayout>
  );
}
