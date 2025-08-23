import { prisma } from "@/lib/prisma";
import AdminLayout from "../layout/layout";
import {
  getDataGuru,
  getGuruStatistics,
  getUnassignedTeachers,
  getAvailableKelasForGuru,
} from "./actions/dataGuru";
import { DataTable, TableColumn } from "./_components/table-reusable-guru";

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
  Briefcase,
} from "lucide-react";
import CreateAccountModal from "./_components/modalCreateAcoount";

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
    const [dataGuru, statistics, unassignedTeachers, availableKelas] =
      await Promise.all([
        getDataGuru(),
        getGuruStatistics(tahunAjaran),
        getUnassignedTeachers(tahunAjaran, currentSemester),
        getAvailableKelasForGuru(
          undefined,
          undefined,
          tahunAjaran,
          currentSemester
        ),
      ]);

    // Type for table data
    type GuruTableType = typeof dataGuru extends (infer U)[] ? U : never;

    // Define table columns with enhanced display
    const columns: TableColumn<GuruTableType>[] = [
      {
        key: "namaLengkap",
        label: "Nama Lengkap",
        sortable: true,
        type: "text",
      },
      {
        key: "nip",
        label: "NIP",
        sortable: true,
        type: "nip",
      },

      {
        key: "bidangStudi",
        label: "Bidang Studi",
        sortable: true,
        type: "text",
      },
      {
        key: "kelas",
        label: "Kelas",
        sortable: false,
        type: "kelas",
      },
      {
        key: "mataPelajaran",
        label: "Mata Pelajaran",
        sortable: false,
        type: "subjects",
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
        type: "phone",
      },
    ];

    // Calculate current semester teachers
    const currentSemesterTeachers = dataGuru.filter((g) => {
      return (
        g.kelas &&
        g.kelas.length > 0 &&
        g.kelas.some(
          (k: any) =>
            k.tahunAjaran === tahunAjaran &&
            k.semester === currentSemester &&
            k.isActive
        )
      );
    });

    // Get users who don't have teacher profiles yet
    const availableUsers = await prisma.user.findMany({
      where: {
        role: "GURU",
        guru: null, // Users without teacher profiles
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Manajemen Guru
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Kelola data guru, status kepegawaian, dan penugasan mengajar
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
                <CreateAccountModal />
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Active Teachers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Total Guru Aktif
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {statistics.active}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    dari {statistics.total} total guru
                  </p>
                </CardContent>
              </Card>

              {/* PNS Teachers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Guru PNS
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {statistics.pns}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Non-PNS: {statistics.nonPns}
                  </p>
                </CardContent>
              </Card>

              {/* Teachers with Classes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Guru Mengajar
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {statistics.withClass}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.classAssignmentRate.toFixed(1)}% dari total
                  </p>
                </CardContent>
              </Card>

              {/* Unassigned Teachers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                    Belum Ditugaskan
                  </CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {statistics.withoutClass}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    perlu penugasan kelas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Section */}
            {(unassignedTeachers.length > 0 || availableUsers.length > 0) && (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Unassigned Teachers Alert */}
                {unassignedTeachers.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Guru Belum Ditugaskan</span>
                      </CardTitle>
                      <CardDescription className="text-orange-700 text-sm">
                        {unassignedTeachers.length} guru belum memiliki
                        penugasan kelas untuk semester ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {unassignedTeachers.slice(0, 3).map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex items-center gap-2"
                          >
                            <UserCheck className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm truncate">
                              {teacher.namaLengkap}
                            </span>
                            {teacher.bidangStudi && (
                              <Badge
                                variant="outline"
                                className="text-xs flex-shrink-0"
                              >
                                {teacher.bidangStudi}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {unassignedTeachers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{unassignedTeachers.length - 3} guru lainnya
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Users Alert */}
                {availableUsers.length > 0 && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                        <UserPlus className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Akun Tanpa Profil</span>
                      </CardTitle>
                      <CardDescription className="text-blue-700 text-sm">
                        {availableUsers.length} akun guru belum memiliki profil
                        lengkap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {availableUsers.slice(0, 3).map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2"
                          >
                            <UserPlus className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm truncate">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                              ({user.email})
                            </span>
                          </div>
                        ))}
                        {availableUsers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{availableUsers.length - 3} akun lainnya
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Daftar Guru</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Data lengkap guru dan informasi penugasan mengajar
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="overflow-x-auto">
                  <DataTable
                    data={dataGuru}
                    columns={columns}
                    searchKey="namaLengkap"
                    searchPlaceholder="Filter nama guru..."
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
    console.error("Error loading teacher data:", error);
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="space-y-6">
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-red-600">Error</h1>
              <p className="text-muted-foreground mt-2">
                Terjadi kesalahan saat memuat data guru. Silakan coba lagi.
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
