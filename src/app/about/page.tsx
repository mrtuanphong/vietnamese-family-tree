"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  {
    group: "Xác thực & Phân quyền",
    items: [
      "Đăng nhập 1 bấm cho khách (dòng họ công khai)",
      "Đăng nhập bằng SĐT Super Admin cho tài khoản quản lý",
      "Tài khoản khách: chỉ xem, ẩn toàn bộ controls chỉnh sửa",
      "Super Admin: toàn quyền + cấu hình dòng họ",
    ],
  },
  {
    group: "Danh sách",
    items: [
      "Tab Sự kiện: sinh nhật & giỗ, lịch Âm–Dương, lọc Tất cả/Sinh nhật/Giỗ",
      "Tab Người: bảng tìm kiếm, lọc Đời, phân trang",
      "Tab Gia đình: xem theo cặp vợ chồng + con cái",
      "Avatar theo giới tính; icon hoa sen cho người mất",
      "Badge ngôi sao cho con cả, badge Dâu/Rể",
    ],
  },
  {
    group: "Cây phả hệ — Đơn giản",
    items: [
      "Cây thư mục phân cấp cha/con, vợ/chồng cùng dòng",
      "Mở rộng tất cả · Mở rộng từ người đang chọn · Xem cây từ người đang chọn",
      "Mặc định mở rộng 3 cấp, subtree view mở rộng 1 cấp",
      "Tìm kiếm + highlight vàng + nhấp nháy báo kết quả ẩn",
      "Highlight hàng + gạch chân tên người được chọn",
      "Double-click: chọn + toggle expand",
    ],
  },
  {
    group: "Cây phả hệ — Sơ đồ",
    items: [
      "Sơ đồ node/edge ReactFlow: drag, zoom, minimap",
      "Badge Đời, Dâu/Rể, hoa sen, ngôi sao trên node",
      "Subtree view từ một người",
    ],
  },
  {
    group: "Chi tiết người",
    items: [
      "Họ tên, giới tính, Đời, ngày sinh, địa chỉ, tiểu sử",
      "Danh sách cha/mẹ, vợ/chồng, con cái",
      "Collapse/expand sidebar (desktop)",
      "Tự mở khi chọn người hoặc bấm Xem cây từ đây (desktop)",
      "Thêm/xoá quan hệ, Sửa/Xoá người (Admin)",
    ],
  },
  {
    group: "Form Thêm / Sửa người",
    items: [
      "3 tab: Cơ bản — Địa điểm — Thông tin khác",
      "Trường: họ/đệm/tên, giới tính, thứ tự con, thành viên dòng họ, ngày sinh/mất, nơi sinh/mất, địa chỉ thường trú, SĐT, tiểu sử",
      "Đời tự động tính dựa trên Super Admin làm mốc",
    ],
  },
  {
    group: "Dòng họ",
    items: [
      "Xem tên, địa chỉ, mô tả, tên họ",
      "Bật/tắt chế độ công khai (Super Admin)",
      "Đặt Super Admin + thế hệ gốc",
    ],
  },
];

const releases = [
  {
    name: "mvp-01",
    status: "Shipped",
    items: [
      "Toàn bộ tính năng cơ bản: xem/quản lý gia phả, phân quyền khách/admin",
      "Cây thư mục + Sơ đồ ReactFlow",
      "Lịch Âm–Dương, tab Sự kiện",
      "PostgreSQL (Neon) + Prisma 7, deploy Vercel",
      "PWA support",
    ],
    updates: [
      "Collapse/expand sidebar Chi tiết (desktop)",
      "Toolbar 3 actions: Mở rộng tất cả · Mở rộng từ người đang chọn · Xem cây từ người đang chọn",
      "Subtree view tự mở sidebar + expand 1 cấp",
      "Trường Địa chỉ thường trú",
      "Form 3 tab: Cơ bản / Địa điểm / Thông tin khác",
      "Đăng nhập khách 1 bấm (không cần nhập credentials)",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Thông tin phần mềm</h1>
      <p className="text-sm text-gray-500 mb-6">Ứng dụng quản lý gia phả dòng họ</p>

      <Tabs defaultValue="releases">
        <TabsList className="mb-6">
          <TabsTrigger value="releases">Phiên bản</TabsTrigger>
          <TabsTrigger value="features">Tính năng</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          {features.map((section) => (
            <div key={section.group}>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">{section.group}</h2>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-gray-300 shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="releases" className="space-y-8">
          {releases.map((r) => (
            <div key={r.name}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-gray-900">{r.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  {r.status}
                </span>
              </div>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tính năng gốc</h3>
              <ul className="space-y-1 mb-4">
                {r.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-gray-300 shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>

              {r.updates.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cập nhật</h3>
                  <ul className="space-y-1">
                    {r.updates.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-brand-400 shrink-0 mt-0.5">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
