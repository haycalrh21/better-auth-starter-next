import AdminLayout from "../layout/layout";

import { DataTable, TableColumn } from "./_components/table-reusable-siswa";
import CreateAccountStudentsModal from "./_components/modalCreateAcoount";
import { getDataSiswa } from "./actions/dataSiswa";

export default async function Page() {
  const dataSiswa = await getDataSiswa();
  // console.log("Data Siswa:", dataSiswa);
  // ambil langsung tipe dari dataSiswa
  type DataSiswaType = typeof dataSiswa extends (infer U)[] ? U : never;

  // Definisikan kolom yang ingin ditampilkan dengan type yang fleksibel
  const columns: TableColumn<DataSiswaType>[] = [
    {
      key: "kelas.namaKelas", // ✅ ambil nama dari object kelas
      label: "Kelas",
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
        <DataTable
          data={dataSiswa}
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
