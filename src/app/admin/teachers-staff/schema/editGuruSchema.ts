import { z } from "zod";
import { Gender, Agama, StatusKawin } from "@/interface/enums";

// Import the base schemas
import {
  createGuruSchema,
  editGuruSchema as baseEditGuruSchema,
} from "./guruSchema";

// Extended edit schema with more specific validation for editing
export const editGuruSchema = baseEditGuruSchema
  .extend({
    // Additional validation for editing scenarios
    id: z.string({ message: "ID guru wajib ada" }).uuid("ID guru tidak valid"),
  })
  .refine(
    (data) => {
      // If employment status is provided, ensure related fields are consistent
      if (data.statusKepegawaian) {
        if (data.statusKepegawaian.toLowerCase().includes("pns")) {
          // PNS should have NIP, golongan, and pangkat
          return data.nip && data.golongan && data.pangkat;
        }
      }
      return true;
    },
    {
      message: "PNS harus memiliki NIP, golongan, dan pangkat",
      path: ["statusKepegawaian"],
    }
  )
  .refine(
    (data) => {
      // If TMT is provided, it should not be in the future
      if (data.tmt) {
        return data.tmt <= new Date();
      }
      return true;
    },
    {
      message: "TMT tidak boleh di masa depan",
      path: ["tmt"],
    }
  )
  .refine(
    (data) => {
      // If masa kerja is provided and TMT is provided, they should be consistent
      if (data.masaKerja && data.tmt) {
        const currentDate = new Date();
        const tmtDate = new Date(data.tmt);
        const yearsDiff = currentDate.getFullYear() - tmtDate.getFullYear();
        const monthsDiff = currentDate.getMonth() - tmtDate.getMonth();
        const totalYears = yearsDiff + monthsDiff / 12;

        // Allow some tolerance (±1 year)
        return Math.abs(totalYears - data.masaKerja) <= 1;
      }
      return true;
    },
    {
      message: "Masa kerja harus konsisten dengan TMT",
      path: ["masaKerja"],
    }
  );

// Specific schema for profile completion
export const completeGuruProfileSchema = editGuruSchema
  .required({
    namaLengkap: true,
    tempatLahir: true,
    tanggalLahir: true,
    jenisKelamin: true,
    agama: true,
    noHp: true,
    alamatLengkap: true,
    pendidikanTerakhir: true,
  })
  .extend({
    isProfileComplete: z.literal(true),
  });

// Schema for updating employment status
export const updateEmploymentStatusSchema = z
  .object({
    id: z.string().uuid(),
    statusKepegawaian: z.string().min(2),
    golongan: z.string().optional(),
    pangkat: z.string().optional(),
    tmt: z.date().optional(),
    masaKerja: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.statusKepegawaian.toLowerCase().includes("pns")) {
        return data.golongan && data.pangkat && data.tmt;
      }
      return true;
    },
    {
      message: "PNS harus memiliki golongan, pangkat, dan TMT",
      path: ["statusKepegawaian"],
    }
  );

// Schema for assigning teacher to class
export const assignTeacherToClassSchema = z.object({
  guruId: z.string().uuid(),
  kelasId: z.string().uuid(),
  isWaliKelas: z.boolean().default(false),
  tahunAjaran: z.string().regex(/^20\d{2}\/20\d{2}$/),
  semester: z.enum(["1", "2"]),
});

// Schema for assigning subject to teacher
export const assignSubjectToTeacherSchema = z.object({
  guruId: z.string().uuid(),
  mataPelajaranId: z.string().uuid(),
  kelasIds: z.array(z.string().uuid()).optional(),
  tahunAjaran: z.string().regex(/^20\d{2}\/20\d{2}$/),
  semester: z.enum(["1", "2"]),
});

// Schema for teacher performance evaluation
export const teacherEvaluationSchema = z.object({
  guruId: z.string().uuid(),
  tahunAjaran: z.string().regex(/^20\d{2}\/20\d{2}$/),
  semester: z.enum(["1", "2"]),
  nilaiKinerja: z.number().min(0).max(100),
  catatan: z.string().optional(),
  evaluatorId: z.string().uuid(),
});

// Type exports
export type EditGuruInput = z.infer<typeof editGuruSchema>;
export type CompleteGuruProfileInput = z.infer<
  typeof completeGuruProfileSchema
>;
export type UpdateEmploymentStatusInput = z.infer<
  typeof updateEmploymentStatusSchema
>;
export type AssignTeacherToClassInput = z.infer<
  typeof assignTeacherToClassSchema
>;
export type AssignSubjectToTeacherInput = z.infer<
  typeof assignSubjectToTeacherSchema
>;
export type TeacherEvaluationInput = z.infer<typeof teacherEvaluationSchema>;

// Re-export base schemas for convenience
export {
  createGuruSchema,
  guruFilterSchema,
  deleteGuruSchema,
  bulkGuruSchema,
} from "./guruSchema";
export type {
  CreateGuruInput,
  GuruFilterInput,
  DeleteGuruInput,
  BulkGuruInput,
} from "./guruSchema";
