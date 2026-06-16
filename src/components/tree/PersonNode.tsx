"use client";

import { Handle, Position } from "reactflow";
import type { Person } from "@/types";

interface PersonNodeData {
  person: Person;
  isSelected: boolean;
  isSuperAdmin: boolean;
  onSelect: (p: Person) => void;
  onAddChild: (personId: string) => void;
}

export default function PersonNode({ data }: { data: PersonNodeData }) {
  const { person, isSelected, isSuperAdmin, onSelect, onAddChild } = data;
  const name = [person.lastName, person.middleName, person.firstName].filter(Boolean).join(" ");
  const years = [
    person.birthDate?.slice(0, 4),
    person.deathDate?.slice(0, 4),
  ]
    .filter(Boolean)
    .join("–");

  const borderColor = isSelected
    ? "border-amber-400"
    : person.gender === "male"
    ? "border-blue-400"
    : person.gender === "female"
    ? "border-pink-400"
    : "border-gray-300";

  const bg = isSelected ? "bg-amber-50" : "bg-white";
  const shadow = isSelected ? "shadow-md ring-2 ring-amber-300" : "shadow-sm";

  return (
    <div className="relative">
      {/* Parent-child handles */}
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      {/* Marriage handles (left/right) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-pink-300 !w-2 !h-2"
        style={{ top: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-pink-300 !w-2 !h-2"
        style={{ top: "50%" }}
      />

      <div
        onClick={() => onSelect(person)}
        className={`${bg} rounded-lg border-2 ${borderColor} ${shadow} w-32 cursor-pointer hover:shadow-md transition-all`}
      >
        <div className="px-2 py-2 flex flex-col items-center gap-0.5">
          <div className="flex items-center justify-center gap-1">
            <p className="text-xs font-semibold text-center leading-tight">{name}</p>
            {isSuperAdmin && (
              <span title="Tài khoản Super Admin" className="text-[10px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium leading-none shrink-0">
                SA
              </span>
            )}
          </div>
          {(person.generation != null || years) && (
            <div className="flex items-center gap-1 justify-center">
              {person.generation != null && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium leading-none">
                  Đời {person.generation}
                </span>
              )}
              {years && <p className="text-[10px] text-gray-400">{years}</p>}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />

      {/* Add child button */}
      <button
        onClick={(e) => { e.stopPropagation(); onAddChild(person.id); }}
        title="Thêm con"
        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-white border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500 text-gray-400 flex items-center justify-center text-sm font-bold shadow-sm transition-colors"
      >
        +
      </button>
    </div>
  );
}
