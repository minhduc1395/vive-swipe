# qa-fail · W013
- Thời gian: 18/11/2026 02:44 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W013
- Link: https://github.com/minhduc1395/vive-swipe/pull/9

QA Fail (lần 2) · PR https://github.com/minhduc1395/vive-swipe/pull/9. Đã đạt: lint, typecheck, 47 unit (khối RLS thật bỏ qua khi không có RUN_SUPABASE_IT, không còn ghi vào database), build. 7 điểm lần trước đã sửa: không còn id giả, luôn getSession, kiểm zod, nối ghiLuotQuet/ghiSuKien/dongBo vào các trang, dùng theHienTai.nguon, hồ sơ gửi theo lô, bỏ qua /nhan-vien và /quan-tri. E2E "tắt mạng" qua (6/6) khi có .env.local. Còn 3 lỗi:

1. Deck không dùng dữ liệu Supabase ở lần mở đầu, nhưng đổi sang dữ liệu Supabase khi quay lại trang. `app/quet/page.tsx` có `deckKhoiTaoRef` nên deck chỉ xếp 1 lần với dữ liệu tĩnh (provider chưa tải xong); khi khách sang /gio rồi quay lại /quet, component mới đọc dữ liệu Supabase nên deck khác hẳn. Claude kiểm bằng bản build có biến môi trường: lần đầu thẻ đầu là Rep!el Hyaluronic Capsule Mask (dữ liệu tĩnh) trong khi provider đã nhận 129 dòng từ Supabase. Sửa: provider trả thêm `daSanSang` (true khi tải Supabase xong, lỗi, hoặc quá 2 giây); /quet chỉ xếp deck khi `daSanSang`, xếp 1 lần; hiện khung chờ ngắn trong lúc đợi. Không xếp lại deck khi khách đã quẹt.
2. Các trang khác vẫn đọc dữ liệu tĩnh: `/gio` (SAN_PHAM, DEALS), `/da-thich` (DEALS, timSanPhamTheoId), `components/deck/BangChiTiet.tsx` (DEALS). Khi quản trị đổi giá, tắt deal hay đánh dấu hết quà (W017), deck và giỏ sẽ lệch nhau. Sửa: mọi trang khách dùng `useDuLieu()` (W026 sau khi rebase cũng vậy).
3. E2E phụ thuộc Supabase thật. Không có `.env.local` thì test tiêu chí "tắt mạng" hỏng (0/3 lượt được gửi vì client Supabase là null). Có `.env.local` thì các test khác (khảo sát, quẹt, danh mục) đăng nhập ẩn danh vào project thật mỗi lần chạy, và deck lấy dữ liệu thật nên số thẻ đổi theo database. Sửa: trong `playwright.config.ts` đặt `webServer.env` với `NEXT_PUBLIC_SUPABASE_URL` là một host giả (ví dụ `http://supabase.e2e.test`) và khóa giả; thêm fixture dùng chung chặn host đó bằng `page.route` (auth trả session giả, `san_pham` và `deal` trả dữ liệu mẫu có ảnh, insert trả 201). Như vậy e2e chạy được ở máy sạch và không bao giờ chạm database thật.

Lưu ý dữ liệu (phần của Claude, không phải lỗi của nhánh này): trên Supabase cột `anh` chỉ điền khi file ảnh có thật trong public/products (hiện 4 mã Dermal), đúng docs/03 mục 4 "sản phẩm chưa có ảnh không hiện trong deck". Còn dữ liệu tĩnh ghi tên file ảnh cho cả 149 mã nên đang hiện cả sản phẩm chưa có ảnh. Sau khi sửa mục 1, deck trên web chỉ còn 4 sản phẩm cho tới khi có ảnh (W004 chủ dự án, W005 Claude). Claude đã hỏi chủ dự án có muốn tạm hiện sản phẩm chưa có ảnh để xem thử không; chưa có trả lời thì giữ đúng luật, không sửa bộ lọc.
