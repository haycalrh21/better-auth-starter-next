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

    if (formState.lessonDuration < 30 || formState.lessonDuration > 120) {
      newErrors.lessonDuration = "Durasi harus antara 30-120 menit";
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
        lessonDuration: formState.lessonDuration,
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
        lessonDuration: 45,
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
    setFormState((prev) => ({
      ...prev,
      selectedKelasIds: checked
        ? [...prev.selectedKelasIds, kelasId]
        : prev.selectedKelasIds.filter((id) => id !== kelasId),
    }));
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
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Generate Jadwal Otomatis</DialogTitle>
            <DialogDescription>
              Buat jadwal acak untuk kelas-kelas yang dipilih. Hanya kelas yang
              belum memiliki jadwal yang akan ditampilkan. Sistem akan secara
              otomatis: • Menggunakan semua mata pelajaran dan guru yang
              tersedia • Menambahkan waktu istirahat otomatis • Mengacak
              penugasan guru dan mata pelajaran • Jadwal hanya untuk hari
              Senin-Jumat
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6">
                {/* Pilih Kelas */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Pilih Kelas *{" "}
                    {availableKelas.length > 0 && (
                      <span className="text-sm text-gray-500 font-normal">
                        ({availableKelas.length} kelas tersedia)
                      </span>
                    )}
                  </Label>
                  {availableKelas.length === 0 ? (
                    <div className="border rounded-md p-4 text-center bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">
                        🚫 Tidak ada kelas yang tersedia untuk pembuatan jadwal
                        otomatis.
                      </p>
                      <p className="text-xs text-gray-400">
                        Semua kelas sudah memiliki jadwal. Untuk membuat jadwal
                        baru, hapus jadwal yang ada terlebih dahulu.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50/50">
                        <div className="grid grid-cols-2 gap-3">
                          {availableKelas.map((kelas) => (
                            <div
                              key={kelas.id}
                              className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer group"
                              onClick={() =>
                                handleKelasChange(
                                  kelas.id,
                                  !formState.selectedKelasIds.includes(kelas.id)
                                )
                              }
                            >
                              <Checkbox
                                id={kelas.id}
                                checked={formState.selectedKelasIds.includes(
                                  kelas.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleKelasChange(kelas.id, !!checked)
                                }
                                className="cursor-pointer"
                              />
                              <Label
                                htmlFor={kelas.id}
                                className="text-sm font-normal cursor-pointer flex-1 truncate group-hover:text-gray-900 transition-colors"
                                title={kelas.namaKelas}
                              >
                                {kelas.namaKelas}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {availableKelas.length > 6 && (
                        <div className="text-xs text-gray-400 mt-1 text-center">
                          ↕️ Scroll untuk melihat semua kelas
                        </div>
                      )}
                      {formState.selectedKelasIds.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          ✓ {formState.selectedKelasIds.length} kelas dipilih
                        </div>
                      )}
                    </div>
                  )}
                  {errors.selectedKelasIds && (
                    <p className="text-sm text-red-500">
                      {errors.selectedKelasIds}
                    </p>
                  )}
                </div>

                {/* Jam Mulai dan Selesai */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Jam Mulai Sekolah *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formState.startTime}
                      onChange={(e) =>
                        updateFormField("startTime", e.target.value)
                      }
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-500">{errors.startTime}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Jam Selesai Sekolah *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formState.endTime}
                      onChange={(e) =>
                        updateFormField("endTime", e.target.value)
                      }
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-500">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                {/* Durasi Pelajaran */}
                <div className="space-y-2">
                  <Label htmlFor="lessonDuration">
                    Durasi Per Pelajaran (menit) *
                  </Label>
                  <Input
                    id="lessonDuration"
                    type="number"
                    min="30"
                    max="120"
                    step="5"
                    value={formState.lessonDuration}
                    onChange={(e) =>
                      updateFormField(
                        "lessonDuration",
                        parseInt(e.target.value) || 45
                      )
                    }
                  />
                  {errors.lessonDuration && (
                    <p className="text-sm text-red-500">
                      {errors.lessonDuration}
                    </p>
                  )}
                </div>

                {/* Info tentang istirahat */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Jadwal Istirahat Otomatis:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Istirahat 1: 09:15 - 09:30</li>
                    <li>• Istirahat (Makan): 12:00 - 13:00</li>
                    <li>• Jeda antar pelajaran: 15 menit</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
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
                className="mr-2"
              >
                🚀 Quick Generate
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={
                  isSubmitting ||
                  formState.selectedKelasIds.length === 0 ||
                  availableKelas.length === 0
                }
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Generating..." : "Generate Jadwal"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
