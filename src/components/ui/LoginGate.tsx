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
  const [showAdminForm, setShowAdminForm] = useState(false);

  const submit = async (phone: string, pwd: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: pwd }),
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

  const handleGuestLogin = () => submit("", "");

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(account, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{clanName}</h1>
          <p className="text-sm text-gray-500 mt-1">Vui lòng xác thực để tiếp tục</p>
        </div>

        <div className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
          {isPublic && !showAdminForm && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-sm text-blue-700">
                Đây là trang dòng họ công khai. Bấm <span className="font-semibold">Đăng nhập</span> để vào xem.
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button onClick={handleGuestLogin} disabled={loading} className="w-full">
                {loading ? "Đang kiểm tra..." : "Đăng nhập"}
              </Button>

              <button
                type="button"
                onClick={() => setShowAdminForm(true)}
                className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors"
              >
                Đăng nhập với tài khoản quản lý
              </button>
            </>
          )}

          {(!isPublic || showAdminForm) && (
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
              {showAdminForm && (
                <button
                  type="button"
                  onClick={() => { setShowAdminForm(false); setError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 text-left transition-colors"
                >
                  ← Quay lại
                </button>
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
                />
              </div>

              <div>
                <label className="font-medium block mb-1.5">Mật khẩu</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang kiểm tra..." : "Đăng nhập"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
