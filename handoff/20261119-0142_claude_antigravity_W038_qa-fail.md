# qa-fail · W038
- Thời gian: 19/11/2026 01:42 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W038
- Link: https://github.com/minhduc1395/vive-swipe/pull/24

QA Fail, phần chính đã đạt: route group app/(khach) bọc AppShell, logo next/image kích thước cố định và vẫn là cùng 1 node DOM khi chuyển trang (w038.spec 8/8 qua), 3 kiểu thanh đúng nhãn, đúng thứ tự ở 390/820/1440, mục sáng đúng (Sản phẩm ở /danh-muc?loai=mat-na, Deal ở /deal, New Arrival ở /), Quay lại và Back trình duyệt về danh mục gốc, không cuộn ngang. Lint 0 lỗi (1 cảnh báo), typecheck, unit 75 qua, build qua. Toàn bộ e2e tại máy Claude (Chromium cho cả 2 project): 167 qua, 7 hỏng. Cần sửa:
(1) new-arrival.spec.ts:163 hỏng vì thay đổi của W038: test cũ của W027 đòi logo ≤ 56px và link New Arrival trên thanh trên điện thoại; theo W038 thanh trên điện thoại chỉ còn logo + Đăng nhập, logo 58px. Sửa test theo spec mới (hoặc đặt logo 56px).
(2) new-arrival.spec.ts:4 còn chờ 'Tông nào hợp bạn?' nhưng data đã đổi thành 'Tone bạn màu nào?' (thay-doi-luat W029 18/11). Sửa test và giá trị mặc định trong components/landing/khoi/KhoiDoiTac.tsx. Cần xanh vì W032 sẽ đưa e2e vào CI.
(3) Nút 'Đăng nhập' trên thanh trên điện thoại cao 32px (h-8), dưới mức 44px của docs/05 §2.2. Giữ viên thuốc 32px cho đẹp nhưng vùng bấm ≥ 44px (Link min-h-[44px] bọc span), test đổi '≥ 30' thành '≥ 44'.
(4) Task mục 5 yêu cầu BỎ các prop hienDieuHuong, hienThanhTrenDesktop, hienThanhDocTablet, hienThanhTabMobile khỏi AppShell; hiện vẫn còn trong AppShellProps (đánh dấu deprecated). Xóa hẳn, bỏ hienDieuHuong ở app/nhan-vien/page.tsx; components/KhungUngDung.tsx không còn trang nào dùng thì xóa.
(5) khung-co-gian.spec.ts test 4 và 5 chạy 55–60s, chạm giới hạn 60s và hỏng ở máy Claude: đặt test.setTimeout(120_000).
(6) Cảnh báo lint: biến context không dùng ở tests/e2e/w038.spec.ts:54.
Sửa xong PR #24 merge trước W032.
