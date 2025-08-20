import { prisma } from "@/lib/prisma";

export async function getDataGuru() {
  const data = await prisma.siswa.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}
