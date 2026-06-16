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

export default function PersonForm({ initial, defaultLastName, onSubmit, onCancel }: PersonFormProps) {
  const [form, setForm] = useState<PersonFormData>({ ...makeEmpty(defaultLastName), ...initial });
  const [loading, setLoading] = useState(false);

  const set = (field: keyof PersonFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Họ *</label>
          <input required value={form.lastName} onChange={set("lastName")} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="Nguyễn" />
        </div>
        <div>
          <label className="text-sm font-medium">Đệm</label>
          <input value={form.middleName ?? ""} onChange={set("middleName")} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="Văn" />
        </div>
        <div>
          <label className="text-sm font-medium">Tên *</label>
          <input required value={form.firstName} onChange={set("firstName")} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="An" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Giới tính *</label>
        <select required value={form.gender} onChange={set("gender")} className="mt-1 w-full border rounded px-3 py-2 text-sm">
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="unknown">Không rõ</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Ngày sinh</label>
          <input type="date" value={form.birthDate ?? ""} onChange={set("birthDate")} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Nơi sinh</label>
          <input value={form.birthPlace ?? ""} onChange={set("birthPlace")} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Ngày mất</label>
          <input type="date" value={form.deathDate ?? ""} onChange={set("deathDate")} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Nơi mất</label>
          <input value={form.deathPlace ?? ""} onChange={set("deathPlace")} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Số điện thoại</label>
        <input value={form.phone ?? ""} onChange={set("phone")} type="tel" className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="0912 345 678" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Đời (thế hệ)</label>
        <input
          type="text"
          value={form.generation != null ? `Đời ${form.generation}` : ""}
          disabled
          placeholder="Tự động tính dựa vào đời của Super Admin hoặc các mối quan hệ liên quan"
          className="mt-1 w-full border rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed placeholder:text-gray-400 placeholder:italic"
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
