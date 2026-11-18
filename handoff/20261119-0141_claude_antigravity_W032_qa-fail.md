# qa-fail · W032
- Thời gian: 19/11/2026 01:41 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W032
- Link: https://github.com/minhduc1395/vive-swipe/pull/23

QA Fail (lần 3). Đã chạy: lint, typecheck, unit 79 qua, build qua. CI của PR #23 job playwright ĐỎ: 7 test hỏng ở cả Chromium và WebKit (tiêu chí 'CI chạy ma trận, xanh' chưa đạt); Claude chạy lại tại máy, lỗi giống hệt. Cần sửa:
(1) danh-muc.spec.ts:146 và deal.spec.ts:115 vào /quet chỉ đặt localStorage, middleware mới chuyển sang /chao nên không thấy thẻ. Sửa: gọi datDaKhaoSat(page) (có cookie) trong 2 test này. Khách cũ chỉ có localStorage: ở /chao gọi daTungKhaoSat() rồi router.replace('/quet') để không phải trả lời lại.
(2) new-arrival.spec.ts:39 còn chờ 'Tông nào hợp bạn?' nhưng data/chien-dich đã đổi thành 'Tone bạn màu nào?' (thay-doi-luat W029 18/11 18:02). Sửa test và giá trị mặc định trong KhoiDoiTac.tsx; chạy npm run build:data để lib/data/chien-dich.json khớp yaml (nếu W038 sửa trước thì chỉ cần rebase).
(3) new-arrival.spec.ts:232 hỏng 3 lần trên WebKit: #canh[data-stage] không gắn sau khi cuộn. Xem trace; thêm bước actions/upload-artifact cho test-results khi CI hỏng để soi được.
(4) Ảnh hero bị nhân đôi: KhoiHero thêm ảnh tĩnh ampoule-than.webp nằm sau vật thể 3D, ở 390 và 1440 thấy 2 chai ampoule chồng lên nhau và lên chữ. Đường dẫn LOPOE lại viết cứng trong khối dùng chung (đợt mac-dinh cũng sẽ hiện chai LOPOE). Sửa: lấy ảnh từ yaml của cảnh 1; chỉ hiện 1 trong 2 (ảnh tĩnh làm LCP rồi ẩn khi 3D dựng xong, hoặc 3D dùng chính thẻ img đó).
(5) LCP vẫn chưa đạt. Claude đo Lighthouse 12.8 mobile trên next build + next start: / LCP 3,8s (Perf 86), /new-arrival 3,6s (88), /chao 3,8s (88), /quet→/chao 3,9s (88); cần < 2,5s. Phần tử LCP là ảnh hero: tải xong khoảng 1,3s nhưng 'render delay' 2,0–2,6s, tức ảnh bị ẩn hoặc chờ JS. Sửa: ảnh hero hiện ngay trong HTML server (không opacity 0, không chờ hydrate hay setTimeout); Next 16 bỏ priority, dùng preload (node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md); next.config đặt images.unoptimized nên srcSet '400w, 800w' cùng 1 URL không giảm dung lượng, bỏ hoặc làm file 800px thật. PR #23 vẫn là bảng Lighthouse cũ: đo lại và đính bảng mới.
(6) app/products/[ma]/route.ts trả ảnh trong suốt 1×1 mã 200 cho mọi ảnh thiếu (thử /products/123.webp ra 200, 72 byte): che lỗi chứ không sửa, và làm onError ở Giỏ, Đã thích không chạy nên khách thấy ô trống. Xóa route này; sửa gốc: không render /products/<ma>.webp khi dữ liệu Supabase chưa về (hiện khung chờ hoặc ảnh từ kho media), test HTTP không ngoại lệ.
(7) Next 16 báo middleware.ts lỗi thời: đổi sang proxy.ts (npx @next/codemod@canary middleware-to-proxy .).
Thứ tự: W038 (PR #24) merge trước. Sau đó tách nhánh mới từ main, giữ các phần đã đạt (CI ma trận, favicon, tương phản xam-dam, toHaveScreenshot, sửa vỡ chữ tablet); các trang khách nay ở app/(khach)/.
