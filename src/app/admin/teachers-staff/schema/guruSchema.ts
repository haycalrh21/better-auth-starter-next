import { z } from "zod";
import { Gender, Agama, StatusKawin } from "@/interface/enums";

// Schema for creating a new teacher
export const createGuruSchema = z.object({
  namaLengkap: z
    .string({ message: "Nama lengkap wajib diisi" })
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .regex(
      /^[a-zA-Z\s\.',-]+$/i,
      "Nama hanya boleh mengandung huruf, spasi, titik, koma, apostrof, dan strip"
    ),

  nip: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{18}$/.test(val), "NIP harus 18 digit angka"),

  nik: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{16}$/.test(val), "NIK harus 16 digit angka"),

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
      const minAge = new Date(
        today.getFullYear() - 20,
        today.getMonth(),
        today.getDate()
      );
      return val >= hundredYearsAgo && val <= minAge;
    }, "Tanggal lahir harus minimal 20 tahun yang lalu"),

  jenisKelamin: z.nativeEnum(Gender).optional(),

  agama: z.nativeEnum(Agama).optional(),

  statusKawin: z.nativeEnum(StatusKawin).optional(),

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

  // Education Information
  pendidikanTerakhir: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 2,
      "Pendidikan terakhir minimal 2 karakter"
    ),

  jurusan: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, "Jurusan minimal 2 karakter"),

  tahunLulus: z
    .number({ message: "Tahun lulus harus berupa angka" })
    .int("Tahun lulus harus bilangan bulat")
    .min(1950, "Tahun lulus minimal 1950")
    .max(
      new Date().getFullYear(),
      "Tahun lulus tidak boleh lebih dari tahun ini"
    )
    .optional(),

  institusi: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, "Institusi minimal 2 karakter"),

  // Employment Information
  statusKepegawaian: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 2,
      "Status kepegawaian minimal 2 karakter"
    ),

  golongan: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, "Golongan minimal 2 karakter"),

  pangkat: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, "Pangkat minimal 2 karakter"),

  tmt: z.date({ message: "TMT harus berupa tanggal yang valid" }).optional(),

  masaKerja: z
    .number({ message: "Masa kerja harus berupa angka" })
    .int("Masa kerja harus bilangan bulat")
    .min(0, "Masa kerja minimal 0")
    .max(50, "Masa kerja maksimal 50 tahun")
    .optional(),

  bidangStudi: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 2,
      "Bidang studi minimal 2 karakter"
    ),

  walikelas: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, "Wali kelas minimal 2 karakter"),

  isProfileComplete: z.boolean().default(false),
  userId: z
    .string({ message: "User ID wajib ada" })
    .uuid("User ID tidak valid"),
});

// Schema for editing a teacher
export const editGuruSchema = createGuruSchema.partial().extend({
  id: z.string({ message: "ID guru wajib ada" }).uuid("ID guru tidak valid"),
});

// Schema for bulk teacher operations
export const bulkGuruSchema = z.object({
  operation: z.enum(
    ["assign_class", "update_status", "export", "assign_subject"],
    {
      message: "Operasi bulk tidak valid",
    }
  ),

  teacherIds: z
    .array(z.string().uuid())
    .min(1, "Minimal 1 guru harus dipilih")
    .max(500, "Maksimal 500 guru dapat diproses sekaligus"),

  // For class assignment
  kelasId: z.string().uuid().optional(),

  // For subject assignment
  mataPelajaranId: z.string().uuid().optional(),

  // For status update
  newStatusKepegawaian: z.string().optional(),
  newGolongan: z.string().optional(),
  newPangkat: z.string().optional(),

  // For export
  exportFormat: z.enum(["xlsx", "csv", "pdf"]).optional(),
  includePersonalData: z.boolean().default(true),
  includeEmploymentData: z.boolean().default(true),
  includeEducationData: z.boolean().default(true),
});

// Schema for teacher import
export const importGuruSchema = z.object({
  file: z.any(), // File will be validated separately
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  defaultStatusKepegawaian: z.string().optional(),
});

// Schema for deleting a teacher
export const deleteGuruSchema = z.object({
  id: z.string({ message: "ID guru wajib ada" }).uuid("ID guru tidak valid"),
  reason: z
    .string()
    .min(10, "Alasan penghapusan minimal 10 karakter")
    .optional(),
  transferData: z.boolean().default(false), // Whether to keep teaching records
});

// Schema for teacher search and filtering
export const guruFilterSchema = z.object({
  search: z.string().optional(),
  statusKepegawaian: z.string().optional(),
  bidangStudi: z.string().optional(),
  golongan: z.string().optional(),
  pangkat: z.string().optional(),
  pendidikanTerakhir: z.string().optional(),
  hasKelas: z.boolean().optional(),
  hasMataPelajaran: z.boolean().optional(),
  jenisKelamin: z.nativeEnum(Gender).optional(),
  agama: z.nativeEnum(Agama).optional(),
  statusKawin: z.nativeEnum(StatusKawin).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum([
      "namaLengkap",
      "nip",
      "statusKepegawaian",
      "createdAt",
      "updatedAt",
      "masaKerja",
    ])
    .default("namaLengkap"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// User creation schema for teacher accounts
export const userCreateSchema = z.object({
  name: z
    .string({ message: "Nama wajib diisi" })
    .min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["GURU", "SISWA", "ADMIN"]),
});

// Type exports
export type CreateGuruInput = z.infer<typeof createGuruSchema>;
export type EditGuruInput = z.infer<typeof editGuruSchema>;
export type BulkGuruInput = z.infer<typeof bulkGuruSchema>;
export type ImportGuruInput = z.infer<typeof importGuruSchema>;
export type DeleteGuruInput = z.infer<typeof deleteGuruSchema>;
export type GuruFilterInput = z.infer<typeof guruFilterSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;

// Legacy export for backward compatibility
export const guruSchema = editGuruSchema;
export type GuruFormValues = z.infer<typeof guruSchema>;
