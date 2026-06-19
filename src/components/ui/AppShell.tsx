"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, Users, TreePine, Settings,
  Plus, UserPlus, CalendarDays,
  CircleUser, UserCog, Building2,
  Search, LogOut, Lock,
} from "lucide-react";
import { clanApi, personsApi } from "@/lib/api";
import { AccessContext } from "@/lib/AccessContext";
import PersonDialog from "@/components/person/PersonDialog";
import LoginGate from "@/components/ui/LoginGate";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/",      label: "Danh sách",   exact: true,  icon: Users },
  { href: "/tree",  label: "Cây gia phả", exact: false, icon: TreePine },
  { href: "/clan",  label: "Thông tin dòng họ", exact: false, icon: Settings },
];

const HEADER_H = 56;
const SIDEBAR_W = 224;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [clanName, setClanName] = useState("Gia Phả");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loggedInName, setLoggedInName] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOpen(window.innerWidth >= 768);
    clanApi.get().then((c) => {
      if (c?.name) setClanName(c.name);
    });
    fetch("/api/access").then((r) => r.json()).then((d) => {
      setIsPublic(d.public ?? true);
      const granted = sessionStorage.getItem("giapha_access") === "granted";
      setAccessGranted(granted);
      if (granted) {
        setLoggedInName(sessionStorage.getItem("giapha_name") ?? "");
        setCanEdit(sessionStorage.getItem("giapha_can_edit") === "1");
      }
    });
  }, []);

  const desktopOpen = mounted && open;

  if (mounted && !accessGranted) {
    return (
      <LoginGate
        clanName={clanName}
        isPublic={isPublic}
        onGranted={(name, edit) => {
          setAccessGranted(true);
          setLoggedInName(name);
          setCanEdit(edit);
        }}
      />
    );
  }

  return (
    <>
      {open && mounted && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed left-0 w-56 bg-white border-r z-20 overflow-y-auto transition-transform duration-200"
        style={{
          top: HEADER_H,
          height: `calc(100vh - ${HEADER_H}px)`,
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <nav className="py-2">
          {navItems.map(({ href, label, exact, icon: Icon }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} className={active ? "text-gray-700" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 h-14 bg-primary flex items-center px-3 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          aria-label="Mở/đóng menu"
          className="hidden md:inline-flex text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
        >
          <Menu size={20} />
        </Button>

        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <Link href="/" className="text-primary-foreground font-semibold text-lg hover:opacity-80 transition-opacity truncate">{clanName}</Link>
          {!isPublic && <Lock size={14} className="text-primary-foreground/60 shrink-0" />}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {canEdit && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-foreground/15 text-primary-foreground/80 shrink-0">
              Super Admin
            </span>
          )}

          {/* Add dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Thêm mới"
                className="rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground data-[state=open]:bg-primary-foreground/10 data-[state=open]:text-primary-foreground"
              >
                <Plus size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {canEdit && (
                <DropdownMenuItem
                  onSelect={() => setShowAddPerson(true)}
                  className="gap-3 px-4 py-3 cursor-pointer"
                >
                  <UserPlus size={18} className="text-gray-400" />
                  Thêm người
                </DropdownMenuItem>
              )}
              <DropdownMenuItem disabled className="gap-3 px-4 py-3">
                <Users size={18} className="text-gray-300" />
                Thêm gia đình
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="gap-3 px-4 py-3">
                <CalendarDays size={18} className="text-gray-300" />
                Thêm sự kiện
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Thiết lập"
                className="rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground data-[state=open]:bg-primary-foreground/10 data-[state=open]:text-primary-foreground"
              >
                <CircleUser size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {loggedInName && (
                <DropdownMenuItem disabled className="gap-3 px-4 py-3">
                  <CircleUser size={18} className="text-gray-400" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-800 truncate">{loggedInName}</span>
                    <span className="text-xs text-gray-400">Đã đăng nhập</span>
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem disabled className="gap-3 px-4 py-3">
                <UserCog size={18} className="text-gray-300" />
                Thông tin cá nhân
              </DropdownMenuItem>
              {loggedInName && (
                <DropdownMenuItem
                  className="gap-3 px-4 py-3 cursor-pointer text-red-600 focus:text-red-600"
                  onSelect={() => {
                    sessionStorage.removeItem("giapha_access");
                    sessionStorage.removeItem("giapha_name");
                    sessionStorage.removeItem("giapha_can_edit");
                    setAccessGranted(false);
                    setLoggedInName("");
                    setCanEdit(false);
                  }}
                >
                  <LogOut size={18} />
                  Thoát
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <Link
            href="/search"
            aria-label="Tìm kiếm"
            className="w-9 h-9 flex items-center justify-center rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
          >
            <Search size={20} />
          </Link>
        </div>
      </header>

      {/* Content */}
      <AccessContext.Provider value={{ canEdit }}>
        <div
          className="transition-all duration-200"
          style={{ marginLeft: desktopOpen ? SIDEBAR_W : 0 }}
        >
          {children}
        </div>
      </AccessContext.Provider>

      <PersonDialog
        open={showAddPerson}
        onOpenChange={setShowAddPerson}
        title="Thêm người"
        onSubmit={async (data) => {
          await personsApi.create(data);
          setShowAddPerson(false);
          router.refresh();
        }}
      />
    </>
  );
}
