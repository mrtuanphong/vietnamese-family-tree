"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { personsApi } from "@/lib/api";
import { getAvatarUrl } from "@/lib/avatar";
import BottomTabBar from "@/components/ui/BottomTabBar";
import type { Person } from "@/types";

function fullName(p: Person) {
  return [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ");
}

function yearOf(d?: string | null) {
  return d?.slice(0, 4) ?? "";
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [all, setAll] = useState<Person[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    personsApi.getAll().then(setAll);
  }, []);

  const results = query.trim()
    ? all.filter((p) =>
        fullName(p).toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleChange = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("q", val);
    else params.delete("q");
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tìm kiếm</h1>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Tìm theo tên..."
            className="rounded-full pl-11 pr-4 py-3 h-auto"
          />
        </div>

        {query.trim() === "" && (
          <p className="text-gray-400 text-center py-12">Nhập tên để tìm kiếm</p>
        )}

        {query.trim() !== "" && results.length === 0 && (
          <p className="text-gray-400 text-center py-12">Không tìm thấy kết quả cho &ldquo;{query}&rdquo;</p>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg border overflow-hidden">
            {results.map((p) => {
              const birth = yearOf(p.birthDate);
              const death = yearOf(p.deathDateLunar);
              const years = birth ? (death ? `${birth}–${death}` : birth) : null;
              return (
                <Link
                  key={p.id}
                  href={`/tree?selected=${p.id}`}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-brand-50 transition-colors"
                >
                  <Image
                    src={getAvatarUrl(p.gender)}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fullName(p)}</p>
                    <p className="text-sm text-gray-400">
                      {[
                        p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : null,
                        p.generation != null ? `Đời ${p.generation}` : null,
                        years,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
