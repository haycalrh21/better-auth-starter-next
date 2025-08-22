"use client";

import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { TrendingUp, Shuffle, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { type PromoteStudentsInput } from "../schema";
import { promoteStudents } from "../actions/promote-students";
import { Jenjang } from "@/interface/enums";

interface PromoteStudentsModalProps {
  currentAcademicYear: string;
  currentSemester: string;
}

export default function PromoteStudentsModal({
  currentAcademicYear,
  currentSemester,
}: PromoteStudentsModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<PromoteStudentsInput>({
    fromTahunAjaran: generatePreviousAcademicYear(currentAcademicYear),
    toTahunAjaran: currentAcademicYear,
    semester: currentSemester as "1" | "2",
    jenjang: Jenjang.SMP,
    fromGrade: 7,
    toGrade: 8,
    jurusan: "",
    numberOfClasses: 1,
    randomDistribution: true,
    deactivateOldClasses: true,
  });

  const updateFormData = (field: keyof PromoteStudentsInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calculate next grade
  useEffect(() => {
    const { fromGrade, jenjang } = formData;

    if (fromGrade) {
      let nextGrade = fromGrade + 1;

      // Handle graduation
      if (jenjang === Jenjang.SMP && fromGrade === 9) {
        nextGrade = 10; // SMP to SMA
        setFormData((prev) => ({
          ...prev,
          jenjang: Jenjang.SMA,
          toGrade: nextGrade,
        }));
      } else if (nextGrade <= 12) {
        setFormData((prev) => ({ ...prev, toGrade: nextGrade }));
      }
    }
  }, [formData.fromGrade, formData.jenjang]);

  function generatePreviousAcademicYear(currentYear: string): string {
    const [startYear] = currentYear.split("/");
    const prevStart = parseInt(startYear) - 1;
    return `${prevStart}/${prevStart + 1}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, String(value));
        }
      });

      promoteStudents(submitData)
        .then((result) => {
          if ("graduatedStudents" in result) {
            toast.success(
              `${result.graduatedStudents} siswa berhasil diluluskan!`
            );
          } else {
            toast.success(
              `✅ ${result.totalPromotedStudents} siswa dan ${result.createdClasses?.length} guru berhasil dipromosikan dan diacak ulang ke kelas baru!`,
              {
                duration: 5000,
                description:
                  "Siswa dan guru telah didistribusikan secara random ke kelas baru",
              }
            );
          }
          setOpen(false);
          // Add a small delay before resetting to ensure UI updates
          setTimeout(() => {
            // Force a hard refresh to ensure data is updated
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("❌ Promotion error:", error);
          toast.error(error.message || "Gagal mempromosikan siswa");
        });
    });
  };

  const getGradeOptions = (jenjang: Jenjang) => {
    if (jenjang === Jenjang.SMP) {
      return [
        { value: 7, label: "Kelas 7" },
        { value: 8, label: "Kelas 8" },
        { value: 9, label: "Kelas 9" },
      ];
    }
    return [
      { value: 10, label: "Kelas 10" },
      { value: 11, label: "Kelas 11" },
      { value: 12, label: "Kelas 12" },
    ];
  };

  const getJurusanOptions = () => [
    { value: "IPA", label: "IPA (Ilmu Pengetahuan Alam)" },
    { value: "IPS", label: "IPS (Ilmu Pengetahuan Sosial)" },
    { value: "BAHASA", label: "Bahasa" },
  ];

  const isGraduation = formData.fromGrade === 9 || formData.fromGrade === 12;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Naik Kelas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isGraduation ? "Kelulusan Siswa" : "Promosi Naik Kelas"}
          </DialogTitle>
          <DialogDescription>
            {isGraduation
              ? "Proses kelulusan siswa dari jenjang pendidikan"
              : "Promosikan siswa ke tingkat berikutnya dengan distribusi random ke kelas baru. Siswa dan guru akan diacak ulang untuk pembagian kelas yang adil."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Academic Year Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Periode Akademik</CardTitle>
              <CardDescription>
                Tentukan periode akademik untuk proses promosi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tahun Ajaran Asal</Label>
                  <Input
                    placeholder="2023/2024"
                    value={formData.fromTahunAjaran}
                    onChange={(e) =>
                      updateFormData("fromTahunAjaran", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Tahun ajaran siswa saat ini
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tahun Ajaran Tujuan</Label>
                  <Input
                    placeholder="2024/2025"
                    value={formData.toTahunAjaran}
                    onChange={(e) =>
                      updateFormData("toTahunAjaran", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Tahun ajaran setelah promosi
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  onValueChange={(value) => updateFormData("semester", value)}
                  value={formData.semester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      Semester 1 (Januari - Juni)
                    </SelectItem>
                    <SelectItem value="2">
                      Semester 2 (Juli - Desember)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grade Progression Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progres Tingkat</CardTitle>
              <CardDescription>
                Tentukan tingkat asal dan tujuan promosi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenjang</Label>
                  <Select
                    onValueChange={(value) => updateFormData("jenjang", value)}
                    value={formData.jenjang}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Jenjang.SMP}>SMP</SelectItem>
                      <SelectItem value={Jenjang.SMA}>SMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.jenjang === Jenjang.SMA && (
                  <div className="space-y-2">
                    <Label>Jurusan</Label>
                    <Select
                      onValueChange={(value) =>
                        updateFormData("jurusan", value)
                      }
                      value={formData.jurusan || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        {getJurusanOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tingkat Asal</Label>
                  <Select
                    onValueChange={(value) =>
                      updateFormData("fromGrade", parseInt(value))
                    }
                    value={formData.fromGrade?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat asal" />
                    </SelectTrigger>
                    <SelectContent>
                      {getGradeOptions(formData.jenjang).map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tingkat Tujuan</Label>
                  <Input
                    type="number"
                    min={7}
                    max={12}
                    value={formData.toGrade}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    {isGraduation
                      ? "Siswa akan lulus"
                      : "Otomatis dihitung berdasarkan tingkat asal"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Distribution Settings */}
          {!isGraduation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pengaturan Distribusi Kelas
                </CardTitle>
                <CardDescription>
                  Tentukan cara pembagian siswa ke kelas baru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Jumlah Kelas Baru</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.numberOfClasses}
                    onChange={(e) =>
                      updateFormData(
                        "numberOfClasses",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Tentukan jumlah kelas baru yang akan dibuat
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Opsi Pengacakan
                  </h4>

                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      checked={formData.randomDistribution}
                      onCheckedChange={(checked) =>
                        updateFormData("randomDistribution", checked)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label>Distribusi Random</Label>
                      <p className="text-sm text-muted-foreground">
                        Siswa akan didistribusikan secara acak dan merata ke
                        semua kelas baru. Guru juga akan diacak ulang untuk
                        setiap kelas.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      checked={formData.deactivateOldClasses}
                      onCheckedChange={(checked) =>
                        updateFormData("deactivateOldClasses", checked)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label>Nonaktifkan Kelas Lama</Label>
                      <p className="text-sm text-muted-foreground">
                        Kelas dari tahun ajaran sebelumnya akan dinonaktifkan
                        (arsip)
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Catatan:</strong> Guru akan selalu diacak ulang
                      untuk semua kelas baru, terlepas dari pengaturan
                      distribusi siswa. Ini memastikan pembagian yang adil dan
                      kesempatan yang sama untuk semua guru.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings for graduation */}
          {isGraduation && (
            <Alert>
              <GraduationCap className="h-4 w-4" />
              <AlertTitle>Kelulusan Terdeteksi</AlertTitle>
              <AlertDescription>
                Siswa tingkat {formData.fromGrade} akan lulus dari{" "}
                {formData.jenjang}. Status mereka akan diubah menjadi "LULUS".
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending
                ? "Memproses..."
                : isGraduation
                ? "Luluskan Siswa"
                : "Promosikan Siswa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
