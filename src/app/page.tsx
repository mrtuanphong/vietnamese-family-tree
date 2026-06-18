"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Heart, Users } from "lucide-react";
import { personsApi, clanApi, relationshipsApi, marriagesApi } from "@/lib/api";
import PersonDialog from "@/components/person/PersonDialog";
import BottomTabBar from "@/components/ui/BottomTabBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Person, Relationship, Marriage } from "@/types";

type Tab = "people" | "families" | "events";

function fullName(p: Person) {
  return [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ");
}

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function dateOf(dateStr?: string | null) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  const y = parts[0] === "0001" ? "—" : (parts[0] ?? "—");
  const m = parts[1] ?? "—";
  const d = parts[2] ?? "—";
  return `${d}/${m}/${y}`;
}

function yearOf(d?: string | null) {
  const y = d?.slice(0, 4) ?? null;
  return y === "0001" ? "?" : y;
}

function outsiderLabel(person: Person, clanLastName: string | null): string | null {
  if (!clanLastName || !person.lastName) return null;
  if (person.lastName === clanLastName) return null;
  return person.gender === "female" ? "Dâu" : person.gender === "male" ? "Rể" : "Dâu/Rể";
}

// ── Families logic ──────────────────────────────────────────────

interface FamilyUnit {
  id: string;
  spouse1?: Person;
  spouse2?: Person;
  children: Person[];
}

function buildFamilies(
  persons: Person[],
  relationships: Relationship[],
  marriages: Marriage[]
): FamilyUnit[] {
  const personMap = new Map(persons.map((p) => [p.id, p]));

  const parentChildren = new Map<string, string[]>();
  for (const rel of relationships) {
    if (!parentChildren.has(rel.parentId)) parentChildren.set(rel.parentId, []);
    parentChildren.get(rel.parentId)!.push(rel.childId);
  }

  const coveredParents = new Set<string>();
  const families: FamilyUnit[] = [];

  for (const m of marriages) {
    const childIds = new Set([
      ...(parentChildren.get(m.spouse1Id) ?? []),
      ...(parentChildren.get(m.spouse2Id) ?? []),
    ]);
    const children = [...childIds]
      .map((id) => personMap.get(id))
      .filter(Boolean) as Person[];

    children.sort((a, b) => {
      const da = a.birthDate ?? "";
      const db = b.birthDate ?? "";
      return da !== db ? (da < db ? -1 : 1) : a.firstName.localeCompare(b.firstName, "vi");
    });

    // male spouse first
    let s1 = personMap.get(m.spouse1Id);
    let s2 = personMap.get(m.spouse2Id);
    if (s1?.gender === "female" && s2?.gender !== "female") [s1, s2] = [s2, s1];

    families.push({ id: `marriage-${m.id}`, spouse1: s1, spouse2: s2, children });
    coveredParents.add(m.spouse1Id);
    coveredParents.add(m.spouse2Id);
  }

  for (const [parentId, childIds] of parentChildren) {
    if (coveredParents.has(parentId)) continue;
    const parent = personMap.get(parentId);
    if (!parent) continue;
    const children = childIds.map((id) => personMap.get(id)).filter(Boolean) as Person[];
    children.sort((a, b) => {
      const da = a.birthDate ?? "";
      const db = b.birthDate ?? "";
      return da !== db ? (da < db ? -1 : 1) : a.firstName.localeCompare(b.firstName, "vi");
    });
    families.push({ id: `single-${parentId}`, spouse1: parent, children });
  }

  families.sort((a, b) => {
    const ga = a.spouse1?.generation ?? a.spouse2?.generation ?? 999;
    const gb = b.spouse1?.generation ?? b.spouse2?.generation ?? 999;
    if (ga !== gb) return ga - gb;
    return fullName(a.spouse1 ?? ({} as Person)).localeCompare(
      fullName(b.spouse1 ?? ({} as Person)), "vi"
    );
  });

  return families;
}

// ── Shared avatar ────────────────────────────────────────────────

function Avatar({ person, size = "md" }: { person: Person; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSz = size === "sm" ? 15 : 18;
  const color =
    person.gender === "female"
      ? "bg-pink-100 text-pink-400"
      : person.gender === "male"
      ? "bg-gray-100 text-gray-500"
      : "bg-gray-100 text-gray-400";
  return (
    <span className={`shrink-0 ${sz} rounded-full flex items-center justify-center ${color}`}>
      <User size={iconSz} />
    </span>
  );
}

// ── Family card ──────────────────────────────────────────────────

function OutsiderBadge({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium shrink-0">
      {label}
    </span>
  );
}

function FamilyCard({ family, clanLastName }: { family: FamilyUnit; clanLastName: string | null }) {
  const { spouse1, spouse2, children } = family;
  return (
    <Card className="gap-0 py-0">
      <div className="px-4 py-4 flex items-center gap-3 flex-wrap">
        {spouse1 && (
          <Link
            href={`/tree?selected=${spouse1.id}`}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity min-w-0"
          >
            <Avatar person={spouse1} />
            <span className="font-semibold truncate">{fullName(spouse1)}</span>
            <OutsiderBadge label={outsiderLabel(spouse1, clanLastName)} />
          </Link>
        )}
        {spouse2 && (
          <>
            <Heart size={14} className="text-pink-400 shrink-0" fill="currentColor" />
            <Link
              href={`/tree?selected=${spouse2.id}`}
              className="flex items-center gap-2 hover:opacity-75 transition-opacity min-w-0"
            >
              <Avatar person={spouse2} />
              <span className="font-semibold truncate">{fullName(spouse2)}</span>
              <OutsiderBadge label={outsiderLabel(spouse2, clanLastName)} />
            </Link>
          </>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div className="border-t mx-4" />
          <div className="px-1 py-2">
            <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Con cái · {children.length}
            </p>
            {children.map((child) => {
              const b = yearOf(child.birthDate);
              const d = yearOf(child.deathDateLunar);
              const years = b ? (d ? `${b}–${d}` : b) : null;
              return (
                <Link
                  key={child.id}
                  href={`/tree?selected=${child.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors group"
                >
                  <Avatar person={child} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium group-hover:text-brand-600 transition-colors">
                      {fullName(child)}
                    </span>
                    {(years || child.generation != null) && (
                      <span className="text-xs text-gray-400 ml-2">
                        {[child.generation != null ? `Đời ${child.generation}` : null, years]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────

export default function PeoplePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [clanName, setClanName] = useState<string>("Gia Phả Việt Nam");
  const [superAdminId, setSuperAdminId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "generation_asc" | "generation_desc" | "name_asc" | "name_desc">("recent");
  const [genFilter, setGenFilter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("people");
  const [editTarget, setEditTarget] = useState<Person | null>(null);

  const load = () =>
    Promise.all([
      personsApi.getAll(),
      relationshipsApi.getAll(),
      marriagesApi.getAll(),
    ]).then(([p, r, m]) => {
      setPersons(p);
      setRelationships(r);
      setMarriages(m);
    });

  useEffect(() => {
    load();
    clanApi.get().then((c) => {
      if (c?.name) setClanName(c.name);
      if (c?.superAdminId) setSuperAdminId(c.superAdminId);
    });
  }, []);

  const handleEdit = async (data: Omit<Person, "id">) => {
    if (!editTarget) return;
    await personsApi.update(editTarget.id, data);
    load();
  };

  const handleDelete = async (id: string) => {
    const person = persons.find((p) => p.id === id);
    const name = person ? fullName(person) : "người này";
    if (!confirm(`Xoá "${name}" khỏi dòng họ?`)) return;
    await personsApi.delete(id);
    load();
  };

  const hasGenerations = persons.some((p) => p.generation != null);
  const generations = Array.from(
    new Set(persons.map((p) => p.generation).filter((g): g is number => g != null))
  ).sort((a, b) => a - b);

  const filtered = persons
    .filter((p) => normalize(fullName(p)).toLowerCase().includes(normalize(search).toLowerCase()))
    .filter((p) => genFilter === null || p.generation === genFilter)
    .sort((a, b) => {
      if (sortBy === "recent") return (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1;
      if (sortBy === "generation_asc") return (a.generation ?? Infinity) - (b.generation ?? Infinity);
      if (sortBy === "generation_desc") return (b.generation ?? -Infinity) - (a.generation ?? -Infinity);
      if (sortBy === "name_asc") return a.firstName.localeCompare(b.firstName, "vi");
      return b.firstName.localeCompare(a.firstName, "vi");
    });

  const families = buildFamilies(persons, relationships, marriages);
  const clanLastName = persons.find((p) => p.id === superAdminId)?.lastName ?? null;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center">
        <h1 className="text-xl font-semibold">Danh sách</h1>
      </header>

      <main className="px-4 sm:px-6 py-6 pb-20 sm:pb-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="people">Người</TabsTrigger>
          <TabsTrigger value="families">Gia đình</TabsTrigger>
          <TabsTrigger value="events" disabled>Sự kiện</TabsTrigger>
        </TabsList>

        {/* ── People tab ── */}
        <TabsContent value="people">
          <>
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="flex-1 min-w-0"
              />
            </div>

            {generations.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <button
                  onClick={() => setGenFilter(null)}
                  className={`px-3.5 py-1 text-[0.875rem] font-medium rounded-full border transition-colors ${genFilter === null ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-border hover:border-gray-400"}`}
                >
                  Tất cả
                </button>
                {generations.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenFilter(g)}
                    className={`px-3.5 py-1 text-[0.875rem] font-medium rounded-full border transition-colors ${genFilter === g ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600 border-border hover:border-gray-400"}`}
                  >
                    Đời {g}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Xếp theo</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mặc định (mới)</SelectItem>
                      <SelectItem value="generation_asc">Đời (tăng dần)</SelectItem>
                      <SelectItem value="generation_desc">Đời (giảm dần)</SelectItem>
                      <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Tên (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Xếp theo</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mặc định (mới)</SelectItem>
                      <SelectItem value="generation_asc">Đời (tăng dần)</SelectItem>
                      <SelectItem value="generation_desc">Đời (giảm dần)</SelectItem>
                      <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Tên (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Card className="gap-0 py-0 border-0 shadow-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 pr-2">Họ tên</TableHead>
                  <TableHead className="hidden sm:table-cell">Giới tính</TableHead>
                  {hasGenerations && <TableHead className="text-right hidden sm:table-cell">Đời</TableHead>}
                  <TableHead className="text-right hidden sm:table-cell">Ngày sinh</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Ngày mất (ÂL)</TableHead>
                  <TableHead className="pl-2 pr-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={100} className="text-center py-12 text-gray-500">
                      Chưa có ai. Thêm người đầu tiên.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4 pr-2 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          p.gender === "female"
                            ? "bg-pink-100 text-pink-400"
                            : p.gender === "male"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          <User size={18} />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium">{fullName(p)}</span>
                            <OutsiderBadge label={outsiderLabel(p, clanLastName)} />
                            {p.id === superAdminId && (
                              <span title="Tài khoản Super Admin" className="text-xs px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded font-medium">
                                SA
                              </span>
                            )}
                          </div>
                          {p.generation != null && (
                            <span className="text-xs text-gray-500 sm:hidden">Đời {p.generation}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 hidden sm:table-cell">
                      {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Không rõ"}
                    </TableCell>
                    {hasGenerations && (
                      <TableCell className="text-gray-600 text-right hidden sm:table-cell">
                        {p.generation != null ? `Đời ${p.generation}` : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-gray-600 text-right hidden sm:table-cell">{dateOf(p.birthDate)}</TableCell>
                    <TableCell className="text-gray-600 text-right hidden sm:table-cell">{dateOf(p.deathDateLunar)}</TableCell>
                    <TableCell className="pl-2 pr-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tree?selected=${p.id}`}>Xem cây</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditTarget(p)}>
                          Sửa
                        </Button>
                        {p.id !== superAdminId && (
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                            Xoá
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </Card>
          </>
        </TabsContent>

        {/* ── Families tab ── */}
        <TabsContent value="families">
          <>
            {families.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400">Chưa có gia đình nào.</p>
                <p className="text-sm text-gray-400 mt-1">Thêm người và kết nối cặp vợ chồng để hiển thị ở đây.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{families.length} gia đình</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {families.map((f) => (
                    <FamilyCard key={f.id} family={f} clanLastName={clanLastName} />
                  ))}
                </div>
              </>
            )}
          </>
        </TabsContent>

      </Tabs>
      </main>

      <PersonDialog
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        title="Sửa thông tin"
        initial={editTarget ?? undefined}
        onSubmit={handleEdit}
      />

      <BottomTabBar />
    </div>
  );
}
