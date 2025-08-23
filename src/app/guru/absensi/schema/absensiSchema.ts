import { z } from "zod";
import { StatusAbsensi } from "@/interface/enums";

// Schema for individual student attendance record
export const absensiRecordSchema = z
  .object({
    siswaId: z.string().min(1, "ID siswa wajib diisi"),
    status: z.nativeEnum(StatusAbsensi, {
      message: "Status absensi harus valid",
    }),
    keterangan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.status === StatusAbsensi.SAKIT ||
          data.status === StatusAbsensi.IZIN) &&
        !data.keterangan
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Keterangan wajib diisi untuk status Sakit atau Izin",
      path: ["keterangan"],
    }
  );

// Schema for bulk attendance submission
export const bulkAbsensiSchema = z.object({
  tanggal: z
    .date({
      message: "Tanggal absensi wajib diisi",
    })
    .refine(
      (date) => {
        const today = new Date();
        const thirtyDaysAgo = new Date(
          today.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        return date >= thirtyDaysAgo && date <= tomorrow;
      },
      {
        message:
          "Tanggal absensi harus dalam rentang 30 hari ke belakang hingga besok",
      }
    ),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
  attendanceRecords: z
    .array(absensiRecordSchema)
    .min(1, "Minimal satu siswa harus diisi absensinya"),
});

// Schema for attendance date validation
export const absensiDateSchema = z.object({
  tanggal: z.date({
    message: "Tanggal wajib diisi",
  }),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
});

// Schema for holiday validation
export const holidayValidationSchema = z.object({
  tanggalMulai: z.date(),
  tanggalSelesai: z.date().optional(),
  semester: z.string(),
  keterangan: z.string().optional(),
});

export type AbsensiRecordInput = z.infer<typeof absensiRecordSchema>;
export type BulkAbsensiInput = z.infer<typeof bulkAbsensiSchema>;
export type AbsensiDateInput = z.infer<typeof absensiDateSchema>;
export type HolidayValidationInput = z.infer<typeof holidayValidationSchema>;
