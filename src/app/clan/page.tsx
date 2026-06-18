"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { clanApi, personsApi } from "@/lib/api";
import BottomTabBar from "@/components/ui/BottomTabBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Clan, Person } from "@/types";

type ClanForm = Omit<Clan, "id">;

const defaultForm: ClanForm = {
  name: "",
  address: "",
  description: "",
  enabled: true,
  superAdminId: null,
  superAdminGeneration: null,
};

function fullName(p: Person) {
  return [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ");
}

export default function ClanPage() {
  const [form, setForm] = useState<ClanForm>(defaultForm);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([clanApi.get(), personsApi.getAll()]).then(([clan, ps]) => {
      if (clan) {
        setForm({
          name: clan.name,
          address: clan.address ?? "",
          description: clan.description ?? "",
          enabled: clan.enabled,
          superAdminId: clan.superAdminId ?? null,
          superAdminGeneration: clan.superAdminGeneration ?? null,
        });
      }
      setPersons(ps);
      setLoading(false);
    });
  }, []);

  const set = (field: keyof ClanForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value || null }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clanApi.upsert(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Lỗi khi lưu: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const superAdmin = persons.find((p) => p.id === form.superAdminId);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center">
        <h1 className="text-xl font-semibold">Thông tin dòng họ</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <Card>
        <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-5">
          <div>
            <label className="font-medium">Tên dòng họ *</label>
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Họ Đỗ Quảng Tái"
              className="mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Địa chỉ</label>
            <Input
              value={form.address ?? ""}
              onChange={set("address")}
              placeholder="Làng Quảng Tái, Xã Ứng Hòa, Thành phố Hà Nội"
              className="mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Mô tả</label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Mô tả về nguồn gốc, lịch sử dòng họ..."
              className="mt-1 resize-none"
            />
          </div>

          {/* Super Admin */}
          <div className="border-t pt-5">
            <label className="font-medium">Quản trị viên (Super Admin)</label>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">Chọn 1 người trong dòng họ làm quản trị viên workspace</p>

            {persons.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Chưa có người nào trong danh sách. Thêm người trước.</p>
            ) : (
              <Select
                value={form.superAdminId ?? "none"}
                onValueChange={(v) => setForm((prev) => ({ ...prev, superAdminId: v === "none" ? null : v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Chưa chọn —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Chưa chọn —</SelectItem>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {superAdmin && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-brand-50 border border-brand-100 rounded-lg">
                <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${superAdmin.gender === "female" ? "bg-pink-100 text-pink-400" : "bg-gray-100 text-gray-500"}`}>
                  <User size={18} />
                </span>
                <div>
                  <p className="font-medium">{fullName(superAdmin)}</p>
                  <p className="text-xs text-brand-500">Tài khoản Super Admin</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm((prev) => ({ ...prev, superAdminId: null, superAdminGeneration: null }))}
                  className="ml-auto text-xs text-gray-400 hover:text-red-500"
                >
                  Bỏ chọn
                </Button>
              </div>
            )}

            {superAdmin && (
              <div className="mt-3">
                <label className="font-medium">
                  {fullName(superAdmin)} thuộc đời thứ
                </label>
                <p className="text-xs text-gray-400 mt-0.5 mb-2">
                  Dùng làm tham chiếu tính đời cho toàn bộ dòng họ
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.superAdminGeneration ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        superAdminGeneration: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    placeholder="VD: 5"
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">
                    {form.superAdminGeneration
                      ? `→ Đời ${form.superAdminGeneration}`
                      : "Chưa nhập"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="font-medium">Kích hoạt workspace</p>
              <p className="text-xs text-gray-400 mt-0.5">Tắt để ẩn dòng họ này khỏi danh sách</p>
            </div>
            <Switch checked disabled />
          </div>

        </CardContent>
        <CardFooter className="border-t justify-between">
          <span className={`text-sm transition-opacity ${saved ? "opacity-100 text-green-600" : "opacity-0"}`}>
            ✓ Đã lưu
          </span>
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </CardFooter>
        </form>
        </Card>
      </main>
      <BottomTabBar />
    </div>
  );
}
