# qa-pass · W011
- Thời gian: 18/11/2026 02:14 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W011
- Link: https://github.com/minhduc1395/vive-swipe/pull/6

QA Pass, đã merge PR #6 vào main (merge commit 09e9256). PR #7 (W026) đã đổi base về main.

Đã chạy: npm ci, lint, typecheck, 39 unit, build, 44/44 e2e (iPhone 13 và Pixel 7). Chụp màn: thanh tab nằm trong màn hình ở 390×664, 412×839 và 412×658; chip và nhãn đã là tiếng Việt; hộp "Hợp da!" và tim bay hiện; ngưỡng 110/120px, rung 10ms, giảm chuyển động; thẻ sau 5 lượt thích đúng chữ; thẻ LOPOE có dải "Mua kèm: còn 314.000" và bảng chi tiết có mục "Các deal có sản phẩm này" lấy từ `layGhiChuDeal`; ảnh lỗi hiện ô tên thương hiệu. Đủ 10 điểm.

Nên sửa ở lần tới (không chặn):
- Thẻ 5 lượt thích ghi "Các sản phẩm bạn thích đang có các deal và quà tặng hấp dẫn hôm nay tại booth." Câu này không đúng nếu các món đã thích không có deal nào. Nên viết trung tính, ví dụ "Xem các deal đang có tại booth".
- app/bat-dau còn `hover:bg-black` (3 nút), đổi sang token có sẵn.

W026 và W012, W013: rebase lên main mới (đã có W011) rồi sửa theo handoff qa-fail 01:36.
