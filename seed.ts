import { prisma } from "@/lib/prisma";

async function seedGuru() {
  console.log("Starting guru seeding...");

  // Ambil semua user dengan role GURU
  const guruUsers = await prisma.user.findMany({
    where: { role: "GURU" },
  });

  console.log(`Found ${guruUsers.length} GURU users`);

  for (const user of guruUsers) {
    // Cek apakah guru sudah ada
    const existingGuru = await prisma.guru.findUnique({
      where: { userId: user.id },
    });

    if (!existingGuru) {
      await prisma.guru.create({
        data: {
          namaLengkap: user.name,
          nip: `19${String(
            Math.floor(Math.random() * 10000000000000000)
          ).padStart(16, "0")}`,
          nik: `32${String(
            Math.floor(Math.random() * 100000000000000)
          ).padStart(14, "0")}`,
          tempatLahir: "Jakarta",
          tanggalLahir: new Date(
            1980 + Math.floor(Math.random() * 20),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          jenisKelamin: Math.random() > 0.5 ? "LAKI_LAKI" : "PEREMPUAN",
          agama: ["ISLAM", "KRISTEN", "KATOLIK"][
            Math.floor(Math.random() * 3)
          ] as any,
          statusKawin: ["BELUM_KAWIN", "KAWIN"][
            Math.floor(Math.random() * 2)
          ] as any,
          noHp: `08${String(Math.floor(Math.random() * 1000000000)).padStart(
            9,
            "0"
          )}`,
          emailAlternatif: `${user.email.split("@")[0]}_alt@gmail.com`,
          alamatLengkap: `Jl. Pendidikan No. ${Math.floor(
            Math.random() * 100
          )}`,
          kelurahan: "Kelurahan Pendidikan",
          kecamatan: "Kecamatan Pendidikan",
          kabupatenKota: "Jakarta Timur",
          provinsi: "DKI Jakarta",
          kodePos: `13${String(Math.floor(Math.random() * 1000)).padStart(
            3,
            "0"
          )}`,
          pendidikanTerakhir: ["S1", "S2"][Math.floor(Math.random() * 2)],
          jurusan: [
            "Pendidikan Matematika",
            "Pendidikan Bahasa Indonesia",
            "Pendidikan IPA",
          ][Math.floor(Math.random() * 3)],
          tahunLulus: 2005 + Math.floor(Math.random() * 15),
          institusi: ["UNS", "UGM", "UI"][Math.floor(Math.random() * 3)],
          statusKepegawaian: ["PNS", "PPPK", "GTT"][
            Math.floor(Math.random() * 3)
          ],
          golongan: ["III/a", "III/b", "III/c"][Math.floor(Math.random() * 3)],
          pangkat: ["Penata Muda", "Penata", "Penata Tk.I"][
            Math.floor(Math.random() * 3)
          ],
          tmt: new Date(
            2010 + Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          masaKerja: 5 + Math.floor(Math.random() * 20),
          bidangStudi: ["Matematika", "Bahasa Indonesia", "IPA"][
            Math.floor(Math.random() * 3)
          ],
          walikelas: [
            `X-${Math.floor(Math.random() * 3) + 1}`,
            `XI-${Math.floor(Math.random() * 3) + 1}`,
          ][Math.floor(Math.random() * 2)],
          isProfileComplete: Math.random() > 0.3, // 70% complete
          userId: user.id,
        },
      });
      console.log(`Created guru for user: ${user.name}`);
    } else {
      console.log(`Guru already exists for user: ${user.name}`);
    }
  }

  console.log("Guru seeding completed!");
}

seedGuru()
  .catch((error) => {
    console.error("Error seeding guru:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
