"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { personsApi, clanApi } from "@/lib/api";
import { getAvatarUrl } from "@/lib/avatar";
import Modal from "@/components/ui/Modal";
import PersonForm from "@/components/person/PersonForm";
import BottomTabBar from "@/components/ui/BottomTabBar";
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
  const [sortBy, setSortBy] = useState<"recent" | "generation" | "name">("recent");
  const [genFilter, setGenFilter] = useState<number | null>(null);
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

  const hasGenerations = persons.some((p) => p.generation != null);

  const generations = Array.from(
    new Set(persons.map((p) => p.generation).filter((g): g is number => g != null))
  ).sort((a, b) => a - b);

  const filtered = persons
    .filter((p) => fullName(p).toLowerCase().includes(search.toLowerCase()))
    .filter((p) => genFilter === null || p.generation === genFilter)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1;
      }
      if (sortBy === "generation") {
        const ga = a.generation ?? Infinity;
        const gb = b.generation ?? Infinity;
        return ga - gb;
      }
      return a.firstName.localeCompare(b.firstName, "vi");
    });

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
    if (!confirm(`Xoá "${name}" khỏi dòng họ?`)) return;
    await personsApi.delete(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2">
        <h1 className="text-base sm:text-xl font-bold flex-1 min-w-0 truncate">{clanName}</h1>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link href="/clan" className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-1 whitespace-nowrap">
            Cài đặt
          </Link>
          <Link href="/tree" className="text-sm px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 whitespace-nowrap">
            Xem cây gia phả →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <div className="flex items-center gap-2 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên..."
            className="border rounded px-3 py-2 text-sm flex-1 min-w-0"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            + Thêm người
          </button>
        </div>

        {generations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <button
              onClick={() => setGenFilter(null)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${genFilter === null ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
            >
              Tất cả
            </button>
            {generations.map((g) => (
              <button
                key={g}
                onClick={() => setGenFilter(g)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${genFilter === g ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-300 hover:border-amber-400"}`}
              >
                Đời {g}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap">Xếp theo</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Mới thêm</option>
                <option value="generation">Đời</option>
                <option value="name">Tên</option>
              </select>
            </div>
          </div>
        )}

        {generations.length === 0 && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 whitespace-nowrap">Xếp theo</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Mới thêm</option>
                <option value="generation">Đời</option>
                <option value="name">Tên</option>
              </select>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Họ tên</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Giới tính</th>
                {hasGenerations && <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Đời</th>}
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Năm sinh</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={100} className="text-center py-8 text-gray-400">
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
                        className="rounded-full shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium">{fullName(p)}</span>
                          {p.id === superAdminId && (
                            <span title="Tài khoản Super Admin" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                              SA
                            </span>
                          )}
                        </div>
                        {p.generation != null && (
                          <span className="text-xs text-gray-400 sm:hidden">
                            Đời {p.generation}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Không rõ"}
                  </td>
                  {hasGenerations && (
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {p.generation != null ? `Đời ${p.generation}` : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {yearOf(p.birthDate)
                      ? yearOf(p.deathDate)
                        ? `${yearOf(p.birthDate)}-${yearOf(p.deathDate)}`
                        : yearOf(p.birthDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/tree?selected=${p.id}`}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100 whitespace-nowrap"
                      >
                        Xem cây
                      </Link>
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

      <BottomTabBar />
    </div>
  );
}
