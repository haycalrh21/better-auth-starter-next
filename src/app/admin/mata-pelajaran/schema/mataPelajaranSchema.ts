import { z } from "zod";

export const mataPelajaranSchema = z.object({
  nama: z
    .string({ message: "Nama mata pelajaran wajib diisi" })
    .min(1, "Nama mata pelajaran wajib diisi")
    .max(100, "Nama mata pelajaran maksimal 100 karakter"),
  kode: z
    .string()
    .min(1, "Kode mata pelajaran wajib diisi")
    .max(10, "Kode mata pelajaran maksimal 10 karakter")
    .optional()
    .or(z.literal("")),
  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  guruId: z.string().optional().or(z.literal("")),
});

export type MataPelajaranFormValues = z.infer<typeof mataPelajaranSchema>;
