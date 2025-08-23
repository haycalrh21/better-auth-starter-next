"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";

interface AbsensiStatsProps {
  stats: {
    totalRecords: number;
    totalKelas: number;
    statusCounts: Record<string, number>;
    attendancePercentage: number;
    monthlyStats: Record<number, any>;
    currentYear: number;
  };
}

export default function AbsensiStats({ stats }: AbsensiStatsProps) {
  const totalHadir = stats.statusCounts.HADIR || 0;
  const totalAbsen =
    (stats.statusCounts.SAKIT || 0) +
    (stats.statusCounts.IZIN || 0) +
    (stats.statusCounts.ALFA || 0);
  const monthlyCount = Object.keys(stats.monthlyStats).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Record</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecords}</div>
          <p className="text-xs text-muted-foreground">record absensi</p>
        </CardContent>
      </Card>

      {/* Total Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kelas Diampu</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalKelas}</div>
          <p className="text-xs text-muted-foreground">kelas aktif</p>
        </CardContent>
      </Card>

      {/* Attendance Percentage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Persentase Kehadiran
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.attendancePercentage}%
          </div>
          <Progress value={stats.attendancePercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            tingkat kehadiran siswa
          </p>
        </CardContent>
      </Card>

      {/* Present Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hadir</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalHadir}</div>
          <p className="text-xs text-muted-foreground">siswa hadir</p>
        </CardContent>
      </Card>

      {/* Absent Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tidak Hadir
          </CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{totalAbsen}</div>
          <p className="text-xs text-muted-foreground">siswa tidak hadir</p>
        </CardContent>
      </Card>

      {/* Monthly Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bulan Tercatat</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyCount}</div>
          <p className="text-xs text-muted-foreground">
            bulan tahun {stats.currentYear}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
