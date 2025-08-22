import { z } from "zod";
import { Jenjang } from "@/interface/enums";

// Schema for creating a new class
export const createKelasSchema = z
  .object({
    namaKelas: z
      .string({ message: "Nama kelas wajib diisi" })
      .min(2, "Nama kelas minimal 2 karakter")
      .max(20, "Nama kelas maksimal 20 karakter")
      .regex(
        /^[0-9]{1,2}[A-Z]{1,2}(?:\s[A-Z]+(?:\s[A-Z])?)?$/i,
        "Format nama kelas tidak valid. Contoh: 7A, 10 IPA A, 11 IPS B"
      ),

    jenjang: z.nativeEnum(Jenjang, {
      message: "Jenjang wajib dipilih",
    }),

    jurusan: z.string().optional(),

    tahunAjaran: z
      .string({ message: "Tahun ajaran wajib diisi" })
      .regex(
        /^20\d{2}\/20\d{2}$/,
        "Format tahun ajaran tidak valid. Contoh: 2024/2025"
      )
      .refine((val) => {
        const [start, end] = val.split("/");
        return parseInt(end) === parseInt(start) + 1;
      }, "Tahun ajaran harus berurutan (contoh: 2024/2025)"),

    semester: z.enum(["1", "2"], {
      message: "Semester wajib dipilih",
    }),

    guruId: z
      .string({ message: "Wali kelas wajib dipilih" })
      .uuid("ID guru tidak valid"),

    kapasitas: z
      .number({ message: "Kapasitas harus berupa angka" })
      .int("Kapasitas harus berupa bilangan bulat")
      .min(10, "Kapasitas minimal 10 siswa")
      .max(40, "Kapasitas maksimal 40 siswa")
      .default(30),

    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // For SMA, jurusan is required
      if (
        data.jenjang === Jenjang.SMA &&
        (!data.jurusan || data.jurusan.trim() === "")
      ) {
        return false;
      }
      // For SMP, jurusan should not be provided
      if (
        data.jenjang === Jenjang.SMP &&
        data.jurusan &&
        data.jurusan.trim() !== ""
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Jurusan wajib untuk SMA dan tidak boleh ada untuk SMP",
      path: ["jurusan"],
    }
  );

// Schema for editing a class
export const editKelasSchema = createKelasSchema.partial().extend({
  id: z.string({ message: "ID kelas wajib ada" }).uuid("ID kelas tidak valid"),
});

// Schema for class promotion
export const promoteStudentsSchema = z
  .object({
    fromTahunAjaran: z
      .string({ message: "Tahun ajaran asal wajib diisi" })
      .regex(/^20\d{2}\/20\d{2}$/, "Format tahun ajaran tidak valid"),

    toTahunAjaran: z
      .string({ message: "Tahun ajaran tujuan wajib diisi" })
      .regex(/^20\d{2}\/20\d{2}$/, "Format tahun ajaran tidak valid"),

    semester: z.enum(["1", "2"], {
      message: "Semester wajib dipilih",
    }),

    jenjang: z.nativeEnum(Jenjang, {
      message: "Jenjang wajib dipilih",
    }),

    fromGrade: z
      .number({ message: "Tingkat asal harus berupa angka" })
      .int("Tingkat asal harus bilangan bulat")
      .min(7, "Tingkat minimal 7")
      .max(12, "Tingkat maksimal 12"),

    toGrade: z
      .number({ message: "Tingkat tujuan harus berupa angka" })
      .int("Tingkat tujuan harus bilangan bulat")
      .min(7, "Tingkat minimal 7")
      .max(12, "Tingkat maksimal 12"),

    jurusan: z.string().optional(),

    numberOfClasses: z
      .number({ message: "Jumlah kelas harus berupa angka" })
      .int("Jumlah kelas harus bilangan bulat")
      .min(1, "Minimal 1 kelas")
      .max(20, "Maksimal 20 kelas"),

    randomDistribution: z.boolean().default(true),

    deactivateOldClasses: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validate grade progression
      const allowedProgression = [
        [7, 8],
        [8, 9],
        [9, 10],
        [10, 11],
        [11, 12],
      ];

      const isValidProgression = allowedProgression.some(
        ([from, to]) => data.fromGrade === from && data.toGrade === to
      );

      // Special case for graduation
      const isGraduation =
        (data.fromGrade === 9 && data.toGrade === 10) || data.fromGrade === 12;

      return isValidProgression || isGraduation;
    },
    {
      message:
        "Progres tingkat tidak valid. Progres yang diizinkan: 7→8, 8→9, 9→10, 10→11, 11→12",
    }
  )
  .refine(
    (data) => {
      // Validate academic year progression
      const fromYear = parseInt(data.fromTahunAjaran.split("/")[0]);
      const toYear = parseInt(data.toTahunAjaran.split("/")[0]);

      return toYear === fromYear + 1;
    },
    {
      message: "Tahun ajaran tujuan harus 1 tahun setelah tahun ajaran asal",
    }
  );

// Schema for random class distribution
export const randomKelasSchema = z
  .object({
    numberOfClasses: z
      .number({ message: "Jumlah kelas harus berupa angka" })
      .int("Jumlah kelas harus bilangan bulat")
      .min(1, "Minimal 1 kelas")
      .max(15, "Maksimal 15 kelas"),

    jenjang: z.nativeEnum(Jenjang, {
      message: "Jenjang wajib dipilih",
    }),

    grade: z
      .number({ message: "Tingkat harus berupa angka" })
      .int("Tingkat harus bilangan bulat")
      .min(7, "Tingkat minimal 7")
      .max(12, "Tingkat maksimal 12"),

    jurusan: z.string().optional(),

    tahunAjaran: z
      .string({ message: "Tahun ajaran wajib diisi" })
      .regex(/^20\d{2}\/20\d{2}$/, "Format tahun ajaran tidak valid"),

    semester: z.enum(["1", "2"], {
      message: "Semester wajib dipilih",
    }),

    kapasitas: z
      .number({ message: "Kapasitas harus berupa angka" })
      .int("Kapasitas harus bilangan bulat")
      .min(10, "Kapasitas minimal 10 siswa")
      .max(40, "Kapasitas maksimal 40 siswa")
      .default(30),

    randomizeStudents: z.boolean().default(true),

    randomizeTeachers: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validate jenjang and grade compatibility
      if (data.jenjang === Jenjang.SMP && (data.grade < 7 || data.grade > 9)) {
        return false;
      }
      if (
        data.jenjang === Jenjang.SMA &&
        (data.grade < 10 || data.grade > 12)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Tingkat tidak sesuai dengan jenjang. SMP: 7-9, SMA: 10-12",
    }
  )
  .refine(
    (data) => {
      // For SMA, jurusan is required
      if (
        data.jenjang === Jenjang.SMA &&
        (!data.jurusan || data.jurusan.trim() === "")
      ) {
        return false;
      }
      // For SMP, jurusan should not be provided
      if (
        data.jenjang === Jenjang.SMP &&
        data.jurusan &&
        data.jurusan.trim() !== ""
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Jurusan wajib untuk SMA dan tidak boleh ada untuk SMP",
    }
  );

// Schema for deleting a class
export const deleteKelasSchema = z.object({
  id: z.string({ message: "ID kelas wajib ada" }).uuid("ID kelas tidak valid"),

  reason: z
    .string()
    .min(10, "Alasan penghapusan minimal 10 karakter")
    .optional(),
});

// Type exports
export type CreateKelasInput = z.infer<typeof createKelasSchema>;
export type EditKelasInput = z.infer<typeof editKelasSchema>;
export type PromoteStudentsInput = z.infer<typeof promoteStudentsSchema>;
export type RandomKelasInput = z.infer<typeof randomKelasSchema>;
export type DeleteKelasInput = z.infer<typeof deleteKelasSchema>;
