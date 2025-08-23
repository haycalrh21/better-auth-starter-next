import { getProfileGuru } from "./actions/getProfileGuru";
import GuruLayout from "../layout/layout";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Users,
  BookOpen,
  IdCard,
  Clock,
  CheckCircle,
  AlertCircle,
  School,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import ProfileActions from "./_components/profile-actions";
import ProfileStats from "./_components/profile-stats";
import ProfileCompletionHelper from "./_components/profile-completion-helper";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  } catch {
    return "-";
  }
};

const formatTime = (time: string) => {
  try {
    return format(new Date(`2000-01-01T${time}`), "HH:mm", { locale: id });
  } catch {
    return time;
  }
};

const dayLabels = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
  MINGGU: "Minggu",
};

export default async function ProfilePage() {
  const result = await getProfileGuru();

  if (!result.success) {
    redirect("/guru/dashboard");
  }

  const guru = result.data;

  if (!guru) {
    redirect("/guru/dashboard");
  }

  // Calculate profile completion percentage
  const requiredFields = [
    guru.namaLengkap,
    guru.tempatLahir,
    guru.tanggalLahir,
    guru.jenisKelamin,
    guru.agama,
    guru.noHp,
    guru.alamatLengkap,
    guru.pendidikanTerakhir,
  ];
  const filledFields = requiredFields.filter(Boolean).length;
  const completionPercentage = Math.round(
    (filledFields / requiredFields.length) * 100
  );

  // Group schedules by day
  const schedulesByDay =
    guru.Jadwal?.reduce((acc: any, jadwal: any) => {
      const day = jadwal.hari;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(jadwal);
      return acc;
    }, {}) || {};

  return (
    <GuruLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Profil Saya
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Kelola informasi profil dan lihat data mengajar Anda
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <ProfileActions guru={guru} />
            </div>
          </div>

          {/* Profile Completion Alert */}
          {!guru.isProfileComplete && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-amber-800 dark:text-amber-200">
                      Profil Belum Lengkap
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                      Lengkapi profil Anda untuk mendapatkan akses penuh ke
                      sistem. Kelengkapan profil: {completionPercentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Information */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                        <User className="h-6 w-6 flex-shrink-0" />
                        {guru.namaLengkap || "Nama Belum Diisi"}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                        {guru.nip && (
                          <span className="flex items-center gap-1">
                            <IdCard className="h-4 w-4" />
                            NIP: {guru.nip}
                          </span>
                        )}
                        {guru.bidangStudi && (
                          <Badge variant="outline" className="text-xs">
                            {guru.bidangStudi}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant={
                          guru.isProfileComplete ? "default" : "secondary"
                        }
                        className="flex items-center gap-1"
                      >
                        {guru.isProfileComplete ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {guru.isProfileComplete
                          ? "Profil Lengkap"
                          : "Profil Belum Lengkap"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      NIK
                    </p>
                    <p className="font-medium">{guru.nik || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tempat, Tanggal Lahir
                    </p>
                    <p className="font-medium">
                      {guru.tempatLahir || "-"}
                      {guru.tanggalLahir && guru.tempatLahir && ", "}
                      {formatDate(guru.tanggalLahir)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Jenis Kelamin
                    </p>
                    <p className="font-medium">
                      {guru.jenisKelamin === "LAKI_LAKI"
                        ? "Laki-laki"
                        : guru.jenisKelamin === "PEREMPUAN"
                        ? "Perempuan"
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Agama
                    </p>
                    <p className="font-medium">{guru.agama || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status Perkawinan
                    </p>
                    <p className="font-medium">
                      {guru.statusKawin === "BELUM_KAWIN"
                        ? "Belum Kawin"
                        : guru.statusKawin === "KAWIN"
                        ? "Kawin"
                        : guru.statusKawin === "CERAI_HIDUP"
                        ? "Cerai Hidup"
                        : guru.statusKawin === "CERAI_MATI"
                        ? "Cerai Mati"
                        : "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Kontak & Alamat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nomor HP
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <Phone className="h-4 w-4" />
                        {guru.noHp || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email Alternatif
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4" />
                        {guru.emailAlternatif || "-"}
                      </p>
                    </div>
                  </div>

                  {guru.alamatLengkap && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Alamat Lengkap
                      </p>
                      <p className="flex items-start gap-2 font-medium">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {guru.alamatLengkap}
                          {(guru.kelurahan ||
                            guru.kecamatan ||
                            guru.kabupatenKota ||
                            guru.provinsi) && (
                            <span className="block text-sm text-muted-foreground mt-1 font-normal">
                              {[
                                guru.kelurahan,
                                guru.kecamatan,
                                guru.kabupatenKota,
                                guru.provinsi,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                              {guru.kodePos && ` ${guru.kodePos}`}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Pendidikan
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pendidikan Terakhir
                    </p>
                    <p className="font-medium">
                      {guru.pendidikanTerakhir || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Jurusan
                    </p>
                    <p className="font-medium">{guru.jurusan || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Institusi
                    </p>
                    <p className="font-medium">{guru.institusi || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tahun Lulus
                    </p>
                    <p className="font-medium">{guru.tahunLulus || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Bidang Studi
                    </p>
                    <p className="font-medium">{guru.bidangStudi || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Kepegawaian
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status Kepegawaian
                    </p>
                    <p className="font-medium">
                      {guru.statusKepegawaian ? (
                        <Badge variant="outline">
                          {guru.statusKepegawaian}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Golongan/Pangkat
                    </p>
                    <p className="font-medium">
                      {guru.golongan && guru.pangkat
                        ? `${guru.golongan} - ${guru.pangkat}`
                        : guru.golongan || guru.pangkat || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      TMT
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4" />
                      {formatDate(guru.tmt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Teaching Info */}
            <div className="space-y-6">
              {/* Profile Statistics */}
              <ProfileStats
                guru={guru}
                completionPercentage={completionPercentage}
              />

              {/* Profile Completion Helper */}
              <ProfileCompletionHelper
                guru={guru}
                completionPercentage={completionPercentage}
              />
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Akun
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Akun
                    </p>
                    <p className="font-medium text-sm break-all">
                      {guru.user?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Role
                    </p>
                    <p>
                      <Badge variant="outline">{guru.user?.role || "-"}</Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status Verifikasi
                    </p>
                    <p>
                      <Badge
                        variant={
                          guru.user?.emailVerified ? "default" : "destructive"
                        }
                      >
                        {guru.user?.emailVerified
                          ? "Terverifikasi"
                          : "Belum Verifikasi"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Bergabung
                    </p>
                    <p className="font-medium">
                      {formatDate(guru.user?.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Class Assignment */}
              {guru.kelas && guru.kelas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Kelas yang Diampu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {guru.kelas.map((kelas) => (
                      <div
                        key={kelas.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{kelas.namaKelas}</p>
                          <p className="text-sm text-muted-foreground">
                            {kelas.tahunAjaran} - Semester {kelas.semester}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {kelas._count?.siswa || 0} siswa
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Subject Assignment */}
              {guru.mataPelajaran && guru.mataPelajaran.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Mata Pelajaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {guru.mataPelajaran.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="font-medium">{subject.nama}</span>
                          {subject.kode && (
                            <Badge variant="secondary" className="text-xs">
                              {subject.kode}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Schedule */}
              {guru.Jadwal && guru.Jadwal.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Jadwal Mengajar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(dayLabels).map(([day, label]) => {
                        const daySchedules = schedulesByDay[day];
                        if (!daySchedules || daySchedules.length === 0)
                          return null;

                        return (
                          <div key={day} className="space-y-2">
                            <h4 className="font-medium text-sm">{label}</h4>
                            {daySchedules
                              .sort((a: any, b: any) =>
                                a.jamMulai.localeCompare(b.jamMulai)
                              )
                              .map((jadwal: any) => (
                                <div
                                  key={jadwal.id}
                                  className="p-2 border rounded text-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {formatTime(jadwal.jamMulai)} -{" "}
                                      {formatTime(jadwal.jamSelesai)}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground">
                                    {jadwal.mataPelajaran?.nama} -{" "}
                                    {jadwal.kelas?.namaKelas}
                                  </p>
                                </div>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
