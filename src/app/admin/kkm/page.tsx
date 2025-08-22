import AdminLayout from "../layout/layout";

import { DataTable, TableColumn } from "./_components/table-reusable-kkm";
import KKMModal from "./_components/modalKkm";
import { getDataKKM } from "./actions/kkmActions";

export default async function KKMPage() {
  const dataKKM = await getDataKKM();

  // Define the type for table data
  type DataKKMType = typeof dataKKM extends (infer U)[] ? U : never;

  // Define columns for the data table
  const columns: TableColumn[] = [
    {
      key: "MataPelajaran.kode",
      label: "Kode",
      sortable: true,
      type: "text",
    },
    {
      key: "MataPelajaran.nama",
      label: "Mata Pelajaran",
      sortable: true,
      type: "text",
    },
    {
      key: "MataPelajaran.guru.namaLengkap",
      label: "Guru Pengampu",
      sortable: true,
      type: "text",
    },
    {
      key: "nilai",
      label: "Nilai KKM",
      sortable: true,
      type: "number",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New KKM */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manajemen KKM</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kriteria Ketuntasan Minimal untuk setiap mata pelajaran
            </p>
          </div>
          <KKMModal />
        </div>

        {/* Data Table */}
        <DataTable
          data={dataKKM}
          columns={columns}
          searchKey="MataPelajaran.nama"
          searchPlaceholder="Cari mata pelajaran..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}
