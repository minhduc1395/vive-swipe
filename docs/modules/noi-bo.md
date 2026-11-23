# Module: noi-bo

## Mục đích
Trang nhân viên (tra mã giữ hàng tại booth) và trang quản trị; cron hết hạn giữ hàng và độ phổ biến.

## Thư mục và file chính
- `app/nhan-vien/`, `lib/nhan-vien/` (đăng nhập nhân viên, xác thực server).
- `app/quan-tri/`, `lib/admin/` (kho quản trị, luật deal cho quản trị, KiotViet).
- `app/api/cron/het-han-giu-hang`, `app/api/cron/pho-bien`.
- Test: `tests/nhan-vien.test.ts`, `quan-tri.test.ts`.

## Quy ước riêng
- Chỉ nhân viên đăng nhập mới xem được mã giữ hàng.
- Nhân viên booth dùng điện thoại: nút to, ít chữ.

## Lịch sử ngắn
- (chưa có)

## Đang khóa
- 23/11: job #136 (che SĐT /nhan-vien, LEG L1) đang chạy. Không giao job hay task W khác vào `app/nhan-vien/` tới khi #136 đóng.
- 21/11: W045, W046 Done. Antigravity làm W066 (thưởng giữ hàng ở trang nhân viên). Không giao job đội coder vào noi-bo cho tới khi W066 Done.
