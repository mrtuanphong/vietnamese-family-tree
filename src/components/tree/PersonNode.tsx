"use client";

import { Handle, Position } from "reactflow";
import type { Person } from "@/types";

interface PersonNodeData {
  person: Person;
  isSelected: boolean;
  isSuperAdmin: boolean;
  onSelect: (p: Person) => void;
}

export default function PersonNode({ data }: { data: PersonNodeData }) {
  const { person, isSelected, isSuperAdmin, onSelect } = data;
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
    <div
      onClick={() => onSelect(person)}
      className={`${bg} rounded-lg border-2 ${borderColor} ${shadow} w-32 cursor-pointer hover:shadow-md transition-all`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="px-2 py-2 flex flex-col items-center gap-0.5">
        <p className="text-xs font-semibold text-center leading-tight">{name}</p>
        {(isSuperAdmin || person.generation != null) && (
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {isSuperAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium leading-none">
                Super Admin
              </span>
            )}
            {person.generation != null && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium leading-none">
                Đời {person.generation}
              </span>
            )}
          </div>
        )}
        {years && <p className="text-[10px] text-gray-400">{years}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}
