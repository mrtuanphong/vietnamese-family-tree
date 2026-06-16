"use client";

import Image from "next/image";
import { getAvatarUrl } from "@/lib/avatar";
import type { Person, Relationship, Marriage } from "@/types";

const NEW_PERSON_SENTINEL = "__new__";

interface PersonSidebarProps {
  person: Person;
  allPersons: Person[];
  relationships: Relationship[];
  marriages: Marriage[];
  superAdminId: string | null;
  onClose: () => void;
  onEdit: (p: Person) => void;
  onDelete: (id: string) => void;
  onAddParent: (parentId: string, childId: string) => void;
  onAddChild: (parentId: string, childId: string) => void;
  onAddSpouse: (spouse1Id: string, spouse2Id: string) => void;
  onCreateAndAddParent: (childId: string) => void;
  onCreateAndAddChild: (parentId: string) => void;
  onCreateAndAddSpouse: (personId: string) => void;
  onRemoveParent: (relationshipId: string) => void;
  onRemoveChild: (relationshipId: string) => void;
  onRemoveSpouse: (marriageId: string) => void;
}

function fullName(p: Person) {
  return [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ");
}

export default function PersonSidebar({
  person,
  allPersons,
  relationships,
  marriages,
  superAdminId,
  onClose,
  onEdit,
  onDelete,
  onAddParent,
  onAddChild,
  onAddSpouse,
  onCreateAndAddParent,
  onCreateAndAddChild,
  onCreateAndAddSpouse,
  onRemoveParent,
  onRemoveChild,
  onRemoveSpouse,
}: PersonSidebarProps) {
  const isSuperAdmin = person.id === superAdminId;
  const personMap = new Map(allPersons.map((p) => [p.id, p]));

  const parents = relationships
    .filter((r) => r.childId === person.id)
    .flatMap((r) => {
      const p = personMap.get(r.parentId);
      return p ? [{ relId: r.id, person: p }] : [];
    });

  const children = relationships
    .filter((r) => r.parentId === person.id)
    .flatMap((r) => {
      const p = personMap.get(r.childId);
      return p ? [{ relId: r.id, person: p }] : [];
    });

  const spouses = marriages
    .filter((m) => m.spouse1Id === person.id || m.spouse2Id === person.id)
    .flatMap((m) => {
      const otherId = m.spouse1Id === person.id ? m.spouse2Id : m.spouse1Id;
      const p = personMap.get(otherId);
      return p ? [{ marriageId: m.id, person: p }] : [];
    });

  const unrelated = allPersons.filter(
    (p) =>
      p.id !== person.id &&
      !parents.find((x) => x.person.id === p.id) &&
      !children.find((x) => x.person.id === p.id) &&
      !spouses.find((x) => x.person.id === p.id)
  );

  const handleAddParent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    e.target.value = "";
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddParent(person.id); return; }
    onAddParent(val, person.id);
  };

  const handleAddSpouse = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    e.target.value = "";
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddSpouse(person.id); return; }
    onAddSpouse(person.id, val);
  };

  const handleAddChild = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    e.target.value = "";
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddChild(person.id); return; }
    onAddChild(person.id, val);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 max-h-[65vh] rounded-t-2xl shadow-2xl sm:static sm:bottom-auto sm:w-72 sm:max-h-none sm:z-auto sm:rounded-none sm:shadow-none bg-white border-t sm:border-t-0 sm:border-l flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-semibold text-sm">Chi tiết</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      <div className="p-4 flex flex-col items-center gap-2 border-b">
        <Image src={getAvatarUrl(person.gender)} alt="" width={72} height={72} className="rounded-full" />
        <p className="font-bold text-center">{fullName(person)}</p>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {isSuperAdmin && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              Super Admin
            </span>
          )}
          {person.generation != null && (
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
              Đời {person.generation}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {person.gender === "male" ? "Nam" : person.gender === "female" ? "Nữ" : "Không rõ"}
        </p>
        {(person.birthDate || person.deathDate) && (
          <p className="text-xs text-gray-500">
            {person.birthDate?.slice(0, 4) || "?"} – {person.deathDate?.slice(0, 4) || "nay"}
          </p>
        )}
        {person.birthPlace && <p className="text-xs text-gray-500">📍 {person.birthPlace}</p>}
      </div>

      {person.bio && (
        <div className="px-4 py-3 border-b">
          <p className="text-xs text-gray-500 font-medium mb-1">Tiểu sử</p>
          <p className="text-sm text-gray-700 leading-relaxed">{person.bio}</p>
        </div>
      )}

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Cha/Mẹ</p>
        {parents.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {parents.map(({ relId, person: p }) => (
              <li key={relId} className="flex items-center justify-between gap-2 text-sm">
                <span>{fullName(p)}</span>
                <button
                  onClick={() => onRemoveParent(relId)}
                  className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                  title="Xoá quan hệ"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <select onChange={handleAddParent} className="mt-2 w-full border rounded px-2 py-1 text-xs">
          <option value="">+ Thêm cha/mẹ</option>
          <option value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</option>
          {unrelated.length > 0 && <option disabled>──────────────</option>}
          {unrelated.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
        </select>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Vợ/Chồng</p>
        {spouses.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {spouses.map(({ marriageId, person: p }) => (
              <li key={marriageId} className="flex items-center justify-between gap-2 text-sm">
                <span>{fullName(p)}</span>
                <button
                  onClick={() => onRemoveSpouse(marriageId)}
                  className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                  title="Xoá quan hệ"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <select onChange={handleAddSpouse} className="mt-2 w-full border rounded px-2 py-1 text-xs">
          <option value="">+ Thêm vợ/chồng</option>
          <option value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</option>
          {unrelated.length > 0 && <option disabled>──────────────</option>}
          {unrelated.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
        </select>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Con cái</p>
        {children.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {children.map(({ relId, person: p }) => (
              <li key={relId} className="flex items-center justify-between gap-2 text-sm">
                <span>{fullName(p)}</span>
                <button
                  onClick={() => onRemoveChild(relId)}
                  className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                  title="Xoá quan hệ"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <select onChange={handleAddChild} className="mt-2 w-full border rounded px-2 py-1 text-xs">
          <option value="">+ Thêm con</option>
          <option value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</option>
          {unrelated.length > 0 && <option disabled>──────────────</option>}
          {unrelated.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
        </select>
      </div>

      <div className="px-4 py-3 flex gap-2 mt-auto">
        <button onClick={() => onEdit(person)} className="flex-1 text-xs px-3 py-2 border rounded hover:bg-gray-50">
          Sửa
        </button>
        {!isSuperAdmin && (
          <button onClick={() => onDelete(person.id)} className="text-xs px-3 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50">
            Xoá
          </button>
        )}
      </div>
    </div>
  );
}
