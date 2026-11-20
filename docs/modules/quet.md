# Module: quet

## Mục đích
Trải nghiệm quẹt sản phẩm kiểu Tinder, danh mục, sản phẩm đã thích, New Arrival, màn chào và bắt đầu.

## Thư mục và file chính
- `components/deck/`: `TheSanPham.tsx` (thẻ), `BangChiTiet.tsx` (chi tiết khi chạm), `TheDealDacBiet.tsx`.
- `lib/goi-y/`: điểm và xếp deck (hàm thuần, có test `tests/goi-y.test.ts`). Đặc tả: `docs/02-ky-thuat.md` mục 5.
- Trang: `app/(khach)/quet`, `da-thich`, `danh-muc`, `new-arrival`, `bat-dau`, `chao`.
- Dữ liệu sản phẩm: `lib/data/` đọc từ `data/products.csv` (dùng chung).

## Quy ước riêng
- Mở chi tiết thì cuộn trong thẻ, khóa cuộn nền (`lib/khoa-cuon.ts`).
- Mô tả sản phẩm tạm lấy từ `lib/mo-ta-tam.ts` cho tới khi có mô tả thật (W047).

## Lịch sử ngắn
- 2026-11-20 W057: chạm thẻ mở chi tiết, khóa cuộn nền.
