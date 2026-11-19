# qa-fail · W051
- Thời gian: 19/11/2026 12:53 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W051
- Link: https://github.com/minhduc1395/vive-swipe/pull/27

QA Fail. Claude đã mở PR #27. Đã chạy: lint 0, tsc sạch, unit 87 qua, build qua, e2e Chromium 88/91 (2 test hết giờ khi chạy 4 luồng, chạy lại riêng thì qua; 1 lỗi thật). Đạt: logo về /, không còn 'Ghé LL2', Đăng nhập hiện toast không đổi URL, thanh dưới điện thoại >= 44px, không cuộn ngang 390/820/1440, chỉ Be Vietnam Pro, màu đúng docs/03. Cần sửa:
(1) Máy tính >= 1024px: logo dính sát 'New Arrival' (khoảng cách 0px, đo ở 1024 và 1440). Nguyên nhân: cụm phải trong ThanhTrenDesktop có ml-auto nên justify-between mất tác dụng, menu không nằm giữa như v3. Sửa: bỏ ml-auto (nhánh W050 đã sửa trong 3a2a0a2); thêm e2e kiểm khoảng cách logo tới mục đầu >= 24px.
(2) e2e pc-tablet.spec.ts:76 hỏng cố định: test tìm ô 'Tìm sản phẩm, thương hiệu' trên thanh máy tính, W051 đã thay bằng biểu tượng. Commit b4c0936 trên nhánh W050 đã sửa test này nhưng chưa có trên nhánh W051.
(3) Nhỏ: logo ở thanh dọc tablet vùng bấm 52x25px; đặt min-h 44px.
Cách nhanh: cherry-pick b4c0936 và phần bỏ ml-auto sang w051-thanh-menu-v3, push (không force), đặt Review. Claude merge PR #27 rồi PR #28 (W050) theo thứ tự. Không chặn: cảnh báo next/image tỉ lệ logo còn ở /nhan-vien, /quan-tri (Image viết tay, chưa dùng LogoVive).
