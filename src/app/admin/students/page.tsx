import AdminLayout from "../layout/layout";

import {
  DataTableSiswa,
  TableColumn,
} from "./_components/table-reusable-siswa";
import CreateAccountStudentsModal from "./_components/modalCreateAcoount";
import { getDataGuru } from "./actions/dataGuru";

export default async function Page() {
  const dataGuru = await getDataGuru();

  // Definisikan kolom yang ingin ditampilkan dengan type yang fleksibel
  const columns: TableColumn<(typeof dataGuru)[0]>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      type: "text",
    },
    {
      key: "userId",
      label: "User ID",
      sortable: true,
      type: "text",
    },
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
      key: "nisn",
      label: "NISN",
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
      key: "alamatLengkap",
      label: "Alamat",
      sortable: false,
      type: "truncate",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Account */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
          <CreateAccountStudentsModal />
        </div>

        {/* Data Table */}
        <DataTableSiswa
          data={dataGuru}
          columns={columns}
          searchKey="namaLengkap"
          searchPlaceholder="Filter nama siswa..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}
