"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
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
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

type UserSession = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string | null;
  banned?: boolean;
};

export default function AppSidebarAdmin({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserSession }) {
  const pathname = usePathname();

  // Fungsi sederhana untuk mengecek apakah path aktif
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Fungsi untuk mengecek apakah parent memiliki child yang aktif
  const hasActiveChild = (parentPath: string, childPaths: string[]) => {
    // Jika di parent path itu sendiri
    if (pathname === parentPath) return true;

    // Jika di salah satu child path
    return childPaths.some((childPath) => pathname === childPath);
  };

  const data = {
    navMain: [
      // ### Manajemen Data Sekolah
      {
        title: "Profil Sekolah",
        url: "/admin/school-profile",
        icon: School,
        isActive: hasActiveChild("/admin/school-profile", [
          "/admin/dashboard",
          "/admin/school-profile/npsn",
          "/admin/school-profile/accreditation",
          "/admin/school-profile/vision-mission",
          "/admin/school-profile/principal-data",
          "/admin/school-profile/facilities",
        ]),
        items: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
            isActive: isActive("/admin/dashboard"),
          },
          {
            title: "NPSN",
            url: "/admin/school-profile/npsn",
            isActive: isActive("/admin/school-profile/npsn"),
          },
          {
            title: "Akreditasi Sekolah",
            url: "/admin/school-profile/accreditation",
            isActive: isActive("/admin/school-profile/accreditation"),
          },
          {
            title: "Visi, Misi & Tujuan",
            url: "/admin/school-profile/vision-mission",
            isActive: isActive("/admin/school-profile/vision-mission"),
          },
          {
            title: "Data Kepala Sekolah",
            url: "/admin/school-profile/principal-data",
            isActive: isActive("/admin/school-profile/principal-data"),
          },
          {
            title: "Fasilitas Sekolah",
            url: "/admin/school-profile/facilities",
            isActive: isActive("/admin/school-profile/facilities"),
          },
        ],
      },
      {
        title: "Manajemen Tahun Ajaran",
        url: "/admin/academic-year",
        icon: Calendar,
        isActive: hasActiveChild("/admin/academic-year", [
          "/admin/academic-year/settings",
          "/admin/academic-year/calendar",
          "/admin/academic-year/holidays",
        ]),
        items: [
          {
            title: "Pengaturan Tahun Ajaran",
            url: "/admin/academic-year/settings",
            isActive: isActive("/admin/academic-year/settings"),
          },
          {
            title: "Kalender Akademik",
            url: "/admin/academic-year/calendar",
            isActive: isActive("/admin/academic-year/calendar"),
          },
          {
            title: "Jadwal Libur",
            url: "/admin/academic-year/holidays",
            isActive: isActive("/admin/academic-year/holidays"),
          },
        ],
      },

      // ### Manajemen Pengguna
      {
        title: "Data Guru & Staff",
        url: "/admin/teachers-staff",
        icon: Users,
        isActive: hasActiveChild("/admin/teachers-staff", [
          "/admin/teachers-staff/nip",
          "/admin/teachers-staff/nuptk",
          "/admin/teachers-staff/certificates",
          "/admin/teachers-staff/employment-status",
          "/admin/teachers-staff/subjects",
        ]),
        items: [
          {
            title: "Daftar Guru & Staff",
            url: "/admin/teachers-staff",
            isActive: isActive("/admin/teachers-staff"),
          },
          {
            title: "NIP",
            url: "/admin/teachers-staff/nip",
            isActive: isActive("/admin/teachers-staff/nip"),
          },
          {
            title: "NUPTK",
            url: "/admin/teachers-staff/nuptk",
            isActive: isActive("/admin/teachers-staff/nuptk"),
          },
          {
            title: "Sertifikat Pendidik",
            url: "/admin/teachers-staff/certificates",
            isActive: isActive("/admin/teachers-staff/certificates"),
          },
          {
            title: "Status Kepegawaian",
            url: "/admin/teachers-staff/employment-status",
            isActive: isActive("/admin/teachers-staff/employment-status"),
          },
          {
            title: "Mata Pelajaran",
            url: "/admin/teachers-staff/subjects",
            isActive: isActive("/admin/teachers-staff/subjects"),
          },
        ],
      },
      {
        title: "Data Siswa",
        url: "/admin/students",
        icon: GraduationCap,
        isActive: hasActiveChild("/admin/students", [
          "/admin/students/nisn",
          "/admin/students/parents",
          "/admin/students/education-history",
          "/admin/students/status",
        ]),
        items: [
          {
            title: "Daftar Siswa",
            url: "/admin/students",
            isActive: isActive("/admin/students"),
          },
          {
            title: "NISN",
            url: "/admin/students/nisn",
            isActive: isActive("/admin/students/nisn"),
          },
          {
            title: "Data Orang Tua/Wali",
            url: "/admin/students/parents",
            isActive: isActive("/admin/students/parents"),
          },
          {
            title: "Riwayat Pendidikan",
            url: "/admin/students/education-history",
            isActive: isActive("/admin/students/education-history"),
          },
          {
            title: "Status Siswa",
            url: "/admin/students/status",
            isActive: isActive("/admin/students/status"),
          },
        ],
      },

      // ### Manajemen Akademik
      {
        title: "Kurikulum",
        url: "/admin/curriculum",
        icon: BookOpen,
        isActive: hasActiveChild("/admin/curriculum", [
          "/admin/curriculum/settings",
          "/admin/curriculum/subjects-structure",
          "/admin/curriculum/competency-standards",
        ]),
        items: [
          {
            title: "Pengaturan Kurikulum",
            url: "/admin/curriculum/settings",
            isActive: isActive("/admin/curriculum/settings"),
          },
          {
            title: "Struktur Mata Pelajaran",
            url: "/admin/curriculum/subjects-structure",
            isActive: isActive("/admin/curriculum/subjects-structure"),
          },
          {
            title: "Standar Kompetensi",
            url: "/admin/curriculum/competency-standards",
            isActive: isActive("/admin/curriculum/competency-standards"),
          },
        ],
      },
      {
        title: "Kelas & Jurusan",
        url: "/admin/classes-majors",
        icon: Bot,
        isActive: hasActiveChild("/admin/classes-majors", [
          "/admin/classes-majors/class-division",
          "/admin/classes-majors/majors",
          "/admin/classes-majors/capacity",
          "/admin/classes-majors/homeroom-teacher",
        ]),
        items: [
          {
            title: "Pembagian Kelas",
            url: "/admin/classes-majors/class-division",
            isActive: isActive("/admin/classes-majors/class-division"),
          },
          {
            title: "Jurusan",
            url: "/admin/classes-majors/majors",
            isActive: isActive("/admin/classes-majors/majors"),
          },
          {
            title: "Kapasitas Kelas",
            url: "/admin/classes-majors/capacity",
            isActive: isActive("/admin/classes-majors/capacity"),
          },
          {
            title: "Wali Kelas",
            url: "/admin/classes-majors/homeroom-teacher",
            isActive: isActive("/admin/classes-majors/homeroom-teacher"),
          },
        ],
      },
      {
        title: "Jadwal Pelajaran",
        url: "/admin/schedule",
        icon: Calendar,
        isActive: hasActiveChild("/admin/schedule", [
          "/admin/schedule/master-schedule",
          "/admin/schedule/time-allocation",
          "/admin/schedule/lesson-hours",
        ]),
        items: [
          {
            title: "Jadwal Master",
            url: "/admin/schedule/master-schedule",
            isActive: isActive("/admin/schedule/master-schedule"),
          },
          {
            title: "Alokasi Waktu",
            url: "/admin/schedule/time-allocation",
            isActive: isActive("/admin/schedule/time-allocation"),
          },
          {
            title: "Pengaturan Jam Pelajaran",
            url: "/admin/schedule/lesson-hours",
            isActive: isActive("/admin/schedule/lesson-hours"),
          },
        ],
      },

      // ### Manajemen Keuangan
      {
        title: "SPP",
        url: "/admin/spp",
        icon: DollarSign,
        isActive: hasActiveChild("/admin/spp", [
          "/admin/spp/rates",
          "/admin/spp/payment-monitoring",
          "/admin/spp/arrears-report",
          "/admin/spp/scholarship-system",
        ]),
        items: [
          {
            title: "Penetapan Tarif SPP",
            url: "/admin/spp/rates",
            isActive: isActive("/admin/spp/rates"),
          },
          {
            title: "Monitoring Pembayaran",
            url: "/admin/spp/payment-monitoring",
            isActive: isActive("/admin/spp/payment-monitoring"),
          },
          {
            title: "Laporan Tunggakan",
            url: "/admin/spp/arrears-report",
            isActive: isActive("/admin/spp/arrears-report"),
          },
          {
            title: "Sistem Beasiswa",
            url: "/admin/spp/scholarship-system",
            isActive: isActive("/admin/spp/scholarship-system"),
          },
        ],
      },
      {
        title: "Keuangan Sekolah",
        url: "/admin/school-finance",
        icon: PieChart,
        isActive: hasActiveChild("/admin/school-finance", [
          "/admin/school-finance/budget",
          "/admin/school-finance/bos",
          "/admin/school-finance/financial-report",
        ]),
        items: [
          {
            title: "Anggaran Sekolah",
            url: "/admin/school-finance/budget",
            isActive: isActive("/admin/school-finance/budget"),
          },
          {
            title: "BOS",
            url: "/admin/school-finance/bos",
            isActive: isActive("/admin/school-finance/bos"),
          },
          {
            title: "Laporan Keuangan",
            url: "/admin/school-finance/financial-report",
            isActive: isActive("/admin/school-finance/financial-report"),
          },
        ],
      },

      // ### Laporan & Analisis
      {
        title: "Laporan & Analisis",
        url: "/admin/reports",
        icon: BarChart3,
        isActive: hasActiveChild("/admin/reports", [
          "/admin/reports/academic-overall",
          "/admin/reports/graduation-statistics",
          "/admin/reports/student-achievement-analysis",
          "/admin/reports/attendance-report",
          "/admin/reports/dapodik-export",
        ]),
        items: [
          {
            title: "Laporan Akademik",
            url: "/admin/reports/academic-overall",
            isActive: isActive("/admin/reports/academic-overall"),
          },
          {
            title: "Statistik Kelulusan",
            url: "/admin/reports/graduation-statistics",
            isActive: isActive("/admin/reports/graduation-statistics"),
          },
          {
            title: "Analisis Prestasi Siswa",
            url: "/admin/reports/student-achievement-analysis",
            isActive: isActive("/admin/reports/student-achievement-analysis"),
          },
          {
            title: "Laporan Kehadiran",
            url: "/admin/reports/attendance-report",
            isActive: isActive("/admin/reports/attendance-report"),
          },
          {
            title: "Export Data Dapodik",
            url: "/admin/reports/dapodik-export",
            isActive: isActive("/admin/reports/dapodik-export"),
          },
        ],
      },

      // ### Pengaturan Sistem
      {
        title: "Pengaturan Sistem",
        url: "/admin/system-settings",
        icon: Settings2,
        isActive: hasActiveChild("/admin/system-settings", [
          "/admin/system-settings/database-backup",
          "/admin/system-settings/semester-settings",
          "/admin/system-settings/grading-system",
          "/admin/system-settings/role-permissions",
        ]),
        items: [
          {
            title: "Backup Database",
            url: "/admin/system-settings/database-backup",
            isActive: isActive("/admin/system-settings/database-backup"),
          },
          {
            title: "Pengaturan Semester",
            url: "/admin/system-settings/semester-settings",
            isActive: isActive("/admin/system-settings/semester-settings"),
          },
          {
            title: "Sistem Penilaian",
            url: "/admin/system-settings/grading-system",
            isActive: isActive("/admin/system-settings/grading-system"),
          },
          {
            title: "Role & Permission",
            url: "/admin/system-settings/role-permissions",
            isActive: isActive("/admin/system-settings/role-permissions"),
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
