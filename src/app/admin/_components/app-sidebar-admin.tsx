"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  Users,
  GraduationCap,
  DollarSign,
  BarChart3,
  School,
  Calendar,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

type UserSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  banned?: boolean;
};

export function AppSidebarAdmin({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserSession }) {
  const pathname = usePathname();

  // Fungsi untuk mengecek apakah item atau parent item aktif
  const isItemActive = (itemUrl: string) => {
    // Jika URL exact match
    if (pathname === itemUrl) return true;

    // Jika item URL bukan "#" dan pathname dimulai dengan item URL
    if (itemUrl !== "#" && pathname.startsWith(itemUrl)) {
      // Pastikan ini bukan match partial yang salah
      // Contoh: /admin/dashboard/profile/settings tidak boleh match dengan /admin/dashboard/settings
      const pathAfterItem = pathname.slice(itemUrl.length);
      return pathAfterItem === "" || pathAfterItem.startsWith("/");
    }

    return false;
  };

  // Fungsi untuk mengecek apakah parent item memiliki child yang aktif
  const hasActiveChild = (items: { url: string }[]) => {
    return items.some((item) => isItemActive(item.url));
  };

  const data = {
    navMain: [
      // ### Manajemen Data Sekolah
      {
        title: "Profil Sekolah",
        url: "/admin/school-profile",
        icon: School,
        isActive:
          isItemActive("/admin/school-profile") ||
          hasActiveChild([
            { url: "/admin/dashboard" },

            { url: "/admin/school-profile/npsn" },
            { url: "/admin/school-profile/accreditation" },
            { url: "/admin/school-profile/vision-mission" },
            { url: "/admin/school-profile/principal-data" },
            { url: "/admin/school-profile/facilities" },
          ]),
        items: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
            isActive: isItemActive("/admin/dashboard"),
          },
          {
            title: "NPSN",
            url: "/admin/school-profile/npsn",
            isActive: isItemActive("/admin/school-profile/npsn"),
          },
          {
            title: "Akreditasi Sekolah",
            url: "/admin/school-profile/accreditation",
            isActive: isItemActive("/admin/school-profile/accreditation"),
          },
          {
            title: "Visi, Misi & Tujuan",
            url: "/admin/school-profile/vision-mission",
            isActive: isItemActive("/admin/school-profile/vision-mission"),
          },
          {
            title: "Data Kepala Sekolah",
            url: "/admin/school-profile/principal-data",
            isActive: isItemActive("/admin/school-profile/principal-data"),
          },
          {
            title: "Fasilitas Sekolah",
            url: "/admin/school-profile/facilities",
            isActive: isItemActive("/admin/school-profile/facilities"),
          },
        ],
      },
      {
        title: "Manajemen Tahun Ajaran",
        url: "/admin/academic-year",
        icon: Calendar,
        isActive:
          isItemActive("/admin/academic-year") ||
          hasActiveChild([
            { url: "/admin/academic-year/settings" },
            { url: "/admin/academic-year/calendar" },
            { url: "/admin/academic-year/holidays" },
          ]),
        items: [
          {
            title: "Pengaturan Tahun Ajaran",
            url: "/admin/academic-year/settings",
            isActive: isItemActive("/admin/academic-year/settings"),
          },
          {
            title: "Kalender Akademik",
            url: "/admin/academic-year/calendar",
            isActive: isItemActive("/admin/academic-year/calendar"),
          },
          {
            title: "Jadwal Libur",
            url: "/admin/academic-year/holidays",
            isActive: isItemActive("/admin/academic-year/holidays"),
          },
        ],
      },

      // ### Manajemen Pengguna
      {
        title: "Data Guru & Staff",
        url: "/admin/teachers-staff",
        icon: Users,
        isActive:
          isItemActive("/admin/teachers-staff") ||
          hasActiveChild([
            { url: "/admin/teachers-staff/" },
            { url: "/admin/teachers-staff/nip" },
            { url: "/admin/teachers-staff/nuptk" },
            { url: "/admin/teachers-staff/certificates" },
            { url: "/admin/teachers-staff/employment-status" },
            { url: "/admin/teachers-staff/subjects" },
          ]),
        items: [
          {
            title: "Daftar Guru & Staff",
            url: "/admin/teachers-staff",
            isActive: isItemActive("/admin/teachers-staff"),
          },
          {
            title: "NIP",
            url: "/admin/teachers-staff/nip",
            isActive: isItemActive("/admin/teachers-staff/nip"),
          },
          {
            title: "NUPTK",
            url: "/admin/teachers-staff/nuptk",
            isActive: isItemActive("/admin/teachers-staff/nuptk"),
          },
          {
            title: "Sertifikat Pendidik",
            url: "/admin/teachers-staff/certificates",
            isActive: isItemActive("/admin/teachers-staff/certificates"),
          },
          {
            title: "Status Kepegawaian",
            url: "/admin/teachers-staff/employment-status",
            isActive: isItemActive("/admin/teachers-staff/employment-status"),
          },
          {
            title: "Mata Pelajaran",
            url: "/admin/teachers-staff/subjects",
            isActive: isItemActive("/admin/teachers-staff/subjects"),
          },
        ],
      },
      {
        title: "Data Siswa",
        url: "/admin/students",
        icon: GraduationCap,
        isActive:
          isItemActive("/admin/students") ||
          hasActiveChild([
            { url: "/admin/students" },
            { url: "/admin/students/nisn" },
            { url: "/admin/students/parents" },
            { url: "/admin/students/education-history" },
            { url: "/admin/students/status" },
          ]),
        items: [
          {
            title: "Daftar Siswa",
            url: "/admin/students",
            isActive: isItemActive("/admin/students"),
          },
          {
            title: "NISN",
            url: "/admin/students/nisn",
            isActive: isItemActive("/admin/students/nisn"),
          },
          {
            title: "Data Orang Tua/Wali",
            url: "/admin/students/parents",
            isActive: isItemActive("/admin/students/parents"),
          },
          {
            title: "Riwayat Pendidikan",
            url: "/admin/students/education-history",
            isActive: isItemActive("/admin/students/education-history"),
          },
          {
            title: "Status Siswa",
            url: "/admin/students/status",
            isActive: isItemActive("/admin/students/status"),
          },
        ],
      },

      // ### Manajemen Akademik
      {
        title: "Kurikulum",
        url: "/admin/curriculum",
        icon: BookOpen,
        isActive:
          isItemActive("/admin/curriculum") ||
          hasActiveChild([
            { url: "/admin/curriculum/settings" },
            { url: "/admin/curriculum/subjects-structure" },
            { url: "/admin/curriculum/competency-standards" },
          ]),
        items: [
          {
            title: "Pengaturan Kurikulum",
            url: "/admin/curriculum/settings",
            isActive: isItemActive("/admin/curriculum/settings"),
          },
          {
            title: "Struktur Mata Pelajaran",
            url: "/admin/curriculum/subjects-structure",
            isActive: isItemActive("/admin/curriculum/subjects-structure"),
          },
          {
            title: "Standar Kompetensi",
            url: "/admin/curriculum/competency-standards",
            isActive: isItemActive("/admin/curriculum/competency-standards"),
          },
        ],
      },
      {
        title: "Kelas & Jurusan",
        url: "/admin/classes-majors",
        icon: Bot,
        isActive:
          isItemActive("/admin/classes-majors") ||
          hasActiveChild([
            { url: "/admin/classes-majors/class-division" },
            { url: "/admin/classes-majors/majors" },
            { url: "/admin/classes-majors/capacity" },
            { url: "/admin/classes-majors/homeroom-teacher" },
          ]),
        items: [
          {
            title: "Pembagian Kelas",
            url: "/admin/classes-majors/class-division",
            isActive: isItemActive("/admin/classes-majors/class-division"),
          },
          {
            title: "Jurusan",
            url: "/admin/classes-majors/majors",
            isActive: isItemActive("/admin/classes-majors/majors"),
          },
          {
            title: "Kapasitas Kelas",
            url: "/admin/classes-majors/capacity",
            isActive: isItemActive("/admin/classes-majors/capacity"),
          },
          {
            title: "Wali Kelas",
            url: "/admin/classes-majors/homeroom-teacher",
            isActive: isItemActive("/admin/classes-majors/homeroom-teacher"),
          },
        ],
      },
      {
        title: "Jadwal Pelajaran",
        url: "/admin/schedule",
        icon: Calendar,
        isActive:
          isItemActive("/admin/schedule") ||
          hasActiveChild([
            { url: "/admin/schedule/master-schedule" },
            { url: "/admin/schedule/time-allocation" },
            { url: "/admin/schedule/lesson-hours" },
          ]),
        items: [
          {
            title: "Jadwal Master",
            url: "/admin/schedule/master-schedule",
            isActive: isItemActive("/admin/schedule/master-schedule"),
          },
          {
            title: "Alokasi Waktu",
            url: "/admin/schedule/time-allocation",
            isActive: isItemActive("/admin/schedule/time-allocation"),
          },
          {
            title: "Pengaturan Jam Pelajaran",
            url: "/admin/schedule/lesson-hours",
            isActive: isItemActive("/admin/schedule/lesson-hours"),
          },
        ],
      },

      // ### Manajemen Keuangan
      {
        title: "SPP",
        url: "/admin/spp",
        icon: DollarSign,
        isActive:
          isItemActive("/admin/spp") ||
          hasActiveChild([
            { url: "/admin/spp/rates" },
            { url: "/admin/spp/payment-monitoring" },
            { url: "/admin/spp/arrears-report" },
            { url: "/admin/spp/scholarship-system" },
          ]),
        items: [
          {
            title: "Penetapan Tarif SPP",
            url: "/admin/spp/rates",
            isActive: isItemActive("/admin/spp/rates"),
          },
          {
            title: "Monitoring Pembayaran",
            url: "/admin/spp/payment-monitoring",
            isActive: isItemActive("/admin/spp/payment-monitoring"),
          },
          {
            title: "Laporan Tunggakan",
            url: "/admin/spp/arrears-report",
            isActive: isItemActive("/admin/spp/arrears-report"),
          },
          {
            title: "Sistem Beasiswa",
            url: "/admin/spp/scholarship-system",
            isActive: isItemActive("/admin/spp/scholarship-system"),
          },
        ],
      },
      {
        title: "Keuangan Sekolah",
        url: "/admin/school-finance",
        icon: PieChart,
        isActive:
          isItemActive("/admin/school-finance") ||
          hasActiveChild([
            { url: "/admin/school-finance/budget" },
            { url: "/admin/school-finance/bos" },
            { url: "/admin/school-finance/financial-report" },
          ]),
        items: [
          {
            title: "Anggaran Sekolah",
            url: "/admin/school-finance/budget",
            isActive: isItemActive("/admin/school-finance/budget"),
          },
          {
            title: "BOS",
            url: "/admin/school-finance/bos",
            isActive: isItemActive("/admin/school-finance/bos"),
          },
          {
            title: "Laporan Keuangan",
            url: "/admin/school-finance/financial-report",
            isActive: isItemActive("/admin/school-finance/financial-report"),
          },
        ],
      },

      // ### Laporan & Analisis
      {
        title: "Laporan & Analisis",
        url: "/admin/reports",
        icon: BarChart3,
        isActive:
          isItemActive("/admin/reports") ||
          hasActiveChild([
            { url: "/admin/reports/academic-overall" },
            { url: "/admin/reports/graduation-statistics" },
            { url: "/admin/reports/student-achievement-analysis" },
            { url: "/admin/reports/attendance-report" },
            { url: "/admin/reports/dapodik-export" },
          ]),
        items: [
          {
            title: "Laporan Akademik",
            url: "/admin/reports/academic-overall",
            isActive: isItemActive("/admin/reports/academic-overall"),
          },
          {
            title: "Statistik Kelulusan",
            url: "/admin/reports/graduation-statistics",
            isActive: isItemActive("/admin/reports/graduation-statistics"),
          },
          {
            title: "Analisis Prestasi Siswa",
            url: "/admin/reports/student-achievement-analysis",
            isActive: isItemActive(
              "/admin/reports/student-achievement-analysis"
            ),
          },
          {
            title: "Laporan Kehadiran",
            url: "/admin/reports/attendance-report",
            isActive: isItemActive("/admin/reports/attendance-report"),
          },
          {
            title: "Export Data Dapodik",
            url: "/admin/reports/dapodik-export",
            isActive: isItemActive("/admin/reports/dapodik-export"),
          },
        ],
      },

      // ### Pengaturan Sistem
      {
        title: "Pengaturan Sistem",
        url: "/admin/system-settings",
        icon: Settings2,
        isActive:
          isItemActive("/admin/system-settings") ||
          hasActiveChild([
            { url: "/admin/system-settings/database-backup" },
            { url: "/admin/system-settings/semester-settings" },
            { url: "/admin/system-settings/grading-system" },
            { url: "/admin/system-settings/role-permissions" },
          ]),
        items: [
          {
            title: "Backup Database",
            url: "/admin/system-settings/database-backup",
            isActive: isItemActive("/admin/system-settings/database-backup"),
          },
          {
            title: "Pengaturan Semester",
            url: "/admin/system-settings/semester-settings",
            isActive: isItemActive("/admin/system-settings/semester-settings"),
          },
          {
            title: "Sistem Penilaian",
            url: "/admin/system-settings/grading-system",
            isActive: isItemActive("/admin/system-settings/grading-system"),
          },
          {
            title: "Role & Permission",
            url: "/admin/system-settings/role-permissions",
            isActive: isItemActive("/admin/system-settings/role-permissions"),
          },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "/admin/projects/design",
        icon: Frame,
        isActive: isItemActive("/admin/projects/design"),
      },
      {
        name: "Sales & Marketing",
        url: "/admin/projects/sales",
        icon: PieChart,
        isActive: isItemActive("/admin/projects/sales"),
      },
      {
        name: "Travel",
        url: "/admin/projects/travel",
        icon: Map,
        isActive: isItemActive("/admin/projects/travel"),
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader> */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
