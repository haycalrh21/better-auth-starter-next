"use client";

import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogReusableProps {
  trigger?: ReactNode; // tombol pembuka
  title: string; // judul modal
  description?: string; // deskripsi opsional
  children: ReactNode; // isi modal (form / content)
  footer?: ReactNode; // custom footer
  maxWidth?: string; // lebar maksimal
  open?: boolean; // controlled state
  onOpenChange?: (open: boolean) => void; // handler open
}

export function DialogReusable({
  trigger,
  title,
  description,
  children,

  maxWidth = "sm:max-w-[500px]",
  open,
  onOpenChange,
}: DialogReusableProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent forceMount className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* content scrollable */}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
