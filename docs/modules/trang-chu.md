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
- 2026-11-22 W072 phần A (#126): đoạn 4 hoạt chất ampoule kiểu bọt nước sau công tắc `bot_nuoc.bat` trong `data/thu-nghiem/lopoe-3d.yaml` hoặc `?bot-nuoc=1` (tắt thì giữ như cũ). Bọt là HTML (`LopBotNuoc`, `[data-bot]`), ảnh `public/thanh-phan/bot-nuoc-*.webp`, chữ từ `thanh_phan.ampoule`, 2 nút lấy từ khối `ket`. Đoạn nới 0,53–0,68; cảnh 3D và ảnh khung giữ mốc gốc, đổi qua `pCanh`/`pTuCanh` (`phat-khung.ts`); điện thoại bật bọt nước thì ảnh khung đứng ở 0,53 suốt đoạn (ảnh khung còn hạt + đường kẻ cũ). e2e `tests/e2e/w072-bot-nuoc.spec.ts`.
- 2026-11-23 W072 phần B (#127): bật bọt nước thì chai đi theo cuộn (máy tính: `KHOA_AMP_BOT_NUOC`/`tuTheAmp` trong `canh.ts`, giữa → 29% bề rộng, thu 70%, không xoay; điện thoại: khung đứng 0,53 vẽ ghép nền lật + chai tách nền, dời vào giữa dưới 2 nút, `chaiDienThoai`, `CHAI_KHUNG` đo trên khung 426). Bọt bay từ miệng chai (`duongBay`, `NHIP_BOT` trong `phat-khung.ts`), nảy 1 lần, đứng đúng chỗ phần A. Hộp chai ghi ra `window.__chaiBotNuoc` cho e2e. Đổi ảnh khung thì đo lại `CHAI_KHUNG`.
- 2026-11-26 W073 phần A (#150): chai ampoule 3D GLB trên máy tính sau công tắc `glb.bat` trong `data/thu-nghiem/lopoe-3d.yaml` hoặc `?glb=1` (tắt thì không tải gì thêm). `components/cuon-3d/glb.ts` (import động) nạp GLB + Draco (`public/lopoe-3d-glb/`), gom `collar`+`bulb`+`pipette` (hoặc node `Dropper` bản v3) thành nắp, chia tỷ lệ theo chiều cao chai ảnh cũ. Chỉ nạp khi khách đã cuộn và khối cách ≤ 1 màn (`canh.napGlb()`); chờ/lỗi thì giữ ảnh phẳng. Nhấc nắp GLB: chai thu nhỏ + hạ để nắp trọn khung. `glb.srm`/`glb.kem` khác null thì thay ảnh tuýp. Điện thoại vẫn chuỗi ảnh khung. e2e đọc `window.__lopoeGlb`, `__lopoeGlbNap`, `__lopoeGlbKhung` (`tests/e2e/w073-lopoe-glb.spec.ts`).
- 2026-11-26 W073 phần B (#152): điện thoại bật GLB dùng chuỗi khung MỚI `public/thu-nghiem/lopoe-khung-glb/` (799 khung 780×1688, cùng bảng p; yaml `glb.khung_dien_thoai`), chụp từ cảnh 3D có GLB bằng `scripts/chup-khung-glb.mjs` (`?glb=1&ba-chieu=1&chup=1`). Không chạy 3D trực tiếp: Pixel 7 CPU x4 chỉ 5–13 fps. `nhan.json` mới có thêm `chai` (hộp mô hình, miệng, giọt mỗi khung) cho e2e. Bọt nước + GLB dùng `CHAI_KHUNG_GLB`. `?fps=1` hiện số khung/giây (`window.__lopoeFps`). Đổi GLB thì chụp lại chuỗi này.
- 2026-11-26 #154 (W073 sửa QA fail): GLB nạp xong thì gỡ hẳn ảnh phẳng ampoule bằng `removeFromParent()` và gỡ nhóm nắp ảnh cũ (ảnh nắp nằm trong nhóm `nap`, `ampG.remove` không gỡ được). Cảnh ghi `window.__lopoeAnhAmpConLai` (số mesh ảnh phẳng ampoule còn trong cảnh, phải = 0); `scripts/chup-khung-glb.mjs` dừng nếu khác 0. e2e `tests/e2e/w073c-glb-go-nap-cu.spec.ts` (GLB nạp lúc đóng và lúc đang nhấc). Chuỗi `lopoe-khung-glb/` chụp lại.

## Việc đang mở (không giao job trùng)
- DIR-037: điện thoại còn giật 1–2 giây sau khi thả tay ở khối 3D (WEB đang xem).
- 2026-11-21 W064: bật chuỗi ảnh LOPOE trên điện thoại ở trang chủ (CĐT giữ cách này). Landing `/new-arrival` dùng `CuonLopoe3D` khi chiến dịch có `cuon_3d: lopoe`; khối "Đủ bộ, đỡ tốn." chạy kiểu phẳng (`phang`).
