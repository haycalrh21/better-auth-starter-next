"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AttendanceListProps {
  attendanceRecords: any[];
}

const formatDate = (date: Date | string) => {
  try {
    return format(new Date(date), "dd MMM yyyy", { locale: id });
  } catch {
    return "-";
  }
};

const statusColors = {
  HADIR: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  SAKIT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  IZIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ALFA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels = {
  HADIR: "Hadir",
  SAKIT: "Sakit",
  IZIN: "Izin",
  ALFA: "Alfa",
};

export default function AttendanceList({
  attendanceRecords,
}: AttendanceListProps) {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Clock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum ada data absensi</h3>
        <p className="text-muted-foreground">
          Mulai input absensi siswa untuk kelas Anda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{record.siswa?.namaLengkap || "-"}</p>
                      {record.siswa?.nisn && (
                        <p className="text-xs text-muted-foreground">
                          NISN: {record.siswa.nisn}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{record.kelas?.namaKelas || "-"}</TableCell>
                <TableCell>{formatDate(record.tanggal)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      statusColors[record.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[record.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{record.keterangan || "-"}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Absensi
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {attendanceRecords.map((record) => (
          <div key={record.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">
                      {record.siswa?.namaLengkap || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {record.kelas?.namaKelas}
                    </p>
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  statusColors[record.status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[record.status as keyof typeof statusLabels]}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tanggal:</span>
                <p className="font-medium">{formatDate(record.tanggal)}</p>
              </div>
              {record.siswa?.nisn && (
                <div>
                  <span className="text-muted-foreground">NISN:</span>
                  <p className="font-medium">{record.siswa.nisn}</p>
                </div>
              )}
              {record.keterangan && (
                <div>
                  <span className="text-muted-foreground">Keterangan:</span>
                  <p className="font-medium">{record.keterangan}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Detail
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
