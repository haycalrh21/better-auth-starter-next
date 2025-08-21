import { prisma } from "@/lib/prisma";
import { TableColumn } from "../../students/_components/table-reusable-siswa";
import AdminLayout from "../../layout/layout";

import CreateModalPembagianKelas from "./_component/modalPembagianKelas";
import { GuruWithRelations, Siswa } from "@/interface";
import { DataTable } from "./_component/table-reusable-kelas";

export default async function Page() {
  const getDataSiswa = await prisma.siswa.findMany({
    where: {
      kelas: {
        none: { id: undefined },
      },
    },
  });

  const getDataGuruRandom = await prisma.guru.findMany({
    where: {
      kelas: {
        none: { id: undefined },
      },
    },
  });

  const getDataKelas = await prisma.kelas.findMany({
    include: {
      guru: {
        select: { namaLengkap: true },
      },
      siswa: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      Jadwal: true, // ambil jadwal
      Pembayaran: true, // ambil pembayaran
    },
  });

  const guruData = getDataGuruRandom as GuruWithRelations[];
  // console.log("Guru Data:", guruData);
  // Type assertion to match our interface
  const siswaData = getDataSiswa as Siswa[];

  type KelasTableType = typeof getDataKelas extends (infer U)[] ? U : never;
  const columns: TableColumn<KelasTableType>[] = [
    { key: "namaKelas", label: "Nama Kelas", sortable: true, type: "text" },

    {
      key: "guru.namaLengkap",
      label: "Nama Guru",
      sortable: false,
      type: "text",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Account */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
          <CreateModalPembagianKelas getSiswa={siswaData} getGuru={guruData} />
        </div>

        {/* Data Table */}
        <DataTable
          data={getDataKelas}
          columns={columns}
          searchKey="namaKelas"
          searchPlaceholder="Filter nama siswa..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}
