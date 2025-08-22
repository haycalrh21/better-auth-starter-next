import { z } from "zod";

export const kkmSchema = z.object({
  mataPelajaranId: z
    .string({ message: "Mata pelajaran wajib dipilih" })
    .min(1, "Mata pelajaran wajib dipilih"),
  nilai: z
    .number({ message: "Nilai KKM wajib diisi" })
    .int("Nilai KKM harus berupa bilangan bulat")
    .min(1, "Nilai KKM minimal 1")
    .max(100, "Nilai KKM maksimal 100"),
});

export type KKMFormValues = z.infer<typeof kkmSchema>;
