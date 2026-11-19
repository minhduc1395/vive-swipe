# qa-pass · W050
- Thời gian: 19/11/2026 17:52 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W050
- Link: https://github.com/minhduc1395/vive-swipe/pull/28

QA Pass, đã merge PR #28. Đạt cả 4 mục sửa 12:53: (1) /personal-color trỏ /#ghe-vive, personal-color.spec qua; (2) Lighthouse 12.8 mobile trên next build + next start, nhánh trước khi ghép: Perf 95/82/96, LCP 2,3s cả 3 lượt, phần tử LCP img.anh-mat-tien-goc; (3) Xem › ở thanh khuyến mãi cao >= 44px (e2e); (4) Claude merge main (W051 + W049 vừa merge) vào nhánh, giải xung đột: tasks/W050.md giữ bản main, lib/data/chien-dich.json chạy lại build:data, components/ChanTrang.tsx dùng chân trang W049 nhưng giữ cách đọc thẳng lib/data/doanh-nghiep.json và logo vive-logo-chu.webp (54x26, lazy) của W050 để trang chủ không kéo zod. Sau khi ghép: lint 0, tsc sạch, unit 97 qua, build qua, e2e Chromium 100/100, Lighthouse / Perf 95–96, LCP 2,3–2,4s, CLS 0, A11y 96 (chỉ còn color-contrast ở chân trang, đã dồn sang W052); JS đầu khoảng 150KB nén, supabase-js 62KB tải sau LCP. So với design/landing-v3 ở 390/820/1440: bố cục, chữ, hiệu ứng khớp; khối 5 và 6 hiện đúng; không cuộn ngang; nhóm logo lặp có aria-hidden và tabIndex -1. Còn [chờ ảnh] (chủ dự án cung cấp): ảnh mặt tiền thật (ảnh khái niệm hiện có biển hiệu hãng khác như LANEIGE, COSRX), logo 12 thương hiệu, ảnh Uniura. Việc tiếp theo của Antigravity: W052 (gồm mục dồn từ QA), W040, W042, W039.
