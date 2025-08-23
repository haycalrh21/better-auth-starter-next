"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import type { MonthlyAttendanceReport } from "@/interface/absensi";
import { StatusAbsensi } from "@/interface/enums";
import { getClassAttendance } from "../actions/getClassAttendance";

interface AttendanceHistoryProps {
  kelasId: string;
  namaKelas: string;
}

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const statusColors = {
  [StatusAbsensi.HADIR]: "bg-green-500",
  [StatusAbsensi.SAKIT]: "bg-yellow-500",
  [StatusAbsensi.IZIN]: "bg-blue-500",
  [StatusAbsensi.ALFA]: "bg-red-500",
};

const statusLabels = {
  [StatusAbsensi.HADIR]: "H",
  [StatusAbsensi.SAKIT]: "S",
  [StatusAbsensi.IZIN]: "I",
  [StatusAbsensi.ALFA]: "A",
};

export function AttendanceHistory({
  kelasId,
  namaKelas,
}: AttendanceHistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const result = await getClassAttendance(
        kelasId,
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );

      if (result.success) {
        setAttendanceData(result.data);
      }
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear, kelasId]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  const getStatusBadge = (status: StatusAbsensi) => (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Absensi
          </CardTitle>
          <CardDescription>
            Lihat riwayat absensi siswa kelas {namaKelas}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Data */}
      {attendanceData && (
        <>
          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {attendanceData.totalSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Pertemuan
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {attendanceData.report.students.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Siswa</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {attendanceData.report.students.reduce(
                        (avg: number, student: any) =>
                          avg + student.summary.persentaseKehadiran,
                        0
                      ) / attendanceData.report.students.length || 0}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rata-rata Kehadiran
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Detail Absensi - {monthNames[parseInt(selectedMonth) - 1]}{" "}
                    {selectedYear}
                  </CardTitle>
                  <CardDescription>
                    Rekap kehadiran siswa per tanggal
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceData.report.students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Belum ada data absensi untuk periode ini
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Legend */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(StatusAbsensi.HADIR)}
                      <span>Hadir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(StatusAbsensi.SAKIT)}
                      <span>Sakit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(StatusAbsensi.IZIN)}
                      <span>Izin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(StatusAbsensi.ALFA)}
                      <span>Alfa</span>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="space-y-4">
                    {attendanceData.report.students.map((student: any) => (
                      <Card key={student.siswaId} className="p-4">
                        <div className="space-y-3">
                          {/* Student Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {student.namaLengkap}
                              </h4>
                              {student.nisn && (
                                <p className="text-sm text-muted-foreground">
                                  NISN: {student.nisn}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {student.summary.persentaseKehadiran}% Kehadiran
                              </div>
                              <Progress
                                value={student.summary.persentaseKehadiran}
                                className="w-20 h-2"
                              />
                            </div>
                          </div>

                          {/* Attendance Grid */}
                          <div className="flex flex-wrap gap-1">
                            {student.attendanceData.map(
                              (attendance: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center gap-1"
                                  title={`${format(
                                    new Date(attendance.tanggal),
                                    "dd MMM",
                                    { locale: id }
                                  )} - ${attendance.status}${
                                    attendance.keterangan
                                      ? `: ${attendance.keterangan}`
                                      : ""
                                  }`}
                                >
                                  <div className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(attendance.tanggal),
                                      "dd",
                                      { locale: id }
                                    )}
                                  </div>
                                  {getStatusBadge(attendance.status)}
                                </div>
                              )
                            )}
                          </div>

                          {/* Summary */}
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>H: {student.summary.totalHadir}</span>
                            <span>S: {student.summary.totalSakit}</span>
                            <span>I: {student.summary.totalIzin}</span>
                            <span>A: {student.summary.totalAlfa}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
