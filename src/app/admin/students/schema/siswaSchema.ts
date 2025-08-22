import { z } from "zod";
import { Gender, Agama, StatusSiswa, Jenjang } from "@/interface/enums";

// Schema for creating a new student
export const createSiswaSchema = z
  .object({
    namaLengkap: z
      .string({ message: "Nama lengkap wajib diisi" })
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter")
      .regex(
        /^[a-zA-Z\s\.',-]+$/i,
        "Nama hanya boleh mengandung huruf, spasi, titik, koma, apostrof, dan strip"
      ),

    nisn: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{10}$/.test(val),
        "NISN harus 10 digit angka"
      ),

    nik: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{16}$/.test(val),
        "NIK harus 16 digit angka"
      ),

    tempatLahir: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 2,
        "Tempat lahir minimal 2 karakter"
      ),

    tanggalLahir: z
      .date({ message: "Tanggal lahir harus berupa tanggal yang valid" })
      .optional()
      .refine((val) => {
        if (!val) return true;
        const today = new Date();
        const hundredYearsAgo = new Date(
          today.getFullYear() - 100,
          today.getMonth(),
          today.getDate()
        );
        return val >= hundredYearsAgo && val <= today;
      }, "Tanggal lahir harus antara 100 tahun yang lalu dan hari ini"),

    jenisKelamin: z.nativeEnum(Gender).optional(),

    agama: z.nativeEnum(Agama).optional(),

    noHp: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+62|62|0)[2-9]\d{7,11}$/.test(val),
        "Format nomor HP tidak valid (contoh: 081234567890)"
      ),

    emailAlternatif: z
      .string()
      .optional()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        "Format email tidak valid"
      ),

    alamatLengkap: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 10,
        "Alamat lengkap minimal 10 karakter"
      ),

    kelurahan: z.string().optional(),
    kecamatan: z.string().optional(),
    kabupatenKota: z.string().optional(),
    provinsi: z.string().optional(),

    kodePos: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{5}$/.test(val),
        "Kode pos harus 5 digit angka"
      ),

    tahunMasuk: z
      .number({ message: "Tahun masuk harus berupa angka" })
      .int("Tahun masuk harus bilangan bulat")
      .min(1950, "Tahun masuk minimal 1950")
      .max(
        new Date().getFullYear() + 1,
        "Tahun masuk tidak boleh lebih dari tahun depan"
      )
      .optional(),

    status: z.nativeEnum(StatusSiswa).default(StatusSiswa.AKTIF),

    tahunLulus: z
      .number()
      .int()
      .min(1950)
      .max(new Date().getFullYear() + 10)
      .optional(),

    tanggalLulus: z.date().optional(),
    alasanKeluar: z.string().optional(),

    // Parent/Guardian Information
    namaAyah: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 2, "Nama ayah minimal 2 karakter"),

    namaIbu: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 2, "Nama ibu minimal 2 karakter"),

    namaWali: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 2, "Nama wali minimal 2 karakter"),

    pekerjaanAyah: z.string().optional(),
    pekerjaanIbu: z.string().optional(),
    pekerjaanWali: z.string().optional(),

    noHpOrtu: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+62|62|0)[2-9]\d{7,11}$/.test(val),
        "Format nomor HP orang tua tidak valid"
      ),

    isProfileComplete: z.boolean().default(false),
    userId: z
      .string({ message: "User ID wajib ada" })
      .uuid("User ID tidak valid"),
  })
  .refine(
    (data) => {
      // If student is graduated, graduation date and year should be provided
      if (data.status === StatusSiswa.LULUS) {
        return data.tahunLulus || data.tanggalLulus;
      }
      return true;
    },
    {
      message: "Tahun atau tanggal lulus wajib untuk siswa yang sudah lulus",
      path: ["tahunLulus"],
    }
  )
  .refine(
    (data) => {
      // If student is not active, reason should be provided
      if (
        data.status === StatusSiswa.KELUAR ||
        data.status === StatusSiswa.PINDAH ||
        data.status === StatusSiswa.DIKELUARKAN
      ) {
        return data.alasanKeluar && data.alasanKeluar.length >= 10;
      }
      return true;
    },
    {
      message:
        "Alasan keluar minimal 10 karakter untuk siswa yang keluar/pindah/dikeluarkan",
      path: ["alasanKeluar"],
    }
  );

// Schema for editing a student
export const editSiswaSchema = createSiswaSchema.partial().extend({
  id: z.string({ message: "ID siswa wajib ada" }).uuid("ID siswa tidak valid"),
});

// Schema for bulk student operations
export const bulkSiswaSchema = z.object({
  operation: z.enum(["promote", "assign_class", "update_status", "export"], {
    message: "Operasi bulk tidak valid",
  }),

  studentIds: z
    .array(z.string().uuid())
    .min(1, "Minimal 1 siswa harus dipilih")
    .max(500, "Maksimal 500 siswa dapat diproses sekaligus"),

  // For promotion
  newGrade: z.number().int().min(7).max(12).optional(),
  newJenjang: z.nativeEnum(Jenjang).optional(),
  newAcademicYear: z
    .string()
    .regex(/^20\d{2}\/20\d{2}$/)
    .optional(),

  // For class assignment
  kelasId: z.string().uuid().optional(),

  // For status update
  newStatus: z.nativeEnum(StatusSiswa).optional(),
  reason: z.string().min(10).optional(),

  // For export
  exportFormat: z.enum(["xlsx", "csv", "pdf"]).optional(),
  includePersonalData: z.boolean().default(true),
  includeParentData: z.boolean().default(true),
  includeAcademicData: z.boolean().default(true),
});

// Schema for student import
export const importSiswaSchema = z.object({
  file: z.any(), // File will be validated separately
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  defaultKelasId: z.string().uuid().optional(),
  defaultStatus: z.nativeEnum(StatusSiswa).default(StatusSiswa.AKTIF),
});

// Schema for deleting a student
export const deleteSiswaSchema = z.object({
  id: z.string({ message: "ID siswa wajib ada" }).uuid("ID siswa tidak valid"),
  reason: z
    .string()
    .min(10, "Alasan penghapusan minimal 10 karakter")
    .optional(),
  transferData: z.boolean().default(false), // Whether to keep academic records
});

// Schema for student search and filtering
export const siswaFilterSchema = z.object({
  search: z.string().optional(),
  jenjang: z.nativeEnum(Jenjang).optional(),
  tingkat: z.number().int().min(7).max(12).optional(),
  status: z.nativeEnum(StatusSiswa).optional(),
  kelasId: z.string().uuid().optional(),
  tahunMasuk: z.number().int().min(1950).optional(),
  hasKelas: z.boolean().optional(),
  gender: z.nativeEnum(Gender).optional(),
  agama: z.nativeEnum(Agama).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum([
      "namaLengkap",
      "nisn",
      "tahunMasuk",
      "createdAt",
      "updatedAt",
      "tingkatSaatIni",
    ])
    .default("namaLengkap"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Type exports
export type CreateSiswaInput = z.infer<typeof createSiswaSchema>;
export type EditSiswaInput = z.infer<typeof editSiswaSchema>;
export type BulkSiswaInput = z.infer<typeof bulkSiswaSchema>;
export type ImportSiswaInput = z.infer<typeof importSiswaSchema>;
export type DeleteSiswaInput = z.infer<typeof deleteSiswaSchema>;
export type SiswaFilterInput = z.infer<typeof siswaFilterSchema>;

// Legacy export for backward compatibility
export const siswaSchema = editSiswaSchema;
export type SiswaFormValues = z.infer<typeof siswaSchema>;
