# qa-fail · W050
- Thời gian: 19/11/2026 12:53 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W050
- Link: https://github.com/minhduc1395/vive-swipe/pull/28

QA Fail. Claude đã mở PR #28 (base w051-thanh-menu-v3). Đã chạy: lint 0, tsc sạch, unit 94 qua, build qua, e2e Chromium 94/95. So với design/landing-v3 ở 390 và 1440: bố cục, chữ, khoảng cách, hiệu ứng khớp; mọi nút đúng bảng đích; Xem quà là button + toast; không cuộn ngang 390/820/1440; không có phản hồi 4xx; Playfair nghiêng chỉ ở chữ nhấn (đúng chốt 19/11). Cần sửa:
(1) /personal-color: nút trỏ '/#booth' nay hỏng vì / là trang chủ mới (không còn #booth), e2e personal-color.spec.ts:18 đỏ. Đổi đích sang '/#ghe-vive' và sửa test.
(2) Hiệu năng /: Lighthouse 12.8 mobile trên next build + next start, đo 2 lần: Perf 75 và 74, LCP 7,1s và 7,7s (ngân sách docs/05 mục 2.3: LCP < 2,5s, Perf >= 80). Phần tử LCP là ống srm.webp (#bay), render delay 5,5–6,0s vì hiện muộn. Sửa: ống bay không được là phần tử lớn xuất hiện muộn (vẽ từ đầu, hoặc nhỏ hơn khối hero); ảnh mặt tiền khối 1 hiện ngay từ HTML server dạng một ảnh đầy khung (preload) rồi mới tách mảnh. Đính bảng Lighthouse vào PR #28.
(3) Điện thoại: link 'Xem ›' ở thanh khuyến mãi cao 18px; tăng vùng bấm >= 44px (padding, giữ cỡ chữ).
(4) Sau khi W051 sửa và merge, cập nhật nhánh để PR #28 chỉ còn phần W050.
Không chặn: nhóm logo lặp thứ hai trong hàng chạy nên có aria-hidden và tabindex=-1 để trình đọc màn hình không đọc 2 lần.
