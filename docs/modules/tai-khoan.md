# Module: tai-khoan

## Mục đích
Khách đăng nhập để giữ lịch sử quẹt, đã thích, giỏ hàng và đơn giữ hàng khi đổi máy (W030). Đăng nhập là tùy chọn: khách không đăng nhập vẫn quẹt và giữ hàng được như hiện nay.

## Thư mục và file chính
- Trang: `app/(khach)/dang-nhap/` (form 2 bước khi bật cờ, trang chờ khi tắt), `app/(khach)/tai-khoan/`.
- `lib/tai-khoan/`: `dang-nhap.ts` (`guiMa`, `xacNhanMa`, `dangXuat`, `laDaDangNhap`), `kiem-tra.ts` (email, mã, che email, đếm ngược), `loi.ts` (lỗi tiếng Việt), `use-tai-khoan.ts` (hook trạng thái đăng nhập), `co.ts` (cờ `NEXT_PUBLIC_DANG_NHAP_EMAIL`).
- `components/tai-khoan/`: `FormDangNhap.tsx` (2 bước), `ThongTinTaiKhoan.tsx`, `LinkTaiKhoan.tsx` (đổi nút "Đăng nhập" thành "Tài khoản" khi đã đăng nhập và bật cờ).
- Test: `tests/tai-khoan.test.ts`, `tests/e2e/tai-khoan.spec.ts` (mock `/auth/v1/otp`, `/verify`, `/user` PUT ngay trong spec).
- Đọc, không sửa: `lib/supabase/auth.ts` (khách ẩn danh `damBaoKhachAnDanh`), `lib/supabase/client.ts`, `lib/kho-luu-tru.ts` (khóa localStorage `vive_da_thich`, `vive_gio_hang`). Cần sửa các file này thì comment BLOCKED, WEB làm.
- Thanh trên (`components/ThanhTren*.tsx`, thanh điện thoại trong `components/AppShell.tsx`) là file shared: job cần đổi nút "Đăng nhập" thì ghi rõ trong PR, WEB gộp.

## Cách đăng nhập (BOD duyệt hướng, phần còn lại WEB tự quyết, QD-BOD-010)
- Bước 1: email + mã 6 số (Supabase Auth OTP). Chưa làm Google (cần BOD tạo OAuth client).
- Khách ẩn danh: `updateUser({ email })` → `verifyOtp({ email, token, type: "email_change" })`, giữ nguyên `auth.uid()` nên dữ liệu cũ (`khach`, `luot_quet`, `giu_hang`) đi theo.
- Email đã có tài khoản (`email_exists`): `signInWithOtp({ shouldCreateUser: false })` → `verifyOtp({ type: "email" })`, đổi sang uid của tài khoản đó. Dữ liệu localStorage của máy này gộp vào tài khoản (job đồng bộ).
- Xong: upsert `khach.email` của chính mình. Đăng xuất: `signOut({ scope: "local" })` rồi `damBaoKhachAnDanh()`; đã thích, giỏ ở localStorage giữ nguyên.
- Lỗi nói bằng tiếng Việt: sai mã, mã hết hạn, gửi quá nhiều lần (đợi 60 giây mới cho gửi lại), mất mạng.

## Ràng buộc
- Cờ `NEXT_PUBLIC_DANG_NHAP_EMAIL === "1"` mới hiện form và nút "Tài khoản". Tắt cờ: `/dang-nhap` là trang chờ, nút "Đăng nhập" vẫn hiện toast "sắp ra mắt". Cờ đọc lúc build (Next inline), đổi cờ phải build lại. e2e bật cờ trong `playwright.config.ts`.
- Gửi mail mã dùng SMTP của Supabase project (WEB cấu hình SMTP Resend; mẫu "Change email address" và "Magic link" phải có `{{ .Token }}`). Ở e2e không có Supabase thật: mock.
- Supabase trả `otp_expired` cho cả mã sai và hết hạn: dưới 1 giờ từ lúc gửi báo "mã chưa đúng".
- Không lưu email, số điện thoại ra log. Không hiện email đầy đủ trên thanh trên (chỉ "Tài khoản"); trang tài khoản chỉ hiện email đã che (`cheEmail`).
- Bảng mới và RLS chỉ WEB viết (`supabase/migrations/`, shared).

## Lịch sử ngắn
- 2026-11-21 WEB tạo module, job A (đăng nhập email OTP), job B (đồng bộ đã thích + giỏ) chờ migration.
- 2026-11-21 WEB: bảng `yeu_thich`, `gio_hang_luu` + RLS chủ sở hữu (`supabase/migrations/20261121120000_yeu_thich_gio_hang_luu.sql`, đã chạy trên Supabase) cho job #66.
- 2026-11-21 BOD: phần email để sau. Đăng nhập email nằm sau cờ `NEXT_PUBLIC_DANG_NHAP_EMAIL=1`; WEB bật khi có SMTP. Job #66 vẫn làm được (đồng bộ chỉ chạy khi đã đăng nhập).
- 2026-11-21 #65: đăng nhập email + mã 6 số, trang tài khoản, nút "Tài khoản" ở thanh trên máy tính và điện thoại, tất cả sau cờ.
- 2026-11-22 #84 (W044): song ngữ VI | EN cho `/dang-nhap`, `/tai-khoan`. Chữ ở `messages/{vi,en}/tai-khoan.json`; `lib/tai-khoan/loi.ts` trả mã lỗi (`LOI.maSai`...), UI dịch bằng `tai-khoan.loi.<mã>`. Nút "Đăng nhập" trên thanh trên (shared) chưa đổi, chờ job #96.
