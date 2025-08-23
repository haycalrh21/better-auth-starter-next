import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, BookOpen, Calendar, MoreHorizontal } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DaftarKelas() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "GURU") {
    redirect("/");
  }

  // Mock data untuk demo - nanti bisa diganti dengan data real dari database
  const kelasData = [
    {
      id: 1,
      nama: "VII A",
      tingkat: 7,
      jurusan: "-",
      mataPelajaran: "Matematika",
      jumlahSiswa: 32,
      jadwal: [
        { hari: "Senin", jam: "07:30 - 08:10" },
        { hari: "Rabu", jam: "08:10 - 08:50" },
        { hari: "Jumat", jam: "10:10 - 10:50" },
      ],
      waliKelas: "Ibu Sari Dewi",
      tahunAjaran: "2024/2025",
      semester: "Ganjil",
    },
    {
      id: 2,
      nama: "VII B",
      tingkat: 7,
      jurusan: "-",
      mataPelajaran: "Matematika",
      jumlahSiswa: 30,
      jadwal: [
        { hari: "Selasa", jam: "07:30 - 08:10" },
        { hari: "Kamis", jam: "08:10 - 08:50" },
      ],
      waliKelas: "Bapak Ahmad Rijal",
      tahunAjaran: "2024/2025",
      semester: "Ganjil",
    },
    {
      id: 3,
      nama: "VIII A",
      tingkat: 8,
      jurusan: "-",
      mataPelajaran: "Matematika",
      jumlahSiswa: 28,
      jadwal: [
        { hari: "Senin", jam: "10:10 - 10:50" },
        { hari: "Rabu", jam: "11:00 - 11:40" },
        { hari: "Jumat", jam: "07:30 - 08:10" },
      ],
      waliKelas: "Ibu Fitri Handayani",
      tahunAjaran: "2024/2025",
      semester: "Ganjil",
    },
  ];

  const totalSiswa = kelasData.reduce(
    (sum, kelas) => sum + kelas.jumlahSiswa,
    0
  );
  const totalJadwal = kelasData.reduce(
    (sum, kelas) => sum + kelas.jadwal.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kelas yang Diampu</h1>
        <p className="text-muted-foreground">
          Kelola dan pantau kelas yang Anda ajar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Total Jadwal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJadwal}</div>
            <p className="text-xs text-muted-foreground">
              Jam pelajaran per minggu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Kelas */}
      <div className="grid gap-6">
        {kelasData.map((kelas) => (
          <Card key={kelas.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Kelas {kelas.nama}
                  </CardTitle>
                  <CardDescription>
                    {kelas.mataPelajaran} • {kelas.tahunAjaran} •{" "}
                    {kelas.semester}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Informasi Kelas */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Informasi Kelas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tingkat:</span>
                      <span>Kelas {kelas.tingkat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Jumlah Siswa:
                      </span>
                      <Badge variant="secondary">
                        {kelas.jumlahSiswa} siswa
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wali Kelas:</span>
                      <span>{kelas.waliKelas}</span>
                    </div>
                  </div>
                </div>

                {/* Jadwal Mengajar */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Jadwal Mengajar</h4>
                  <div className="space-y-2">
                    {kelas.jadwal.map((jadwal, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm rounded-lg border p-2"
                      >
                        <span className="font-medium">{jadwal.hari}</span>
                        <span className="text-muted-foreground">
                          {jadwal.jam}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Aksi Cepat</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Lihat Daftar Siswa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Input Absensi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Input Nilai
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
