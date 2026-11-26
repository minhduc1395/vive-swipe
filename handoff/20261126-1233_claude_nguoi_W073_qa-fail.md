# qa-fail · W073
- Thời gian: 26/11/2026 12:33 (GMT+7)
- Từ: claude
- Đến: nguoi
- Task: W073
- Link: https://github.com/minhduc1395/vive-swipe/pull/153

W073 (QD-BOD-085, đoạn LOPOE chai ampoule GLB): QA ĐỘC LẬP trên main b34825e (đã gộp PR #151 + #153) = KHÔNG ĐẠT. QA: Fail, Trạng thái: Doing. KHÔNG bật glb.bat và chưa nên mời BOD xem /?glb=1 cho tới khi sửa xong lỗi 1. Web thật không bị ảnh hưởng (công tắc đang TẮT, không đổi giá/deal).

Gửi: khung chat WEB (Lead) mở job sửa cho đội coder theo QD-BOD-061 (Antigravity không làm W073). Sửa xong đặt lại Review, QA lượt kế tiếp kiểm lại.

## Lỗi 1 (chặn bật công tắc): ảnh nắp phẳng cũ vẫn còn trong cảnh khi đã nạp GLB
- Thấy gì: `/?glb=1` máy tính 1440×900 và điện thoại 390×844.
  - Chai đóng: 2 nắp chồng nhau. Bầu kem + vòng cổ nắp xanh bạc hà của ảnh cũ (`ampoule_nap`) ló ra sau nắp GLB.
  - Nhấc nắp (p 0,4865): nắp GLB đi lên, còn nắp ảnh cũ ở lại trên miệng chai. Giọt rơi xuống nắp cũ, không thấy miệng chai hở. Nếu GLB nạp xong khi đang nhấc dở thì nắp cũ treo lơ lửng giữa chừng (chính ảnh PR #151 `media/w073/glb-2-nhac-nap-giot.jpg` có 2 bộ nắp: trắng của GLB + kem/xanh của ảnh cũ).
  - Điện thoại: chuỗi 799 khung `public/thu-nghiem/lopoe-khung-glb/` chụp từ cảnh lỗi này, nên khi bật GLB, điện thoại cũng thấy nắp cũ ở lại trên chai (ảnh PR #153 `media/w073/w073b-dt-2-nhac-nap-giot.jpg`).
- Nguyên nhân: `components/cuon-3d/canh.ts` dòng 272 `for (const a of anhAmp) { ampG.remove(a); ... }`. `anhNap` không phải con trực tiếp của `ampG`: nó nằm trong nhóm `nap` (`nap.add(anhNap); ampG.add(nap)`). Vì vậy `ampG.remove(anhNap)` không gỡ được gì. Gọi `dispose()` geometry/material cũng không gỡ mesh khỏi cảnh, vì three.js nạp lại ở lần vẽ sau. Sau đó `NAP.nhom = c.nap`, nên nhóm `nap` cũ đứng yên ở tư thế lúc GLB vừa nạp xong.
- Cách sửa:
  1. Thay `ampG.remove(a)` bằng `a.removeFromParent()`, hoặc gỡ luôn cả nhóm nắp ảnh cũ. QA đã thử sửa đúng 1 dòng này trên máy QA (không commit): chai đóng chỉ còn nắp GLB, nhấc nắp thì lộ miệng chai và giọt rơi vào miệng.
  2. Chụp lại chuỗi khung điện thoại bằng `node scripts/chup-khung-glb.mjs` (kèm `nhan.json`, giữ số khung, cỡ ảnh, bảng p). Chụp lại ảnh và video `media/w073/`.
  3. Thêm e2e bắt lỗi này. e2e hiện chỉ kiểm tên mesh trong nhóm nắp (`__lopoeGlbNap`) nên vẫn qua. Ví dụ: ghi ra `window` số mesh ảnh phẳng của ampoule còn trong cảnh sau khi GLB nạp, kỳ vọng 0. Kiểm cả 2 trường hợp: GLB nạp lúc chai đóng và lúc đang nhấc nắp.

## Ghi chú cho DES-018 / GD-002 v3 (không phải lỗi code, chưa chắc chắn vì máy QA không có GPU)
Máy QA vẽ bằng phần mềm (SwiftShader), nên màu và độ trong có thể khác máy thật. BOD/WEB/DES cần xem trên laptop và điện thoại thật.
- Nắp GLB (bulb màu kem, collar xanh có transmission) hiện gần trắng. Ảnh thật là bầu kem và cổ nắp xanh bạc hà trong.
- Thân chai hiện xanh đậm, đục. Ảnh thật là thủy tinh trong, dịch xanh nhạt; cạnh 2 tuýp ảnh, chai lệch màu rõ (tiêu chí mục 4 của task).
- Nhãn: ở góc nhìn chính diện, chữ "LOPOE" bị cắt mép phải thành "LOPOI" (ảnh cuối đoạn). Chữ nhỏ trên nhãn bị răng cưa.
- Máy tính, cuộn cả khối trên máy QA không GPU: tắt 15 fps, bật `?glb=1` 2,3 fps. Số này chỉ để so sánh; trước khi bật phải đo trên laptop thật (WEB đã ghi điều này).

## Đã đạt (kiểm trên main b34825e)
- `npm ci`, lint, typecheck, test (57 file, 410 qua, 1 bỏ qua), build: qua.
- e2e Chromium dự án pixel-7 cho các spec liên quan (w073, w073b ×2, w054, w072, trang-chu, new-arrival, w069-hieu-nang): 39 qua, 1 bỏ qua (đo fps CPU x4). Dự án iphone-13 (WebKit) không chạy được trên máy QA vì không có WebKit, nên dựa vào CI.
- Bản build production (`next start`):
  - Công tắc mặc định TẮT. Không `?glb`: cuộn hết khối, 0 request tới `/lopoe-3d-glb/`, cả máy tính và điện thoại. Điện thoại dùng chuỗi khung cũ (800 request), 0 request chuỗi GLB.
  - `?glb=1`: 0 request GLB trước khi cuộn (nạp lười đúng). Sau khi cuộn tải thêm GLB 110 KB + Draco wasm 192 KB + wrapper 59 KB + chunk GLTFLoader/DRACOLoader 53 KB, tổng ≈ 0,41 MB, dưới mức 1 MB.
  - Điện thoại bật GLB dùng chuỗi mới (800 request `lopoe-khung-glb`), 0 request chuỗi cũ.
- Phạm vi: `data/` chỉ thêm khối `glb` trong `data/thu-nghiem/lopoe-3d.yaml`. Không đổi `deals.yaml`, `products.csv`, `supabase/`, `package.json`, `messages/`, font hay màu. Không đổi giá, deal hay chữ hiển thị.
- Lỗi React #418 (hydrate) thấy trên trang chủ bản build của máy QA là do máy QA build không có biến môi trường `NEXT_PUBLIC_*`. Build lại có biến môi trường thì hết, bản trước W073 cũng vậy. Đây không phải lỗi web.

## Việc cần BOD
Chưa có việc cần BOD quyết. Sau khi sửa lỗi 1 và QA đạt, BOD xem `/?glb=1` trên laptop và điện thoại thật (DIR 10:42: chỉ bật glb.bat khi BOD đã xem).
