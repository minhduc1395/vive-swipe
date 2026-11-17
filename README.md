# vive-swipe · VIVE Quẹt

Web bán hàng của **VIVE | K-Beauty Experience** theo kiểu Tinder: quẹt phải món thích, quẹt trái để bỏ qua; web học sở thích, đề xuất deal hợp với từng người, giữ hàng để nhận và trả tiền tại booth, báo deal qua email.

| Cần gì | Mở đâu |
|---|---|
| Kế hoạch, lịch, quyết định, câu hỏi mở | `docs/00-ke-hoach.md` |
| Màn hình và luồng | `docs/01-trai-nghiem.md` |
| Code, database, quy tắc giá, thuật toán gợi ý | `docs/02-ky-thuat.md` |
| Màu, font, logo, chữ, pháp lý | `docs/03-thuong-hieu-va-noi-dung.md` |
| Dữ liệu sản phẩm và deal | `data/` |
| Việc cần làm | `tasks/` (xem nhanh: `python3 scripts/board.py`) |
| Tin nhắn Claude ↔ Antigravity | `handoff/` |
| Chỉ dẫn cho agent | `AGENTS.md`, `CLAUDE.md` |

Điều phối chung của dự án VIVE: repo `minhduc1395/vive_poup` (task T016).

## Phiên đầu tiên của Antigravity (dán 1 lần)
Mở Antigravity ở thư mục cha của `vive_poup` (hoặc một thư mục trống), chọn chế độ Planning, rồi dán:

"Đây là phiên đầu tiên của bạn với dự án VIVE Quẹt: web bán mỹ phẩm kiểu quẹt Tinder. Trả lời tôi bằng tiếng Việt.
1. Clone https://github.com/minhduc1395/vive-swipe vào thư mục này. Mọi việc làm trong thư mục vive-swipe.
2. Đọc AGENTS.md, README.md, docs/00-ke-hoach.md, docs/01-trai-nghiem.md, docs/02-ky-thuat.md, docs/03-thuong-hieu-va-noi-dung.md và design/README.md. Đây là luật của dự án: Claude là Lead và kiểm tra (QA), bạn viết code theo task, tôi là chủ dự án.
3. Chạy python3 scripts/board.py và đọc các handoff mới nhất (handoff W013 tra-loi nói cách kết nối Supabase).
4. Kiểm tra máy: node -v (cần 20 trở lên), npm, git, gh auth status. Thiếu gì thì báo tôi, không tự cài phần mềm lớn. Chưa có gh thì push nhánh rồi gửi tôi link tạo Pull Request mà GitHub trả về.
5. Sao chép .env.example thành .env.local. Để trống SUPABASE_SERVICE_ROLE_KEY, tôi tự điền sau. Không commit file này.
6. Làm W006 trước: nhận việc theo AGENTS.md, cho tôi xem kế hoạch rồi mới code, làm trên nhánh w006-khoi-tao, mở Pull Request. Giao diện bám theo design/.
7. Xong W006 thì làm tiếp W007, rồi W008 và W009 (logic trong lib/, có test). Mỗi task một nhánh tách từ nhánh task phụ thuộc, một Pull Request riêng.
8. Không sửa data/, docs/, supabase/. Thấy thiếu dữ liệu hoặc tài liệu mâu thuẫn thì tạo handoff hoi và hỏi tôi, không tự đoán.
9. Cuối phiên tạo handoff trang-thai-phien, push, rồi tóm tắt cho tôi: xong việc gì, link Pull Request, cách chạy thử trên máy."

## Khởi động Antigravity (dán vào đầu mỗi phiên sau)
"Vào repo vive-swipe, pull bản mới nhất, đọc AGENTS.md (mục Vòng làm việc tự động). Chạy python3 scripts/inbox.py antigravity: sửa hết lỗi QA và trả lời tin mới trước, rồi mới nhận việc Todo tiếp theo. Sau mỗi việc xong, pull và chạy lại inbox.py. Cứ lặp như vậy đến khi hết việc làm được thì tạo handoff trang-thai-phien và dừng."
