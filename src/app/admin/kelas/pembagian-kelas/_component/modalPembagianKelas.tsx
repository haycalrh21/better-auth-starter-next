"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Guru, Siswa } from "@/interface";
import { toast } from "sonner";
import { KelasData, saveRandomKelas } from "../actions/createPembagianKelas";

type CreateRandomClassProps = {
  getSiswa: Siswa[];
  getGuru?: Guru[];
};

type KelasWithGuru = {
  siswa: string[];
  guru: string | null;
};

export default function CreateModalPembagianKelas({
  getSiswa,
  getGuru,
}: CreateRandomClassProps) {
  const openRef = useRef(false);
  const [open, setOpen] = useState(openRef.current);
  const [jumlahKelas, setJumlahKelas] = useState<number>(2);
  const [hasilKelas, setHasilKelas] = useState<KelasWithGuru[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form data untuk save
  const [tahunAjaran, setTahunAjaran] = useState(
    new Date().getFullYear().toString()
  );
  const [semester, setSemester] = useState("1");
  const [jurusan, setJurusan] = useState("Umum");

  const handleOpenChange = (val: boolean) => {
    openRef.current = val;
    setOpen(val);
    if (!val) {
      // Reset form saat modal ditutup
      setHasilKelas([]);
    }
  };

  // Fungsi shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Random kelas ketika tombol diklik
  const randomKelas = () => {
    if (!getSiswa || getSiswa.length === 0) return;

    // Shuffle siswa
    const shuffledSiswa = shuffleArray(getSiswa);

    // Shuffle guru jika ada
    const shuffledGuru =
      getGuru && getGuru.length > 0 ? shuffleArray(getGuru) : [];

    // Buat array kelas kosong
    const kelasArr: KelasWithGuru[] = Array.from(
      { length: jumlahKelas },
      () => ({
        siswa: [],
        guru: null,
      })
    );

    // Map siswa ke kelas menggunakan modulo index
    shuffledSiswa.forEach((siswa, index) => {
      const nama = siswa.namaLengkap ?? siswa.emailAlternatif ?? "-";
      kelasArr[index % jumlahKelas].siswa.push(nama);
    });

    // Assign guru ke setiap kelas (1 guru per kelas)
    kelasArr.forEach((kelas, index) => {
      if (shuffledGuru[index]) {
        kelas.guru =
          shuffledGuru[index].namaLengkap ??
          shuffledGuru[index].emailAlternatif ??
          "Guru Tidak Diketahui";
      }
    });

    setHasilKelas(kelasArr);
  };

  // Function untuk save kelas ke database
  const handleSaveKelas = async () => {
    if (hasilKelas.length === 0) {
      toast.success(
        "Tidak ada kelas yang dihasilkan. Silakan random kelas terlebih dahulu."
      );
      return;
    }

    // Validasi semua kelas harus punya guru
    const kelasWithoutGuru = hasilKelas.filter((kelas) => !kelas.guru);
    if (kelasWithoutGuru.length > 0) {
      toast.error(
        "Tidak ada kelas yang dihasilkan. Silakan random kelas terlebih dahulu."
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await saveRandomKelas({
        hasilKelas: hasilKelas as KelasData[],
        tahunAjaran,
        semester,
        jurusan,
      });

      if (result.success) {
        toast.success("Kelas berhasil disimpan!");
        handleOpenChange(false); // Close modal
      } else {
        toast.error(`Gagal menyimpan kelas: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving kelas:", error);
      toast.error("Terjadi kesalahan saat menyimpan kelas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const maxKelas =
    getGuru && getGuru.length > 0
      ? Math.min(getGuru.length, getSiswa.length)
      : getSiswa.length;

  return (
    <div>
      <Button variant="outline" onClick={() => handleOpenChange(true)}>
        Random Pembagian Kelas
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Random Pembagian Kelas</DialogTitle>
            <DialogDescription>
              Tentukan jumlah kelas dan klik tombol untuk membagi siswa dan
              assign guru.
              <br />
              <span className="text-sm text-gray-600">
                Total siswa: {getSiswa.length} | Total guru:{" "}
                {getGuru?.length || 0}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Form Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4  rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="tahun-ajaran">Tahun Ajaran</Label>
                <Input
                  id="tahun-ajaran"
                  type="text"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  placeholder="2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Input
                  id="jurusan"
                  type="text"
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  placeholder="Umum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah-kelas">Jumlah Kelas</Label>
                <Input
                  id="jumlah-kelas"
                  type="number"
                  min={1}
                  max={maxKelas}
                  value={jumlahKelas}
                  onChange={(e) =>
                    setJumlahKelas(
                      Math.max(1, Math.min(maxKelas, Number(e.target.value)))
                    )
                  }
                  placeholder="Masukkan jumlah kelas"
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-500">
              Maksimal {maxKelas} kelas (berdasarkan jumlah guru yang tersedia)
              <br />
              Rata-rata {Math.ceil(getSiswa.length / jumlahKelas)} siswa per
              kelas
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={randomKelas}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={getSiswa.length === 0}
              >
                {getSiswa.length === 0
                  ? "Tidak ada siswa"
                  : "Random Kelas & Assign Guru"}
              </Button>

              <Button
                type="button"
                onClick={handleSaveKelas}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={hasilKelas.length === 0 || isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Kelas ke Database"}
              </Button>
            </div>

            {/* Hasil random */}
            {hasilKelas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Hasil Pembagian Kelas:
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {hasilKelas.map((kelas, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-3">
                        <h4 className="font-semibold text-blue-600">
                          {jurusan} {idx + 1} ({kelas.siswa.length} siswa)
                        </h4>
                        <div
                          className={`mt-1 p-2 rounded-md ${
                            kelas.guru ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              kelas.guru ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            Wali Kelas: {kelas.guru || "❌ Tidak ada guru!"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Daftar Siswa:
                        </h5>
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="text-sm space-y-1">
                            {kelas.siswa.map((nama, namaIdx) => (
                              <li key={namaIdx} className="text-gray-600">
                                {namaIdx + 1}. {nama}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Ringkasan:</h4>
                  <div className="text-sm text-yellow-700 mt-1 grid grid-cols-2 gap-2">
                    <div>Total Kelas: {hasilKelas.length}</div>
                    <div>Total Siswa: {getSiswa.length}</div>
                    <div>
                      Guru Assigned: {hasilKelas.filter((k) => k.guru).length}
                    </div>
                    <div>Guru Tersedia: {getGuru?.length || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tombol tutup modal */}
            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
