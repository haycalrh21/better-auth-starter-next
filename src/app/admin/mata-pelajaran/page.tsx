import AdminLayout from "../layout/layout";

import {
  DataTable,
  TableColumn,
} from "./_components/table-reusable-mataPelajaran";
import MataPelajaranModal from "./_components/modalMataPelajaran";
import { getDataMataPelajaran } from "./actions/mataPelajaranActions";

export default async function MataPelajaranPage() {
  const dataMataPelajaran = await getDataMataPelajaran();

  // Define columns for the data table
  const columns: TableColumn[] = [
    {
      key: "nama",
      label: "Nama Mata Pelajaran",
      sortable: true,
      type: "text",
    },
    {
      key: "kode",
      label: "Kode",
      sortable: true,
      type: "text",
    },
    {
      key: "guru.namaLengkap",
      label: "Guru Pengampu",
      sortable: true,
      type: "text",
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      sortable: false,
      type: "truncate",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Mata Pelajaran */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Mata Pelajaran</h1>
          <MataPelajaranModal />
        </div>

        {/* Data Table */}
        <DataTable
          data={dataMataPelajaran}
          columns={columns}
          searchKey="nama"
          searchPlaceholder="Filter nama mata pelajaran..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}

export const metadata = {
  title: "Manajemen Mata Pelajaran",
  description: "Kelola mata pelajaran dan guru pengampu",
};
