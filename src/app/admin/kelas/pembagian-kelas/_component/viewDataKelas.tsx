// KelasDetailsDialog.tsx
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
import { KelasWithRelations } from "@/interface";

interface KelasDetailsDialogProps<TData extends KelasWithRelations> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TData | null;
}

export function KelasDetailsDialog<TData extends KelasWithRelations>({
  open,
  onOpenChange,
  item,
}: KelasDetailsDialogProps<TData>) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Data Kelas</DialogTitle>
          <DialogDescription>
            Informasi lengkap data kelas yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[70vh] overflow-y-auto">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Informasi Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Nama Kelas:</span>
                <span>{item.namaKelas}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Tahun Ajaran:</span>
                <span>{item.tahunAjaran}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Jurusan:</span>
                <span>{item.jurusan ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Semester:</span>
                <span>{item.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Nama Guru:</span>
                <span>{item.guru?.namaLengkap ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Jumlah Siswa:</span>
                <span>{item.siswa?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Jumlah Jadwal:
                </span>
                <span>{item.Jadwal?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Jumlah Pembayaran:
                </span>
                <span>{item.Pembayaran?.length ?? 0}</span>
              </div>
              {/* Div tambahan untuk menampilkan nama siswa */}
              <div className="col-span-1 md:col-span-2">
                <span className="font-medium text-gray-600">Daftar Siswa:</span>
                {item.siswa && item.siswa.length > 0 ? (
                  <ul className="mt-1 max-h-40 overflow-y-auto list-disc list-inside text-gray-700">
                    {item.siswa.map((s) => (
                      <li key={s.id} className="truncate">
                        {s.namaLengkap}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-1 text-gray-400">-</div>
                )}
              </div>
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
