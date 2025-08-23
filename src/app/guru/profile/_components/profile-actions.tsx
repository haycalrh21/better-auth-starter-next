"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditProfileGuruDialog } from "./edit-profile-dialog";
import { useRouter } from "next/navigation";

interface ProfileActionsProps {
  guru: any;
}

export default function ProfileActions({ guru }: ProfileActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const router = useRouter();

  const handleEditSuccess = () => {
    router.refresh(); // Refresh the page to show updated data
  };

  return (
    <>
      <Button
        className="flex items-center gap-2 w-full sm:w-auto"
        onClick={() => setEditDialogOpen(true)}
      >
        <Edit className="h-4 w-4" />
        <span className="hidden sm:inline">Edit Profil</span>
        <span className="sm:hidden">Edit</span>
      </Button>

      <EditProfileGuruDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        guru={guru}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
