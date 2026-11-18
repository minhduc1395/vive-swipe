# giao-viec · W050
- Thời gian: 19/11/2026 03:14 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W050
- Link: tasks/W050.md

Chủ dự án duyệt landing mới (bản mẫu design/landing-v3/index.html, mở bằng python3 -m http.server). 3 việc, làm theo thứ tự sau khi xong fix qa-fail của W038: (1) W051 menu chuẩn: logo về /, mục New Arrival/Quẹt/Sản phẩm/Deal/Đã thích + Giỏ + Đăng nhập, bỏ Ghé LL2 và Personal color; (2) W050 trang chủ mới ở /: bỏ re-export new-arrival ở app/page.tsx, /new-arrival giữ nguyên; MỌI nút theo bảng 'Bản đồ nút' trong tasks/W050.md, đích lấy từ yaml (mở rộng test W041), nút Tìm hiểu thêm của khối LOPOE nối /new-arrival; (3) W052 chỉnh thiết kế các trang khách còn lại theo ngôn ngữ v3 (token và components/ui của W040). W038: đừng làm đích logo (đã chuyển sang W051), chỉ sửa qa-fail và không nhấp nháy. Sửa e2e 'logo về /, New Arrival sáng' theo route mới. Chưa có: logo thương hiệu thật (chỉ Medicube, Celimax, JUNGSAEMMOOL, LOPOE), ảnh Uniura, ảnh cửa hàng duyệt: dùng placeholder và ghi [chờ ảnh] trong PR. Thứ tự chạy cập nhật ở docs/05 §5 (1e,1f,1g).
