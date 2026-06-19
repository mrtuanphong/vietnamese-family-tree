"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import type { Person } from "@/types";
import { personsApi } from "@/lib/api";
import PersonForm from "@/components/person/PersonForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type PersonFormData = Omit<Person, "id">;

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial?: Partial<Person>;
  defaultLastName?: string;
  onSubmit: (data: PersonFormData) => Promise<void>;
}

export default function PersonDialog({
  open,
  onOpenChange,
  title,
  initial,
  defaultLastName,
  onSubmit,
}: PersonDialogProps) {
  const formId = useId();
  const [loading, setLoading] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    personsApi.getAll().then((persons) => {
      const places = Array.from(
        new Set(
          persons
            .flatMap((p) => [p.birthPlace, p.deathPlace])
            .filter((v): v is string => !!v && v.trim() !== "")
        )
      ).sort((a, b) => a.localeCompare(b, "vi"));
      setPlaceSuggestions(places);
    });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col p-0 gap-0 sm:max-w-lg max-h-[90vh]"
      >
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0 flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 text-muted-foreground shrink-0">
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <PersonForm
            key={initial?.id ?? "new"}
            formId={formId}
            initial={initial}
            defaultLastName={defaultLastName}
            placeSuggestions={placeSuggestions}
            onSubmit={async (data) => {
              await onSubmit(data);
              toast.success("Đã lưu thành công");
            }}
            onCancel={() => onOpenChange(false)}
            onLoadingChange={setLoading}
            hideButtons
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted rounded-b-xl flex-col sm:flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Bỏ qua
            </Button>
            <Button type="submit" form={formId} disabled={loading} className="flex-1">
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
