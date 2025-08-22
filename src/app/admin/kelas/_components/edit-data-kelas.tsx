"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { KelasWithRelations } from "@/interface/kelas";
import { Jenjang } from "@/interface/enums";
import { editKelasSchema, type EditKelasInput } from "../schema";
import { editKelas } from "../actions/edit-kelas";

interface EditKelasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: KelasWithRelations | null;
  availableTeachers?: Array<{
    id: string;
    namaLengkap: string;
    nip?: string;
  }>;
}

export function EditKelasDialog({
  open,
  onOpenChange,
  item,
  availableTeachers = [],
}: EditKelasDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditKelasInput>({
    resolver: zodResolver(editKelasSchema),
    defaultValues: {
      id: "",
      namaKelas: "",
      jenjang: Jenjang.SMP,
      jurusan: "",
      tahunAjaran: "",
      semester: "1",
      guruId: "",
      kapasitas: 30,
      isActive: true,
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        id: item.id,
        namaKelas: item.namaKelas,
        jenjang: item.jenjang,
        jurusan: item.jurusan || "",
        tahunAjaran: item.tahunAjaran,
        semester: item.semester as "1" | "2",
        guruId: item.guruId,
        kapasitas: item.kapasitas,
        isActive: item.isActive,
      });
    }
  }, [item, form]);

  const selectedJenjang = form.watch("jenjang");

  async function onSubmit(data: EditKelasInput) {
    if (!item) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      await editKelas(formData);
      toast.success("Kelas berhasil diupdate");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Edit kelas error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupdate kelas"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Data Kelas</DialogTitle>
          <DialogDescription>
            Ubah informasi kelas {item?.namaKelas}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaKelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 7A, 10 IPA A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jenjang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenjang</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

              {selectedJenjang === Jenjang.SMA && (
                <FormField
                  control={form.control}
                  name="jurusan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jurusan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IPA">IPA</SelectItem>
                          <SelectItem value="IPS">IPS</SelectItem>
                          <SelectItem value="Bahasa">Bahasa</SelectItem>
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
                control={form.control}
                name="tahunAjaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Ajaran</FormLabel>
                    <FormControl>
                      <Input placeholder="2024/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
              control={form.control}
              name="guruId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wali Kelas</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wali kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.namaLengkap}
                          {teacher.nip && ` (${teacher.nip})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kapasitas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasitas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={10}
                      max={40}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Kelas aktif dapat digunakan untuk pembelajaran
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
