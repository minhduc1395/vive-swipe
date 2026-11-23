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
- #136 (23/11) SĐT khách che ở server (`lib/nhan-vien/che-sdt.ts`): `/nhan-vien` chỉ nhận và hiện 4 số cuối; ô tìm khớp 4 số cuối còn thấy.

## Đang khóa
- (không có). #136 gộp PR #138 (23/11), W066 Done.
