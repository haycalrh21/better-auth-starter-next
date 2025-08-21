-- CreateEnum
CREATE TYPE "public"."StatusBeasiswa" AS ENUM ('AKTIF', 'NONAKTIF', 'SELESAI');

-- CreateEnum
CREATE TYPE "public"."TipePembayaran" AS ENUM ('SPP', 'BUKU', 'EKSKUL', 'LAINNYA');

-- CreateEnum
CREATE TYPE "public"."StatusPembayaran" AS ENUM ('BELUM_BAYAR', 'SUDAH_BAYAR', 'TERTUNDA');

-- CreateEnum
CREATE TYPE "public"."MetodePembayaran" AS ENUM ('CASH', 'TRANSFER', 'VIRTUAL_ACCOUNT', 'E_WALLET');

-- CreateEnum
CREATE TYPE "public"."Hari" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'GURU', 'SISWA');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "public"."Agama" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU');

-- CreateEnum
CREATE TYPE "public"."StatusKawin" AS ENUM ('BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI');

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'GURU',
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guru" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nip" TEXT,
    "nik" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "public"."Gender",
    "agama" "public"."Agama",
    "statusKawin" "public"."StatusKawin",
    "noHp" TEXT,
    "emailAlternatif" TEXT,
    "alamatLengkap" TEXT,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kabupatenKota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "pendidikanTerakhir" TEXT,
    "jurusan" TEXT,
    "tahunLulus" INTEGER,
    "institusi" TEXT,
    "statusKepegawaian" TEXT,
    "golongan" TEXT,
    "pangkat" TEXT,
    "tmt" TIMESTAMP(3),
    "masaKerja" INTEGER,
    "bidangStudi" TEXT,
    "walikelas" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kalender" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "kalender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mata_pelajaran" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "deskripsi" TEXT,
    "guruId" TEXT,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kkm" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mataPelajaranId" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,

    CONSTRAINT "kkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jadwal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hari" "public"."Hari" NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "mataPelajaranId" TEXT,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beasiswa" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "nominal" DOUBLE PRECISION NOT NULL,
    "mulaiBerlaku" TIMESTAMP(3),
    "selesaiBerlaku" TIMESTAMP(3),
    "status" "public"."StatusBeasiswa" NOT NULL DEFAULT 'AKTIF',
    "siswaId" TEXT NOT NULL,

    CONSTRAINT "beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pembayaran" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipe" "public"."TipePembayaran" NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusPembayaran" NOT NULL DEFAULT 'BELUM_BAYAR',
    "metode" "public"."MetodePembayaran",
    "siswaId" TEXT NOT NULL,
    "kelasId" TEXT,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kelas" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "namaKelas" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "jurusan" TEXT,
    "semester" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."siswa" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nisn" TEXT,
    "nik" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "public"."Gender",
    "agama" "public"."Agama",
    "noHp" TEXT,
    "emailAlternatif" TEXT,
    "alamatLengkap" TEXT,
    "kelurahan" TEXT,
    "statsuSiswa" TEXT,
    "kecamatan" TEXT,
    "kabupatenKota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "tahunMasuk" INTEGER,
    "namaAyah" TEXT,
    "namaIbu" TEXT,
    "namaWali" TEXT,
    "pekerjaanAyah" TEXT,
    "pekerjaanIbu" TEXT,
    "pekerjaanWali" TEXT,
    "noHpOrtu" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verifications" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_KelasSiswa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KelasSiswa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "public"."guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nik_key" ON "public"."guru"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "guru_userId_key" ON "public"."guru"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_key" ON "public"."mata_pelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_nisn_key" ON "public"."siswa"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_nik_key" ON "public"."siswa"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_userId_key" ON "public"."siswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- CreateIndex
CREATE INDEX "_KelasSiswa_B_index" ON "public"."_KelasSiswa"("B");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guru" ADD CONSTRAINT "guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mata_pelajaran" ADD CONSTRAINT "mata_pelajaran_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kkm" ADD CONSTRAINT "kkm_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "public"."mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal" ADD CONSTRAINT "jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "public"."kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal" ADD CONSTRAINT "jadwal_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal" ADD CONSTRAINT "jadwal_mataPelajaranId_fkey" FOREIGN KEY ("mataPelajaranId") REFERENCES "public"."mata_pelajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beasiswa" ADD CONSTRAINT "beasiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "public"."siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pembayaran" ADD CONSTRAINT "pembayaran_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "public"."siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pembayaran" ADD CONSTRAINT "pembayaran_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "public"."kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kelas" ADD CONSTRAINT "kelas_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_logs" ADD CONSTRAINT "user_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_KelasSiswa" ADD CONSTRAINT "_KelasSiswa_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_KelasSiswa" ADD CONSTRAINT "_KelasSiswa_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
