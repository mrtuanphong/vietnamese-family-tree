"use client";

import { Handle, Position } from "reactflow";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Person } from "@/types";

interface PersonNodeData {
  person: Person;
  isSelected: boolean;
  isSuperAdmin: boolean;
  onSelect: (p: Person) => void;
  onAddChild: (personId: string) => void;
}

function outsiderLabel(person: Person): string | null {
  if (person.isClanMember !== false) return null;
  return person.gender === "female" ? "Dâu" : person.gender === "male" ? "Rể" : "Dâu/Rể";
}

export default function PersonNode({ data }: { data: PersonNodeData }) {
  const { person, isSelected, isSuperAdmin, onSelect, onAddChild } = data;
  const outsider = outsiderLabel(person);
  const name = [person.lastName, person.middleName, person.firstName].filter(Boolean).join(" ");
  const years = "";

  const borderColor = isSelected
    ? "border-orange-400"
    : person.gender === "male"
    ? "border-brand-300"
    : person.gender === "female"
    ? "border-pink-400"
    : "border-gray-300";

  const bg = isSelected ? "bg-orange-50" : "bg-white";
  const shadow = isSelected ? "shadow-md ring-2 ring-orange-200" : "shadow-sm";

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
        className={`relative ${bg} rounded-lg border-2 ${borderColor} ${shadow} w-32 cursor-pointer hover:shadow-md transition-all`}
      >
        {person.childOrder === 1 && (
          <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm z-10">
            <Star size={9} className="text-white" fill="currentColor" />
          </span>
        )}
        <div className="px-2 py-2 flex flex-col items-center gap-0.5">
          <p className="text-xs font-semibold text-center leading-tight">{name}</p>
          {(person.generation != null || years || outsider) && (
            <div className="flex items-center gap-1 justify-center flex-wrap">
              {person.generation != null && (
                <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-600 rounded-full font-medium leading-none">
                  Đời {person.generation}
                </span>
              )}
              {outsider && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium leading-none">
                  {outsider}
                </span>
              )}
              {years && <p className="text-[10px] text-gray-400">{years}</p>}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />

    </div>
  );
}
