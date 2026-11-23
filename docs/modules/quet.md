# Module: quet

## Mục đích
Trải nghiệm quẹt sản phẩm kiểu Tinder, danh mục, sản phẩm đã thích, New Arrival, màn chào và bắt đầu.

## Thư mục và file chính
- `components/deck/`: `TheSanPham.tsx` (thẻ), `BangChiTiet.tsx` (chi tiết khi chạm), `TheDealDacBiet.tsx`.
- `lib/goi-y/`: điểm và xếp deck (hàm thuần, có test `tests/goi-y.test.ts`). Đặc tả: `docs/02-ky-thuat.md` mục 5.
- Trang: `app/(khach)/quet`, `da-thich`, `danh-muc`, `new-arrival`, `bat-dau`, `chao`.
- Dữ liệu sản phẩm: `lib/data/` đọc từ `data/products.csv` (dùng chung).

## Quy ước riêng
- Song ngữ (W044): chữ hiện cho khách nằm ở `messages/<vi|en>/quet.json` (nhóm `nhan`, `the`, `chiTiet`, `dealThe`, `deck`, `daThich`, `danhMuc`, `batDau`, `chao`, `newArrival`). Nhãn loại da, vấn đề da, danh mục, ngân sách lấy theo mã qua `components/deck/ngon-ngu-quet.ts` (`taoNhan`); trường `*_en` của sản phẩm/deal qua `truongTheoNgonNgu`, thiếu thì bản vi. Trang client dùng `useDichQuet` / `useNhanQuet` (`components/deck/dung-dich.ts`). Giá: `tienKhongDon` (thẻ, lưới) và `tienCoDon` (có đơn vị).
- Mở chi tiết thì cuộn trong thẻ, khóa cuộn nền (`lib/khoa-cuon.ts`).
- Mô tả sản phẩm tạm lấy từ `lib/mo-ta-tam.ts` cho tới khi có mô tả thật (W047).

## Lịch sử ngắn
- 2026-11-20 W057: chạm thẻ mở chi tiết, khóa cuộn nền.
- 2026-11-21 W064: `/new-arrival` mở đầu bằng khối cuộn LOPOE như trang chủ; màu toàn site theo bảng nội thất (xem `_chung.md`).
- 2026-11-21 #62: các trang khám phá (`danh-muc`, `quet`, `da-thich`, `chao`, `bat-dau`, `components/deck`) đổi token cũ sang tên mới: `hong-nhat`→`kem`, `bac-ha`→`be`, `bac-ha-nhat`→`oliu-nhat`; `vien` giữ.
- 2026-11-21 #81 W044: song ngữ VI | EN cho `quet`, `da-thich`, `danh-muc`, `new-arrival` (metadata), `bat-dau`, `chao`, `components/deck`; test `tests/w044-quet-song-ngu.test.ts`, e2e `tests/e2e/w044-quet-en.spec.ts`.
- 2026-11-22 #104 LEG-003: bỏ "nội địa Hàn" / "Korean domestic" trong `messages/*/quet.json` (khóa `cuoi`, `moTaTrang`); test `tests/quet-leg003.test.ts`.
- 2026-11-23 #128 W069: `/quet` hiện ảnh thẻ đầu nhanh hơn: `app/(khach)/quet/tai-som.ts` tải sản phẩm/deal sớm và preload ảnh thẻ đầu (dùng đúng `xepDeck`), layout preconnect tới Supabase, thẻ trên cùng `fetchPriority=high`, ảnh thẻ kế tiếp chỉ preload sau khi ảnh đầu tải xong. Đo: `node scripts/do-lcp-quet.mjs <gốc-url> [số-lần]`; test `tests/quet-tai-anh.test.ts`, e2e `tests/e2e/quet-lcp.spec.ts`.
- 2026-11-23 #132: sản phẩm/deal chỉ gọi 1 lần mỗi loại (`lib/supabase/du-lieu.ts` dùng chung promise đang chạy; xóa cache thì request cũ không ghi đè). `DuLieuProvider` không gọi Server Action `actionLayDuLieuKhachDev` ở khách khi chạy production (vẫn gọi ở `/quan-tri` và ở dev/e2e). `/bat-dau` gọi `taiSomChoQuet()` khi nộp hoặc bỏ qua khảo sát. Đo luồng: `node scripts/do-lcp-quet.mjs <gốc-url> 5 luong`; test `tests/du-lieu-context.test.ts`.
