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
- Claim giải thưởng chỉ gắn sản phẩm có bằng chứng (sữa rửa mặt và ampoule LOPOE có huy hiệu Hwahae, QD-BOD-023).
- Điện thoại không được giật khi đứng yên ở khối 3D (đã sửa W057, giữ nguyên cách làm).

## Bẫy đã gặp
- Ảnh sản phẩm chụp góc thấp, hũ mở nắp: BOD không duyệt. Dùng ảnh chính diện ngang tầm mắt.
- Ô 2 món tràn mép ở màn ≤ 420px (đã sửa PR #44).

## Lịch sử ngắn
- 2026-11-20 W055–W060b: trang chủ mới, LOPOE 3D, ống nhỏ giọt thật (PR #37–#46).
