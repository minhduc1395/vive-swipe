# Module: giu-hang

## Mục đích
Khách giữ hàng trên web, nhận mã giữ hàng, trả tiền và nhận tại booth; email xác nhận; QR.

## Thư mục và file chính
- `lib/giu-hang/`: `tao-giu-hang.ts`, `kho-giu-hang.ts`, `types.ts`. Test: `tests/giu-hang-server.test.ts`, `gio-hang.test.ts`.
- `app/(khach)/giu-hang/` và `[ma]`: trang giữ hàng và trang mã.
- `app/api/` (trừ `cron/`): API giữ hàng.
- `lib/email/`: email xác nhận (tắt mặc định, bật bằng `VIVE_BAT_GUI_EMAIL=1`).
- `lib/qr.ts`.
- `lib/giu-hang/thuong.ts`: hàm thuần `thuongGiuHang`, `dongThuongGiuHang` đọc `thuong_giu_hang` của deal (qua `hienThi`); form và trang mã hiện dòng này.

## Quy ước riêng
- Giá tính lại ở server khi giữ hàng, không tin giá từ trình duyệt.
- Không ghi dữ liệu cá nhân của khách vào log.

## Lịch sử ngắn
- 2026-11-21 (#64): màu theo bảng nội thất: kem/be/oliu-nhat thay token cũ, ô nhập viền `vien` (chọn: `den`), khung QR `oliu-nhat`; hồng chỉ còn chip đang chọn.
- 2026-11-21 (#75): hiện thưởng thêm lượt quay (DC-02 `thuong_giu_hang`) ở form giữ hàng và trang mã; chữ và ngày lấy từ data, tắt DC-02 thì ẩn.
- 22/11: Antigravity làm W067 (sửa select deal(ten) trong lib/giu-hang/kho-giu-hang.ts). Đội coder không nhận job chạm file này tới khi W067 Done.
- 2026-11-21 (#83, W044): chữ của trang giữ hàng và trang mã nằm ở `messages/{vi,en}/giu-hang.json`; lỗi server trả thêm `maLoi` để hiện đúng ngôn ngữ; thưởng giữ hàng en dùng `qua_en`. Email chưa song ngữ.
- 2026-11-22 (#106, LEG-003): email xác nhận bỏ chữ "nội địa Hàn", dòng chân là "Mỹ phẩm Hàn Quốc tại TP. Hồ Chí Minh"; test khóa trong `tests/giu-hang-leg003.test.ts`.
- 2026-11-22 (#116, LEG-002): ô đồng ý chính sách ở form giữ hàng mặc định chưa tick (`useState(false)`); chưa tick thì báo `loi.chinhSach`, không gọi tạo giữ hàng. Test: `tests/giu-hang-dong-y.test.ts`, e2e 1b trong `giu-hang.spec.ts`.
