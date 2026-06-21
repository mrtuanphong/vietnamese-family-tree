# PRD — Release mvp-01

**Tên release:** mvp-01  
**Trạng thái:** Shipped  
**Mô tả:** Phiên bản MVP đầu tiên của ứng dụng quản lý gia phả dòng họ.

---

## 1. Xác thực & Phân quyền

### 1.1 Đăng nhập
| Loại tài khoản | Cách đăng nhập | Quyền |
|---|---|---|
| Khách (Guest) | Bấm "Đăng nhập" (không cần nhập gì) | Xem |
| Quản lý (Admin) | Số điện thoại của Super Admin | Xem + Sửa |
| Super Admin | Số điện thoại đã đăng ký trong cài đặt dòng họ | Xem + Sửa + Cấu hình dòng họ |

- Trang công khai (`isPublic = true`): khách bấm một lần là vào.
- Trang riêng tư: chỉ admin và super admin mới vào được.
- Session lưu trong `sessionStorage` (mất khi đóng tab).

### 1.2 Kiểm soát truy cập theo vai trò

Về mặt UI, hệ thống có 2 role: **Khách** (`canEdit=false`) và **Admin** (`canEdit=true`).  
Super Admin là Admin đặc biệt (biết SĐT đăng ký trong clan config), có thêm quyền cấu hình dòng họ.  
Super Admin chỉ có 1 người duy nhất trong hệ thống, không thể bị xoá.

| Tính năng | Khách | Admin | Super Admin |
|---|:---:|:---:|:---:|
| Xem danh sách người | ✓ | ✓ | ✓ |
| Xem cây phả hệ | ✓ | ✓ | ✓ |
| Xem sự kiện (sinh nhật, giỗ) | ✓ | ✓ | ✓ |
| Xem chi tiết người | ✓ | ✓ | ✓ |
| Thêm / Sửa / Xoá người | — | ✓ | ✓ |
| Thêm / Xoá mối quan hệ | — | ✓ | ✓ |
| Xem thông tin dòng họ | ✓ | ✓ | ✓ |
| Cấu hình dòng họ | — | — | ✓ |
| Đặt Super Admin | — | — | ✓ |

---

## 2. Trang Danh sách (`/`)

### 2.1 Tab Sự kiện
- Hiển thị sinh nhật và giỗ trong năm, tính chuyển đổi Âm–Dương lịch.
- Mỗi sự kiện: tên người + badge Đời + loại sự kiện (sinh nhật / giỗ) + ngày.
- Filter chips: **Tất cả / Sinh nhật / Giỗ**.
- Mặc định mở tab này khi vào trang.
- Click event card → chọn người, hiện sidebar Thông tin cá nhân bên phải (không chuyển trang).
- Row đang chọn: highlight `bg-brand-50` + ring + tên bold brand, giống tab Người.

### 2.2 Tab Người
- Danh sách dạng bảng: avatar (icon/ảnh), họ tên, Đời, ngày sinh, ngày mất.
- Tìm kiếm theo tên.
- Lọc theo Đời.
- Sắp xếp: theo tên, theo Đời, theo ngày sinh.
- Phân trang (10 / 25 / 50 / 100 / tất cả).
- Click tên người hoặc avatar → mở sidebar Thông tin cá nhân bên phải (desktop).
- Hover row: tên đổi màu primary + gạch chân; hover avatar: ring outline.
- Row được chọn: highlight brand.
- **Admin:** nút "+ Thêm người" ở đầu bảng + nút Sửa trên mỗi hàng.

### 2.3 Tab Gia đình
- Hiển thị các gia đình (cặp vợ chồng + con cái) dạng card.
- Mỗi card: avatar vợ/chồng + danh sách con.

### Avatar
- Nam: nền xám. Nữ: nền hồng.
- Người mất: icon hoa sen thay thế icon user, màu đậm hơn.
- Con cả (childOrder = 1): badge ngôi sao vàng góc trên phải.

---

## 3. Trang Cây phả hệ (`/tree`)

### 3.1 Chế độ xem
Hai chế độ chuyển đổi bằng tab:

| Tab | Mô tả |
|---|---|
| **Đơn giản** | Cây thư mục (TreeOutline) — mặc định |
| **Sơ đồ** | Sơ đồ node/edge dạng graph (ReactFlow) |

### 3.2 Chế độ Đơn giản (TreeOutline)
- Hiển thị phân cấp cha/con, vợ/chồng cùng dòng (icon trái tim).
- Người trong dòng họ hiện trước dâu/rể.
- Badge Đời chỉ hiện với người trong dòng họ.
- Icon +/− để mở rộng / thu gọn nhánh.
- Mặc định mở rộng 3 cấp đầu khi load.
- **Toolbar actions** (disabled khi chưa chọn ai với action liên quan đến người):
  - "Mở rộng tất cả" — mở rộng toàn bộ cây.
  - "Mở rộng từ người đang chọn" — mở rộng nhánh từ người đang chọn (tổ tiên + toàn bộ con cháu).
  - "Xem cây từ người đang chọn" — chuyển sang subtree view, tự mở sidebar chi tiết (desktop).
- Tìm kiếm: ô tìm kiếm + hiển thị số kết quả + highlight vàng tên trùng khớp.
- Khi kết quả tìm kiếm bị ẩn (nhánh đang thu gọn): hàng cha nhấp nháy nền vàng báo hiệu.
- Chọn người: highlight hàng bằng ring màu primary + gạch chân tên người được chọn.
- Double-click: chọn + toggle expand.
- **Mobile:** bấm chỉ select row, không mở sidebar.
- **Desktop:** bấm mở sidebar chi tiết.

### 3.3 Chế độ Sơ đồ (Graph)
- Visualize bằng ReactFlow: node theo thế hệ, edge cha/con và hôn nhân.
- Drag node, zoom, minimap.
- Bấm node: mở sidebar chi tiết (**desktop**) hoặc select (**mobile**).
- Badge Đời, badge Dâu/Rể, badge hoa sen (người mất), badge ngôi sao (con cả) trên mỗi node.

### 3.4 Chế độ xem từ một người
- Badge "Cây từ: [tên]" trên header với nút X để quay về xem toàn bộ.
- Chỉ hiển thị nhánh con cháu từ người đó.

---

## 4. Chi tiết người (PersonSidebar — "Thông tin cá nhân")

Luôn hiển thị trên desktop bên phải, chiếm toàn chiều cao page content.  
Khi chưa chọn ai: placeholder icon + hướng dẫn.

### Thông tin hiển thị (tất cả vai trò)
- Họ tên đầy đủ, giới tính, badge Đời, badge Dâu/Rể.
- Ngày sinh (Dương lịch).
- Địa chỉ thường trú.
- Tiểu sử.
- Danh sách cha/mẹ, vợ/chồng, con cái (chỉ đọc với khách).
- Nút "Xem cây từ đây" / "Xem toàn bộ".

### Collapse/Expand (Desktop)
- Nút toggle `›` / `‹` trên header sidebar — hoạt động kể cả khi chưa chọn ai.
- Collapsed: dải 32px, nền xám, click bất kỳ chỗ → expand.
- Placeholder (chưa chọn ai) cũng có header với nút toggle.
- Không thể đóng hoàn toàn.

### Tính năng Admin
- Nút Sửa / Xoá người.
- Thêm / xoá mối quan hệ cha/mẹ, vợ/chồng, con.
- Tạo người mới trực tiếp từ select quan hệ.

---

## 5. Form Thêm / Sửa người

Ba tab:

| Tab | Trường |
|---|---|
| **Cơ bản** | Họ / Đệm / Tên, Giới tính, Thứ tự con, Thành viên dòng họ (switch), Ngày sinh, Ngày mất (Âm lịch), Đời |
| **Địa điểm** | Nơi sinh, Địa chỉ thường trú, Nơi mất |
| **Thông tin khác** | Số điện thoại, Tiểu sử |

- Đời: readonly, tự động tính toán.
- Thứ tự con: số thứ tự trong gia đình (1 = con cả → hiện badge ngôi sao).
- Thành viên dòng họ: tắt = Dâu/Rể (không hiện Đời, hiện badge Dâu/Rể).

---

## 6. Trang Thông tin dòng họ (`/clan`)

### Xem (tất cả)
- Tên, địa chỉ, mô tả dòng họ.
- Tên họ chính.

### Cấu hình (Super Admin)
- Sửa tên / địa chỉ / mô tả / tên họ.
- Bật/tắt chế độ công khai.
- Đặt Super Admin bằng số điện thoại (OTP verify).
- Đặt thế hệ gốc của Super Admin.

---

## 7. Trang Về phần mềm (`/about`)

- Mục trong sidebar nav (icon Info).
- Tab **Phiên bản** (mặc định): danh sách release + tính năng gốc + changelog.
- Tab **Tính năng**: liệt kê toàn bộ tính năng theo module.

---

## 8. Điều hướng

- **Desktop:** sidebar trái cố định (logo + nav items: Danh sách, Cây gia phả, Thông tin dòng họ, Về phần mềm).
- **Mobile:** bottom tab bar (Danh sách / Cây / Dòng họ).
- Tên người dùng + badge vai trò (Tài khoản khách / SA) hiển thị trên header.
- Nút Đăng xuất trên header.
- **Admin header:** dropdown "+ Thêm" với các action: Thêm người, Thêm gia đình *(disabled)*, Thêm sự kiện *(disabled)*.

---

## 9. Dữ liệu & Kỹ thuật

| Hạng mục | Chi tiết |
|---|---|
| Frontend | Next.js App Router, React, Tailwind v4, shadcn/ui |
| Tree visualization | ReactFlow |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Lịch Âm | Tự tính chuyển đổi Âm–Dương |
| Auth | Session-based (sessionStorage), không dùng JWT/cookie |

### Model dữ liệu chính
- **Person:** id, họ tên, giới tính, ngày sinh (DL), ngày mất (ÂL), nơi sinh, nơi mất, địa chỉ thường trú, SĐT, tiểu sử, đời, thứ tự con, isClanMember.
- **Relationship:** parentId → childId.
- **Marriage:** spouse1Id ↔ spouse2Id.
- **Clan:** tên, địa chỉ, mô tả, tên họ, superAdminId, thế hệ gốc, enabled (public).

---

## 10. Ngoài phạm vi mvp-01

- Upload ảnh thực sự (photoUrl có field nhưng chưa có UI upload).
- Xem thống kê / biểu đồ dòng họ.
- Xuất PDF / in gia phả.
- Đa ngôn ngữ.
- Push notification cho sự kiện sắp tới.
- Multi-clan (hiện chỉ hỗ trợ 1 dòng họ).
