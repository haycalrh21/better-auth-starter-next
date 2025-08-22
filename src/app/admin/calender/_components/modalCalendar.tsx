"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

import { KalenderFormValues, kalenderSchema } from "../schema/kalenderSchema";
import { createKalender, updateKalender } from "../actions/kalenderActions";
import { objectToFormData } from "@/utils/objectToFormData";
import type { Kalender } from "@/interface/kalender";

interface CalendarModalProps {
  kalenderData?: Kalender;
  isEdit?: boolean;
}

export default function CalendarModal({
  kalenderData,
  isEdit = false,
}: CalendarModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Helper function to get current semester based on month
  const getCurrentSemester = (): string => {
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
    return currentMonth >= 1 && currentMonth <= 6 ? "1" : "2";
  };

  // Helper function to get today's date without time
  const getTodayDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<KalenderFormValues>({
    resolver: zodResolver(kalenderSchema),
    defaultValues: {
      semester: getCurrentSemester(), // Set default semester based on current month
    },
  });

  // Update form values when date range changes
  React.useEffect(() => {
    if (dateRange?.from) {
      setValue("tanggalMulai", dateRange.from);
    }
    if (dateRange?.to) {
      setValue("tanggalSelesai", dateRange.to);
    } else {
      setValue("tanggalSelesai", undefined);
    }
  }, [dateRange, setValue]);

  // Initialize form data for editing or new entry
  React.useEffect(() => {
    if (open) {
      if (isEdit && kalenderData) {
        // For edit mode, use existing data
        reset({
          tanggalMulai: new Date(kalenderData.tanggalMulai),
          tanggalSelesai: kalenderData.tanggalSelesai
            ? new Date(kalenderData.tanggalSelesai)
            : undefined,
          semester: kalenderData.semester || getCurrentSemester(),
          keterangan: kalenderData.keterangan || "",
        });

        setDateRange({
          from: new Date(kalenderData.tanggalMulai),
          to: kalenderData.tanggalSelesai
            ? new Date(kalenderData.tanggalSelesai)
            : undefined,
        });
      } else {
        // For new entry, set current semester
        setValue("semester", getCurrentSemester());
      }
    }
  }, [open, isEdit, kalenderData, reset, setValue]);

  const onSubmit: SubmitHandler<KalenderFormValues> = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = objectToFormData(data);

      const result =
        isEdit && kalenderData
          ? await updateKalender(kalenderData.id, formData)
          : await createKalender(formData);

      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan kalender");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset({
      semester: getCurrentSemester(), // Reset to current semester
    });
    setDateRange(undefined);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {isEdit ? "Edit Kalender" : "Tambah Kalender"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Kalender" : "Tambah Kalender Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Ubah informasi kalender di sini."
                : "Pilih rentang tanggal untuk kalender dan tambahkan keterangan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label>Rentang Tanggal *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd LLL y", { locale: id })} -{" "}
                          {format(dateRange.to, "dd LLL y", { locale: id })}
                        </>
                      ) : (
                        format(dateRange.from, "dd LLL y", { locale: id })
                      )
                    ) : (
                      <span>Pilih rentang tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) =>
                      date < getTodayDate() || // Disable past dates
                      date > new Date("2100-12-31")
                    }
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(errors.tanggalMulai || errors.tanggalSelesai) && (
                <p className="text-sm text-red-500">
                  {errors.tanggalMulai?.message ||
                    errors.tanggalSelesai?.message}
                </p>
              )}
            </div>

            {/* Display Current Semester (Read-only) */}
            <div className="space-y-2">
              <Label>Semester</Label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                Semester {getCurrentSemester()} (
                {getCurrentSemester() === "1"
                  ? "Januari - Juni"
                  : "Juli - Desember"}
                )
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                placeholder="Masukkan keterangan (opsional)"
                {...register("keterangan")}
              />
              {errors.keterangan && (
                <p className="text-sm text-red-500">
                  {errors.keterangan.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Perbarui" : "Simpan"} Kalender
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
