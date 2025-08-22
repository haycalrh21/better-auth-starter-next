import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const jadwalSchema = z
  .object({
    hari: z
      .string({ message: "Hari wajib diisi" })
      .refine(
        (val) => ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"].includes(val),
        {
          message:
            "Hari harus salah satu dari: SENIN, SELASA, RABU, KAMIS, JUMAT",
        }
      ),
    jamMulai: z
      .string({ message: "Jam mulai wajib diisi" })
      .regex(timeRegex, "Format jam harus HH:MM (contoh: 08:00)"),
    jamSelesai: z
      .string({ message: "Jam selesai wajib diisi" })
      .regex(timeRegex, "Format jam harus HH:MM (contoh: 09:30)"),
    kelasId: z
      .string({ message: "Kelas wajib dipilih" })
      .min(1, "Kelas wajib dipilih"),
    guruId: z
      .string({ message: "Guru wajib dipilih" })
      .min(1, "Guru wajib dipilih"),
    mataPelajaranId: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      const [startHour, startMinute] = data.jamMulai.split(":").map(Number);
      const [endHour, endMinute] = data.jamSelesai.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      return endMinutes > startMinutes;
    },
    {
      message: "Jam selesai harus setelah jam mulai",
      path: ["jamSelesai"],
    }
  );

export const generateScheduleSchema = z.object({
  kelasIds: z
    .array(z.string())
    .min(1, "Minimal pilih satu kelas")
    .max(10, "Maksimal 10 kelas sekaligus"),
  startTime: z.string().regex(timeRegex, "Format jam harus HH:MM").optional(),
  endTime: z.string().regex(timeRegex, "Format jam harus HH:MM").optional(),
  lessonDuration: z
    .number()
    .min(30, "Durasi minimal 30 menit")
    .max(120, "Durasi maksimal 120 menit")
    .optional(),
});

export type JadwalFormValues = z.infer<typeof jadwalSchema>;
export type GenerateScheduleFormValues = z.infer<typeof generateScheduleSchema>;
