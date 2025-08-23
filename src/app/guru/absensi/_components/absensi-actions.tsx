"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList } from "lucide-react";
import { MonthlyAttendanceDialog } from "./monthly-attendance-dialog";
import { useRouter } from "next/navigation";

interface AbsensiActionsProps {
  guru: any;
  kelas: any[];
}

export default function AbsensiActions({ guru, kelas }: AbsensiActionsProps) {
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const router = useRouter();

  const handleInputSuccess = () => {
    router.refresh(); // Refresh the page to show updated data
  };

  return (
    <>
      <Button
        className="flex items-center gap-2 w-full sm:w-auto"
        onClick={() => setMonthlyDialogOpen(true)}
        disabled={kelas.length === 0}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Input Absensi</span>
        <span className="sm:hidden">Input</span>
      </Button>

      <MonthlyAttendanceDialog
        open={monthlyDialogOpen}
        onOpenChange={setMonthlyDialogOpen}
        kelas={kelas}
        onSuccess={handleInputSuccess}
      />
    </>
  );
}
