"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  bulkAbsensiSchema,
  type BulkAbsensiInput,
} from "../schema/absensiSchema";
import { StatusAbsensi } from "@/interface/enums";
import type { KelasWithJadwal } from "@/interface/absensi";

import { validateAttendanceDate } from "../actions/validateDate";
import { submitAbsensi } from "../actions/submitAbsensi";

interface AttendanceFormProps {
  kelas: KelasWithJadwal;
}

interface StudentAttendance {
  siswaId: string;
  status: StatusAbsensi;
  keterangan?: string;
}

const statusOptions = [
  { value: StatusAbsensi.HADIR, label: "Hadir", color: "green" },
  { value: StatusAbsensi.SAKIT, label: "Sakit", color: "yellow" },
  { value: StatusAbsensi.IZIN, label: "Izin", color: "blue" },
  { value: StatusAbsensi.ALFA, label: "Alfa", color: "red" },
];

export function AttendanceForm({ kelas }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateValidation, setDateValidation] = useState<any>(null);
  const [studentAttendance, setStudentAttendance] = useState<
    Map<string, StudentAttendance>
  >(new Map());

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      setDateValidation(null);
      return;
    }

    setSelectedDate(date);

    // Validate date
    try {
      const result = await validateAttendanceDate({
        tanggal: date,
        kelasId: kelas.id,
      });

      setDateValidation(result);

      if (result.data?.validation.isHoliday) {
        toast.warning(
          `Perhatian: ${
            result.data.validation.holidayInfo?.keterangan || "Hari libur"
          }`
        );
      }
    } catch (error) {
      toast.error("Gagal validasi tanggal");
    }
  };

  const updateStudentAttendance = (
    siswaId: string,
    status: StatusAbsensi,
    keterangan?: string
  ) => {
    const newAttendance = new Map(studentAttendance);
    newAttendance.set(siswaId, { siswaId, status, keterangan });
    setStudentAttendance(newAttendance);
  };

  const setAllStudentsStatus = (status: StatusAbsensi) => {
    const newAttendance = new Map();
    kelas.siswa.forEach((siswa) => {
      newAttendance.set(siswa.id, {
        siswaId: siswa.id,
        status,
        keterangan: "",
      });
    });
    setStudentAttendance(newAttendance);
  };

  const onSubmit = () => {
    console.log("Form submit called"); // Debug log

    if (!selectedDate) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }

    if (dateValidation?.data?.validation.isHoliday) {
      toast.error("Tidak dapat mengisi absensi pada hari libur");
      return;
    }

    const attendanceRecords = Array.from(studentAttendance.values()).filter(
      (record) => record.status !== undefined
    );

    console.log("Attendance records:", attendanceRecords); // Debug log

    if (attendanceRecords.length === 0) {
      toast.error("Isi minimal satu absensi siswa");
      return;
    }

    // Validate required keterangan for SAKIT and IZIN
    const invalidRecords = attendanceRecords.filter(
      (record) =>
        (record.status === StatusAbsensi.SAKIT ||
          record.status === StatusAbsensi.IZIN) &&
        (!record.keterangan || record.keterangan.trim() === "")
    );

    if (invalidRecords.length > 0) {
      toast.error("Keterangan wajib diisi untuk status Sakit atau Izin");
      return;
    }

    const formData = {
      tanggal: selectedDate,
      kelasId: kelas.id,
      attendanceRecords,
    };

    console.log("Submitting data:", formData); // Debug log

    startTransition(async () => {
      try {
        const result = await submitAbsensi(formData);

        console.log("Submit result:", result); // Debug log

        if (result.success) {
          toast.success(result.message);
          setStudentAttendance(new Map());
          setSelectedDate(undefined);
          setDateValidation(null);
        } else {
          toast.error(result.message);
          console.error("Submit failed:", result.message);
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Terjadi kesalahan saat menyimpan absensi");
      }
    });
  };

  const getAttendanceSummary = () => {
    const summary = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      alfa: 0,
      total: studentAttendance.size,
    };

    studentAttendance.forEach((record) => {
      switch (record.status) {
        case StatusAbsensi.HADIR:
          summary.hadir++;
          break;
        case StatusAbsensi.SAKIT:
          summary.sakit++;
          break;
        case StatusAbsensi.IZIN:
          summary.izin++;
          break;
        case StatusAbsensi.ALFA:
          summary.alfa++;
          break;
      }
    });

    return summary;
  };

  const summary = getAttendanceSummary();

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Pilih Tanggal Absensi
          </CardTitle>
          <CardDescription>
            Pilih tanggal untuk mengisi absensi siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd MMMM yyyy", { locale: id })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date(
                    today.getTime() - 30 * 24 * 60 * 60 * 1000
                  );
                  const tomorrow = new Date(
                    today.getTime() + 24 * 60 * 60 * 1000
                  );
                  return date < thirtyDaysAgo || date > tomorrow;
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Date Validation Alert */}
          {dateValidation && selectedDate && (
            <div className="mt-4">
              {dateValidation.data?.validation.isHoliday ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Hari Libur:</strong>{" "}
                    {dateValidation.data.validation.holidayInfo?.keterangan ||
                      "Tidak ada keterangan"}
                    <br />
                    <span className="text-sm">
                      Tidak dapat mengisi absensi pada hari libur
                    </span>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tanggal valid untuk mengisi absensi
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedDate && !dateValidation?.data?.validation.isHoliday && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
            <CardDescription>
              Atur status absensi untuk semua siswa sekaligus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setAllStudentsStatus(option.value)}
                  className="text-xs"
                >
                  Semua {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Attendance Form */}
      {selectedDate && !dateValidation?.data?.validation.isHoliday && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Absensi Siswa
            </CardTitle>
            <CardDescription>
              Isi status kehadiran untuk setiap siswa di kelas {kelas.namaKelas}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                {kelas.siswa.map((siswa, index) => {
                  const attendance = studentAttendance.get(siswa.id);
                  const needsKeterangan =
                    attendance?.status === StatusAbsensi.SAKIT ||
                    attendance?.status === StatusAbsensi.IZIN;

                  return (
                    <div
                      key={siswa.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{siswa.namaLengkap}</p>
                          {siswa.nisn && (
                            <p className="text-sm text-muted-foreground">
                              NISN: {siswa.nisn}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>

                      {/* Status Selection */}
                      <div>
                        <Label className="text-sm font-medium">
                          Status Kehadiran
                        </Label>
                        <div className="flex gap-2 mt-2">
                          {statusOptions.map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={
                                attendance?.status === option.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateStudentAttendance(
                                  siswa.id,
                                  option.value,
                                  attendance?.keterangan
                                )
                              }
                              className="text-xs"
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Keterangan for Sakit/Izin */}
                      {needsKeterangan && (
                        <div>
                          <Label className="text-sm font-medium">
                            Keterangan <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            placeholder="Masukkan keterangan..."
                            value={attendance?.keterangan || ""}
                            onChange={(e) =>
                              updateStudentAttendance(
                                siswa.id,
                                attendance!.status,
                                e.target.value
                              )
                            }
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {summary.total > 0 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Ringkasan Absensi</h4>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Hadir: {summary.hadir}</span>
                        <span>Sakit: {summary.sakit}</span>
                        <span>Izin: {summary.izin}</span>
                        <span>Alfa: {summary.alfa}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {summary.total} / {kelas.siswa.length} siswa
                    </Badge>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isPending || summary.total === 0}
                  className="min-w-32"
                >
                  {isPending ? "Menyimpan..." : "Simpan Absensi"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
