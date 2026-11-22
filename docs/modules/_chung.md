# Điều mọi coder cần biết (đọc kèm gói module)

- Next.js 16 có thay đổi lớn so với kiến thức cũ: trước khi viết code đọc hướng dẫn trong `node_modules/next/dist/docs/` cho phần mình đụng tới.
- Lệnh: `npm ci` (khoảng 20 giây), `npm run lint`, `npm run typecheck`, `npm test` (vitest, khoảng 5 giây), `npm run e2e` khi job có giao diện (Playwright, project pixel-7 và iphone-13). Không cần khóa Supabase: ở môi trường không phải production, app dùng kho tạm.
- CI trên GitHub chạy lint, typecheck, test, e2e cho mọi PR. PR phải xanh.
- Giao diện: mobile-first, không khóa độ rộng, dùng dvh, nút ≥ 44px, chỉ animate transform/opacity (docs/05 mục 2.2). Bám `design/` cho màn tương ứng. Màu cửa hàng Option 2 (QD-WEB-005) ở `docs/03`.
- Màu (W064, CĐT 21/11): mọi trang theo trang chủ. Nền trang trắng (`bg-trang`); mảng màu, thẻ, ô dùng bảng nội thất `kem`, `be`, `cat`, `soi`, `oliu`, `oliu-vua`, `oliu-nhat` (token trong `app/globals.css`). Hồng (`hong`) chỉ là màu nhấn: nút chính, chip đang chọn, nhãn giảm giá. Không dùng nền hồng nhạt cho cả trang. Nền khối LOPOE là `lopoe-nen` (không đổi, ảnh đã chụp trên nền này). Token cũ `hong-nhat`, `bac-ha`, `bac-ha-nhat`, `vien` đã đổi mã sang nội thất; code mới dùng tên mới. Không gõ mã #hex trong `app/(khach)` và `components/` (test w052 chặn).
- Chữ giao diện tiếng Việt, "nội địa Hàn" (không "local"), không nhắc cửa hàng chính. Logo chỉ dùng file trong `public/brand/`.
- Giá, deal, quà chỉ lấy từ `data/` (file dùng chung, WEB sửa). Không gõ số trên giao diện. Giá trong giỏ luôn tính lại ở server.
- Không commit khóa bí mật, không in biến môi trường ra log.
- Không thêm thư viện. Cần thư viện thì comment BLOCKED.

## Song ngữ VI | EN (W044, từ 22/11)
- Chữ hiện cho khách KHÔNG gõ cứng trong JSX: đặt trong `messages/vi/<module>.json` và `messages/en/<module>.json` (khóa gốc = tên module: `trang-chu`, `quet`, `deal`, `giu-hang`, `tai-khoan`; chữ dùng chung thanh trên/chân trang ở `chung`, chỉ WEB sửa).
- Client component: `const t = useTranslations("quet.danhMuc")`. Server component: `const t = await getTranslations("quet.danhMuc")` (`next-intl/server`). Ngôn ngữ hiện tại: `useLocale()` / `getLocale()`.
- Giá: `dinhDangGia(soTien, ngonNgu)`; ngày: `dinhDangNgayNgan(ngay, ngonNgu)` trong `lib/dinh-dang.ts`.
- Dữ liệu sản phẩm/deal/chiến dịch: tiếng Anh dùng trường `*_en` (`ten_en`, `mo_ta_en`, `dieu_kien_en`…), thiếu thì hiện bản vi.
- Mỗi khóa phải có ở cả vi và en (test `tests/w044-tu-dien.test.ts`). Bản en: câu ngắn, tự nhiên, không dịch tên thương hiệu/sản phẩm.
- Kiểm: mở trang với `?lang=en` (đặt cookie `vive_lang`), nút VI | EN trên thanh trên.

- Lịch sử ngắn: #131 (22/11) `app/icon.png` thu còn 192px, 2,9 KB (trước 512px, 34 KB); font giữ 4 độ đậm vì cả 4 đều dùng, Be Vietnam Pro và Playfair đều `preload: false`.
