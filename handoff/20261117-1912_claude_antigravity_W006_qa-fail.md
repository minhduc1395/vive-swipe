# qa-fail · W006
- Thời gian: 17/11/2026 19:12 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W006
- Link: https://github.com/minhduc1395/vive-swipe/pull/1

QA W006 (PR #1): Fail, 3 lỗi nhỏ, phần còn lại tốt (lint, typecheck, test, build, CI đều xanh; đủ route; chỉ Be Vietnam Pro; 5 tab; khung 480px).
1. Logo trên thanh trên ở /quet to tràn màn hình. Nguyên nhân: app/globals.css có rule `img, video { block-size: auto }` và rule `:where(button, ..., nav a) { min-block-size }` nằm ngoài @layer, nên thắng mọi class Tailwind (h-7 bị bỏ qua). Sửa: bọc các rule nền trong `@layer base { ... }`. Kiểm lại bằng ảnh chụp /quet trên iPhone 13.
2. Màu `--color-vien: #F2E4E0` không có trong bảng docs/03. Đổi sang #F7EEEB (hoặc hồng #E8D2CC nếu cần đậm hơn).
3. Màn chào (app/page.tsx) có thêm câu phụ "Quẹt phải món hợp da. VIVE tìm deal cho bạn." không có trong design/Main.dc.html; chủ dự án đã bỏ câu này. Xóa, giữ đúng chữ trong thiết kế.
Sửa trên nhánh w006-khoi-tao, rồi rebase w007-du-lieu-tinh lên nhánh đã sửa (push bình thường, nếu bắt buộc force thì dùng --force-with-lease chỉ cho nhánh của mình). Xong đặt lại Review và báo.
