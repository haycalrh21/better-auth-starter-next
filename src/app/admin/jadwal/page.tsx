import AdminLayout from "../layout/layout";

import { DataTable, TableColumn } from "./_components/table-reusable-jadwal";

import RandomScheduleModal from "./_components/modalRandomSchedule";
import {
  getDataJadwal,
  getDataKelasWithoutSchedule,
} from "./actions/jadwalActions";

export default async function JadwalPage() {
  const dataJadwal = await getDataJadwal();
  const availableKelas = await getDataKelasWithoutSchedule();
  console.log(dataJadwal, "jadwal kelas");
  // Define columns for the data table
  const columns: TableColumn[] = [
    {
      key: "hari",
      label: "Hari",
      sortable: true,
      type: "day",
    },
    {
      key: "jamMulai",
      label: "Jam Mulai",
      sortable: true,
      type: "time",
    },
    {
      key: "jamSelesai",
      label: "Jam Selesai",
      sortable: true,
      type: "time",
    },
    {
      key: "kelas",
      label: "Kelas",
      sortable: true,
      type: "text",
    },
    {
      key: "guru",
      label: "Guru",
      sortable: true,
      type: "text",
    },
    {
      key: "mataPelajaran",
      label: "Mata Pelajaran",
      sortable: true,
      type: "text",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        {/* Header dengan tombol Add New Jadwal */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Jadwal</h1>
          <div className="flex gap-2">
            <RandomScheduleModal availableKelas={availableKelas} />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={dataJadwal}
          columns={columns}
          searchKey="hari"
          searchPlaceholder="Filter berdasarkan hari..."
          showSelection={true}
          showColumnToggle={true}
          showActions={true}
        />
      </div>
    </AdminLayout>
  );
}
