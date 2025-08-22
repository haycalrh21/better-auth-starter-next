import AdminLayout from "../layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Manajemen Kalender
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Kelola kalender dan jadwal acara sekolah
              </p>
            </div>
            <div className="flex-shrink-0">
              <CalendarModal />
            </div>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Daftar Kalender
              </CardTitle>
              <CardDescription className="text-sm">
                Semua event dan jadwal dalam sistem kalender
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="overflow-x-auto">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export const metadata = {
  title: "Manajemen Kalender",
  description: "Kelola kalender dan jadwal acara",
};
