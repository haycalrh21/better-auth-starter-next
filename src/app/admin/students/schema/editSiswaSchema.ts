import { z } from "zod";

export const siswaSchema = z.object({
  namaLengkap: z.string().min(1, "Nama Lengkap wajib diisi"),
  nisn: z.string().min(1, "NISN wajib diisi"),
  nik: z.string().min(1, "NIK wajib diisi"),
  tempatLahir: z.string().min(1, "Tempat Lahir wajib diisi"),

  tanggalLahir: z
    .date({ message: "Tanggal Lahir wajib diisi" })
    .refine((val) => !!val, {}),

  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"], {
    message: "Jenis Kelamin wajib dipilih",
  }),
  agama: z.enum(
    ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU"],
    { message: "Agama wajib dipilih" }
  ),
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
  kelas: z.string().optional(),
  tahunMasuk: z
    .number()
    .refine((val) => val >= 1900 && val <= new Date().getFullYear(), {
      message:
        "Tahun Lulus tidak valid. Masukkan tahun antara 1900 dan tahun sekarang.",
    }),
  namaAyah: z.string().min(1, "Nama Ayah wajib diisi"),
  namaIbu: z.string().min(1, "Nama Ibu wajib diisi"),
  namaWali: z.string().optional(),
  pekerjaanAyah: z.string().min(1, "Pekerjaan Ayah wajib diisi"),
  pekerjaanIbu: z.string().min(1, "Pekerjaan Ibu wajib diisi"),
  pekerjaanWali: z.string().optional(),
  noHpOrtu: z.string().optional(),
});

export type SiswaFormValues = z.infer<typeof siswaSchema>;
