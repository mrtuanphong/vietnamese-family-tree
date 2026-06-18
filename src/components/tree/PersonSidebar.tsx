"use client";

import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Person, Relationship, Marriage } from "@/types";

const NEW_PERSON_SENTINEL = "__new__";

interface PersonSidebarProps {
  person: Person;
  allPersons: Person[];
  relationships: Relationship[];
  marriages: Marriage[];
  superAdminId: string | null;
  clanLastName?: string | null;
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
  clanLastName,
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

  const [addParentSel, setAddParentSel] = useState("");
  const [addSpouseSel, setAddSpouseSel] = useState("");
  const [addChildSel, setAddChildSel] = useState("");

  useEffect(() => {
    setAddParentSel("");
    setAddSpouseSel("");
    setAddChildSel("");
  }, [person.id]);

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

  const handleAddParent = (val: string) => {
    setAddParentSel("");
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddParent(person.id); return; }
    onAddParent(val, person.id);
  };

  const handleAddSpouse = (val: string) => {
    setAddSpouseSel("");
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddSpouse(person.id); return; }
    onAddSpouse(person.id, val);
  };

  const handleAddChild = (val: string) => {
    setAddChildSel("");
    if (!val) return;
    if (val === NEW_PERSON_SENTINEL) { onCreateAndAddChild(person.id); return; }
    onAddChild(person.id, val);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 max-h-[65vh] rounded-t-2xl shadow-2xl sm:static sm:bottom-auto sm:w-72 sm:max-h-none sm:z-auto sm:rounded-none sm:shadow-none bg-white border-t sm:border-t-0 sm:border-l flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-semibold text-sm">Chi tiết</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </Button>
      </div>

      <div className="p-4 flex flex-col items-center gap-2 border-b">
        <span className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 ${
          person.gender === "female" ? "bg-pink-100 text-pink-400"
          : person.gender === "male" ? "bg-gray-100 text-gray-500"
          : "bg-gray-100 text-gray-400"
        }`}>
          <User size={32} />
        </span>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <p className="font-bold text-center">{fullName(person)}</p>
          {isSuperAdmin && (
            <span title="Tài khoản Super Admin" className="text-xs px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium shrink-0">
              SA
            </span>
          )}
          {clanLastName && person.lastName && person.lastName !== clanLastName && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium shrink-0">
              {person.gender === "female" ? "Dâu" : person.gender === "male" ? "Rể" : "Dâu/Rể"}
            </span>
          )}
        </div>
        {person.generation != null && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-600 rounded-full font-medium">
              Đời {person.generation}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-500">
          {person.gender === "male" ? "Nam" : person.gender === "female" ? "Nữ" : "Không rõ"}
        </p>
        {person.birthDate && (
          <p className="text-xs text-gray-500">
            Sinh: {person.birthDate.startsWith("0001") ? `?/${person.birthDate.slice(5).replace(/-/g, "/")}` : person.birthDate.slice(0, 10).replace(/-/g, "/")} (Dương lịch)
          </p>
        )}
      </div>

      {person.bio && (
        <div className="px-4 py-3 border-b">
          <p className="text-xs text-gray-500 font-medium mb-1">Tiểu sử</p>
          <p className="text-gray-700 leading-relaxed">{person.bio}</p>
        </div>
      )}

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Cha/Mẹ</p>
        {parents.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {parents.map(({ relId, person: p }) => (
              <li key={relId} className="flex items-center justify-between gap-2">
                <span className="text-sm">{fullName(p)}</span>
                <Button variant="ghost" size="icon" onClick={() => onRemoveParent(relId)} className="h-5 w-5 shrink-0 text-gray-400 hover:text-red-500" title="Xoá quan hệ">
                  <X size={12} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Select value={addParentSel} onValueChange={handleAddParent}>
          <SelectTrigger size="sm" className="mt-2 w-full text-xs">
            <SelectValue placeholder="+ Thêm cha/mẹ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</SelectItem>
            {unrelated.length > 0 && <SelectSeparator />}
            {unrelated.map((p) => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Vợ/Chồng</p>
        {spouses.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {spouses.map(({ marriageId, person: p }) => (
              <li key={marriageId} className="flex items-center justify-between gap-2">
                <span className="text-sm">{fullName(p)}</span>
                <Button variant="ghost" size="icon" onClick={() => onRemoveSpouse(marriageId)} className="h-5 w-5 shrink-0 text-gray-400 hover:text-red-500" title="Xoá quan hệ">
                  <X size={12} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Select value={addSpouseSel} onValueChange={handleAddSpouse}>
          <SelectTrigger size="sm" className="mt-2 w-full text-xs">
            <SelectValue placeholder="+ Thêm vợ/chồng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</SelectItem>
            {unrelated.length > 0 && <SelectSeparator />}
            {unrelated.map((p) => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500 font-medium mb-2">Con cái</p>
        {children.length === 0 ? <p className="text-xs text-gray-400">Chưa có</p> : (
          <ul className="space-y-1">
            {children.map(({ relId, person: p }) => (
              <li key={relId} className="flex items-center justify-between gap-2">
                <span className="text-sm">{fullName(p)}</span>
                <Button variant="ghost" size="icon" onClick={() => onRemoveChild(relId)} className="h-5 w-5 shrink-0 text-gray-400 hover:text-red-500" title="Xoá quan hệ">
                  <X size={12} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Select value={addChildSel} onValueChange={handleAddChild}>
          <SelectTrigger size="sm" className="mt-2 w-full text-xs">
            <SelectValue placeholder="+ Thêm con" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW_PERSON_SENTINEL}>✦ Tạo người mới...</SelectItem>
            {unrelated.length > 0 && <SelectSeparator />}
            {unrelated.map((p) => <SelectItem key={p.id} value={p.id}>{fullName(p)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 py-3 flex gap-2 mt-auto">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(person)}>
          Sửa
        </Button>
        {!isSuperAdmin && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(person.id)}>
            Xoá
          </Button>
        )}
      </div>
    </div>
  );
}
