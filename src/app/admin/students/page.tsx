import { prisma } from "@/lib/prisma";
import AdminLayout from "../layout/layout";
import {
  getDataSiswa,
  getSiswaStatistics,
  getUnassignedStudents,
  getAvailableKelasForSiswa,
} from "./actions/dataSiswa";
import { DataTable, TableColumn } from "./_components/table-reusable-siswa";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { StatusSiswa, Jenjang } from "@/interface/enums";
import CreateAccountStudentsModal from "./_components/modalCreateAcoount";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Auto-detect current academic year and semester
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? "1" : "2";
  const tahunAjaran = `${currentYear}/${currentYear + 1}`;

  // Generate semester label
  const semesterLabel =
    currentSemester === "1"
      ? "Semester 1 (Januari - Juni)"
      : "Semester 2 (Juli - Desember)";

  try {
    // Fetch all required data
    const [dataSiswa, statistics, unassignedStudents, availableKelas] =
      await Promise.all([
        getDataSiswa(),
        getSiswaStatistics(tahunAjaran, currentSemester),
        getUnassignedStudents(tahunAjaran, currentSemester),
        getAvailableKelasForSiswa(
          undefined,
          undefined,
          tahunAjaran,
          currentSemester
        ),
      ]);

    // Type for table data
    type SiswaTableType = typeof dataSiswa extends (infer U)[] ? U : never;

    // Define table columns with enhanced display
    const columns: TableColumn<SiswaTableType>[] = [
      {
        key: "namaLengkap",
        label: "Nama Lengkap",
        sortable: true,
        type: "text",
      },
      {
        key: "nisn",
        label: "NISN",
        sortable: true,
        type: "text",
      },
      {
        key: "jenjangSaatIni",
        label: "Jenjang",
        sortable: true,
        type: "text",
      },
      {
        key: "tingkatSaatIni",
        label: "Tingkat",
        sortable: true,
        type: "number",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        type: "text",
      },
      {
        key: "kelas.0.namaKelas",
        label: "Kelas",
        sortable: false,
        type: "text",
      },
      {
        key: "emailAlternatif",
        label: "Email",
        sortable: true,
        type: "email",
      },
      {
        key: "noHp",
        label: "No. Telepon",
        sortable: false,
        type: "text",
      },
    ];

    // Calculate current semester students
    const currentSemesterStudents = dataSiswa.filter((s) => {
      return s.kelas?.some(
        (k) =>
          k.tahunAjaran === tahunAjaran &&
          k.semester === currentSemester &&
          k.isActive
      );
    });

    // Group students by status
    const studentsByStatus = dataSiswa.reduce((acc, siswa) => {
      const status = siswa.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(siswa);
      return acc;
    }, {} as Record<string, typeof dataSiswa>);

    // Group students by jenjang
    const studentsByJenjang = dataSiswa.reduce((acc, siswa) => {
      const jenjang = "Tidak Diketahui"; // Field doesn't exist in schema
      // const jenjang = siswa.jenjangSaatIni || "Tidak Diketahui";
      if (!acc[jenjang]) acc[jenjang] = [];
      acc[jenjang].push(siswa);
      return acc;
    }, {} as Record<string, typeof dataSiswa>);

    // Calculate metrics
    const activeStudents = dataSiswa.filter(
      (s) => s.status === StatusSiswa.AKTIF
    );
    const graduatedThisYear = dataSiswa.filter(
      (s) => s.status === StatusSiswa.LULUS && s.tahunLulus === currentYear
    );
    const studentsWithoutClass = activeStudents.filter(
      (s) => !s.kelas?.some((k) => k.isActive)
    );

    // Get users who don't have student profiles yet
    const availableUsers = await prisma.user.findMany({
      where: {
        role: "SISWA",
        siswa: null, // Users without student profiles
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return (
      <AdminLayout>
        <div className="grid auto-rows-min gap-6 md:grid-cols-1">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Manajemen Siswa
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola data siswa, status, dan penempatan kelas
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{tahunAjaran}</Badge>
                <Badge variant="secondary">{semesterLabel}</Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <CreateAccountStudentsModal />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Siswa Aktif
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  dari {dataSiswa.length} total siswa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lulus Tahun Ini
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {graduatedThisYear.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  siswa telah lulus di {currentYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Semester Ini
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentSemesterStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  siswa terdaftar semester aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Belum Ada Kelas
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {studentsWithoutClass.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  siswa aktif belum ditempatkan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Distribusi Status Siswa
                </CardTitle>
                <CardDescription>
                  Breakdown siswa berdasarkan status saat ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(studentsByStatus).map(
                    ([status, students]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {status === StatusSiswa.AKTIF && (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                          {status === StatusSiswa.LULUS && (
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                          )}
                          {(status === StatusSiswa.KELUAR ||
                            status === StatusSiswa.PINDAH ||
                            status === StatusSiswa.DIKELUARKAN) && (
                            <UserX className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {status === StatusSiswa.AKTIF && "Aktif"}
                            {status === StatusSiswa.LULUS && "Lulus"}
                            {status === StatusSiswa.KELUAR && "Keluar"}
                            {status === StatusSiswa.PINDAH && "Pindah"}
                            {status === StatusSiswa.DIKELUARKAN &&
                              "Dikeluarkan"}
                          </span>
                        </div>
                        <Badge variant="outline">{students.length}</Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Jenjang</CardTitle>
                <CardDescription>
                  Breakdown siswa berdasarkan jenjang pendidikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(studentsByJenjang).map(
                    ([jenjang, students]) => (
                      <div
                        key={jenjang}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{jenjang}</span>
                        </div>
                        <Badge variant="outline">{students.length}</Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {(unassignedStudents.length > 0 || availableUsers.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tindakan Cepat</CardTitle>
                <CardDescription>
                  Aksi yang mungkin diperlukan berdasarkan data saat ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {unassignedStudents.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">
                          Siswa Belum Ditempatkan
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {unassignedStudents.length} siswa aktif belum memiliki
                        kelas untuk tahun ajaran {tahunAjaran}
                      </p>
                      <Badge variant="outline">Perlu penempatan kelas</Badge>
                    </div>
                  )}

                  {availableUsers.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          User Belum Punya Profil
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {availableUsers.length} user dengan role SISWA belum
                        memiliki profil siswa
                      </p>
                      <Badge variant="outline">Dapat dibuat profil</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Siswa</CardTitle>
              <CardDescription>
                Kelola dan pantau data siswa secara menyeluruh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={dataSiswa}
                columns={columns}
                searchKey="namaLengkap"
                searchPlaceholder="Cari siswa berdasarkan nama..."
                showSelection={true}
                showColumnToggle={true}
                showActions={true}
              />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error("❌ Error loading students page:", error);

    return (
      <AdminLayout>
        <div className="grid auto-rows-min gap-4 md:grid-cols-1">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Gagal Memuat Data
                </h3>
                <p className="text-muted-foreground">
                  Terjadi kesalahan saat memuat data siswa. Silakan refresh
                  halaman atau hubungi administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }
}
