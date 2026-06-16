"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { personsApi, clanApi } from "@/lib/api";
import { getAvatarUrl } from "@/lib/avatar";
import Modal from "@/components/ui/Modal";
import PersonForm from "@/components/person/PersonForm";
import type { Person } from "@/types";

function fullName(p: Person) {
  return [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ");
}

function yearOf(dateStr?: string | null) {
  if (!dateStr) return "";
  return dateStr.slice(0, 4);
}

export default function PeoplePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [clanName, setClanName] = useState<string>("Gia Phả Việt Nam");
  const [superAdminId, setSuperAdminId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);

  const load = () => personsApi.getAll().then(setPersons);

  useEffect(() => {
    load();
    clanApi.get().then((c) => {
      if (c?.name) setClanName(c.name);
      if (c?.superAdminId) setSuperAdminId(c.superAdminId);
    });
  }, []);

  const filtered = persons.filter((p) =>
    fullName(p).toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data: Omit<Person, "id">) => {
    await personsApi.create(data);
    setShowAdd(false);
    load();
  };

  const handleEdit = async (data: Omit<Person, "id">) => {
    if (!editTarget) return;
    await personsApi.update(editTarget.id, data);
    setEditTarget(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const person = persons.find((p) => p.id === id);
    const name = person ? fullName(person) : "người này";
    if (!confirm(`Xoá "${name}" khỏi danh sách?`)) return;
    await personsApi.delete(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{clanName}</h1>
          <Link href="/clan" className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-0.5">
            Cài đặt
          </Link>
        </div>
        <Link href="/tree" className="text-sm px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          Xem cây gia phả →
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên..."
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Thêm người
          </button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Họ tên</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Giới tính</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Năm sinh</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Năm mất</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Chưa có ai. Thêm người đầu tiên.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={getAvatarUrl(p.gender)}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fullName(p)}</span>
                        {p.id === superAdminId && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Không rõ"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{yearOf(p.birthDate) || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{yearOf(p.deathDate) || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditTarget(p)} className="text-xs px-2 py-1 border rounded hover:bg-gray-100">
                        Sửa
                      </button>
                      {p.id !== superAdminId && (
                        <button onClick={() => handleDelete(p.id)} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">
                          Xoá
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showAdd && (
        <Modal title="Thêm người" onClose={() => setShowAdd(false)}>
          <PersonForm
            defaultLastName={persons[persons.length - 1]?.lastName}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Sửa thông tin" onClose={() => setEditTarget(null)}>
          <PersonForm initial={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  );
}
