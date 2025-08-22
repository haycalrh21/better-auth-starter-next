# Struktur Lengkap Website Sistem Informasi Sekolah Indonesia

Stop-Process -Name node -Force
Remove-Item -Recurse -Force .\src\generated\prisma
npx tsx seeds.ts

## 🏫 DASHBOARD ADMIN

### Statistik Utama

- Total siswa aktif
- Total guru dan staff
- Jumlah kelas
- Tingkat kehadiran keseluruhan
- Grafik perkembangan akademik sekolah

### Manajemen Data Sekolah

- **Profil Sekolah**

  - NPSN (Nomor Pokok Sekolah Nasional)
  - Akreditasi sekolah
  - Visi, misi, dan tujuan
  - Data kepala sekolah
  - Fasilitas sekolah

- **Manajemen Tahun Ajaran**
  - Pengaturan tahun ajaran aktif
  - Kalender akademik
  - Jadwal libur nasional dan sekolah

### Manajemen Pengguna

- **Data Guru & Staff**

  - Tambah/edit/hapus guru
  - NIP (Nomor Induk Pegawai)
  - NUPTK (Nomor Unik Pendidik dan Tenaga Kependidikan)
  - Sertifikat pendidik
  - Status kepegawaian (PNS/Non-PNS/Honor)
  - Mata pelajaran yang diampu

- **Data Siswa**
  - Tambah/edit/hapus siswa
  - NISN (Nomor Induk Siswa Nasional)
  - Data orang tua/wali
  - Riwayat pendidikan
  - Status siswa (aktif/alumni/pindah/keluar)

### Manajemen Akademik

- **Kurikulum**

  - Pengaturan kurikulum (K13/Merdeka Belajar)
  - Struktur mata pelajaran per tingkat
  - Standar kompetensi

- **Kelas & Jurusan**

  - Pembagian kelas
  - Jurusan (untuk SMA/SMK)
  - Kapasitas kelas
  - Wali kelas

- **Jadwal Pelajaran**
  - Pengaturan jadwal master
  - Alokasi waktu per mata pelajaran
  - Pengaturan jam pelajaran

### Manajemen Keuangan

- **SPP (Sumbangan Pembinaan Pendidikan)**

  - Penetapan tarif SPP
  - Monitoring pembayaran
  - Laporan tunggakan
  - Sistem beasiswa

- **Keuangan Sekolah**
  - Anggaran sekolah
  - BOS (Bantuan Operasional Sekolah)
  - Laporan keuangan

### Laporan & Analisis

- Laporan akademik keseluruhan
- Statistik kelulusan
- Analisis prestasi siswa
- Laporan kehadiran
- Export data untuk Dapodik

### Pengaturan Sistem

- Backup database
- Pengaturan semester
- Konfigurasi sistem penilaian
- Manajemen role dan permission

---

## 👨‍🏫 DASHBOARD GURU

### Informasi Pribadi

- Profil guru (NIP, NUPTK, foto)
- Jadwal mengajar hari ini
- Tugas-tugas yang perlu direview
- Pengumuman dari sekolah

### Manajemen Kelas

- **Kelas yang Diampu**

  - Daftar kelas yang diajar
  - Jumlah siswa per kelas
  - Jadwal per kelas

- **Data Siswa**
  - Daftar siswa per kelas
  - Profil lengkap siswa
  - Riwayat akademik siswa
  - Kontak orang tua/wali

### Pembelajaran

- **RPP (Rencana Pelaksanaan Pembelajaran)**

  - Upload/download RPP
  - Template RPP sesuai kurikulum
  - Riwayat RPP

- **Materi Pembelajaran**

  - Upload materi pelajaran
  - Bank soal
  - Video pembelajaran
  - E-book dan modul

- **Tugas & Ujian**
  - Buat tugas/PR online
  - Buat soal ujian/ulangan
  - Setting waktu pengerjaan
  - Auto-correction untuk pilihan ganda

### Penilaian

- **Input Nilai**

  - Nilai harian/tugas
  - Nilai UTS/UAS
  - Nilai praktek/keterampilan
  - Nilai sikap/karakter

- **Analisis Nilai**
  - Grafik perkembangan siswa
  - Ranking kelas
  - Analisis ketuntasan belajar
  - Identifikasi siswa yang perlu remedial

### Absensi

- **Presensi Siswa**
  - Input kehadiran harian
  - Rekap absensi bulanan
  - Laporan siswa sering tidak hadir
  - Sistem izin/sakit

### Komunikasi

- **Dengan Siswa**

  - Forum diskusi kelas
  - Chat/pesan pribadi
  - Pengumuman kelas

- **Dengan Orang Tua**
  - Laporan perkembangan siswa
  - Konsultasi akademik
  - Pemberitahuan kegiatan

### Laporan

- Laporan perkembangan kelas
- Analisis hasil belajar
- Laporan kehadiran
- Cetak raport/leger

---

## 🎓 DASHBOARD SISWA

### Informasi Pribadi

- Profil siswa (NISN, foto, data diri)
- Jadwal pelajaran hari ini
- Tugas yang belum dikerjakan
- Pengumuman sekolah dan kelas

### Akademik

- **Jadwal Pelajaran**

  - Jadwal harian/mingguan
  - Informasi guru pengampu
  - Ruang kelas
  - Perubahan jadwal

- **Nilai & Rapor**

  - Nilai per mata pelajaran
  - Grafik perkembangan nilai
  - Ranking kelas
  - Download rapor/transkrip nilai
  - Nilai UTS/UAS
  - Predikat kelulusan

- **Tugas & Ujian**
  - Daftar tugas aktif
  - Submit tugas online
  - Riwayat tugas yang sudah dikerjakan
  - Ujian/kuis online
  - Hasil ujian

### Kehadiran

- **Absensi Pribadi**

  - Rekap kehadiran bulanan
  - Persentase kehadiran
  - Riwayat izin/sakit
  - Status kehadiran real-time

- **Izin/Dispensasi**
  - Ajukan izin tidak masuk
  - Upload surat dokter/keterangan
  - Status persetujuan izin

### Keuangan

- **SPP & Pembayaran**
  - Status pembayaran SPP
  - Riwayat pembayaran
  - Sisa tunggakan
  - Download kwitansi
  - Info beasiswa

### Pembelajaran

- **Materi Pelajaran**

  - Download materi dari guru
  - E-book dan modul
  - Video pembelajaran
  - Bank latihan soal

- **Forum Diskusi**
  - Diskusi per mata pelajaran
  - Tanya jawab dengan guru
  - Diskusi kelompok

### Ekstrakurikuler

- **Kegiatan Ekskul**
  - Daftar ekskul yang diikuti
  - Jadwal latihan/kegiatan
  - Prestasi yang diraih
  - Sertifikat kegiatan

### Konsultasi

- **Bimbingan Konseling**

  - Jadwal konseling
  - Riwayat konsultasi
  - Minat dan bakat
  - Perencanaan karir

- **Komunikasi**
  - Chat dengan guru
  - Pesan dari wali kelas
  - Notifikasi penting

### Perpustakaan Digital

- Katalog buku
- Peminjaman buku online
- E-book gratis
- Riwayat peminjaman

### Alumni & Karir

- Info perguruan tinggi
- Beasiswa tersedia
- Tips sukses alumni
- Lowongan magang

---

## 🔐 FITUR KEAMANAN & UMUM

### Sistem Login

- Multi-role authentication
- Forgot password
- Captcha security
- Session management

### Notifikasi

- Push notification
- Email alerts
- SMS gateway (opsional)
- In-app notifications

### Mobile Responsive

- Responsive design
- Mobile app (Android/iOS)
- Offline capability (terbatas)

### Integrasi

- Integrasi dengan Dapodik
- Google Classroom (opsional)
- Sistem pembayaran digital
- API untuk aplikasi eksternal

### Backup & Security

- Regular data backup
- SSL certificate
- Data encryption
- Access logging

---

## 🌐 FITUR TAMBAHAN KHUSUS INDONESIA

### Compliance

- Format data sesuai Kemendikbud
- Integrasi PIP (Program Indonesia Pintar)
- Sinkronisasi dengan server pusat
- Standar kurikulum nasional

### Bahasa & Lokalisasi

- Bahasa Indonesia
- Support bahasa daerah (opsional)
- Kalender Hijriyah
- Hari libur nasional Indonesia

### Pelaporan Pemerintah

- Laporan BOS
- Data Pokok Pendidikan (Dapodik)
- Ujian Nasional/ANBK
- Akreditasi sekolah
