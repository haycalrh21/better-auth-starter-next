"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Edit,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StudentGradeDialog from "./student-grade-dialog";

interface StudentListProps {
  siswa: any[];
  kelas: any;
  mataPelajaran: any[];
  penilaian: any[];
}

export default function StudentList({
  siswa,
  kelas,
  mataPelajaran,
  penilaian,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

  // Filter students based on search
  const filteredStudents = siswa.filter(
    (student) =>
      student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nisn && student.nisn.includes(searchTerm))
  );

  // Get student's grades for display
  const getStudentGrades = (studentId: string) => {
    const studentGrades = penilaian.reduce((acc: any[], assessment) => {
      const grade = assessment.nilaiSiswa.find(
        (n: any) => n.siswaId === studentId
      );
      if (grade) {
        acc.push({
          ...grade,
          penilaian: {
            id: assessment.id,
            nama: assessment.nama,
            kategori: assessment.kategori,
            nilaiMaksimal: assessment.nilaiMaksimal,
            mataPelajaran: assessment.mataPelajaran,
          },
        });
      }
      return acc;
    }, []);
    return studentGrades;
  };

  // Calculate student average
  const getStudentAverage = (studentId: string) => {
    const grades = getStudentGrades(studentId);
    if (grades.length === 0) return 0;
    const sum = grades.reduce(
      (acc: number, grade: any) => acc + grade.nilai,
      0
    );
    return Math.round((sum / grades.length) * 100) / 100;
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsGradeDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Siswa ({filteredStudents.length})
            </CardTitle>
          </div>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari siswa berdasarkan nama atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm
                  ? "Tidak ada siswa yang ditemukan"
                  : "Tidak ada siswa"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian"
                  : "Belum ada siswa di kelas ini"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredStudents.map((student) => {
                const studentGrades = getStudentGrades(student.id);
                const studentAverage = getStudentAverage(student.id);

                return (
                  <Card
                    key={student.id}
                    className="transition-all hover:shadow-md hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {student.namaLengkap}
                              </h3>
                              {student.nisn && (
                                <p className="text-sm text-muted-foreground">
                                  NISN: {student.nisn}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Penilaian</p>
                              <p className="font-medium">
                                {studentGrades.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rata-rata</p>
                              <p className="font-medium">
                                {studentAverage > 0 ? studentAverage : "-"}
                              </p>
                            </div>
                          </div>

                          {studentGrades.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                Nilai Terbaru:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {studentGrades.slice(0, 3).map((grade: any) => (
                                  <Badge
                                    key={`${grade.penilaian.id}-${student.id}`}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {grade.penilaian.mataPelajaran.nama}:{" "}
                                    {grade.nilai}
                                  </Badge>
                                ))}
                                {studentGrades.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{studentGrades.length - 3} lainnya
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentClick(student);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Grade Dialog */}
      <StudentGradeDialog
        open={isGradeDialogOpen}
        onOpenChange={setIsGradeDialogOpen}
        student={selectedStudent}
        kelas={kelas}
        mataPelajaran={mataPelajaran}
        existingGrades={
          selectedStudent ? getStudentGrades(selectedStudent.id) : []
        }
      />
    </>
  );
}
