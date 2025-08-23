"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Users,
  Search,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusAbsensi } from "@/interface/enums";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { saveBulkAbsensi } from "../actions/editAbsensiGuru";
import { getAttendanceByMonthClass } from "../actions/editAbsensiGuru";

interface StudentAttendanceInputProps {
  kelas: any[];
}

interface Student {
  id: string;
  namaLengkap: string;
  nisn: string | null;
}

interface StudentAttendance {
  siswaId: string;
  status: StatusAbsensi;
  keterangan?: string;
}

const attendanceInputSchema = z.object({
  kelasId: z.string().min(1, "Pilih kelas terlebih dahulu"),
  tanggal: z.date(),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020).max(2030),
});

type AttendanceInputForm = z.infer<typeof attendanceInputSchema>;

const statusLabels = {
  HADIR: "Hadir",
  SAKIT: "Sakit",
  IZIN: "Izin",
  ALFA: "Alfa",
};

const statusColors = {
  HADIR: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  SAKIT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  IZIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ALFA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function StudentAttendanceInput({
  kelas,
}: StudentAttendanceInputProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [studentAttendance, setStudentAttendance] = useState<
    Map<string, StudentAttendance>
  >(new Map());
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentDate = new Date();
  const form = useForm<AttendanceInputForm>({
    resolver: zodResolver(attendanceInputSchema),
    defaultValues: {
      kelasId: "",
      tanggal: currentDate,
      bulan: currentDate.getMonth() + 1,
      tahun: currentDate.getFullYear(),
    },
  });

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
      form.setValue("kelasId", selectedClass);
    }
  }, [selectedClass, form]);

  // Update month and year when date changes
  useEffect(() => {
    const selectedDate = form.watch("tanggal");
    if (selectedDate) {
      form.setValue("bulan", selectedDate.getMonth() + 1);
      form.setValue("tahun", selectedDate.getFullYear());
    }
  }, [form.watch("tanggal"), form]);

  const loadStudents = async (kelasId: string) => {
    setIsLoadingStudents(true);
    try {
      // Get students from the selected class
      const result = await getAttendanceByMonthClass({
        kelasId,
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
      });

      if (result.success && result.data) {
        setStudents(result.data.kelas.siswa || []);
      } else {
        toast.error("Gagal memuat daftar siswa");
        setStudents([]);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat siswa");
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    const newAttendance = new Map(studentAttendance);

    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
      newAttendance.delete(studentId);
    } else {
      newSelected.add(studentId);
      newAttendance.set(studentId, {
        siswaId: studentId,
        status: StatusAbsensi.HADIR,
        keterangan: "",
      });
    }

    setSelectedStudents(newSelected);
    setStudentAttendance(newAttendance);
  };

  const handleStatusChange = (studentId: string, status: StatusAbsensi) => {
    const newAttendance = new Map(studentAttendance);
    const current = newAttendance.get(studentId);
    if (current) {
      newAttendance.set(studentId, {
        ...current,
        status,
        keterangan:
          status === StatusAbsensi.SAKIT || status === StatusAbsensi.IZIN
            ? current.keterangan
            : "",
      });
      setStudentAttendance(newAttendance);
    }
  };

  const handleKeteranganChange = (studentId: string, keterangan: string) => {
    const newAttendance = new Map(studentAttendance);
    const current = newAttendance.get(studentId);
    if (current) {
      newAttendance.set(studentId, {
        ...current,
        keterangan,
      });
      setStudentAttendance(newAttendance);
    }
  };

  const handleSelectAll = (status?: StatusAbsensi) => {
    const filteredStudents = students.filter(
      (student) =>
        student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchTerm))
    );

    if (selectedStudents.size === filteredStudents.length && !status) {
      // Unselect all
      setSelectedStudents(new Set());
      setStudentAttendance(new Map());
    } else {
      // Select all filtered students
      const newSelected = new Set(filteredStudents.map((s) => s.id));
      const newAttendance = new Map();

      filteredStudents.forEach((student) => {
        newAttendance.set(student.id, {
          siswaId: student.id,
          status: status || StatusAbsensi.HADIR,
          keterangan: "",
        });
      });

      setSelectedStudents(newSelected);
      setStudentAttendance(newAttendance);
    }
  };

  const onSubmit = async (data: AttendanceInputForm) => {
    if (selectedStudents.size === 0) {
      toast.error("Pilih minimal satu siswa untuk diabsen");
      return;
    }

    // Validate that students with SAKIT or IZIN have keterangan
    const invalidAttendance = Array.from(selectedStudents).filter(
      (studentId) => {
        const attendance = studentAttendance.get(studentId);
        return (
          attendance &&
          (attendance.status === StatusAbsensi.SAKIT ||
            attendance.status === StatusAbsensi.IZIN) &&
          (!attendance.keterangan || attendance.keterangan.trim() === "")
        );
      }
    );

    if (invalidAttendance.length > 0) {
      toast.error("Status SAKIT dan IZIN harus dilengkapi dengan keterangan");
      return;
    }

    setIsSubmitting(true);

    try {
      const attendanceData = Array.from(selectedStudents).map((studentId) => {
        const attendance = studentAttendance.get(studentId)!;
        return {
          siswaId: studentId,
          status: attendance.status,
          keterangan: attendance.keterangan || undefined,
        };
      });

      const result = await saveBulkAbsensi({
        ...data,
        absensiData: attendanceData,
      });

      if (result.success) {
        toast.success(
          `Berhasil menyimpan absensi untuk ${attendanceData.length} siswa`
        );

        // Reset selections but keep class and date
        setSelectedStudents(new Set());
        setStudentAttendance(new Map());
        setSearchTerm("");
      } else {
        toast.error(result.error || "Gagal menyimpan absensi siswa");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nisn && student.nisn.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Step 1: Select Class and Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            1. Pilih Kelas & Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas untuk diabsen" />
                </SelectTrigger>
                <SelectContent>
                  {kelas.map((kelasItem) => (
                    <SelectItem key={kelasItem.id} value={kelasItem.id}>
                      {kelasItem.namaKelas} - {kelasItem.tahunAjaran}
                      <span className="text-muted-foreground ml-2">
                        ({kelasItem._count?.siswa || 0} siswa)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Absensi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !form.watch("tanggal") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("tanggal") ? (
                      format(form.watch("tanggal"), "dd/MM/yyyy")
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("tanggal")}
                    onSelect={(date) =>
                      form.setValue("tanggal", date || new Date())
                    }
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Students and Mark Attendance */}
      {selectedClass && students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                2. Pilih Siswa & Input Absensi
              </CardTitle>
              <Badge variant="secondary">
                {selectedStudents.size} dari {filteredStudents.length} siswa
                dipilih
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Quick Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa berdasarkan nama atau NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll()}
                  disabled={filteredStudents.length === 0}
                >
                  {selectedStudents.size === filteredStudents.length
                    ? "Batal Pilih"
                    : "Pilih Semua"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(StatusAbsensi.HADIR)}
                  disabled={filteredStudents.length === 0}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  Semua Hadir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(StatusAbsensi.ALFA)}
                  disabled={filteredStudents.length === 0}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  Semua Alfa
                </Button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoadingStudents ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Memuat daftar siswa...
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "Tidak ada siswa yang sesuai pencarian"
                      : "Tidak ada siswa di kelas ini"}
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const attendance = studentAttendance.get(student.id);
                  const isSelected = selectedStudents.has(student.id);

                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "flex flex-col gap-3 p-4 border rounded-lg",
                        isSelected &&
                          "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      )}
                    >
                      {/* Student Header */}
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleStudentToggle(student.id)
                          }
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {student.namaLengkap}
                          </p>
                          {student.nisn && (
                            <p className="text-sm text-muted-foreground">
                              NISN: {student.nisn}
                            </p>
                          )}
                        </div>

                        {isSelected && attendance && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              statusColors[attendance.status]
                            }`}
                          >
                            {statusLabels[attendance.status]}
                          </Badge>
                        )}
                      </div>

                      {/* Attendance Options */}
                      {isSelected && attendance && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`status-${student.id}`}
                              className="text-sm font-medium"
                            >
                              Status Kehadiran
                            </Label>
                            <Select
                              value={attendance.status}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  student.id,
                                  value as StatusAbsensi
                                )
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(StatusAbsensi).map(
                                  ([key, value]) => (
                                    <SelectItem key={key} value={value}>
                                      <span
                                        className={cn(
                                          "font-medium",
                                          value === StatusAbsensi.HADIR &&
                                            "text-green-700",
                                          value === StatusAbsensi.SAKIT &&
                                            "text-yellow-700",
                                          value === StatusAbsensi.IZIN &&
                                            "text-blue-700",
                                          value === StatusAbsensi.ALFA &&
                                            "text-red-700"
                                        )}
                                      >
                                        {statusLabels[value]}
                                      </span>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Keterangan for SAKIT and IZIN */}
                          {(attendance.status === StatusAbsensi.SAKIT ||
                            attendance.status === StatusAbsensi.IZIN) && (
                            <div className="space-y-1">
                              <Label
                                htmlFor={`keterangan-${student.id}`}
                                className="text-sm"
                              >
                                Keterangan{" "}
                                {attendance.status === StatusAbsensi.SAKIT
                                  ? "Sakit"
                                  : "Izin"}{" "}
                                *
                              </Label>
                              <Textarea
                                id={`keterangan-${student.id}`}
                                placeholder={`Masukkan keterangan ${
                                  attendance.status === StatusAbsensi.SAKIT
                                    ? "sakit"
                                    : "izin"
                                }...`}
                                value={attendance.keterangan || ""}
                                onChange={(e) =>
                                  handleKeteranganChange(
                                    student.id,
                                    e.target.value
                                  )
                                }
                                className="min-h-[60px]"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Button */}
            {selectedStudents.size > 0 && (
              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting || !form.formState.isValid}
                  className="w-full"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Absensi untuk {selectedStudents.size} Siswa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
