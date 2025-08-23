"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Award,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  createPenilaian,
  saveBulkNilai,
} from "../../actions/editPenilaianGuru";

const gradeInputSchema = z.object({
  nama: z.string().min(1, "Nama penilaian harus diisi"),
  kategori: z.enum(["Umum", "UTS", "UAS", "Ulangan Harian"]),
  tanggalPenilaian: z.date(),
  nilaiMaksimal: z.number().min(1),
  mataPelajaranId: z.string().min(1, "Mata pelajaran harus dipilih"),
  nilai: z.number().min(0, "Nilai tidak boleh negatif"),
  catatan: z.string().optional(),
});

type GradeInputForm = z.infer<typeof gradeInputSchema>;

interface StudentGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  kelas: any;
  mataPelajaran: any[];
  existingGrades: any[];
}

const kategoriColors = {
  Umum: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  UTS: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  UAS: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Ulangan Harian":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function StudentGradeDialog({
  open,
  onOpenChange,
  student,
  kelas,
  mataPelajaran,
  existingGrades,
}: StudentGradeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [editingGrade, setEditingGrade] = useState<any>(null);

  const form = useForm<GradeInputForm>({
    resolver: zodResolver(gradeInputSchema),
    defaultValues: {
      nama: "",
      kategori: undefined,
      tanggalPenilaian: new Date(),
      nilaiMaksimal: 100,
      mataPelajaranId: "",
      nilai: 0,
      catatan: "",
    },
  });

  useEffect(() => {
    if (mode === "add") {
      form.reset({
        nama: "",
        kategori: undefined,
        tanggalPenilaian: new Date(),
        nilaiMaksimal: 100,
        mataPelajaranId: "",
        nilai: 0,
        catatan: "",
      });
    } else if (mode === "edit" && editingGrade) {
      form.reset({
        nama: editingGrade.penilaian.nama,
        kategori: editingGrade.penilaian.kategori,
        tanggalPenilaian: new Date(editingGrade.penilaian.tanggalPenilaian),
        nilaiMaksimal: editingGrade.penilaian.nilaiMaksimal,
        mataPelajaranId: editingGrade.penilaian.mataPelajaran.id,
        nilai: editingGrade.nilai,
        catatan: editingGrade.catatan || "",
      });
    }
  }, [mode, editingGrade, form]);

  const onSubmit = async (data: GradeInputForm) => {
    if (!student || !kelas) return;

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        // Create new assessment and grade
        const assessmentResult = await createPenilaian({
          ...data,
          kelasId: kelas.id,
        });

        if (!assessmentResult.success || !assessmentResult.data) {
          toast.error(assessmentResult.error || "Gagal membuat penilaian");
          return;
        }

        // Save the grade for this student
        const gradeResult = await saveBulkNilai({
          penilaianId: assessmentResult.data.id,
          nilaiData: [
            {
              siswaId: student.id,
              nilai: data.nilai,
            },
          ],
        });

        if (gradeResult.success) {
          toast.success("Penilaian dan nilai berhasil ditambahkan");
          setMode("view");
          onOpenChange(false);
          // Refresh page
          window.location.reload();
        } else {
          toast.error(gradeResult.error || "Gagal menyimpan nilai");
        }
      } else if (mode === "edit") {
        // Update existing grade
        const gradeResult = await saveBulkNilai({
          penilaianId: editingGrade.penilaian.id,
          nilaiData: [
            {
              siswaId: student.id,
              nilai: data.nilai,
            },
          ],
        });

        if (gradeResult.success) {
          toast.success("Nilai berhasil diperbarui");
          setMode("view");
          setEditingGrade(null);
          // Refresh page
          window.location.reload();
        } else {
          toast.error(gradeResult.error || "Gagal memperbarui nilai");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGrade = (grade: any) => {
    setEditingGrade(grade);
    setMode("edit");
  };

  const handleAddGrade = () => {
    setEditingGrade(null);
    setMode("add");
  };

  const handleCancel = () => {
    setMode("view");
    setEditingGrade(null);
    form.reset();
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Penilaian - {student.namaLengkap}
          </DialogTitle>
          <DialogDescription>
            {student.nisn && `NISN: ${student.nisn} • `}
            Kelas {kelas?.namaKelas}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {mode === "view" && (
            <>
              {/* Existing Grades */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Nilai Siswa</h3>
                  <Button onClick={handleAddGrade}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Nilai
                  </Button>
                </div>

                {existingGrades.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        Belum ada nilai
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Belum ada nilai untuk siswa ini
                      </p>
                      <Button onClick={handleAddGrade}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Nilai Pertama
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {existingGrades.map((grade) => (
                      <Card key={`${grade.penilaian.id}-${student.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {grade.penilaian.nama}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    kategoriColors[
                                      grade.penilaian
                                        .kategori as keyof typeof kategoriColors
                                    ] || "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {grade.penilaian.kategori}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {grade.penilaian.mataPelajaran.nama}
                                {grade.penilaian.mataPelajaran.kode &&
                                  ` (${grade.penilaian.mataPelajaran.kode})`}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium">
                                  Nilai: {grade.nilai}/
                                  {grade.penilaian.nilaiMaksimal}
                                </span>
                                <span className="text-muted-foreground">
                                  {Math.round(
                                    (grade.nilai /
                                      grade.penilaian.nilaiMaksimal) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                              {grade.catatan && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Catatan: {grade.catatan}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGrade(grade)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {(mode === "add" || mode === "edit") && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {mode === "add" ? "Tambah Nilai Baru" : "Edit Nilai"}
                </h3>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {mode === "add" && (
                      <>
                        <FormField
                          control={form.control}
                          name="nama"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Penilaian</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Contoh: Ulangan Harian Bab 1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="kategori"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Umum">Umum</SelectItem>
                                    <SelectItem value="UTS">
                                      Ujian Tengah Semester
                                    </SelectItem>
                                    <SelectItem value="UAS">
                                      Ujian Akhir Semester
                                    </SelectItem>
                                    <SelectItem value="Ulangan Harian">
                                      Ulangan Harian
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="mataPelajaranId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mata Pelajaran</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih mata pelajaran" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {mataPelajaran.map((mapel) => (
                                      <SelectItem
                                        key={mapel.id}
                                        value={mapel.id}
                                      >
                                        {mapel.nama}
                                        {mapel.kode && ` (${mapel.kode})`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="tanggalPenilaian"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Penilaian</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "dd/MM/yyyy")
                                        ) : (
                                          <span>Pilih tanggal</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="nilaiMaksimal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nilai Maksimal</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 100
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nilai"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nilai Siswa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={form.watch("nilaiMaksimal") || 100}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <div className="text-sm text-muted-foreground">
                          Persentase:{" "}
                          {Math.round(
                            (form.watch("nilai") /
                              (form.watch("nilaiMaksimal") || 100)) *
                              100
                          ) || 0}
                          %
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="catatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tambahkan catatan untuk nilai ini..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {mode === "add" ? "Simpan Nilai" : "Update Nilai"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
