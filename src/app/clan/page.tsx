"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clanApi } from "@/lib/api";
import type { Clan } from "@/types";

type ClanForm = Omit<Clan, "id">;

const defaultForm: ClanForm = {
  name: "",
  address: "",
  description: "",
  enabled: true,
};

export default function ClanPage() {
  const [form, setForm] = useState<ClanForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    clanApi.get().then((clan) => {
      if (clan) setForm({ name: clan.name, address: clan.address ?? "", description: clan.description ?? "", enabled: clan.enabled });
      setLoading(false);
    });
  }, []);

  const set = (field: keyof ClanForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await clanApi.upsert(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Quay lại</Link>
        <h1 className="text-xl font-bold">Thông tin dòng họ</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Cover placeholder */}
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-dashed border-amber-200 rounded-xl flex flex-col items-center justify-center mb-8 text-amber-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Ảnh bìa dòng họ</span>
          <span className="text-xs mt-1 text-amber-300">(Tính năng upload ảnh sẽ có sau)</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium">Tên dòng họ *</label>
            <input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Họ Đỗ Quảng Tái"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <input
              value={form.address ?? ""}
              onChange={set("address")}
              placeholder="Làng Quảng Tái, Xã Ứng Hòa, Thành phố Hà Nội"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              value={form.description ?? ""}
              onChange={set("description")}
              rows={4}
              placeholder="Mô tả về nguồn gốc, lịch sử dòng họ..."
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="text-sm font-medium">Kích hoạt workspace</p>
              <p className="text-xs text-gray-400 mt-0.5">Tắt để ẩn dòng họ này khỏi danh sách</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.enabled ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className={`text-sm transition-opacity ${saved ? "opacity-100 text-green-600" : "opacity-0"}`}>
              ✓ Đã lưu
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
