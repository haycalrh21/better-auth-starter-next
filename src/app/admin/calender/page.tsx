import AdminLayout from "../layout/layout";

import { DataTable, TableColumn } from "./_components/table-reusable-kalender";
import CalendarModal from "./_components/modalCalendar";
import { getDataKalender } from "./actions/kalenderActions";

export default async function CalenderPage() {
  const dataKalender = await getDataKalender();

  // Define columns for the data table
  const columns: TableColumn[] = [
    {
      key: "dateRange",
      label: "Rentang Tanggal",
      sortable: true,
      type: "dateRange",
    },
    {
      key: "tanggalMulai",
      label: "Tanggal Mulai",
      sortable: true,
      type: "date",
    },
    {
      key: "tanggalSelesai",
      label: "Tanggal Selesai",
      sortable: true,
      type: "date",
    },
    {
      key: "semester",
      label: "Semester",
      sortable: true,
      type: "text",
    },
    {
      key: "keterangan",
      label: "Keterangan",
      sortable: false,
      type: "truncate",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Calendar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Kalender</h1>
          <CalendarModal />
        </div>

        {/* Data Table */}
        <DataTable
          data={dataKalender}
          columns={columns}
          searchKey="keterangan"
          searchPlaceholder="Filter keterangan kalender..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}

export const metadata = {
  title: "Manajemen Kalender",
  description: "Kelola kalender dan jadwal acara",
};
