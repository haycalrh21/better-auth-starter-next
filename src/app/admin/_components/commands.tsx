"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Full menu data sesuai request lo
const menuData = [
  // Manajemen Data Sekolah
  {
    title: "Profil Sekolah",
    url: "/admin/school-profile",
    items: [
      { title: "Dashboard", url: "/admin/dashboard" },
      { title: "NPSN", url: "/admin/school-profile/npsn" },
      {
        title: "Akreditasi Sekolah",
        url: "/admin/school-profile/accreditation",
      },
      {
        title: "Visi, Misi & Tujuan",
        url: "/admin/school-profile/vision-mission",
      },
      {
        title: "Data Kepala Sekolah",
        url: "/admin/school-profile/principal-data",
      },
      { title: "Fasilitas Sekolah", url: "/admin/school-profile/facilities" },
    ],
  },
  {
    title: "Manajemen Tahun Ajaran",
    url: "/admin/academic-year",
    items: [
      {
        title: "Pengaturan Tahun Ajaran",
        url: "/admin/academic-year/settings",
      },
      { title: "Kalender Akademik", url: "/admin/academic-year/calendar" },
      { title: "Jadwal Libur", url: "/admin/academic-year/holidays" },
    ],
  },
  // Manajemen Pengguna
  {
    title: "Data Guru & Staff",
    url: "/admin/teachers-staff",
    items: [
      { title: "Daftar Guru & Staff", url: "/admin/teachers-staff" },
      { title: "NIP", url: "/admin/teachers-staff/nip" },
      { title: "NUPTK", url: "/admin/teachers-staff/nuptk" },
      {
        title: "Sertifikat Pendidik",
        url: "/admin/teachers-staff/certificates",
      },
      {
        title: "Status Kepegawaian",
        url: "/admin/teachers-staff/employment-status",
      },
      { title: "Mata Pelajaran", url: "/admin/teachers-staff/subjects" },
    ],
  },
  {
    title: "Data Siswa",
    url: "/admin/students",
    items: [
      { title: "Daftar Siswa", url: "/admin/students" },
      { title: "NISN", url: "/admin/students/nisn" },
      { title: "Data Orang Tua/Wali", url: "/admin/students/parents" },
      { title: "Riwayat Pendidikan", url: "/admin/students/education-history" },
      { title: "Status Siswa", url: "/admin/students/status" },
    ],
  },
  // Manajemen Akademik
  {
    title: "Kurikulum",
    url: "/admin/curriculum",
    items: [
      { title: "Pengaturan Kurikulum", url: "/admin/curriculum/settings" },
      {
        title: "Struktur Mata Pelajaran",
        url: "/admin/curriculum/subjects-structure",
      },
      {
        title: "Standar Kompetensi",
        url: "/admin/curriculum/competency-standards",
      },
    ],
  },
  {
    title: "Kelas & Jurusan",
    url: "/admin/classes-majors",
    items: [
      { title: "Pembagian Kelas", url: "/admin/classes-majors/class-division" },
      { title: "Jurusan", url: "/admin/classes-majors/majors" },
      { title: "Kapasitas Kelas", url: "/admin/classes-majors/capacity" },
      { title: "Wali Kelas", url: "/admin/classes-majors/homeroom-teacher" },
    ],
  },
  {
    title: "Jadwal Pelajaran",
    url: "/admin/schedule",
    items: [
      { title: "Jadwal Master", url: "/admin/schedule/master-schedule" },
      { title: "Alokasi Waktu", url: "/admin/schedule/time-allocation" },
      {
        title: "Pengaturan Jam Pelajaran",
        url: "/admin/schedule/lesson-hours",
      },
    ],
  },
  // Manajemen Keuangan
  {
    title: "SPP",
    url: "/admin/spp",
    items: [
      { title: "Penetapan Tarif SPP", url: "/admin/spp/rates" },
      { title: "Monitoring Pembayaran", url: "/admin/spp/payment-monitoring" },
      { title: "Laporan Tunggakan", url: "/admin/spp/arrears-report" },
      { title: "Sistem Beasiswa", url: "/admin/spp/scholarship-system" },
    ],
  },
  {
    title: "Keuangan Sekolah",
    url: "/admin/school-finance",
    items: [
      { title: "Anggaran Sekolah", url: "/admin/school-finance/budget" },
      { title: "BOS", url: "/admin/school-finance/bos" },
      {
        title: "Laporan Keuangan",
        url: "/admin/school-finance/financial-report",
      },
    ],
  },
  // Laporan & Analisis
  {
    title: "Laporan & Analisis",
    url: "/admin/reports",
    items: [
      { title: "Laporan Akademik", url: "/admin/reports/academic-overall" },
      {
        title: "Statistik Kelulusan",
        url: "/admin/reports/graduation-statistics",
      },
      {
        title: "Analisis Prestasi Siswa",
        url: "/admin/reports/student-achievement-analysis",
      },
      { title: "Laporan Kehadiran", url: "/admin/reports/attendance-report" },
      { title: "Export Data Dapodik", url: "/admin/reports/dapodik-export" },
    ],
  },
  // Pengaturan Sistem
  {
    title: "Pengaturan Sistem",
    url: "/admin/system-settings",
    items: [
      {
        title: "Backup Database",
        url: "/admin/system-settings/database-backup",
      },
      {
        title: "Pengaturan Semester",
        url: "/admin/system-settings/semester-settings",
      },
      {
        title: "Sistem Penilaian",
        url: "/admin/system-settings/grading-system",
      },
      {
        title: "Role & Permission",
        url: "/admin/system-settings/role-permissions",
      },
    ],
  },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {menuData.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => {
                  router.push(item.url);
                  setOpen(false); // Tutup menu setelah pilih
                }}
              >
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
