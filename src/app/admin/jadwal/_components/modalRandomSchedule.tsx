"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { generateRandomSchedule } from "../actions/jadwalActions";
import { objectToFormData } from "@/utils/objectToFormData";

interface RandomScheduleModalProps {
  availableKelas: { id: string; namaKelas: string }[];
}

interface FormState {
  startTime: string;
  endTime: string;
  lessonDuration: number;
  selectedKelasIds: string[];
}

export default function RandomScheduleModal({
  availableKelas,
}: RandomScheduleModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Simplified form state management
  const [formState, setFormState] = React.useState<FormState>({
    startTime: "07:00",
    endTime: "15:00",
    lessonDuration: 45,
    selectedKelasIds: [],
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formState.startTime) {
      newErrors.startTime = "Jam mulai wajib diisi";
    }

    if (!formState.endTime) {
      newErrors.endTime = "Jam selesai wajib diisi";
    }

    if (formState.selectedKelasIds.length === 0) {
      newErrors.selectedKelasIds = "Pilih minimal satu kelas";
    }

    // Validate time format and logic
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (formState.startTime && !timeRegex.test(formState.startTime)) {
      newErrors.startTime = "Format jam tidak valid";
    }

    if (formState.endTime && !timeRegex.test(formState.endTime)) {
      newErrors.endTime = "Format jam tidak valid";
    }

    // Check if end time is after start time
    if (formState.startTime && formState.endTime) {
      const [startHour, startMinute] = formState.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = formState.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        newErrors.endTime = "Jam selesai harus setelah jam mulai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      toast.error("Mohon periksa form input");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = objectToFormData({
        startTime: formState.startTime,
        endTime: formState.endTime,
        lessonDuration: formState.lessonDuration || 45,
        kelasIds: formState.selectedKelasIds.join(","),
      });

      const result = await generateRandomSchedule(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose();
        window.location.reload();
      } else {
        if (result.error?.includes("guru")) {
          toast.error(
            result.error + " Silakan tambahkan guru di modul Teachers-Staff."
          );
        } else if (result.error?.includes("mata pelajaran")) {
          toast.error(
            result.error +
              " Silakan tambahkan mata pelajaran di modul Mata Pelajaran."
          );
        } else {
          toast.error(result.error || "Terjadi kesalahan");
        }
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Terjadi kesalahan saat membuat jadwal otomatis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormState({
      startTime: "07:00",
      endTime: "15:00",
      lessonDuration: 45,
      selectedKelasIds: [],
    });
    setErrors({});
  };

  const handleQuickGenerate = async () => {
    if (formState.selectedKelasIds.length === 0) {
      toast.error("Pilih minimal satu kelas");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = objectToFormData({
        startTime: "07:00",
        endTime: "15:00",
        lessonDuration: formState.lessonDuration || 45,
        kelasIds: formState.selectedKelasIds.join(","),
      });

      const result = await generateRandomSchedule(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose();
        window.location.reload();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error in quick generation:", error);
      toast.error(
        "Error: " + (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKelasChange = (kelasId: string, checked: boolean) => {
    setFormState((prev) => {
      const newSelectedIds = checked
        ? [...prev.selectedKelasIds, kelasId]
        : prev.selectedKelasIds.filter((id) => id !== kelasId);

      return {
        ...prev,
        selectedKelasIds: newSelectedIds,
      };
    });
  };

  const updateFormField = (
    field: keyof FormState,
    value: string | number | string[]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2" variant="outline">
        <Shuffle className="h-4 w-4" />
        Generate Jadwal Otomatis
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[95vh] flex flex-col p-0">
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              Generate Jadwal Otomatis
            </DialogTitle>
            <DialogDescription className="leading-relaxed mt-2">
              Buat jadwal acak untuk kelas-kelas yang dipilih. Sistem akan
              secara otomatis mengatur:
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* System Features */}
            <div className="space-y-2 border rounded-lg p-4">
              <h4 className="font-semibold">Fitur Otomatis:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border"></div>
                  <span>
                    Menggunakan semua mata pelajaran dan guru yang tersedia
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border"></div>
                  <span>Menambahkan waktu istirahat otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border"></div>
                  <span>Mengacak penugasan guru dan mata pelajaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border"></div>
                  <span>Jadwal hanya untuk hari Senin-Jumat</span>
                </div>
              </div>
            </div>

            {/* Class Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Pilih Kelas</Label>
                {availableKelas.length > 0 && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full border">
                    {availableKelas.length} kelas tersedia
                  </span>
                )}
              </div>

              {availableKelas.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium mb-2">
                    Tidak ada kelas tersedia
                  </h3>
                  <p className="text-muted-foreground">
                    Semua kelas sudah memiliki jadwal. Untuk membuat jadwal
                    baru, hapus jadwal yang ada terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="max-h-48 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {availableKelas.map((kelas) => (
                        <div
                          key={kelas.id}
                          className={`
                            flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group
                            ${
                              formState.selectedKelasIds.includes(kelas.id)
                                ? "border-primary shadow-sm"
                                : "hover:border-primary/50"
                            }
                          `}
                        >
                          <Checkbox
                            id={kelas.id}
                            checked={formState.selectedKelasIds.includes(
                              kelas.id
                            )}
                            onCheckedChange={(checked) =>
                              handleKelasChange(kelas.id, !!checked)
                            }
                            className="w-5 h-5"
                          />
                          <Label
                            htmlFor={kelas.id}
                            className="font-medium cursor-pointer flex-1"
                          >
                            {kelas.namaKelas}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {formState.selectedKelasIds.length > 0 && (
                    <div className="border-t p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center">
                          <span className="text-xs font-bold">✓</span>
                        </div>
                        <span className="font-medium">
                          {formState.selectedKelasIds.length} kelas dipilih
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {errors.selectedKelasIds && (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <span className="text-lg">⚠️</span>
                  <p className="font-medium text-red-500">
                    {errors.selectedKelasIds}
                  </p>
                </div>
              )}
            </div>

            {/* Time Settings Section */}
            <div className="rounded-lg p-5 border space-y-5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                Pengaturan Waktu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    Jam Mulai Sekolah
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formState.startTime}
                    onChange={(e) =>
                      updateFormField("startTime", e.target.value)
                    }
                  />
                  {errors.startTime && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    Jam Selesai Sekolah
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formState.endTime}
                    onChange={(e) => updateFormField("endTime", e.target.value)}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration Setting */}
              <div className="space-y-2">
                <Label htmlFor="lessonDuration" className="text-sm font-medium">
                  Durasi Per Pelajaran (menit)
                </Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  value={formState.lessonDuration || ""}
                  onChange={(e) =>
                    updateFormField(
                      "lessonDuration",
                      e.target.value === "" ? 0 : parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="Masukkan durasi (menit)"
                />
                {errors.lessonDuration && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.lessonDuration}
                  </p>
                )}
              </div>
            </div>

            {/* Break Schedule Info */}
            <div className="rounded-lg p-5 border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">☕</span>
                Jadwal Istirahat Otomatis
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border"></div>
                  <span className="font-medium">
                    Istirahat 1: 09:15 - 09:30
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border"></div>
                  <span className="font-medium">
                    Istirahat Makan: 12:00 - 13:00
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border"></div>
                  <span className="font-medium">
                    Jeda antar pelajaran: 15 menit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 border-t p-6">
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 py-2"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleQuickGenerate}
                disabled={
                  isSubmitting ||
                  formState.selectedKelasIds.length === 0 ||
                  availableKelas.length === 0
                }
                className="px-6 py-2"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2">⚡</span>
                )}
                Quick Generate
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={
                  isSubmitting ||
                  formState.selectedKelasIds.length === 0 ||
                  availableKelas.length === 0
                }
                className="px-6 py-2 font-medium"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Generating..." : "Generate Jadwal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
