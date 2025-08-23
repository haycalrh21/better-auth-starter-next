"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ProfileCompletionHelperProps {
  guru: any;
  completionPercentage: number;
}

export default function ProfileCompletionHelper({
  guru,
  completionPercentage,
}: ProfileCompletionHelperProps) {
  const requiredFields = [
    { field: "namaLengkap", label: "Nama Lengkap", value: guru.namaLengkap },
    { field: "tempatLahir", label: "Tempat Lahir", value: guru.tempatLahir },
    { field: "tanggalLahir", label: "Tanggal Lahir", value: guru.tanggalLahir },
    { field: "jenisKelamin", label: "Jenis Kelamin", value: guru.jenisKelamin },
    { field: "agama", label: "Agama", value: guru.agama },
    { field: "noHp", label: "Nomor HP", value: guru.noHp },
    {
      field: "alamatLengkap",
      label: "Alamat Lengkap",
      value: guru.alamatLengkap,
    },
    {
      field: "pendidikanTerakhir",
      label: "Pendidikan Terakhir",
      value: guru.pendidikanTerakhir,
    },
  ];

  const optionalFields = [
    { field: "nip", label: "NIP", value: guru.nip },
    { field: "nik", label: "NIK", value: guru.nik },
    {
      field: "emailAlternatif",
      label: "Email Alternatif",
      value: guru.emailAlternatif,
    },
    { field: "bidangStudi", label: "Bidang Studi", value: guru.bidangStudi },
    {
      field: "statusKepegawaian",
      label: "Status Kepegawaian",
      value: guru.statusKepegawaian,
    },
  ];

  const completedRequired = requiredFields.filter(
    (field) => field.value
  ).length;
  const completedOptional = optionalFields.filter(
    (field) => field.value
  ).length;

  if (completionPercentage === 100) {
    return null; // Don't show if profile is complete
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <AlertCircle className="h-5 w-5" />
          Panduan Kelengkapan Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Progress Kelengkapan
            </span>
            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Data Wajib ({completedRequired}/{requiredFields.length})
            </h4>
            <div className="space-y-1">
              {requiredFields.map((field) => (
                <div
                  key={field.field}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {field.label}
                  </span>
                  {field.value ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Data Opsional ({completedOptional}/{optionalFields.length})
            </h4>
            <div className="space-y-1">
              {optionalFields.slice(0, 3).map((field) => (
                <div
                  key={field.field}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {field.label}
                  </span>
                  {field.value ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              ))}
              {optionalFields.length > 3 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  +{optionalFields.length - 3} data lainnya
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            💡 Lengkapi semua data wajib untuk mengakses fitur penuh sistem
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
