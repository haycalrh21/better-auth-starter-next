import { z } from "zod";

export const guruSchema = z.object({
  // Semua field sekarang wajib diisi
  namaLengkap: z.string().min(1, "Nama Lengkap wajib diisi"),
  nip: z.string().min(1, "NIP wajib diisi"),
  nik: z.string().min(1, "NIK wajib diisi"),
  tempatLahir: z.string().min(1, "Tempat Lahir wajib diisi"),

  tanggalLahir: z
    .date({ message: "Tanggal Lahir wajib diisi" })
    .refine((val) => !!val, {}),

  jenisKelamin: z
    .enum(["LAKI_LAKI", "PEREMPUAN"], { message: "  wajib diisi" })
    .refine((val) => !!val, "Jenis Kelamin wajib dipilih"),

  agama: z.enum(
    ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU"],
    { message: "  wajib diisi" }
  ),
  statusKawin: z
    .enum(["BELUM_KAWIN", "KAWIN", "CERAI_HIDUP", "CERAI_MATI"], {
      message: "  wajib diisi",
    })
    .refine((val) => !!val, "Status Kawin wajib dipilih"),

  noHp: z.string().min(1, "Nomor HP wajib diisi"),
  emailAlternatif: z
    .string()
    .email("Format email tidak valid")
    .min(1, "Email Alternatif wajib diisi"),
  alamatLengkap: z.string().min(1, "Alamat Lengkap wajib diisi"),
  kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kabupatenKota: z.string().min(1, "Kabupaten/Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  kodePos: z.string().min(1, "Kode Pos wajib diisi"),
  pendidikanTerakhir: z.string().min(1, "Pendidikan Terakhir wajib diisi"),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),

  tahunLulus: z
    .number()
    .refine((val) => val >= 1900 && val <= new Date().getFullYear(), {
      message:
        "Tahun Lulus tidak valid. Masukkan tahun antara 1900 dan tahun sekarang.",
    }),

  institusi: z.string().min(1, "Institusi wajib diisi"),
  statusKepegawaian: z.string().min(1, "Status Kepegawaian wajib diisi"),
  golongan: z.string().min(1, "Golongan wajib diisi"),
  pangkat: z.string().min(1, "Pangkat wajib diisi"),

  tmt: z.date({ message: "  wajib diisi" }).refine((val) => !!val, {
    message: "TMT wajib diisi",
  }),

  bidangStudi: z.string().min(1, "Bidang Studi wajib diisi"),
});

export type GuruFormValues = z.infer<typeof guruSchema>;
