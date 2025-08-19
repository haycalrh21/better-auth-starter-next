// GuruDetailsDialog.tsx

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Definisikan tipe untuk props, membuatnya generik
interface GuruDetailsDialogProps<TData extends Record<string, unknown>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TData | null;
}

export function GuruDetailsDialog<TData extends Record<string, unknown>>({
  open,
  onOpenChange,
  item,
}: GuruDetailsDialogProps<TData>) {
  if (!item) {
    return null; // Jangan render apapun jika tidak ada item yang dipilih
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Detail Data Guru</DialogTitle>
          <DialogDescription>
            Informasi lengkap data guru yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 p-4 max-h-[70vh] overflow-y-auto">
          {/* Data Pribadi */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Data Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Nama Lengkap:
                </span>
                <span className="text-sm">
                  {String(item.namaLengkap || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">NIP:</span>
                <span className="text-sm">{String(item.nip || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">NIK:</span>
                <span className="text-sm">{String(item.nik || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Tempat Lahir:
                </span>
                <span className="text-sm">
                  {String(item.tempatLahir || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Tanggal Lahir:
                </span>
                <span className="text-sm">
                  {item.tanggalLahir
                    ? new Date(
                        item.tanggalLahir as string | Date
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Jenis Kelamin:
                </span>
                <span className="text-sm">
                  {String(item.jenisKelamin || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Agama:
                </span>
                <span className="text-sm">{String(item.agama || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Status Kawin:
                </span>
                <span className="text-sm">
                  {String(item.statusKawin || "-")}
                </span>
              </div>
            </div>
          </div>

          {/* Kontak */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  No. HP:
                </span>
                <span className="text-sm">{String(item.noHp || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Email:
                </span>
                <span className="text-sm text-blue-600">
                  {String(item.emailAlternatif || "-")}
                </span>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Alamat</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Alamat Lengkap:
                </span>
                <span className="text-sm text-right max-w-xs">
                  {String(item.alamatLengkap || "-")}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="font-medium text-sm text-gray-600">
                    Kelurahan:
                  </span>
                  <span className="text-sm">
                    {String(item.kelurahan || "-")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm text-gray-600">
                    Kecamatan:
                  </span>
                  <span className="text-sm">
                    {String(item.kecamatan || "-")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm text-gray-600">
                    Kabupaten/Kota:
                  </span>
                  <span className="text-sm">
                    {String(item.kabupatenKota || "-")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm text-gray-600">
                    Provinsi:
                  </span>
                  <span className="text-sm">
                    {String(item.provinsi || "-")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-sm text-gray-600">
                    Kode Pos:
                  </span>
                  <span className="text-sm">{String(item.kodePos || "-")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pendidikan */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Pendidikan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Pendidikan Terakhir:
                </span>
                <span className="text-sm">
                  {String(item.pendidikanTerakhir || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Jurusan:
                </span>
                <span className="text-sm">{String(item.jurusan || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Tahun Lulus:
                </span>
                <span className="text-sm">
                  {item.tahunLulus ? String(item.tahunLulus) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Institusi:
                </span>
                <span className="text-sm">{String(item.institusi || "-")}</span>
              </div>
            </div>
          </div>

          {/* Kepegawaian */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Kepegawaian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Status Kepegawaian:
                </span>
                <span className="text-sm">
                  {String(item.statusKepegawaian || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Golongan:
                </span>
                <span className="text-sm">{String(item.golongan || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Pangkat:
                </span>
                <span className="text-sm">{String(item.pangkat || "-")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">TMT:</span>
                <span className="text-sm">
                  {item.tmt
                    ? new Date(item.tmt as string | Date).toLocaleDateString(
                        "id-ID"
                      )
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Masa Kerja:
                </span>
                <span className="text-sm">
                  {item.masaKerja ? `${item.masaKerja} tahun` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Mengajar */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Data Mengajar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Bidang Studi:
                </span>
                <span className="text-sm">
                  {String(item.bidangStudi || "-")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm text-gray-600">
                  Kelas:
                </span>
                <span className="text-sm">{String(item.kelas || "-")}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm text-gray-600">
                Status Profil:
              </span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  item.isProfileComplete
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.isProfileComplete ? "Lengkap" : "Belum Lengkap"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
