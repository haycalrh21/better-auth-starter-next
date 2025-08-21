import { Agama, StatusKawin } from "@/interface";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Starting database seeding...");

  // Clear existing data
  console.log("Cleaning existing data...");

  await prisma.kelas.deleteMany();
  await prisma.mataPelajaran.deleteMany();
  await prisma.jadwal.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.guru.deleteMany();
  //   await prisma.account.deleteMany();
  //   await prisma.user.deleteMany();

  const users = [];

  // 0. Create Admin
  console.log("Creating admin...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      name: "admin",
      emailVerified: true,
      role: "ADMIN",
    },
  });
  users.push(admin);

  // Buat account untuk admin
  await prisma.account.create({
    data: {
      accountId: `${admin.id}`,
      providerId: "credentials",
      password:
        "28fdbda610237e735259aaecbc211afa:7456629bc62cf5a8266e51564e7dfd60b0a067fefe682e108d35731a72e795bd9b504d7b3ad118f5429b59ddb519f0af632f93dcf81654043cabd73a9d3e0f0d", // password = admin@gmail.com
      userId: admin.id,
    },
  });
  console.log(`Created ADMIN: ${admin.name}`);

  // 1. Create Guru Users (20 guru)
  console.log("Creating guru users...");
  for (let i = 1; i <= 20; i++) {
    const guru = await prisma.user.create({
      data: {
        email: `guru${i}@school.com`,
        name: `Guru ${i}`,
        emailVerified: true,
        role: "GURU",
      },
    });
    users.push(guru);

    // Buat account untuk guru
    await prisma.account.create({
      data: {
        accountId: `local-guru${i}`,
        providerId: "credentials",
        password: guru.email, // password = email
        userId: guru.id,
      },
    });

    console.log(`Created GURU: ${guru.name}`);
  }

  // 2. Create Siswa Users (50 siswa)
  console.log("Creating siswa users...");
  for (let i = 1; i <= 50; i++) {
    const siswa = await prisma.user.create({
      data: {
        email: `siswa${i}@school.com`,
        name: `Siswa ${i}`,
        emailVerified: true,
        role: "SISWA",
      },
    });
    users.push(siswa);

    // Buat account untuk siswa
    await prisma.account.create({
      data: {
        accountId: `local-siswa${i}`,
        providerId: "credentials",
        password: siswa.email, // password = email
        userId: siswa.id,
      },
    });

    console.log(`Created SISWA: ${siswa.name}`);
  }

  // 3. Create Guru profiles
  console.log("Creating guru profiles...");
  const guruUsers = users.filter((u) => u.role === "GURU");

  for (let i = 0; i < guruUsers.length; i++) {
    const user = guruUsers[i];
    await prisma.guru.create({
      data: {
        namaLengkap: user.name,
        nip: `19${String(
          Math.floor(Math.random() * 10000000000000000)
        ).padStart(16, "0")}`,
        nik: `32${String(Math.floor(Math.random() * 100000000000000)).padStart(
          14,
          "0"
        )}`,
        tempatLahir: ["Jakarta", "Bandung", "Surabaya", "Medan", "Semarang"][
          Math.floor(Math.random() * 5)
        ],
        tanggalLahir: new Date(
          1980 + Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        jenisKelamin: Math.random() > 0.5 ? "LAKI_LAKI" : "PEREMPUAN",
        agama: [
          Agama.ISLAM,
          Agama.KRISTEN,
          Agama.KATOLIK,
          Agama.HINDU,
          Agama.BUDDHA,
        ][Math.floor(Math.random() * 5)],
        statusKawin: [
          StatusKawin.BELUM_KAWIN,
          StatusKawin.KAWIN,
          StatusKawin.CERAI_HIDUP,
        ][Math.floor(Math.random() * 3)],
        noHp: `08${String(Math.floor(Math.random() * 1000000000)).padStart(
          9,
          "0"
        )}`,
        emailAlternatif: `${user.email.split("@")[0]}_alt@gmail.com`,
        alamatLengkap: `Jl. Pendidikan No. ${Math.floor(Math.random() * 100)}`,
        kelurahan: "Kelurahan Pendidikan",
        kecamatan: "Kecamatan Pendidikan",
        kabupatenKota: "Jakarta Timur",
        provinsi: "DKI Jakarta",
        kodePos: `13${String(Math.floor(Math.random() * 1000)).padStart(
          3,
          "0"
        )}`,
        pendidikanTerakhir: ["S1", "S2", "S3"][Math.floor(Math.random() * 3)],
        jurusan: [
          "Pendidikan Matematika",
          "Pendidikan Bahasa Indonesia",
          "Pendidikan IPA",
          "Pendidikan IPS",
          "Pendidikan Bahasa Inggris",
        ][Math.floor(Math.random() * 5)],
        tahunLulus: 2005 + Math.floor(Math.random() * 15),
        institusi: ["UNS", "UGM", "UI", "ITB", "UNPAD"][
          Math.floor(Math.random() * 5)
        ],
        statusKepegawaian: ["PNS", "PPPK", "GTT", "GTY"][
          Math.floor(Math.random() * 4)
        ],
        golongan: ["III/a", "III/b", "III/c", "III/d", "IV/a"][
          Math.floor(Math.random() * 5)
        ],
        pangkat: [
          "Penata Muda",
          "Penata Muda Tk.I",
          "Penata",
          "Penata Tk.I",
          "Pembina",
        ][Math.floor(Math.random() * 5)],
        tmt: new Date(
          2010 + Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        masaKerja: 5 + Math.floor(Math.random() * 20),
        bidangStudi: [
          "Matematika",
          "Bahasa Indonesia",
          "IPA",
          "IPS",
          "Bahasa Inggris",
          "Seni Budaya",
        ][Math.floor(Math.random() * 6)],
        walikelas: i < 6 ? `X-${i + 1}` : null,
        isProfileComplete: Math.random() > 0.2,
        userId: user.id,
      },
    });
    console.log(`Created guru profile for: ${user.name}`);
  }

  // 4. Create Siswa profiles
  console.log("Creating siswa profiles...");
  const siswaUsers = users.filter((u) => u.role === "SISWA");

  for (let i = 0; i < siswaUsers.length; i++) {
    const user = siswaUsers[i];
    await prisma.siswa.create({
      data: {
        namaLengkap: user.name,
        nisn: `${String(Math.floor(Math.random() * 1000000000)).padStart(
          10,
          "0"
        )}`,
        nik: `32${String(Math.floor(Math.random() * 100000000000000)).padStart(
          14,
          "0"
        )}`,
        tempatLahir: ["Jakarta", "Bandung", "Surabaya", "Medan", "Semarang"][
          Math.floor(Math.random() * 5)
        ],
        tanggalLahir: new Date(
          2005 + Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        jenisKelamin: Math.random() > 0.5 ? "LAKI_LAKI" : "PEREMPUAN",
        agama: [
          Agama.ISLAM,
          Agama.KRISTEN,
          Agama.KATOLIK,
          Agama.HINDU,
          Agama.BUDDHA,
        ][Math.floor(Math.random() * 5)],
        noHp: `08${String(Math.floor(Math.random() * 1000000000)).padStart(
          9,
          "0"
        )}`,
        emailAlternatif: `${user.email.split("@")[0]}_alt@gmail.com`,
        alamatLengkap: `Jl. Siswa No. ${Math.floor(Math.random() * 200)}`,
        kelurahan: "Kelurahan Siswa",
        kecamatan: "Kecamatan Siswa",
        kabupatenKota: "Jakarta Selatan",
        provinsi: "DKI Jakarta",
        kodePos: `12${String(Math.floor(Math.random() * 1000)).padStart(
          3,
          "0"
        )}`,
        tahunMasuk: 2020 + Math.floor(Math.random() * 4),
        namaAyah: `Ayah ${user.name}`,
        namaIbu: `Ibu ${user.name}`,
        pekerjaanAyah: ["Karyawan", "Wiraswasta", "PNS", "TNI/Polri", "Guru"][
          Math.floor(Math.random() * 5)
        ],
        pekerjaanIbu: [
          "Ibu Rumah Tangga",
          "Karyawan",
          "Wiraswasta",
          "PNS",
          "Guru",
        ][Math.floor(Math.random() * 5)],
        noHpOrtu: `08${String(Math.floor(Math.random() * 1000000000)).padStart(
          9,
          "0"
        )}`,
        isProfileComplete: Math.random() > 0.3,
        userId: user.id,
      },
    });
    console.log(`Created siswa profile for: ${user.name}`);
  }

  console.log("Database seeding completed!");
  console.log(
    `Total created: 1 Admin, ${guruUsers.length} Guru, ${siswaUsers.length} Siswa`
  );
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
