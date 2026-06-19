"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginGateProps {
  clanName: string;
  isPublic: boolean;
  onGranted: (name: string, canEdit: boolean) => void;
}

export default function LoginGate({ clanName, isPublic, onGranted }: LoginGateProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: account, password }),
      });
      const data = await res.json();
      if (data.granted) {
        sessionStorage.setItem("giapha_access", "granted");
        sessionStorage.setItem("giapha_name", data.name ?? "");
        sessionStorage.setItem("giapha_can_edit", data.canEdit ? "1" : "0");
        onGranted(data.name ?? "", !!data.canEdit);
      } else {
        setError("Bạn không có quyền truy cập!");
      }
    } catch {
      setError("Lỗi kết nối, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{clanName}</h1>
          <p className="text-sm text-gray-500 mt-1">Vui lòng xác thực để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
          {isPublic && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-sm text-blue-700">
              Tài khoản xem: <span className="font-semibold">do</span> · Mật khẩu: <span className="font-semibold">do</span>
            </div>
          )}

          <div>
            <label className="font-medium block mb-1.5">Tài khoản</label>
            <Input
              type="text"
              value={account}
              onChange={(e) => { setAccount(e.target.value); setError(""); }}
              placeholder="Nhập tài khoản"
              autoFocus
              required
              onKeyDown={handleEnter}
            />
          </div>

          <div>
            <label className="font-medium block mb-1.5">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Nhập mật khẩu"
              onKeyDown={handleEnter}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
