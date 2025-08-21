import { prisma } from "@/lib/prisma";
import AdminLayout from "../layout/layout";

import { DataTable, TableColumn } from "./_component/table-reusable";
import CreateAccountModal from "./_component/modalCreateAcoount";

export default async function Page() {
  const getDataGuru = await prisma.guru.findMany({
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

  console.log("Data Guru:", getDataGuru);
  type DataSiswaType = typeof getDataGuru extends (infer U)[] ? U : never;
  // Definisikan kolom yang ingin ditampilkan dengan type yang fleksibel
  const columns: TableColumn<DataSiswaType>[] = [
    {
      key: "namaLengkap",
      label: "Nama Lengkap",
      sortable: true,
      type: "text",
    },
    {
      key: "emailAlternatif",
      label: "Email",
      sortable: true,
      type: "email",
    },
    {
      key: "nip",
      label: "NIP",
      sortable: true,
      type: "text",
    },
    {
      key: "noHp",
      label: "No. Telepon",
      sortable: false,
      type: "text",
    },
    {
      key: "kelas.namaKelas",
      label: "kelas",
      sortable: true,
      type: "truncate",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Account */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Guru</h1>
          <CreateAccountModal />
        </div>

        {/* Data Table */}

        <DataTable
          data={getDataGuru}
          columns={columns}
          searchKey="namaLengkap"
          searchPlaceholder="Filter nama guru..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}
