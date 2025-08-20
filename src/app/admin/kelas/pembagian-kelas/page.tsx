import { prisma } from "@/lib/prisma";
import { TableColumn } from "../../students/_components/table-reusable-siswa";
import AdminLayout from "../../layout/layout";

import CreateModalPembagianKelas from "./_component/modalPembagianKelas";
import { Guru, Kelas, Siswa } from "@/interface";
import { DataTableKelas } from "./_component/table-reusable-kelas";

export default async function Page() {
  const getDataSiswa = await prisma.siswa.findMany({
    select: {
      kelas: true,
    },
  });
  const getDataGuru = await prisma.guru.findMany({
    select: {
      kelas: true,
    },
  });
  const getDataKelas = await prisma.kelas.findMany({
    include: {
      guru: {
        select: { namaLengkap: true },
      },
      siswa: true, // ambil semua siswa
      Jadwal: true, // ambil jadwal
      Pembayaran: true, // ambil pembayaran
    },
  });

  const guruData = getDataGuru as Guru[];
  console.log("Guru Data:", guruData);
  // Type assertion to match our interface
  const siswaData = getDataSiswa as Siswa[];

  type KelasTableType = Pick<
    Kelas,
    "id" | "namaKelas" | "guruId" | "tahunAjaran" | "semester" | "jurusan"
  > & { guru: { namaLengkap: string } | null };

  const columns: TableColumn<KelasTableType>[] = [
    { key: "namaKelas", label: "Nama Kelas", sortable: true, type: "text" },
    { key: "guruId", label: "Guru ID", sortable: false, type: "text" },
    { key: "guru", label: "Nama guru", sortable: false, type: "text" },
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
        <DataTableKelas
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
