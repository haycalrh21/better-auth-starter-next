"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Guru } from "@/interface/guru";
import { toast } from "sonner";
import { deleteGuru } from "../actions/delete-teacher";
import { Button } from "@/components/ui/button";

interface DeleteGuruDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Guru | null;
}

export default function DeleteGuruDialog({
  open,
  onOpenChange,
  item,
}: DeleteGuruDialogProps) {
  const handleDelete = async () => {
    if (!item) return;

    try {
      const confirmDelete = await deleteGuru(item.userId);
      if (confirmDelete.success) {
        toast.success("Guru deleted successfully");
        onOpenChange(false);
      } else {
        toast.error("Failed to delete guru");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            type="button"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
