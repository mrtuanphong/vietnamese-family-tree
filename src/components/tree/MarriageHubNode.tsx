"use client";

import { Handle, Position } from "reactflow";

export default function MarriageHubNode() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 16, height: 16 }}>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-pink-400 !w-1.5 !h-1.5 !border-0"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="!bg-pink-400 !w-1.5 !h-1.5 !border-0"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-gray-400 !w-1.5 !h-1.5 !border-0"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="w-4 h-4 rounded-full bg-pink-400 border-2 border-white shadow flex items-center justify-center pointer-events-none">
        <span className="text-[7px] leading-none text-white select-none">♥</span>
      </div>
    </div>
  );
}
