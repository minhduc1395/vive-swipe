# Module: giu-hang

## Mục đích
Khách giữ hàng trên web, nhận mã giữ hàng, trả tiền và nhận tại booth; email xác nhận; QR.

## Thư mục và file chính
- `lib/giu-hang/`: `tao-giu-hang.ts`, `kho-giu-hang.ts`, `types.ts`. Test: `tests/giu-hang-server.test.ts`, `gio-hang.test.ts`.
- `app/(khach)/giu-hang/` và `[ma]`: trang giữ hàng và trang mã.
- `app/api/` (trừ `cron/`): API giữ hàng.
- `lib/email/`: email xác nhận (tắt mặc định, bật bằng `VIVE_BAT_GUI_EMAIL=1`).
- `lib/qr.ts`.

## Quy ước riêng
- Giá tính lại ở server khi giữ hàng, không tin giá từ trình duyệt.
- Không ghi dữ liệu cá nhân của khách vào log.

## Lịch sử ngắn
- 2026-11-21 (#64): màu theo bảng nội thất: kem/be/oliu-nhat thay token cũ, ô nhập viền `vien` (chọn: `den`), khung QR `oliu-nhat`; hồng chỉ còn chip đang chọn.
