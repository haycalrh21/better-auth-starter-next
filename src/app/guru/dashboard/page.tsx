import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  BookOpen,
  Award,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GuruLayout from "../layout/layout";

export default async function GuruDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "GURU") {
    redirect("/");
  }

  // Mock data untuk demo - nanti bisa diganti dengan data real dari database
  const dashboardData = {
    profile: {
      nip: "196512345678901234",
      nuptk: "1234567890123456",
      name: session?.user.name || "Nama Guru",
      email: session?.user.email || "guru@sekolah.id",
    },
    todaySchedule: [
      { time: "07:30 - 08:10", subject: "Matematika", class: "VII A" },
      { time: "08:10 - 08:50", subject: "Matematika", class: "VII B" },
      { time: "10:10 - 10:50", subject: "Matematika", class: "VIII A" },
    ],
    classes: [
      { name: "VII A", students: 32, subject: "Matematika" },
      { name: "VII B", students: 30, subject: "Matematika" },
      { name: "VIII A", students: 28, subject: "Matematika" },
    ],
    pendingTasks: [
      { task: "Review Tugas Matematika VII A", deadline: "Hari ini" },
      { task: "Input Nilai UTS VIII A", deadline: "Besok" },
      { task: "Persiapan RPP Minggu Depan", deadline: "3 hari lagi" },
    ],
    announcements: [
      {
        title: "Rapat Guru",
        date: "25 Agustus 2025",
        content: "Rapat evaluasi pembelajaran semester",
      },
      {
        title: "Libur Nasional",
        date: "17 Agustus 2025",
        content: "Libur Hari Kemerdekaan Indonesia",
      },
    ],
  };

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Guru</h1>
          <p className="text-muted-foreground">
            Selamat datang, {dashboardData.profile.name}! Kelola pembelajaran
            dan pantau progress siswa Anda.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kelas Diampu
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.classes.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total{" "}
                {dashboardData.classes.reduce(
                  (sum, cls) => sum + cls.students,
                  0
                )}{" "}
                siswa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jadwal Hari Ini
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.todaySchedule.length}
              </div>
              <p className="text-xs text-muted-foreground">Jam pelajaran</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tugas Pending
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.pendingTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Perlu ditindaklanjuti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengumuman</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.announcements.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengumuman terbaru
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profil Guru */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Profil Guru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">NIP</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.profile.nip}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">NUPTK</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.profile.nuptk}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.profile.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Jadwal Hari Ini */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Jadwal Hari Ini
              </CardTitle>
              <CardDescription>Jadwal mengajar untuk hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.todaySchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{schedule.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.class}
                      </p>
                    </div>
                    <Badge variant="outline">{schedule.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daftar Kelas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kelas yang Diampu
              </CardTitle>
              <CardDescription>Daftar kelas yang Anda ajar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.classes.map((cls, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls.subject}
                      </p>
                    </div>
                    <Badge variant="secondary">{cls.students} siswa</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tugas yang Perlu Direview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Tugas Pending
              </CardTitle>
              <CardDescription>
                Tugas yang perlu ditindaklanjuti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.pendingTasks.map((task, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-3">
                    <p className="text-sm font-medium">{task.task}</p>
                    <Badge variant="destructive" className="text-xs">
                      {task.deadline}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pengumuman */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengumuman Sekolah
              </CardTitle>
              <CardDescription>Pengumuman terbaru dari sekolah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.announcements.map((announcement, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {announcement.title}
                      </h4>
                      <Badge variant="outline">{announcement.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GuruLayout>
  );
}
