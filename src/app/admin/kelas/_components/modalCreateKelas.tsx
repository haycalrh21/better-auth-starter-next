"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Shuffle, Users, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  createKelasSchema,
  randomKelasSchema,
  type CreateKelasInput,
  type RandomKelasInput,
} from "../schema";
import {
  createKelas,
  createRandomKelas,
  assignStudentsToExistingClasses,
} from "../actions/create-kelas";
import { Jenjang } from "@/interface/enums";

interface Teacher {
  id: string;
  namaLengkap: string;
  nip?: string | null;
}

interface Student {
  id: string;
  namaLengkap: string;
  nisn?: string | null;
}

interface ExistingClass {
  id: string;
  namaKelas: string;
  kapasitas: number;
  currentStudents: number;
  availableSpots: number;
}

interface CreateKelasModalProps {
  availableTeachers: Teacher[];
  unassignedStudents: Student[];
  currentAcademicYear: string;
  currentSemester: string;
  existingClasses?: ExistingClass[];
}

export default function CreateKelasModal({
  availableTeachers,
  unassignedStudents,
  currentAcademicYear,
  currentSemester,
  existingClasses = [],
}: CreateKelasModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("single");

  // Determine scenarios based on resource availability
  const hasTeachers = availableTeachers.length > 0;
  const hasStudents = unassignedStudents.length > 0;

  // Scenario validation logic - only require teachers for new class creation
  const canCreateNew = hasTeachers; // Allow creation as long as there are teachers
  const onlyTeachers = hasTeachers && !hasStudents;
  const onlyStudents = !hasTeachers && hasStudents;
  const noResources = !hasTeachers && !hasStudents;

  // Single class form
  const singleForm = useForm({
    resolver: zodResolver(createKelasSchema),
    defaultValues: {
      namaKelas: "",
      jenjang: Jenjang.SMP,
      jurusan: "",
      tahunAjaran: currentAcademicYear,
      semester: currentSemester as "1" | "2",
      guruId: "",
      kapasitas: 30,
      isActive: true,
    },
  });

  // Random distribution form
  const randomForm = useForm({
    resolver: zodResolver(randomKelasSchema),
    defaultValues: {
      numberOfClasses: 10,
      jenjang: Jenjang.SMP,
      grade: 7,
      jurusan: "",
      tahunAjaran: currentAcademicYear,
      semester: currentSemester as "1" | "2",
      kapasitas: 30,
      randomizeStudents: true,
      randomizeTeachers: true,
    },
  });

  const watchJenjang = singleForm.watch("jenjang");
  const watchRandomJenjang = randomForm.watch("jenjang");
  const watchGrade = randomForm.watch("grade");
  const watchNumberOfClasses = randomForm.watch("numberOfClasses");

  // Calculate maximum classes based only on available teachers
  const maxPossibleClasses = availableTeachers.length;

  const recommendedClasses = Math.min(
    Math.ceil(unassignedStudents.length / 30), // Optimal 30 students per class
    availableTeachers.length
  );

  const onSubmitSingle = (data: any) => {
    startTransition(() => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle boolean values properly
          if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      createKelas(formData)
        .then(() => {
          toast.success("Kelas berhasil dibuat!");
          singleForm.reset();
          setOpen(false);
        })
        .catch((error) => {
          toast.error(error.message || "Gagal membuat kelas");
        });
    });
  };

  const onSubmitRandom = (data: any) => {
    if (data.numberOfClasses > availableTeachers.length) {
      toast.error(
        `Maksimal ${availableTeachers.length} kelas dapat dibuat berdasarkan jumlah guru yang tersedia`
      );
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle boolean values properly
          if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      createRandomKelas(formData)
        .then((result) => {
          toast.success(
            `${result.length} kelas berhasil dibuat dengan distribusi random!`
          );
          randomForm.reset();
          setOpen(false);
        })
        .catch((error) => {
          toast.error(error.message || "Gagal membuat kelas secara random");
        });
    });
  };

  const onAssignToExisting = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.append("tahunAjaran", currentAcademicYear);
      formData.append("semester", currentSemester);

      assignStudentsToExistingClasses(formData)
        .then((result) => {
          toast.success(
            `${result.totalAssigned} siswa berhasil ditempatkan di ${result.classesUsed} kelas!`
          );
          setOpen(false);
        })
        .catch((error) => {
          toast.error(
            error.message || "Gagal menempatkan siswa ke kelas yang ada"
          );
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {onlyStudents ? (
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gunakan Existing ({unassignedStudents.length} siswa)
          </Button>
        ) : onlyTeachers ? (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Kelas ({availableTeachers.length} guru)
          </Button>
        ) : noResources ? (
          <Button disabled className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tidak Ada Guru
          </Button>
        ) : (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Kelas Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {onlyStudents
              ? "Tempatkan Siswa ke Kelas Existing"
              : "Buat Kelas Baru"}
          </DialogTitle>
          <DialogDescription>
            {onlyStudents
              ? "Tempatkan siswa yang belum memiliki kelas ke kelas-kelas yang sudah ada"
              : "Buat kelas individual atau distribusi otomatis dengan pengacakan siswa"}
          </DialogDescription>
        </DialogHeader>

        {onlyStudents ? (
          /* Assign to Existing Classes Content */
          <div className="space-y-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistik Penempatan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {unassignedStudents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Siswa Perlu Ditempatkan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        existingClasses.filter((c) => c.availableSpots > 0)
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kelas Tersedia
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {existingClasses.reduce(
                        (sum, c) => sum + c.availableSpots,
                        0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Kapasitas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Classes List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Kelas dengan Kapasitas Tersedia
                </CardTitle>
                <CardDescription>
                  Siswa akan didistribusikan secara merata ke semua kelas yang
                  tersedia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {existingClasses
                    .filter((c) => c.availableSpots > 0)
                    .map((kelas, index) => {
                      // Calculate expected distribution
                      const availableClasses = existingClasses.filter(
                        (c) => c.availableSpots > 0
                      );
                      const studentsPerClass = Math.floor(
                        unassignedStudents.length / availableClasses.length
                      );
                      const remainder =
                        unassignedStudents.length % availableClasses.length;
                      const expectedStudents = Math.min(
                        studentsPerClass + (index < remainder ? 1 : 0),
                        kelas.availableSpots
                      );

                      return (
                        <div
                          key={kelas.id}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-medium">{kelas.namaKelas}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {kelas.currentStudents}/{kelas.kapasitas}
                            </Badge>
                            <Badge variant="secondary">
                              +{kelas.availableSpots} tersedia
                            </Badge>
                            <Badge variant="default">
                              ~{expectedStudents} akan ditambah
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {existingClasses.filter((c) => c.availableSpots > 0).length ===
                  0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Tidak ada kelas dengan kapasitas tersedia
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={onAssignToExisting}
                disabled={
                  isPending ||
                  existingClasses.filter((c) => c.availableSpots > 0).length ===
                    0
                }
                className="flex-1"
              >
                {isPending
                  ? "Memproses..."
                  : `Tempatkan ${unassignedStudents.length} Siswa`}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Kelas Individual
              </TabsTrigger>
              <TabsTrigger value="random" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Distribusi Random
              </TabsTrigger>
            </TabsList>

            {/* Statistics Card */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistik Sumber Daya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {availableTeachers.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Guru Tersedia
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {unassignedStudents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Siswa Belum Berkelas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {maxPossibleClasses}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maks Kelas (Guru)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {recommendedClasses}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rekomendasi (30/kelas)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="single" className="space-y-4">
              <Form {...singleForm}>
                <form
                  onSubmit={singleForm.handleSubmit(onSubmitSingle)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={singleForm.control}
                      name="namaKelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Kelas</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: 7A, 10 IPA A"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Format: TingkatSeksi atau Tingkat Jurusan Seksi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="jenjang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenjang</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenjang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Jenjang.SMP}>SMP</SelectItem>
                              <SelectItem value={Jenjang.SMA}>SMA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchJenjang === Jenjang.SMA && (
                    <FormField
                      control={singleForm.control}
                      name="jurusan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurusan</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jurusan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getJurusanOptions().map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={singleForm.control}
                      name="tahunAjaran"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tahun Ajaran</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih semester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={singleForm.control}
                    name="guruId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wali Kelas</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih wali kelas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTeachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.namaLengkap}{" "}
                                {teacher.nip && `(${teacher.nip})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {availableTeachers.length} guru tersedia untuk menjadi
                          wali kelas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={singleForm.control}
                    name="kapasitas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas Maksimal</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={10}
                            max={40}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Jumlah maksimal siswa dalam kelas (10-40)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={singleForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Kelas Aktif</FormLabel>
                          <FormDescription>
                            Tandai jika kelas langsung aktif dan dapat digunakan
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Membuat Kelas..." : "Buat Kelas"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="random" className="space-y-4">
              <Form {...randomForm}>
                <form
                  onSubmit={randomForm.handleSubmit(onSubmitRandom)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={randomForm.control}
                      name="numberOfClasses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Kelas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={maxPossibleClasses}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Maksimal {maxPossibleClasses} kelas berdasarkan
                            jumlah guru tersedia. Rekomendasi:{" "}
                            {recommendedClasses}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={randomForm.control}
                      name="jenjang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenjang</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenjang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Jenjang.SMP}>SMP</SelectItem>
                              <SelectItem value={Jenjang.SMA}>SMA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={randomForm.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tingkat</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tingkat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getGradeOptions(watchRandomJenjang).map(
                                (option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value.toString()}
                                  >
                                    {option.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchRandomJenjang === Jenjang.SMA && (
                      <FormField
                        control={randomForm.control}
                        name="jurusan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jurusan</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jurusan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getJurusanOptions().map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={randomForm.control}
                      name="tahunAjaran"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tahun Ajaran</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={randomForm.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih semester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={randomForm.control}
                    name="kapasitas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas per Kelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={10}
                            max={40}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Kapasitas maksimal untuk setiap kelas yang dibuat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Opsi Pengacakan</h4>

                    <FormField
                      control={randomForm.control}
                      name="randomizeStudents"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Acak Distribusi Siswa</FormLabel>
                            <FormDescription>
                              Siswa akan didistribusikan secara acak dan merata
                              ke semua kelas
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={randomForm.control}
                      name="randomizeTeachers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Acak Penugasan Guru</FormLabel>
                            <FormDescription>
                              Guru akan dipilih secara acak sebagai wali kelas
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Preview */}
                  {watchNumberOfClasses > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Preview Distribusi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Jumlah Kelas:</span>
                            <Badge>{watchNumberOfClasses}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Siswa per Kelas:</span>
                            <Badge>
                              ≈{" "}
                              {Math.ceil(
                                unassignedStudents.length / watchNumberOfClasses
                              )}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Siswa:</span>
                            <Badge>{unassignedStudents.length}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Guru Dibutuhkan:</span>
                            <Badge
                              variant={
                                watchNumberOfClasses <= availableTeachers.length
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {watchNumberOfClasses} /{" "}
                              {availableTeachers.length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isPending ||
                      watchNumberOfClasses > availableTeachers.length
                    }
                    className="w-full"
                  >
                    {isPending
                      ? "Membuat Kelas..."
                      : `Buat ${watchNumberOfClasses} Kelas dengan Distribusi Random`}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
