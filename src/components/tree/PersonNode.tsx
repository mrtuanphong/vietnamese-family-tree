"use client";

import { Handle, Position } from "reactflow";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/avatar";
import type { Person } from "@/types";

interface PersonNodeData {
  person: Person;
  onSelect: (p: Person) => void;
}

export default function PersonNode({ data }: { data: PersonNodeData }) {
  const { person, onSelect } = data;
  const name = [person.lastName, person.firstName].filter(Boolean).join(" ");
  const years = [
    person.birthDate?.slice(0, 4),
    person.deathDate?.slice(0, 4),
  ]
    .filter(Boolean)
    .join("–");

  const borderColor =
    person.gender === "male"
      ? "border-blue-400"
      : person.gender === "female"
      ? "border-pink-400"
      : "border-gray-300";

  return (
    <div
      onClick={() => onSelect(person)}
      className={`bg-white rounded-lg border-2 ${borderColor} shadow-sm w-36 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="p-2 flex flex-col items-center gap-1">
        <Image
          src={getAvatarUrl(person.gender)}
          alt=""
          width={48}
          height={48}
          className="rounded-full"
        />
        <p className="text-xs font-semibold text-center leading-tight">{name}</p>
        {years && <p className="text-xs text-gray-400">{years}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}
