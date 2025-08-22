import { z } from "zod";

export const kalenderSchema = z
  .object({
    tanggalMulai: z
      .date({ message: "Tanggal mulai wajib diisi" })
      .refine((val) => !!val, "Tanggal mulai wajib diisi"),
    tanggalSelesai: z
      .date({ message: "Tanggal selesai wajib diisi" })
      .optional(),
    semester: z
      .string({ message: "Semester wajib diisi" })
      .min(1, "Semester wajib diisi")
      .refine((val) => ["1", "2"].includes(val), "Semester harus 1 atau 2"),
    keterangan: z.string().optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, validate that end date is after or equal to start date
      if (data.tanggalSelesai && data.tanggalMulai) {
        return data.tanggalSelesai >= data.tanggalMulai;
      }
      return true;
    },
    {
      message: "Tanggal selesai harus sama dengan atau setelah tanggal mulai",
      path: ["tanggalSelesai"],
    }
  );

export type KalenderFormValues = z.infer<typeof kalenderSchema>;
