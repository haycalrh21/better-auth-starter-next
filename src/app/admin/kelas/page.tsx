import { prisma } from "@/lib/prisma";
import AdminLayout from "../layout/layout";
import {
  getDataKelas,
  getAvailableTeachers,
  getUnassignedStudents,
  getKelasStatistics,
  getExistingClassesWithCapacity,
} from "./actions/dataKelas";
import { DataTable, TableColumn } from "./_components/table-reusable-kelas";
import CreateKelasModal from "./_components/modalCreateKelas";
import PromoteStudentsModal from "./_components/promote-students-modal";
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
  BookOpen,
  GraduationCap,
  TrendingUp,
  School,
  UserCheck,
} from "lucide-react";

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
    const [
      dataKelas,
      availableTeachers,
      unassignedStudents,
      statistics,
      existingClasses,
    ] = await Promise.all([
      getDataKelas(),
      getAvailableTeachers(tahunAjaran, currentSemester),
      getUnassignedStudents(tahunAjaran, currentSemester),
      getKelasStatistics(tahunAjaran, currentSemester),
      getExistingClassesWithCapacity(tahunAjaran, currentSemester),
    ]);

    // Debug logging to help identify issues
    console.log("📊 Page data summary:", {
      tahunAjaran,
      currentSemester,
      totalClasses: dataKelas.length,
      availableTeachersCount: availableTeachers.length,
      unassignedStudentsCount: unassignedStudents.length,
      activeClassesForCurrentPeriod: dataKelas.filter(
        (k) =>
          k.tahunAjaran === tahunAjaran &&
          k.semester === currentSemester &&
          k.isActive
      ).length,
    });

    // Type for table data
    type KelasTableType = typeof dataKelas extends (infer U)[] ? U : never;

    // Define table columns with enhanced display
    const columns: TableColumn<KelasTableType>[] = [
      {
        key: "namaKelas",
        label: "Nama Kelas",
        sortable: true,
        type: "text",
      },
      {
        key: "jenjang",
        label: "Jenjang",
        sortable: true,
        type: "badge",
      },
      {
        key: "jurusan",
        label: "Jurusan",
        sortable: true,
        type: "text",
      },
      {
        key: "guru.namaLengkap",
        label: "Wali Kelas",
        sortable: false,
        type: "text",
      },
      {
        key: "_count.siswa",
        label: "Jumlah Siswa",
        sortable: true,
        type: "number",
      },
      {
        key: "tahunAjaran",
        label: "Tahun Ajaran",
        sortable: true,
        type: "text",
      },
      {
        key: "semester",
        label: "Semester",
        sortable: true,
        type: "text",
      },
      {
        key: "isActive",
        label: "Status",
        sortable: true,
        type: "status",
      },
    ];

    // Calculate metrics
    const currentYearClasses = dataKelas.filter(
      (k) =>
        k.tahunAjaran === tahunAjaran &&
        k.semester === currentSemester &&
        k.isActive
    );

    const totalCurrentStudents = currentYearClasses.reduce(
      (sum, kelas) => sum + (kelas._count?.siswa || 0),
      0
    );

    const averageClassSize =
      currentYearClasses.length > 0
        ? Math.round(totalCurrentStudents / currentYearClasses.length)
        : 0;

    // Group classes by jenjang for better organization
    const classesByJenjang = dataKelas.reduce((acc, kelas) => {
      const key = kelas.jenjang;
      if (!acc[key]) acc[key] = [];
      acc[key].push(kelas);
      return acc;
    }, {} as Record<string, typeof dataKelas>);

    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Manajemen Kelas
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Kelola kelas, distribusi siswa, dan promosi naik kelas
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {tahunAjaran}
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {semesterLabel}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                <PromoteStudentsModal
                  currentAcademicYear={tahunAjaran}
                  currentSemester={currentSemester}
                />
                <CreateKelasModal
                  availableTeachers={availableTeachers}
                  unassignedStudents={unassignedStudents}
                  currentAcademicYear={tahunAjaran}
                  currentSemester={currentSemester}
                  existingClasses={existingClasses}
                />
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Total Kelas Aktif
                  </CardTitle>
                  <School className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {currentYearClasses.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {semesterLabel}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Total Siswa
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalCurrentStudents}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Siswa terdaftar di kelas aktif
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Guru Tersedia
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {availableTeachers.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Belum menjadi wali kelas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Siswa Tanpa Kelas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {unassignedStudents.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perlu penempatan kelas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Statistics */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Distribusi per Jenjang
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Sebaran kelas berdasarkan jenjang pendidikan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(classesByJenjang).map(
                      ([jenjang, classes]) => {
                        const activeClasses = classes.filter(
                          (k) =>
                            k.tahunAjaran === tahunAjaran &&
                            k.semester === currentSemester &&
                            k.isActive
                        );
                        return (
                          <div
                            key={jenjang}
                            className="flex justify-between items-center py-2"
                          >
                            <span className="text-sm font-medium truncate">
                              {jenjang}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {activeClasses.length} kelas
                              </Badge>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {activeClasses.reduce(
                                  (sum, k) => sum + (k._count?.siswa || 0),
                                  0
                                )}{" "}
                                siswa
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Ringkasan Kapasitas
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Analisis penggunaan kapasitas kelas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Rata-rata per kelas:
                      </span>
                      <span className="font-medium text-sm">
                        {averageClassSize} siswa
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Kapasitas optimal:
                      </span>
                      <span className="font-medium text-sm">25-35 siswa</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Status kapasitas:
                      </span>
                      <Badge
                        variant={
                          averageClassSize >= 25 && averageClassSize <= 35
                            ? "default"
                            : averageClassSize < 25
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {averageClassSize >= 25 && averageClassSize <= 35
                          ? "Optimal"
                          : averageClassSize < 25
                          ? "Underused"
                          : "Overloaded"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Aksi Cepat
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Operasi yang sering digunakan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        • Buat kelas baru untuk siswa tanpa kelas
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        • Promosi naik kelas otomatis dengan pengacakan
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        • Distribusi ulang untuk pemerataan
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        • Manajemen wali kelas dan kapasitas
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts/Recommendations */}
            {(unassignedStudents.length > 0 ||
              availableTeachers.length === 0) && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Perhatian Diperlukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-xs sm:text-sm">
                    {unassignedStudents.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="leading-relaxed">
                          {unassignedStudents.length} siswa belum memiliki kelas
                          dan perlu penempatan
                        </span>
                      </div>
                    )}
                    {availableTeachers.length === 0 && (
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span className="leading-relaxed">
                          Tidak ada guru yang tersedia untuk menjadi wali kelas
                          baru
                        </span>
                      </div>
                    )}
                    {unassignedStudents.length > 0 &&
                      availableTeachers.length > 0 && (
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 flex-shrink-0" />
                          <span className="leading-relaxed">
                            Anda dapat membuat{" "}
                            {Math.min(
                              Math.ceil(unassignedStudents.length / 30),
                              availableTeachers.length
                            )}{" "}
                            kelas baru dengan sumber daya yang tersedia
                          </span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Daftar Kelas
                </CardTitle>
                <CardDescription className="text-sm">
                  Semua kelas dalam sistem dengan informasi lengkap
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="overflow-x-auto">
                  <DataTable
                    data={dataKelas}
                    columns={columns}
                    searchKey="namaKelas"
                    searchPlaceholder="Cari nama kelas..."
                    showSelection={true}
                    showColumnToggle={true}
                    showActions={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error("Error loading class management page:", error);

    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
                Error
              </h1>
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 text-base sm:text-lg">
                  Gagal Memuat Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 text-sm sm:text-base">
                  Terjadi kesalahan saat memuat data kelas. Silakan refresh
                  halaman atau hubungi administrator.
                </p>
                <details className="mt-4">
                  <summary className="text-sm text-red-600 cursor-pointer">
                    Detail Error
                  </summary>
                  <pre className="mt-2 text-xs text-red-500 bg-red-100 p-2 rounded overflow-auto">
                    {error instanceof Error ? error.message : String(error)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
