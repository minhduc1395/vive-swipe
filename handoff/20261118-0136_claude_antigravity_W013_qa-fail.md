# qa-fail · W013
- Thời gian: 18/11/2026 01:36 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W013
- Link: https://github.com/minhduc1395/vive-swipe/pull/9

QA Fail · PR https://github.com/minhduc1395/vive-swipe/pull/9 (nhánh 5093d4c, tách từ main). Lint, typecheck, unit, build, 32/32 e2e qua. Claude kiểm RLS trên database thật (giả lập role authenticated của 1 khách): chỉ thấy 1 dòng khach và lượt quẹt của chính mình, 0 dòng của người khác, không đọc được su_kien. Đăng nhập ẩn danh đang bật. Còn lỗi:

1. Unit test ghi vào Supabase thật. tests/supabase.test.ts (khối RLS) đăng nhập ẩn danh và ghi khach, luot_quet vào project dsrejhghgbvnwgxpdhee mỗi lần `npm test`; URL và khóa viết cứng trong test. CI và Cloud Build (W025) sẽ làm bẩn số liệu đo lường docs/00 mục 6. Hiện database có 65 user ẩn danh, 34 khach, 12 luot_quet, 20 su_kien, toàn là dữ liệu thử. Sửa: unit test dùng client giả (mock); test RLS thật chỉ chạy khi đặt `RUN_SUPABASE_IT=1` (mặc định bỏ qua), đọc URL và khóa từ biến môi trường, và phải kiểm cả chiều "A thấy dòng của A" (hiện test qua được cả khi lệnh ghi lỗi). Claude sẽ dọn dữ liệu thử trước ra mắt.
2. `damBaoKhachAnDanh` có thể khóa khách vĩnh viễn ngoài Supabase. (a) Khi `signInAnonymously` lỗi, code lưu UUID tự sinh vào `vive_khach_id`; lần sau hàm trả về ngay id giả mà không đăng nhập lại, trong khi hàng đợi chỉ gửi khi có session thật, nên lượt quẹt của khách đó không bao giờ lên server. Supabase giới hạn số lần đăng nhập ẩn danh theo IP, nên khách dùng chung Wi-Fi booth hoặc 4G dễ gặp lỗi 429. (b) Có `vive_khach_id` là bỏ qua kiểm tra session. Sửa: luôn lấy session bằng `getSession()`; không lưu id giả; khi chưa có session thì thử đăng nhập lại ở lần đẩy hàng đợi sau hoặc khi có mạng; chỉ upsert `khach` khi có session.
3. Chưa đọc sản phẩm và deal từ Supabase. `taiSanPhamTuSupabase` và `taiDealsTuSupabase` có viết nhưng không chỗ nào gọi, web vẫn chỉ dùng dữ liệu tĩnh, nên bật tắt ở quản trị (W017) sẽ không có tác dụng. Sửa: nạp qua một provider hoặc hook dùng chung (dữ liệu tĩnh hiện trước, có dữ liệu Supabase thì thay); kiểm dòng DB bằng schema zod của lớp dữ liệu tĩnh trước khi dùng (hiện đang ép kiểu `as SanPham[]`); có unit test với dữ liệu giả.
4. Không trang nào gọi `ghiLuotQuet`, `ghiSuKien`, `dongBoTraLoi`, `dongBoHoSo` (chỉ có `mo_web` trong layout), vì nhánh mới tách khỏi các trang. Sau khi W011 và W012 merge: rebase lên main rồi nối vào câu hỏi, deck, danh mục, đã thích, giỏ. Khi nối: dùng `theHienTai.nguon` (goi_y, kham_pha, pho_bien) thay vì ghi cứng "goi_y"; đồng bộ `ho_so` theo lô cùng nhịp hàng đợi (tối đa 5 giây một lần), không gửi 1 request mỗi lượt quẹt.
5. E2E "tắt mạng" hiện tự ghi localStorage rồi chỉ kiểm kết quả là một mảng, không kiểm được tiêu chí. Viết lại: chặn hoặc giả Supabase bằng `page.route`, quẹt thật 3 lượt khi offline, đợi hơn 5 giây, bật mạng lại, kiểm request insert `luot_quet` chứa đủ 3 dòng và hàng đợi rỗng. `tao_luc` phải là chuỗi ISO, không phải số.
6. Nhánh chép `lib/khao-sat.ts` (W010) và `lib/kho-luu-tru.ts` (W011/W012) nên xung đột với W012 ở lib/kho-luu-tru.ts. Rebase lên main sau W011, W012 thay vì chép file.
7. Ghi chú cho W015: `KhoiTaoSupabase` đăng nhập ẩn danh ở mọi trang, kể cả /nhan-vien và /quan-tri. Khi làm đăng nhập nhân viên cần bỏ qua các trang này để không lẫn phiên.

Sửa xong đặt Review, ghi link PR #9 ở dòng Đầu ra.
