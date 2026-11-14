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

## Khởi động Antigravity (dán vào đầu mỗi phiên)
"Vào repo vive-swipe. Pull bản mới nhất, đọc AGENTS.md và docs/00-ke-hoach.md, chạy python3 scripts/board.py, đọc handoff mới nhất. Nhận các việc Chủ trì = Antigravity trạng thái Todo theo ưu tiên, đọc đúng tài liệu được dẫn trong task, làm trên nhánh riêng và mở Pull Request. Cuối phiên tạo handoff trang-thai-phien."
