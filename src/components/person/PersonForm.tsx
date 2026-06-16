"use client";

import { useState } from "react";
import type { Person } from "@/types";

type PersonFormData = Omit<Person, "id">;

interface PersonFormProps {
  initial?: Partial<Person>;
  defaultLastName?: string;
  onSubmit: (data: PersonFormData) => Promise<void>;
  onCancel: () => void;
}

interface DateParts {
  year: string;
  month: string;
  day: string;
}

function parseDateParts(dateStr: string | null | undefined): DateParts {
  if (!dateStr) return { year: "", month: "", day: "" };
  const parts = dateStr.split("-");
  return { year: parts[0] ?? "", month: parts[1] ?? "", day: parts[2] ?? "" };
}

function buildDateString(parts: DateParts): string {
  if (!parts.year) return "";
  if (!parts.month) return parts.year;
  if (!parts.day) return `${parts.year}-${parts.month.padStart(2, "0")}`;
  return `${parts.year}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`;
}

function makeEmpty(defaultLastName?: string): PersonFormData {
  return {
    firstName: "",
    lastName: defaultLastName ?? "",
    middleName: "",
    gender: "male",
    birthDate: "",
    birthPlace: "",
    deathDate: "",
    deathPlace: "",
    phone: "",
    photoUrl: "",
    bio: "",
    generation: null,
  };
}

const inputCls = "border rounded px-3 py-2 text-sm w-full";

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
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex gap-1.5">
        <input
          type="number"
          min={1}
          max={9999}
          value={parts.year}
          onChange={set("year")}
          placeholder="Năm"
          className={inputCls}
        />
        <input
          type="number"
          min={1}
          max={12}
          value={parts.month}
          onChange={set("month")}
          placeholder="Tháng"
          className={inputCls}
        />
        <input
          type="number"
          min={1}
          max={31}
          value={parts.day}
          onChange={set("day")}
          placeholder="Ngày"
          className={inputCls}
        />
      </div>
    </div>
  );
}

export default function PersonForm({ initial, defaultLastName, onSubmit, onCancel }: PersonFormProps) {
  const [form, setForm] = useState<PersonFormData>({ ...makeEmpty(defaultLastName), ...initial });
  const [birthParts, setBirthParts] = useState<DateParts>(() => parseDateParts(initial?.birthDate));
  const [deathParts, setDeathParts] = useState<DateParts>(() => parseDateParts(initial?.deathDate));
  const [loading, setLoading] = useState(false);

  const set = (field: keyof PersonFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        birthDate: buildDateString(birthParts) || "",
        deathDate: buildDateString(deathParts) || "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Họ *</label>
          <input required value={form.lastName} onChange={set("lastName")} className={`mt-1 ${inputCls}`} placeholder="Nguyễn" />
        </div>
        <div>
          <label className="text-sm font-medium">Đệm</label>
          <input value={form.middleName ?? ""} onChange={set("middleName")} className={`mt-1 ${inputCls}`} placeholder="Văn" />
        </div>
        <div>
          <label className="text-sm font-medium">Tên *</label>
          <input required value={form.firstName} onChange={set("firstName")} className={`mt-1 ${inputCls}`} placeholder="An" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Giới tính *</label>
        <select required value={form.gender} onChange={set("gender")} className={`mt-1 ${inputCls}`}>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="unknown">Không rõ</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePartsInput label="Ngày sinh" parts={birthParts} onChange={setBirthParts} />
        <div>
          <label className="text-sm font-medium">Nơi sinh</label>
          <input value={form.birthPlace ?? ""} onChange={set("birthPlace")} className={`mt-1 ${inputCls}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePartsInput label="Ngày mất" parts={deathParts} onChange={setDeathParts} />
        <div>
          <label className="text-sm font-medium">Nơi mất</label>
          <input value={form.deathPlace ?? ""} onChange={set("deathPlace")} className={`mt-1 ${inputCls}`} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Số điện thoại</label>
        <input value={form.phone ?? ""} onChange={set("phone")} type="tel" className={`mt-1 ${inputCls}`} placeholder="0912 345 678" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Đời (thế hệ)</label>
        <input
          type="text"
          value={form.generation != null ? `Đời ${form.generation}` : ""}
          disabled
          placeholder="Tự động tính toán"
          className={`mt-1 ${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed placeholder:text-gray-400 placeholder:italic`}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tiểu sử</label>
        <textarea value={form.bio ?? ""} onChange={set("bio")} rows={3} className="mt-1 w-full border rounded px-3 py-2 text-sm resize-none" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
          Huỷ
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
