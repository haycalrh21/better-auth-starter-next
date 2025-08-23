"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  BarChart3,
  MessageSquare,
  FileText,
  UserCheck,
  Home,
  Settings,
  Award,
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

export default function AppSidebarGuru({
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
      // ### Informasi Pribadi
      {
        title: "Dashboard",
        url: "/guru/dashboard",
        icon: Home,
        isActive: hasActiveChild("/guru/dashboard", [
          "/guru/profile",
          "/guru/schedule-today",
          "/guru/announcements",
        ]),
        items: [
          {
            title: "Beranda",
            url: "/guru/dashboard",
            isActive: isActive("/guru/dashboard"),
          },
          {
            title: "Profil Guru",
            url: "/guru/profile",
            isActive: isActive("/guru/profile"),
          },
          {
            title: "Jadwal Hari Ini",
            url: "/guru/schedule-today",
            isActive: isActive("/guru/schedule-today"),
          },
          {
            title: "Pengumuman",
            url: "/guru/announcements",
            isActive: isActive("/guru/announcements"),
          },
        ],
      },

      // ### Manajemen Kelas
      {
        title: "Manajemen Kelas",
        url: "/guru/kelas",
        icon: Users,
        isActive: hasActiveChild("/guru/kelas", [
          "/guru/kelas/daftar-kelas",
          "/guru/kelas/data-siswa",
          "/guru/kelas/jadwal-kelas",
        ]),
        items: [
          {
            title: "Kelas yang Diampu",
            url: "/guru/kelas/daftar-kelas",
            isActive: isActive("/guru/kelas/daftar-kelas"),
          },
          {
            title: "Data Siswa",
            url: "/guru/kelas/data-siswa",
            isActive: isActive("/guru/kelas/data-siswa"),
          },
          {
            title: "Jadwal per Kelas",
            url: "/guru/kelas/jadwal-kelas",
            isActive: isActive("/guru/kelas/jadwal-kelas"),
          },
        ],
      },

      // ### Pembelajaran
      {
        title: "Pembelajaran",
        url: "/guru/pembelajaran",
        icon: BookOpen,
        isActive: hasActiveChild("/guru/pembelajaran", [
          "/guru/pembelajaran/rpp",
          "/guru/pembelajaran/materi",
          "/guru/pembelajaran/tugas-ujian",
        ]),
        items: [
          {
            title: "RPP (Rencana Pelaksanaan Pembelajaran)",
            url: "/guru/pembelajaran/rpp",
            isActive: isActive("/guru/pembelajaran/rpp"),
          },
          {
            title: "Materi Pembelajaran",
            url: "/guru/pembelajaran/materi",
            isActive: isActive("/guru/pembelajaran/materi"),
          },
          {
            title: "Tugas & Ujian",
            url: "/guru/pembelajaran/tugas-ujian",
            isActive: isActive("/guru/pembelajaran/tugas-ujian"),
          },
        ],
      },

      // ### Penilaian
      {
        title: "Penilaian",
        url: "/guru/penilaian",
        icon: Award,
        isActive: hasActiveChild("/guru/penilaian", [
          "/guru/penilaiann",
          "/guru/penilaian/",
        ]),
        items: [
          {
            title: "Input Nilai",
            url: "/guru/penilaian",
            isActive: isActive("/guru/penilaian"),
          },
          {
            title: "Analisis Nilai",
            url: "/guru/penilaian/analisis-nilai",
            isActive: isActive("/guru/penilaian/analisis-nilai"),
          },
        ],
      },

      // ### Absensi
      {
        title: "Absensi",
        url: "/guru/absensi",
        icon: UserCheck,
        isActive: hasActiveChild("/guru/absensi", [
          "/guru/absensi/",
          "/guru/absensi/rekap-absensi",
          "/guru/absensi/laporan-kehadiran",
        ]),
        items: [
          {
            title: "Presensi Siswa",
            url: "/guru/absensi",
            isActive: isActive("/guru/absensi"),
          },
          {
            title: "Rekap Absensi",
            url: "/guru/absensi/rekap-absensi",
            isActive: isActive("/guru/absensi/rekap-absensi"),
          },
          {
            title: "Laporan Kehadiran",
            url: "/guru/absensi/laporan-kehadiran",
            isActive: isActive("/guru/absensi/laporan-kehadiran"),
          },
        ],
      },

      // ### Komunikasi
      {
        title: "Komunikasi",
        url: "/guru/komunikasi",
        icon: MessageSquare,
        isActive: hasActiveChild("/guru/komunikasi", [
          "/guru/komunikasi/siswa",
          "/guru/komunikasi/orang-tua",
          "/guru/komunikasi/forum-diskusi",
        ]),
        items: [
          {
            title: "Dengan Siswa",
            url: "/guru/komunikasi/siswa",
            isActive: isActive("/guru/komunikasi/siswa"),
          },
          {
            title: "Dengan Orang Tua",
            url: "/guru/komunikasi/orang-tua",
            isActive: isActive("/guru/komunikasi/orang-tua"),
          },
          {
            title: "Forum Diskusi",
            url: "/guru/komunikasi/forum-diskusi",
            isActive: isActive("/guru/komunikasi/forum-diskusi"),
          },
        ],
      },

      // ### Laporan
      {
        title: "Laporan",
        url: "/guru/laporan",
        icon: FileText,
        isActive: hasActiveChild("/guru/laporan", [
          "/guru/laporan/perkembangan-kelas",
          "/guru/laporan/hasil-belajar",
          "/guru/laporan/kehadiran",
          "/guru/laporan/raport",
        ]),
        items: [
          {
            title: "Perkembangan Kelas",
            url: "/guru/laporan/perkembangan-kelas",
            isActive: isActive("/guru/laporan/perkembangan-kelas"),
          },
          {
            title: "Hasil Belajar",
            url: "/guru/laporan/hasil-belajar",
            isActive: isActive("/guru/laporan/hasil-belajar"),
          },
          {
            title: "Laporan Kehadiran",
            url: "/guru/laporan/kehadiran",
            isActive: isActive("/guru/laporan/kehadiran"),
          },
          {
            title: "Cetak Raport/Leger",
            url: "/guru/laporan/raport",
            isActive: isActive("/guru/laporan/raport"),
          },
        ],
      },

      // ### Pengaturan
      {
        title: "Pengaturan",
        url: "/guru/pengaturan",
        icon: Settings,
        isActive: hasActiveChild("/guru/pengaturan", [
          "/guru/pengaturan/profil",
          "/guru/pengaturan/preferensi",
        ]),
        items: [
          {
            title: "Pengaturan Profil",
            url: "/guru/pengaturan/profil",
            isActive: isActive("/guru/pengaturan/profil"),
          },
          {
            title: "Preferensi Sistem",
            url: "/guru/pengaturan/preferensi",
            isActive: isActive("/guru/pengaturan/preferensi"),
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
