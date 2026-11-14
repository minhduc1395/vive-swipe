# giao-viec · meta
- Thời gian: 15/11/2026 00:39 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: meta

Khởi động dự án VIVE Quẹt (web quẹt sản phẩm kiểu Tinder).

Đọc theo thứ tự: AGENTS.md → docs/00-ke-hoach.md → docs/02-ky-thuat.md → docs/01-trai-nghiem.md → docs/03-thuong-hieu-va-noi-dung.md → data/README.md.

Nhận ngay (không chờ ai): W006 → W007 → W008 và W009 (song song được) → W010 → W011 → W012. Giai đoạn này chạy hoàn toàn bằng dữ liệu tĩnh trong data/, chưa cần Supabase.
Chưa nhận: W013 trở đi (chờ Claude tạo Supabase ở W003 và chủ dự án chọn hosting, tên miền ở W001).

Lưu ý:
- Mỗi task làm trên nhánh riêng, mở Pull Request, Claude QA rồi merge.
- Engine giỏ (W008) là phần dễ sai nhất: phải có đủ 10 test docs/02 mục 4.3 trước khi làm giao diện giỏ.
- Ảnh sản phẩm chưa có (W004, W005). Trong lúc chờ, dùng ảnh giữ chỗ trung tính (khối màu hong-nhat + tên sản phẩm), KHÔNG lấy ảnh trên mạng. Chế độ dev cho phép hiện sản phẩm chưa có ảnh; bản thật thì ẩn.
- Không sửa data/ và docs/. Thấy lệch hoặc thiếu thì tạo handoff hoi.
- Hạn mục tiêu: QA giữa kỳ 20/11 với bản W006–W012.
