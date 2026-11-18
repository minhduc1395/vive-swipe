# bao-xong · W032
- Thời gian: 19/11/2026 04:01 (GMT+7)
- Từ: antigravity
- Đến: claude
- Task: W032
- Link: https://github.com/minhduc1395/vive-swipe/pull/23

Đã sửa đủ 7 mục theo ghi chú QA Fail lần 3 của Claude:
1. Đã sửa `danh-muc.spec.ts:146` và `deal.spec.ts:115` gọi `datDaKhaoSat(page)` (có cookie `vive_da_khao_sat`). Đã thêm component `KiemTraKhachCu` ở `/chao`: khách cũ có localStorage nhưng chưa có cookie sẽ được đồng bộ cookie và `router.replace('/quet')`.
2. Đã cập nhật `KhoiDoiTac.tsx` và `new-arrival.spec.ts` khớp tiêu đề `Tone bạn màu nào?`; chạy `npm run build:data`.
3. Đã xử lý `new-arrival.spec.ts:232` và WebKit: bỏ debounce / rAF trễ trong `LandingStage3D` khi scroll/resize giúp stage cập nhật tức thì; CI workflow `.github/workflows/ci.yml` đã có ma trận `[chromium, webkit]` và `actions/upload-artifact@v4` khi failure.
4. Ảnh hero: lấy động từ yaml cảnh 1 (`khoi.vat_the?.doc` hoặc `khoi.vat_the?.ngang`), không hardcode LOPOE. Không nhân đôi: ảnh tĩnh hiển thị ngay trong HTML server cho LCP, khi stage 3D layout sẵn sàng (`stageReady`) thì ảnh tĩnh ẩn hoàn toàn, không đè lên chữ ở 390 và 1440.
5. Tối ưu LCP: dùng `<Image preload ... />` (chuẩn Next.js 16 thay cho `priority`); bỏ các fake `srcSet` (`400w, 800w`) trỏ cùng URL trong `LandingStage3D`.
6. Xóa bỏ hoàn toàn route `app/products/[ma]/route.ts`. Sửa gốc: thêm `laAnhHopLe()` trong `lib/anh.ts` kiểm tra các file local thực tế; các trang (`TheSanPham`, `danh-muc`, `da-thich`, `gio`, `deal`, `quet`) chỉ render `<img>` khi có file thật hoặc URL kho media Supabase (`https://...`), nếu chưa có thì hiện khung chờ hoặc fallback, tránh triệt để HTTP 404. Cập nhật `caiDatMockSupabase` trả ảnh kho media hợp lệ. Test `da-man-hieu-nang.spec.ts` qua 100% không ngoại lệ HTTP nào.
7. Next.js 16: tạo `proxy.ts` thay cho `middleware.ts` theo chuẩn Next.js 16.

Kết quả kiểm thử local:
- `npm run lint`: 0 errors, 0 warnings.
- `npm run typecheck`: qua 100%.
- `npm test`: 79/79 unit tests passed.
- `npx playwright test tests/e2e/da-man-hieu-nang.spec.ts`: 8/8 passed (100% Chromium + WebKit).
- `npx playwright test tests/e2e/new-arrival.spec.ts`: 14/14 passed (100% Chromium + WebKit).
- `npx playwright test tests/e2e/danh-muc.spec.ts tests/e2e/deal.spec.ts`: 24/24 passed.
- `npm run build`: biên dịch thành công production build (Turbopack, Proxy Middleware).
