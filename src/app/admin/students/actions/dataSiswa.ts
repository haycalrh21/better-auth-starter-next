import { prisma } from "@/lib/prisma";

export async function getDataSiswa() {
  const data = await prisma.siswa.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      kelas: {
        select: {
          id: true,
          namaKelas: true,
        },
      },
    },
  });
  return data;
}
