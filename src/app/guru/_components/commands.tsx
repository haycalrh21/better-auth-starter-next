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

// Menu data untuk guru berdasarkan requirements
const menuDataGuru = [
  // Dashboard & Informasi Pribadi
  {
    title: "Dashboard",
    url: "/guru/dashboard",
    items: [
      { title: "Beranda", url: "/guru/dashboard" },
      { title: "Profil Guru", url: "/guru/profile" },
      { title: "Jadwal Hari Ini", url: "/guru/schedule-today" },
      { title: "Pengumuman", url: "/guru/announcements" },
    ],
  },

  // Manajemen Kelas
  {
    title: "Manajemen Kelas",
    url: "/guru/kelas",
    items: [
      { title: "Kelas yang Diampu", url: "/guru/kelas/daftar-kelas" },
      { title: "Data Siswa", url: "/guru/kelas/data-siswa" },
      { title: "Jadwal per Kelas", url: "/guru/kelas/jadwal-kelas" },
    ],
  },

  // Pembelajaran
  {
    title: "Pembelajaran",
    url: "/guru/pembelajaran",
    items: [
      {
        title: "RPP (Rencana Pelaksanaan Pembelajaran)",
        url: "/guru/pembelajaran/rpp",
      },
      { title: "Materi Pembelajaran", url: "/guru/pembelajaran/materi" },
      { title: "Tugas & Ujian", url: "/guru/pembelajaran/tugas-ujian" },
    ],
  },

  // Penilaian
  {
    title: "Penilaian",
    url: "/guru/penilaian",
    items: [
      { title: "Input Nilai", url: "/guru/penilaian/input-nilai" },
      { title: "Analisis Nilai", url: "/guru/penilaian/analisis-nilai" },
    ],
  },

  // Absensi
  {
    title: "Absensi",
    url: "/guru/absensi",
    items: [
      { title: "Presensi Siswa", url: "/guru/absensi/presensi-siswa" },
      { title: "Rekap Absensi", url: "/guru/absensi/rekap-absensi" },
      { title: "Laporan Kehadiran", url: "/guru/absensi/laporan-kehadiran" },
    ],
  },

  // Komunikasi
  {
    title: "Komunikasi",
    url: "/guru/komunikasi",
    items: [
      { title: "Dengan Siswa", url: "/guru/komunikasi/siswa" },
      { title: "Dengan Orang Tua", url: "/guru/komunikasi/orang-tua" },
      { title: "Forum Diskusi", url: "/guru/komunikasi/forum-diskusi" },
    ],
  },

  // Laporan
  {
    title: "Laporan",
    url: "/guru/laporan",
    items: [
      { title: "Perkembangan Kelas", url: "/guru/laporan/perkembangan-kelas" },
      { title: "Hasil Belajar", url: "/guru/laporan/hasil-belajar" },
      { title: "Laporan Kehadiran", url: "/guru/laporan/kehadiran" },
      { title: "Cetak Raport/Leger", url: "/guru/laporan/raport" },
    ],
  },

  // Pengaturan
  {
    title: "Pengaturan",
    url: "/guru/pengaturan",
    items: [
      { title: "Pengaturan Profil", url: "/guru/pengaturan/profil" },
      { title: "Preferensi Sistem", url: "/guru/pengaturan/preferensi" },
    ],
  },
];

export function CommandMenuGuru() {
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
      <CommandInput placeholder="Ketik perintah atau cari menu..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil yang ditemukan.</CommandEmpty>

        {menuDataGuru.map((group) => (
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
