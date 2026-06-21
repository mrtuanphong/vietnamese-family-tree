# Releases

Mỗi thư mục con là một release. Tên theo pattern `<tên>-<số thứ tự>`.

## Cấu trúc

```
docs/releases/
  <release-name>/
    prd.md        # Product Requirements Document — danh sách tính năng, phân quyền, data model
    changelog.md  # (tuỳ chọn) Thay đổi chi tiết so với release trước
```

## Danh sách release

| Release | Trạng thái | Mô tả |
|---|---|---|
| [mvp-01](./mvp-01/prd.md) | Shipped | MVP đầu tiên — xem/quản lý gia phả, phân quyền khách/admin |

## Quy ước

- `prd.md` viết trước hoặc trong khi phát triển, mô tả **những gì đã/sẽ ship**.
- Trạng thái: `In progress` → `Shipped`.
- Tính năng ngoài phạm vi release ghi vào mục **Ngoài phạm vi** trong prd.md, không xoá.
