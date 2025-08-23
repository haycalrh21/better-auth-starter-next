"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Clock,
  Award,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface ProfileStatsProps {
  guru: any;
  completionPercentage: number;
}

export default function ProfileStats({
  guru,
  completionPercentage,
}: ProfileStatsProps) {
  const activeClasses = guru.kelas?.filter((k: any) => k.isActive)?.length || 0;
  const totalStudents =
    guru.kelas?.reduce(
      (sum: number, k: any) => sum + (k._count?.siswa || 0),
      0
    ) || 0;
  const subjects = guru.mataPelajaran?.length || 0;
  const schedules = guru.Jadwal?.length || 0;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
      {/* Profile Completion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Kelengkapan Profil
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <Progress value={completionPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completionPercentage === 100
              ? "Profil sudah lengkap"
              : "Lengkapi profil Anda"}
          </p>
        </CardContent>
      </Card>

      {/* Active Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kelas Aktif</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClasses}</div>
          <p className="text-xs text-muted-foreground">
            {totalStudents} total siswa
          </p>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subjects}</div>
          <p className="text-xs text-muted-foreground">mata pelajaran diampu</p>
        </CardContent>
      </Card>

      {/* Teaching Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jadwal Mengajar</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{schedules}</div>
          <p className="text-xs text-muted-foreground">
            jam pelajaran per minggu
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
