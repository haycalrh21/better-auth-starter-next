"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  Download,
  UserCheck,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

import { GuruWithRelations } from "@/interface";
import { bulkGuruSchema } from "../schema";
import type { BulkGuruInput } from "../schema";
import {
  processBulkGuruOperations,
  getAvailableClasses,
  getAvailableSubjects,
} from "../actions/bulk-operations";

interface BulkOperationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeachers: GuruWithRelations[];
  onSuccess?: () => void;
}

type OperationType =
  | "assign_class"
  | "assign_subject"
  | "update_status"
  | "export";

interface ClassOption {
  id: string;
  namaKelas: string;
  tahunAjaran: string;
  semester: string;
  _count: {
    siswa: number;
  };
}

interface SubjectOption {
  id: string;
  nama: string;
  kode: string | null;
}

export default function BulkOperationsModal({
  open,
  onOpenChange,
  selectedTeachers,
  onSuccess,
}: BulkOperationsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeOperation, setActiveOperation] =
    useState<OperationType>("assign_class");
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(bulkGuruSchema),
    defaultValues: {
      operation: "assign_class",
      teacherIds: selectedTeachers.map((t) => t.id),
      includePersonalData: true,
      includeEmploymentData: true,
      includeEducationData: true,
      exportFormat: "xlsx",
    },
  });

  const watchedOperation = watch("operation");

  // Load available data when modal opens
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.all([getAvailableClasses(), getAvailableSubjects()])
        .then(([classesResult, subjectsResult]) => {
          if (classesResult.success && classesResult.data) {
            setAvailableClasses(classesResult.data);
          }
          if (subjectsResult.success && subjectsResult.data) {
            setAvailableSubjects(subjectsResult.data);
          }
          setLoadingData(false);
        })
        .catch(() => {
          setLoadingData(false);
          toast.error("Gagal memuat data");
        });
    }
  }, [open]);

  // Update form when operation changes
  useEffect(() => {
    if (watchedOperation !== activeOperation) {
      setActiveOperation(watchedOperation);
    }
  }, [watchedOperation, activeOperation]);

  // Reset form when teachers selection changes
  useEffect(() => {
    reset({
      operation: activeOperation,
      teacherIds: selectedTeachers.map((t) => t.id),
      includePersonalData: true,
      includeEmploymentData: true,
      includeEducationData: true,
      exportFormat: "xlsx",
    });
  }, [selectedTeachers, activeOperation, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await processBulkGuruOperations(data);

      if (result.success) {
        toast.success(
          (result as any).message || "Operasi bulk berhasil dijalankan"
        );
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Gagal menjalankan operasi bulk");
      }
    } catch (error) {
      console.error("Bulk operation error:", error);
      toast.error("Terjadi kesalahan saat menjalankan operasi bulk");
    } finally {
      setIsLoading(false);
    }
  };

  const getOperationIcon = (operation: OperationType) => {
    switch (operation) {
      case "assign_class":
        return <Users className="h-4 w-4" />;
      case "assign_subject":
        return <BookOpen className="h-4 w-4" />;
      case "update_status":
        return <UserCheck className="h-4 w-4" />;
      case "export":
        return <Download className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getOperationTitle = (operation: OperationType) => {
    switch (operation) {
      case "assign_class":
        return "Tugaskan ke Kelas";
      case "assign_subject":
        return "Tugaskan Mata Pelajaran";
      case "update_status":
        return "Update Status Kepegawaian";
      case "export":
        return "Ekspor Data";
      default:
        return "Operasi Bulk";
    }
  };

  const getOperationDescription = (operation: OperationType) => {
    switch (operation) {
      case "assign_class":
        return "Tugaskan guru terpilih ke kelas tertentu";
      case "assign_subject":
        return "Tugaskan mata pelajaran ke guru terpilih";
      case "update_status":
        return "Perbarui status kepegawaian guru terpilih";
      case "export":
        return "Ekspor data guru terpilih ke file";
      default:
        return "Jalankan operasi pada guru terpilih";
    }
  };

  if (selectedTeachers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tidak Ada Guru Terpilih
            </DialogTitle>
            <DialogDescription>
              Silakan pilih minimal satu guru untuk melakukan operasi bulk.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getOperationIcon(activeOperation)}
            Operasi Bulk - {getOperationTitle(activeOperation)}
          </DialogTitle>
          <DialogDescription>
            {getOperationDescription(activeOperation)} untuk{" "}
            {selectedTeachers.length} guru terpilih
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Memuat data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selected Teachers Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guru Terpilih ({selectedTeachers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {selectedTeachers.map((teacher) => (
                    <Badge
                      key={teacher.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {teacher.namaLengkap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operation Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Pilih Operasi</Label>
              <Controller
                name="operation"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih operasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_class">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Tugaskan ke Kelas
                        </div>
                      </SelectItem>
                      <SelectItem value="assign_subject">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Tugaskan Mata Pelajaran
                        </div>
                      </SelectItem>
                      <SelectItem value="update_status">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Update Status Kepegawaian
                        </div>
                      </SelectItem>
                      <SelectItem value="export">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Ekspor Data
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.operation && (
                <p className="text-sm text-red-500">
                  {String(errors.operation.message)}
                </p>
              )}
            </div>

            {/* Operation-specific forms */}
            <Tabs value={activeOperation} className="w-full">
              {/* Assign to Class */}
              <TabsContent value="assign_class" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pilih Kelas</CardTitle>
                    <CardDescription>
                      Pilih kelas untuk menugaskan guru terpilih
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Controller
                      name="kelasId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClasses.map((kelas) => (
                              <SelectItem key={kelas.id} value={kelas.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {kelas.namaKelas}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {kelas.tahunAjaran} - Semester{" "}
                                    {kelas.semester} •{kelas._count.siswa} siswa
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.kelasId && (
                      <p className="text-sm text-red-500 mt-1">
                        {String(errors.kelasId.message)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assign Subject */}
              <TabsContent value="assign_subject" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Pilih Mata Pelajaran
                    </CardTitle>
                    <CardDescription>
                      Pilih mata pelajaran untuk ditugaskan ke guru terpilih
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Controller
                      name="mataPelajaranId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {subject.nama}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Kode: {subject.kode || "-"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.mataPelajaranId && (
                      <p className="text-sm text-red-500 mt-1">
                        {String(errors.mataPelajaranId.message)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Update Status */}
              <TabsContent value="update_status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Update Status Kepegawaian
                    </CardTitle>
                    <CardDescription>
                      Perbarui status kepegawaian guru terpilih. Kosongkan field
                      yang tidak ingin diubah.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status Kepegawaian</Label>
                      <Input
                        {...register("newStatusKepegawaian")}
                        placeholder="Contoh: PNS, GTY, GTT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Golongan</Label>
                      <Input
                        {...register("newGolongan")}
                        placeholder="Contoh: III/a, IV/b"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pangkat</Label>
                      <Input
                        {...register("newPangkat")}
                        placeholder="Contoh: Penata Muda, Pembina"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Export Data */}
              <TabsContent value="export" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Pengaturan Ekspor
                    </CardTitle>
                    <CardDescription>
                      Konfigurasi format dan data yang akan diekspor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Format Ekspor</Label>
                      <Controller
                        name="exportFormat"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xlsx">
                                Excel (.xlsx)
                              </SelectItem>
                              <SelectItem value="csv">CSV (.csv)</SelectItem>
                              <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Data yang Disertakan</Label>
                      <div className="space-y-2">
                        <Controller
                          name="includePersonalData"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="personal"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor="personal" className="text-sm">
                                Data Personal (NIK, Alamat, dll)
                              </Label>
                            </div>
                          )}
                        />
                        <Controller
                          name="includeEmploymentData"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="employment"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor="employment" className="text-sm">
                                Data Kepegawaian (Status, Golongan, dll)
                              </Label>
                            </div>
                          )}
                        />
                        <Controller
                          name="includeEducationData"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="education"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor="education" className="text-sm">
                                Data Pendidikan (Pendidikan Terakhir, dll)
                              </Label>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Jalankan Operasi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
