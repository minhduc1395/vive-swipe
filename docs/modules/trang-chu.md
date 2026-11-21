# Module: trang-chu

## Mục đích
Trang chủ và landing: khối mở đầu, khối LOPOE cuộn 3D, lưới combo và ô thương hiệu, dải thông báo chiến dịch.

## Thư mục và file chính
- `components/trang-chu/TrangChuClient.tsx`, `trang-chu.css`: trang chủ.
- `components/landing/` (LandingClient, Header, Footer, Stage3D, `khoi/`): các khối landing.
- `components/cuon-3d/CuonLopoe3D.tsx`, `canh.ts`: khối LOPOE 3D (three.js).
- `lib/trang-chu/`: đọc và kiểm dữ liệu trang chủ (schema zod).
- Dữ liệu: `data/chien-dich/trang-chu.yaml` (dùng chung, chỉ đọc).

## Quy ước riêng
- Nền theo màu cửa hàng Option 2; nút, chip, logo giữ màu thương hiệu (docs/03).
- Claim giải thưởng chỉ gắn sản phẩm có bằng chứng: hiện chỉ ampoule LOPOE có huy hiệu Hwahae Awards 2025 (WEB-001); sữa rửa mặt chưa có bằng chứng nên không ghi giải.
- Điện thoại không được giật khi đứng yên ở khối 3D (đã sửa W057, giữ nguyên cách làm).

## Bẫy đã gặp
- Ảnh sản phẩm chụp góc thấp, hũ mở nắp: BOD không duyệt. Dùng ảnh chính diện ngang tầm mắt.
- Ô 2 món tràn mép ở màn ≤ 420px (đã sửa PR #44).

## Lịch sử ngắn
- 2026-11-20 W055–W062: trang chủ mới, LOPOE 3D (ảnh thật, ống nhỏ giọt và cổ chai cắt từ ảnh, giọt sprite), ảnh combo cắt lại, dải thông báo theo 3 ưu đãi (PR #37–#50).
- 2026-11-21 DIR-040 (#74): ô lớn lưới hiện `phu_de_truoc` (+ `phu_de_them` dòng 2) thay dòng nhãn·giá và dòng quà; giá, quà chỉ còn ở hàng trượt. Tên thẻ trượt: Glow Vitamin C, Keo Ong Dưỡng Ẩm.
- 2026-11-21 W044 (#80): song ngữ VI | EN. Chữ cố định ở `messages/{vi,en}/trang-chu.json`; chữ trong yaml có trường `<tên>_en` cạnh bản vi (schema trong `lib/trang-chu`, `lib/chien-dich`, `lib/thu-nghiem`), client chọn bằng `chonBanNgonNgu(cfg, locale)` (`lib/trang-chu/ngon-ngu.ts`). Chữ deal (tên, hook, quà) đọc `*_en` qua `chuTheoNgonNgu` nhưng schema deal dùng chung chưa có trường này nên landing còn hiện bản vi. Thêm chữ mới: không gõ cứng, test `tests/trang-chu-song-ngu.test.ts` quét.

## Việc đang mở (không giao job trùng)
- DIR-037: điện thoại còn giật 1–2 giây sau khi thả tay ở khối 3D (WEB đang xem).
- 2026-11-21 W064: bật chuỗi ảnh LOPOE trên điện thoại ở trang chủ (CĐT giữ cách này). Landing `/new-arrival` dùng `CuonLopoe3D` khi chiến dịch có `cuon_3d: lopoe`; khối "Đủ bộ, đỡ tốn." chạy kiểu phẳng (`phang`).
