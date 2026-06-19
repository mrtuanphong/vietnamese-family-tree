"use client";

import { useState } from "react";
import type { Person, Gender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PlaceCombobox from "@/components/person/PlaceCombobox";

type PersonFormData = Omit<Person, "id">;

interface PersonFormProps {
  initial?: Partial<Person>;
  defaultLastName?: string;
  placeSuggestions?: string[];
  onSubmit: (data: PersonFormData) => Promise<void>;
  onCancel: () => void;
  formId?: string;
  hideButtons?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

interface DateParts {
  year: string;
  month: string;
  day: string;
}

function parseDateParts(dateStr: string | null | undefined): DateParts {
  if (!dateStr) return { year: "", month: "", day: "" };
  const [y, m, d] = dateStr.split("-");
  return { year: y ?? "", month: m ?? "", day: d ?? "" };
}

function buildDateString(parts: DateParts): string {
  if (!parts.month || !parts.day) {
    if (!parts.year) return "";
    return parts.year;
  }
  const y = parts.year || "0001";
  return `${y}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`;
}

function buildDeathDateString(parts: DateParts): string {
  if (!parts.month || !parts.day) return "";
  const y = parts.year || "0001";
  const m = parts.month.padStart(2, "0");
  const d = parts.day.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDeathDateParts(dateStr: string | null | undefined): DateParts {
  if (!dateStr) return { year: "", month: "", day: "" };
  const [y, m, d] = dateStr.split("-");
  return { year: y ?? "", month: m ?? "", day: d ?? "" };
}

function makeEmpty(defaultLastName?: string): PersonFormData {
  return {
    firstName: "",
    lastName: defaultLastName ?? "",
    middleName: "",
    gender: "male",
    birthDate: "",
    birthPlace: "",
    deathPlace: "",
    phone: "",
    photoUrl: "",
    bio: "",
    generation: null,
    childOrder: null,
    deathDateLunar: null,
  };
}


function DatePartsInput({
  label,
  parts,
  onChange,
}: {
  label: string;
  parts: DateParts;
  onChange: (parts: DateParts) => void;
}) {
  const set = (field: keyof DateParts) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...parts, [field]: e.target.value });

  return (
    <div>
      {label && <label className="font-medium block mb-1">{label}</label>}
      <div className="flex gap-1.5">
        <Input
          type="number"
          min={1}
          max={9999}
          value={parts.year}
          onChange={set("year")}
          placeholder="Năm"
        />
        <Input
          type="number"
          min={1}
          max={12}
          value={parts.month}
          onChange={set("month")}
          placeholder="Tháng"
        />
        <Input
          type="number"
          min={1}
          max={31}
          value={parts.day}
          onChange={set("day")}
          placeholder="Ngày"
        />
      </div>
    </div>
  );
}

export default function PersonForm({ initial, defaultLastName, placeSuggestions = [], onSubmit, onCancel, formId, hideButtons, onLoadingChange }: PersonFormProps) {
  const [form, setForm] = useState<PersonFormData>({ ...makeEmpty(defaultLastName), ...initial });
  const [birthParts, setBirthParts] = useState<DateParts>(() => parseDateParts(initial?.birthDate));
  const [deathParts, setDeathParts] = useState<DateParts>(() =>
    parseDeathDateParts(initial?.deathDateLunar)
  );
  const [loading, setLoading] = useState(false);

  const set = (field: keyof PersonFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onLoadingChange?.(true);
    try {
      await onSubmit({
        ...form,
        birthDate: buildDateString(birthParts) || "",
        deathDateLunar: buildDeathDateString(deathParts) || null,
      });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="font-medium block mb-1">Họ *</label>
          <Input required value={form.lastName} onChange={set("lastName")} placeholder="Nguyễn" />
        </div>
        <div>
          <label className="font-medium block mb-1">Đệm</label>
          <Input value={form.middleName ?? ""} onChange={set("middleName")} placeholder="Văn" />
        </div>
        <div>
          <label className="font-medium block mb-1">Tên *</label>
          <Input required value={form.firstName} onChange={set("firstName")} placeholder="An" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-medium block mb-1">Giới tính *</label>
          <Select
            value={form.gender}
            onValueChange={(v) => setForm((prev) => ({ ...prev, gender: v as Gender }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="unknown">Không rõ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="font-medium block mb-1">Số điện thoại</label>
          <Input value={form.phone ?? ""} onChange={set("phone")} type="tel" placeholder="0912 345 678" />
        </div>
      </div>

      <div>
        <label className="font-medium block mb-1">Ngày sinh <span className="text-muted-foreground font-normal">(Dương lịch)</span></label>
        <div className="flex gap-1.5">
          <Input className="flex-1 min-w-0" type="number" min={1} max={31} value={birthParts.day} onChange={(e) => setBirthParts({ ...birthParts, day: e.target.value })} placeholder="Ngày" />
          <Input className="flex-1 min-w-0" type="number" min={1} max={12} value={birthParts.month} onChange={(e) => setBirthParts({ ...birthParts, month: e.target.value })} placeholder="Tháng" />
          <Input className="flex-1 min-w-0" type="number" min={1} max={9999} value={birthParts.year} onChange={(e) => setBirthParts({ ...birthParts, year: e.target.value })} placeholder="Năm" />
        </div>
      </div>

      <div>
        <label className="font-medium block mb-1">Nơi sinh</label>
        <PlaceCombobox
          defaultValue={form.birthPlace ?? ""}
          onChange={(v) => setForm((prev) => ({ ...prev, birthPlace: v }))}
          suggestions={placeSuggestions}
        />
      </div>

      <div className="rounded-lg bg-muted p-3 flex flex-col gap-3 [&_input]:bg-background [&_.combobox-input]:bg-background">
        <div>
          <label className="font-medium block mb-1">Ngày mất (Âm lịch)</label>
          <div className="flex gap-1.5">
            <Input className="flex-1 min-w-0" type="number" min={1} max={31} value={deathParts.day} onChange={(e) => setDeathParts({ ...deathParts, day: e.target.value })} placeholder="Ngày" />
            <Input className="flex-1 min-w-0" type="number" min={1} max={12} value={deathParts.month} onChange={(e) => setDeathParts({ ...deathParts, month: e.target.value })} placeholder="Tháng" />
            <Input className="flex-1 min-w-0" type="number" min={1} max={9999} value={deathParts.year} onChange={(e) => setDeathParts({ ...deathParts, year: e.target.value })} placeholder="Năm" />
          </div>
        </div>
        <div>
          <label className="font-medium block mb-1">Nơi mất</label>
          <PlaceCombobox
            defaultValue={form.deathPlace ?? ""}
            onChange={(v) => setForm((prev) => ({ ...prev, deathPlace: v }))}
            suggestions={placeSuggestions}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-medium block mb-1 text-muted-foreground">Đời (thế hệ)</label>
          <Input
            type="text"
            value={form.generation != null ? `Đời ${form.generation}` : ""}
            disabled
            placeholder="Tự động tính toán"
            className="bg-muted text-muted-foreground"
          />
        </div>
        <div>
          <label className="font-medium block mb-1">Thứ tự con</label>
          <Input
            type="number"
            min={1}
            value={form.childOrder ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                childOrder: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            placeholder="VD: 1 (con cả)"
          />
        </div>
      </div>

      <div>
        <label className="font-medium block mb-1">Tiểu sử</label>
        <Textarea value={form.bio ?? ""} onChange={set("bio")} rows={3} className="resize-none" />
      </div>

      {!hideButtons && (
        <div className="flex gap-2 pt-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            Huỷ
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      )}
    </form>
  );
}
