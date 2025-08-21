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
import { Beasiswa, Kelas, SiswaWithRelations } from "@/interface";

interface SiswaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: SiswaWithRelations | null;
}

export function SiswaDetailsDialog({
  open,
  onOpenChange,
  item,
}: SiswaDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Detail Data Siswa</DialogTitle>
          <DialogDescription>
            Informasi lengkap data siswa yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 p-4 max-h-[70vh] overflow-y-auto">
          {/* Data Pribadi */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Data Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailRow label="Nama Lengkap" value={item?.namaLengkap} />
              <DetailRow label="NISN" value={item?.nisn} />
              <DetailRow label="NIK" value={item?.nik} />
              <DetailRow label="Tempat Lahir" value={item?.tempatLahir} />
              <DetailRow
                label="Tanggal Lahir"
                value={
                  item?.tanggalLahir
                    ? new Date(item?.tanggalLahir).toLocaleDateString("id-ID")
                    : "-"
                }
              />
              <DetailRow label="Jenis Kelamin" value={item?.jenisKelamin} />
              <DetailRow label="Agama" value={item?.agama} />
              <DetailRow label="Status Siswa" value={item?.statsuSiswa} />
              <DetailRow label="Tahun Masuk" value={item?.tahunMasuk} />
            </div>
          </div>

          {/* Kontak */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailRow label="No. HP" value={item?.noHp} />
              <DetailRow label="Email" value={item?.emailAlternatif} />
            </div>
          </div>

          {/* Alamat */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Alamat</h3>
            <div className="space-y-2">
              <DetailRow
                label="Alamat Lengkap"
                value={item?.alamatLengkap}
                full
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailRow label="Kelurahan" value={item?.kelurahan} />
                <DetailRow label="Kecamatan" value={item?.kecamatan} />
                <DetailRow label="Kabupaten/Kota" value={item?.kabupatenKota} />
                <DetailRow label="Provinsi" value={item?.provinsi} />
                <DetailRow label="Kode Pos" value={item?.kodePos} />
              </div>
            </div>
          </div>

          {/* Orang Tua / Wali */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Data Orang Tua / Wali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailRow label="Nama Ayah" value={item?.namaAyah} />
              <DetailRow label="Pekerjaan Ayah" value={item?.pekerjaanAyah} />
              <DetailRow label="Nama Ibu" value={item?.namaIbu} />
              <DetailRow label="Pekerjaan Ibu" value={item?.pekerjaanIbu} />
              <DetailRow label="Nama Wali" value={item?.namaWali} />
              <DetailRow label="Pekerjaan Wali" value={item?.pekerjaanWali} />
              <DetailRow label="No. HP Ortu/Wali" value={item?.noHpOrtu} />
            </div>
          </div>

          {/* Kelas */}
          {Array.isArray(item?.kelas) && item?.kelas.length > 0 ? (
            item?.kelas.map((k: Kelas, idx: number) => (
              <div
                key={idx}
                className="flex justify-between text-sm border p-2 rounded"
              >
                <span className="font-medium">Kelas :{k.namaKelas}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500">Belum ada kelas</span>
          )}

          {/* Beasiswa */}
          {Array.isArray(item?.Beasiswa) && item?.Beasiswa.length > 0 ? (
            item?.Beasiswa.map((b: Beasiswa, idx: number) => (
              <div
                key={idx}
                className="flex justify-between text-sm border p-2 rounded"
              >
                <span>{b.nama}</span>
                <span>{b.deskripsi}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500">Belum ada beasiswa</span>
          )}

          {/* Status Profil */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between item?s-center">
              <span className="font-medium text-sm text-gray-600">
                Status Profil:
              </span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  item?.isProfileComplete
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item?.isProfileComplete ? "Lengkap" : "Belum Lengkap"}
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

function DetailRow({
  label,
  value,
  full,
}: {
  label: string;
  value: string | number | Date | null | undefined;
  full?: boolean;
}) {
  return (
    <div className={`flex justify-between ${full ? "col-span-2" : ""}`}>
      <span className="font-medium text-sm text-gray-600">{label}:</span>
      <span className="text-sm text-right max-w-xs">
        {value instanceof Date
          ? value.toLocaleDateString("id-ID")
          : value ?? "-"}
      </span>
    </div>
  );
}
