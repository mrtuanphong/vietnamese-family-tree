# Changelog — mvp-01

Toàn bộ thay đổi từ khi khởi tạo dự án đến khi ship mvp-01.

---

## Xác thực & Phân quyền

- Đăng nhập một lần bấm cho khách (trang công khai)
- Đăng nhập bằng SĐT Super Admin cho tài khoản quản lý
- Ẩn nút Sửa/Xoá và toàn bộ controls thêm/xoá quan hệ với tài khoản khách
- Badge "Tài khoản khách" và "SA" trên header
- Session lưu `sessionStorage`, mất khi đóng tab
- Sửa lỗi login flash khi reload

---

## Trang Danh sách

- Tab Sự kiện: sinh nhật + giỗ, chuyển đổi Âm–Dương lịch, filter chips Tất cả/Sinh nhật/Giỗ, mặc định mở tab này
- Tab Người: bảng danh sách, tìm kiếm, lọc theo Đời, phân trang
- Tab Gia đình: hiển thị cặp vợ chồng + con dạng card
- Avatar theo giới tính (xám/hồng); icon hoa sen cho người mất
- Badge ngôi sao vàng cho con cả (`childOrder = 1`)
- Badge Dâu/Rể cho người ngoài dòng họ
- Nút actions trên mỗi hàng (Admin)
- Empty state với nút thêm người

---

## Trang Cây phả hệ

### Chế độ Đơn giản (TreeOutline)
- Cây thư mục phân cấp cha/con, vợ/chồng cùng dòng
- Icon +/− hình vuông, hover đổi màu primary
- Mặc định mở rộng 3 cấp đầu khi load
- Toolbar: "Mở rộng: Tất cả · Từ người đang chọn"
- Tìm kiếm tên + highlight vàng + nhấp nháy báo kết quả đang ẩn
- Highlight hàng (ring + nền) + gạch chân tên người được chọn
- Double-click: chọn + toggle expand
- Mobile: bấm chỉ highlight row, không mở sidebar

### Chế độ Sơ đồ (Graph — ReactFlow)
- Node theo thế hệ, edge cha/con và hôn nhân
- Marriage hub node
- Pan, zoom, minimap
- Mobile: bấm chỉ highlight, không mở sidebar
- Badge Đời, Dâu/Rể, hoa sen, ngôi sao trên node

### Chung
- Chuyển đổi hai chế độ bằng tab (Đơn giản / Sơ đồ)
- Subtree view: xem cây từ một người + badge "Cây từ: [tên]" + nút reset
- URL param cho subtree
- Highlight node khi được chọn

---

## Chi tiết người (PersonSidebar)

- Hiển thị họ tên, giới tính, Đời, ngày sinh, địa chỉ thường trú, tiểu sử
- Badge SA, Dâu/Rể
- Nút "Xem cây từ đây" / "Xem toàn bộ"
- Danh sách cha/mẹ, vợ/chồng, con cái
- Xoá quan hệ có dialog xác nhận (Admin)
- Thêm quan hệ từ Select + tạo người mới inline (Admin)
- Nút Sửa/Xoá người (Admin; SA không bị xoá)
- Loader khi đang mutate

---

## Form Thêm / Sửa người

- 3 tab: Cơ bản / Địa điểm / Thông tin khác
- **Cơ bản:** họ/đệm/tên, giới tính (1/3) + thứ tự con (2/3), switch thành viên dòng họ, ngày sinh, ngày mất (Âm lịch), Đời (readonly)
- **Địa điểm:** nơi sinh, địa chỉ thường trú, nơi mất
- **Thông tin khác:** SĐT, tiểu sử (128px)
- Submit button nằm ngoài tab, luôn visible

---

## Dữ liệu

- Trường mới: `currentAddress`, `childOrder`, `isClanMember`, `deathDateLunar`, `generation`, `phone`, `birthPlace`, `deathPlace`
- Tính Đời tự động dựa trên Super Admin làm mốc
- Migration SQLite → PostgreSQL (Neon)
- Prisma 7 + `@prisma/adapter-pg`

---

## Dòng họ (Clan settings)

- Xem tên, địa chỉ, mô tả, tên họ
- Bật/tắt chế độ công khai (Super Admin)
- Đặt Super Admin + thế hệ gốc (Super Admin)

---

## Hạ tầng & PWA

- Deploy Vercel + Neon PostgreSQL
- PWA manifest + service worker
- Bottom tab bar mobile
- Desktop sidebar cố định
