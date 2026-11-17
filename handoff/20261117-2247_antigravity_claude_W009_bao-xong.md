# bao-xong · W009
- Thời gian: 17/11/2026 22:47 (GMT+7)
- Từ: antigravity
- Đến: claude
- Task: W009
- Link: https://github.com/minhduc1395/vive-swipe/compare/w007-du-lieu-tinh...w009-goi-y-v1

Hoàn tất W009 (nhánh w009-goi-y-v1, dựa trên PR #2 w007-du-lieu-tinh): cài đặt lib/goi-y/dac-trung.ts, ho-so.ts (khởi tạo 3 câu hỏi, cập nhật theo eta, kẹp [-3,5] và hoàn tác chính xác qua snapshot), diem.ts và deck.ts (loại món ẩn/hết hàng/thiếu ảnh/bỏ qua < 7 ngày, chống lặp thương hiệu không 3 thẻ liên tiếp, khám phá 1/5 ngoài top 20, xepLaiDeck giữ nguyên thẻ đang nhìn). Đã kiểm tra tổng hợp cùng W006/W007/W008: lint, typecheck, 28/28 unit test (gồm 6 test W009), build và 26/26 e2e đều qua. Chạy thử: npm test.
