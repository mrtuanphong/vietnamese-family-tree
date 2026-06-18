"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, TreePine, Settings } from "lucide-react";

const tabs = [
  { href: "/",     label: "Danh sách",   icon: Users },
  { href: "/tree", label: "Cây gia phả", icon: TreePine },
  { href: "/clan", label: "Dòng họ",     icon: Settings },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white border-t safe-bottom">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-brand-500" : "text-gray-400"
              }`}
            >
              <Icon size={24} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
