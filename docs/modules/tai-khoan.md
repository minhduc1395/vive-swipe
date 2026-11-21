# Module: tai-khoan

## Mục đích
Khách đăng nhập bằng email + mã 6 số (OTP Supabase) để giữ lịch sử khi đổi máy. Khách ẩn danh đăng nhập thì giữ nguyên `auth.uid()`.

## Thư mục và file chính
- `lib/tai-khoan/`: `dang-nhap.ts` (`guiMa`, `xacNhanMa`, `dangXuat`, `laDaDangNhap`), `kiem-tra.ts` (email, mã, che email, đếm ngược), `loi.ts` (lỗi tiếng Việt), `use-tai-khoan.ts` (hook trạng thái đăng nhập).
- `components/tai-khoan/`: `FormDangNhap.tsx` (2 bước), `ThongTinTaiKhoan.tsx`, `LinkTaiKhoan.tsx` (đổi nút "Đăng nhập" thành "Tài khoản" khi đã đăng nhập).
- `app/(khach)/dang-nhap/`, `app/(khach)/tai-khoan/`.
- Test: `tests/tai-khoan.test.ts`, `tests/e2e/tai-khoan.spec.ts` (mock `/auth/v1/otp`, `/verify`, `/user` PUT ngay trong spec).

## Cách chạy
- Khách ẩn danh: `updateUser({ email })` → `verifyOtp({ type: "email_change" })`, cùng uid.
- Email đã có tài khoản (`email_exists`): `signInWithOtp({ shouldCreateUser: false })` → `verifyOtp({ type: "email" })`, đổi sang uid của tài khoản đó.
- Xong: upsert `khach.email` của chính mình. Đăng xuất: `signOut({ scope: "local" })` rồi `damBaoKhachAnDanh()`; đã thích, giỏ ở localStorage giữ nguyên.

## Quy ước riêng
- Không in email ra console. Trên giao diện chỉ hiện email đã che (`cheEmail`).
- Supabase trả `otp_expired` cho cả mã sai và hết hạn: dưới 1 giờ từ lúc gửi báo "mã chưa đúng".
- Mẫu mail "Change email address" và "Magic link" trên Supabase phải có `{{ .Token }}` (WEB cấu hình).

## Lịch sử ngắn
- #65: tạo module, đăng nhập email + mã 6 số, trang tài khoản, nút "Tài khoản" ở thanh trên máy tính.
