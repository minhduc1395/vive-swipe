# Điều mọi coder cần biết (đọc kèm gói module)

- Next.js 16 có thay đổi lớn so với kiến thức cũ: trước khi viết code đọc hướng dẫn trong `node_modules/next/dist/docs/` cho phần mình đụng tới.
- Lệnh: `npm ci` (khoảng 20 giây), `npm run lint`, `npm run typecheck`, `npm test` (vitest, khoảng 5 giây), `npm run e2e` khi job có giao diện (Playwright, project pixel-7 và iphone-13). Không cần khóa Supabase: ở môi trường không phải production, app dùng kho tạm.
- CI trên GitHub chạy lint, typecheck, test, e2e cho mọi PR. PR phải xanh.
- Giao diện: mobile-first, không khóa độ rộng, dùng dvh, nút ≥ 44px, chỉ animate transform/opacity (docs/05 mục 2.2). Bám `design/` cho màn tương ứng. Màu cửa hàng Option 2 (QD-WEB-005) ở `docs/03`.
- Chữ giao diện tiếng Việt, "nội địa Hàn" (không "local"), không nhắc cửa hàng chính. Logo chỉ dùng file trong `public/brand/`.
- Giá, deal, quà chỉ lấy từ `data/` (file dùng chung, WEB sửa). Không gõ số trên giao diện. Giá trong giỏ luôn tính lại ở server.
- Không commit khóa bí mật, không in biến môi trường ra log.
- Không thêm thư viện. Cần thư viện thì comment BLOCKED.
