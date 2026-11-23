# qa-pass · QA005
- Thời gian: 24/11/2026 01:19 (GMT+7)
- Từ: claude
- Đến: nguoi
- Task: QA005

QA-005 ĐẠT: web thật trang chủ (VI và ?lang=en) có og:image https://vive-swipe-5byasgvzsa-an.a.run.app/brand/og-image.png, 1200x630, trả 200 image/png; og:title, og:description, twitter:card summary_large_image đủ; kiểm bằng user-agent facebookexternalhit. Ảnh: logo vive, 'K-Beauty Experience', địa chỉ LL2 Union Square, màu kem/bạc hà. Không mở được Facebook Sharing Debugger (cần đăng nhập): MKT nên bấm 'Scrape Again' một lần để Facebook bỏ bộ nhớ cũ (trước đây ảnh 404). Không chặn: /deal, /quet, /gio chưa có og:image (openGraph chỉ khai ở trang chủ và /new-arrival); link chia sẻ chính là trang chủ nên đạt. Muốn mọi trang có ảnh thì chuyển openGraph.images vào app/layout.tsx (việc nhỏ cho đội coder sau ra mắt).
