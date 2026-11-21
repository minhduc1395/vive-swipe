# Module: tai-khoan

## Mục đích
Khách đăng nhập để giữ lịch sử quẹt, đã thích, giỏ hàng và đơn giữ hàng khi đổi máy (W030). Đăng nhập là tùy chọn: khách không đăng nhập vẫn quẹt và giữ hàng được như hiện nay.

## Thư mục và file chính
- Trang: `app/(khach)/dang-nhap/` (đang là trang chờ), `app/(khach)/tai-khoan/` (tạo mới).
- `components/tai-khoan/`, `lib/tai-khoan/` (tạo mới).
- Đọc, không sửa: `lib/supabase/auth.ts` (khách ẩn danh `damBaoKhachAnDanh`), `lib/supabase/client.ts`, `lib/kho-luu-tru.ts` (khóa localStorage `vive_da_thich`, `vive_gio_hang`). Cần sửa các file này thì comment BLOCKED, WEB làm.
- Thanh trên (`components/ThanhTren*.tsx`) là file shared: job cần đổi nút "Đăng nhập" thì ghi rõ trong PR, WEB gộp.

## Cách đăng nhập (BOD duyệt hướng, phần còn lại WEB tự quyết, QD-BOD-010)
- Bước 1: email + mã 6 số (Supabase Auth OTP). Chưa làm Google (cần BOD tạo OAuth client).
- Khách đang là user ẩn danh: gọi `supabase.auth.updateUser({ email })` rồi `verifyOtp({ email, token, type: "email_change" })` để biến user ẩn danh thành user thật, giữ nguyên `auth.uid()` nên mọi dữ liệu cũ (bảng `khach`, `luot_quet`, `giu_hang`) đi theo.
- Email đã có tài khoản: `signInWithOtp({ email, options: { shouldCreateUser: false } })` rồi `verifyOtp({ type: "email" })`. Dữ liệu localStorage của máy này gộp vào tài khoản (job đồng bộ).
- Đăng xuất: `signOut()` rồi để `damBaoKhachAnDanh()` tạo user ẩn danh mới. Không xóa localStorage khi đăng xuất trừ khi khách bấm "Xóa dữ liệu trên máy này".
- Lỗi phải nói bằng tiếng Việt dễ hiểu: sai mã, mã hết hạn, gửi quá nhiều lần (đợi 60 giây mới cho gửi lại).

## Ràng buộc
- Gửi mail mã đăng nhập dùng SMTP của Supabase project (WEB cấu hình SMTP Resend và mẫu mail có `{{ .Token }}`). Ở e2e không có Supabase thật: mock theo `tests/e2e/fixtures.ts`.
- Không lưu email, số điện thoại ra log. Không hiện email đầy đủ trên thanh trên (chỉ chữ cái đầu hoặc "Tài khoản").
- Bảng mới và RLS chỉ WEB viết (`supabase/migrations/`, shared).

## Lịch sử ngắn
- 2026-11-21 WEB tạo module, job A (đăng nhập email OTP), job B (đồng bộ đã thích + giỏ) chờ migration.
