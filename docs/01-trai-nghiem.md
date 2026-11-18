# VIVE Quẹt: trải nghiệm và giao diện

Phiên bản 1.0 · 15/11/2026. Thiết kế cho điện thoại trước (rộng 360–430px). Trên máy tính hiện một cột rộng tối đa 480px ở giữa.
Quy tắc chữ, màu, font: `docs/03-thuong-hieu-va-noi-dung.md`.
**Bản thiết kế (15/11/2026):** canvas https://claude.ai/artifact/RM3NbvY1uZ4pFibYCk1AxG, mã nguồn từng màn trong `design/` (xem `design/README.md`). Khi thiết kế và tài liệu này lệch nhau về chữ hoặc luật, theo tài liệu này; về bố cục và hình thức, theo thiết kế.

## 1. Hai luồng chính

**Tại booth:** khách quét QR trên bàn → quẹt vài phút → giữ hàng → đưa mã cho nhân viên → nhân viên soạn hàng, tính tiền trên POS.
**Ngoài booth:** khách bấm link ở bio Instagram, TikTok, Facebook hoặc quảng cáo → quẹt → giữ hàng → đến booth trong hạn giữ.

```
Màn chào → 3 câu hỏi (bỏ qua được) → Deck quẹt ⇄ Chi tiết sản phẩm
                                          ↓
                    Đã thích · Deal cho bạn · Giỏ → Giữ hàng → Mã giữ hàng (+ email xác nhận)
                                                                     ↓
                                                Nhân viên tra mã → Đã soạn → Đã lấy
```

## 2. Màn hình

### 2.0 Landing page và cỡ màn hình (thêm 18/11, thiết kế hàng 4 của canvas)
- **`/` là landing page chiến dịch** (chốt lại 18/11): giới thiệu sản phẩm mới và chương trình của từng đợt, **không nói về quẹt** (quẹt vẫn ở `/quet` và trong menu). Thiết kế mẫu: design/LandingPC.dc.html (đợt LOPOE Better Balance), các loại khối: design/LandingKhoi.dc.html.
- **Đổi theo đợt không sửa code:** mỗi đợt là một file `data/chien-dich/<ma>.yaml` (mục 2.0b). Trang chọn đợt đang trong thời gian chạy, ưu tiên cao nhất; không có đợt nào thì dùng đợt mặc định.
- **Ấn tượng nhưng nhẹ:** hiệu ứng 3D bản đầu làm bằng CSS 3D và chuyển động theo cuộn/chuột trên ảnh tách nền (WebP trong suốt); mô hình 3D thật (`.glb`) và video chỉ tải khi đợt có, tải lười, có ảnh dự phòng; tôn trọng "giảm chuyển động" của máy; trên điện thoại tắt nghiêng theo chuột, giữ trôi nhẹ.
- **Màu:** landing sáng, tươi (nền hồng nhạt, trắng, bạc hà nhạt); đen chỉ dùng cho chữ và nút chính, không làm nền khối lớn (chủ dự án 18/11).
- **Hiệu ứng khi cuộn** (design/HieuUngCuon.dc.html), gắn với vị trí cuộn, cuộn lên thì chạy lùi:
  1. Đầu trang: sản phẩm trôi, nghiêng theo chuột (máy tính).
  2. Cuộn xuống: chữ lớn trượt lên mờ dần; 3 sản phẩm xoay và rơi vào kệ khối ra-mat; thẻ combo nghiêng dần về thẳng.
  3. Khối chuong-trinh: nền chuyển trắng → bạc hà nhạt, ô to hiện trước, ô nhỏ trượt lên lần lượt.
  4. Khối doi-tac: quạt màu xòe theo lượt cuộn; khối booth: chữ LL2 phóng to dần.
  Cách làm: CSS `animation-timeline: view()/scroll()` khi trình duyệt hỗ trợ, còn lại dùng Framer Motion `useScroll` + `useTransform` (đã có trong dự án). Chỉ animate `transform`, `opacity`, `background-color`; không cuộn giả (scroll-jacking), không khóa cuộn; tắt khi máy bật giảm chuyển động. Mỗi khối khai báo hiệu ứng trong cấu hình đợt (`hieu_ung: roi-vao-ke | hien-lan-luot | xoe | phong-to | khong`).
- **Đường dẫn và thanh trên (chủ dự án 18/11):** landing chiến dịch ở `/new-arrival` (không còn ở `/`; `/` là Home = màn chào). Thanh trên: logo chữ "vive" không có dòng UNIVERSE (`public/brand/vive-logo-chu.png`) và một hàng mục: New Arrival `/new-arrival` (chính là landing, đang mở thì tô nền trắng), Home `/`, Quẹt `/quet`, Sản phẩm `/danh-muc`, Giỏ `/gio`, Đăng nhập `/dang-nhap` (nút đen). Điện thoại: logo, mục đang mở và nút Đăng nhập; các trang khác vẫn dùng thanh tab dưới, có thêm lối vào New Arrival (ví dụ thẻ trên màn chào).
- **Sản phẩm 3D chỉ đi qua 3 khối đầu** (chủ dự án 18/11): phần đầu, sản phẩm chính, "Đủ bộ" (combo). Hết khối 3, sản phẩm đứng yên trên kệ và trôi lên theo trang; phần dưới (lưới deal đang chạy, Personal Color cùng Pawlette, booth) vẫn ở cùng landing, trượt lên như một tấm nền trắng bo góc phủ lên, các khối hiện dần khi cuộn tới. Thanh menu có neo #dang-chay, #personal-color, #booth.
- **Vật thể 3D xuyên landing bằng ảnh thật:** ảnh sản phẩm tách nền dựng thành lớp 3D (mặt trước là ảnh thật, phía sau vài lớp tối dần tạo độ dày, vệt sáng chạy theo cuộn và chuột), trong một canvas WebGL cố định sau nội dung. Mẫu đợt LOPOE: chai ampoule là vật thể chính, bóp nhỏ giọt tách thành ảnh riêng để nhấc lên khi cuộn (lộ ống thủy tinh, giọt rơi); tuýp sữa rửa mặt và tuýp kem bay ra ở khối 2, về kệ ở khối 3. Bản thử: design/landing-3d/index.html; ảnh: public/chien-dich/lopoe-better-balance/.
  - Lưu ý thực tế: kem dưỡng LOPOE là tuýp, không phải hũ (thiết kế canvas 4.1 vẽ hũ là sai, theo ảnh thật).
  - Cách ảnh 2.5D giới hạn góc xoay khoảng ±25°; muốn xoay tròn 360° thì cần mô hình 3D thật (`.glb`, nắp hoặc bóp là node riêng), dùng thay ảnh mà giữ nguyên mốc chuyển động.
  - Làm bằng three.js qua react-three-fiber, tải lười sau khi trang hiện (không chặn LCP); điện thoại: vật thể nửa trên, chữ nửa dưới, không nghiêng theo chuột; giảm chuyển động hoặc máy yếu: ảnh tĩnh.
  - Cấu hình: mỗi khối trong file đợt có `vat_the: {chinh: {x, y, xoay, co, mo}, phu: [{anh, x, y, xoay, co}]}` (x, y theo tỉ lệ nửa màn hình; mo 0–1 là độ mở nắp/bóp); ảnh của đợt khai báo `anh: {than, nap, phu: [...]}` trong `public/chien-dich/<ma>/`.
- **Personal Color cùng Pawlette:** khối giới thiệu trên landing dẫn tới `/personal-color` (design/Pawlette.dc.html, bản tạm, W029). Nội dung gói chờ Pawlette.
- **Mốc cỡ màn hình:** dưới 768px như thiết kế điện thoại (thanh tab dưới). 768–1023px: máy tính bảng, thanh điều hướng dọc bên trái (rail), Quẹt có cột Deal cho bạn bên phải (QuetTablet); tablet dọc dưới 900px cao vẫn dùng bố cục điện thoại với thẻ to hơn. Từ 1024px: máy tính, thanh trên cùng có logo, 4 mục, ô tìm, nút Giỏ có số món; Quẹt chia 3 cột (gu + phím tắt | deck | deal cho bạn + giỏ mini, QuetPC); Danh mục có bộ lọc dính bên trái và lưới 3–4 cột (DanhMucPC).
- **Máy tính:** quẹt bằng kéo chuột hoặc phím ← bỏ qua, → thích, ↑ vào giỏ, Z hoàn tác, Space xem chi tiết (chỉ khi con trỏ không ở ô nhập). Chi tiết sản phẩm mở thành hộp thoại giữa màn thay cho bảng trượt. Nội dung rộng tối đa 1280px, căn giữa.
- Các trang còn lại (Đã thích, Deal, Giỏ, Giữ hàng) trên máy tính: lưới nhiều cột cho danh sách, cột tóm tắt giỏ dính bên phải; không cần thiết kế riêng, theo cùng thanh trên và lề.

### 2.0b Cấu hình đợt `data/chien-dich/<ma>.yaml`
```yaml
ma: lopoe-better-balance
ten: LOPOE Better Balance
bat_dau: 2026-11-14
ket_thuc: 2026-11-26
uu_tien: 10
mau: {nen: "#2B2B2A", nhan: "#E8D2CC", chu: "#FFFFFF"}   # chỉ dùng màu trong docs/03
khoi:
  - loai: hero            # kieu: san-pham-3d | video | anh-lon | cuon-ke
    kieu: san-pham-3d
    nhan_tren: "MỚI TẠI VIVE · NỘI ĐỊA HÀN"
    tieu_de: ["LOPOE", "~Better", "Balance"]   # dấu ~ = chữ viền
    mo_ta: "Bộ ba sữa rửa mặt, ampoule, kem dưỡng. Mua kèm sản phẩm bất kỳ, LOPOE giảm 25%."
    san_pham: [LOPOE-CF, LOPOE-AMP, LOPOE-CR]  # ảnh lấy từ public/products; có mo_hinh .glb thì dùng
    nut: [{chu: "Xem bộ sản phẩm", den: "/danh-muc?thuong_hieu=LOPOE"}, {chu: "Giữ hàng tại booth", den: "/gio"}]
    video: null            # kieu video: {mp4, webm, anh_bia}
  - {loai: bang-chu, chu: "BETTER BALANCE · NỘI ĐỊA HÀN · MỚI TẠI VIVE"}
  - {loai: ra-mat, tieu_de: "Đủ bộ, đỡ tốn.", deal: [LOPOE-COMBO-2SRM, LOPOE-COMBO-KEM-AMP, LOPOE-COMBO-BO3]}
  - {loai: chuong-trinh, tieu_de: "Đang chạy tại booth", deal: [COMBO-PINK, DC-05, KM-08], o_to: COMBO-PINK}
  - {loai: doi-tac, doi_tac: pawlette}
  - {loai: booth}
```
- Giá, tên, quà luôn lấy từ `data/` qua `lib/deals` (deal hết hạn hoặc ẩn thì khối tự bỏ ô đó). File cấu hình chỉ chứa chữ, thứ tự, kiểu hiển thị, đường dẫn media.
- Media của đợt để ở `public/chien-dich/<ma>/` (ảnh WebP ≤ 300KB, video ≤ 4MB, mô hình `.glb` ≤ 3MB). Claude soạn file đợt mới theo yêu cầu chủ dự án; sau này có thể đưa vào trang quản trị.

### 2.1 Màn chào (điện thoại; từ W027 gộp vào landing `/`)
- Logo VIVE (file gốc), một dòng chính: "Quẹt phải món hợp da. VIVE tìm deal cho bạn."
- Nút "Bắt đầu quẹt". Không bắt đăng nhập.
- Dưới cùng: "VIVE | K-Beauty Experience · LL2 Union Square, 171 Đồng Khởi". Giờ mở cửa lấy từ cấu hình, không viết cứng.
- Khách quay lại (đã có hồ sơ): vào thẳng deck.

### 2.2 Ba câu hỏi `/bat-dau`
Mỗi câu một màn, chạm để chọn, thanh tiến độ 1/3, nút "Bỏ qua".
1. **Da bạn thuộc loại nào?** Da dầu · Da khô · Da hỗn hợp · Da nhạy cảm · Da thường · Chưa rõ.
2. **Bạn quan tâm điều gì?** (chọn tối đa 3) Mụn · Lỗ chân lông · Thâm, sáng da · Cấp ẩm · Làm dịu · Chống lão hóa · Chống nắng · Trang điểm · Chăm sóc cơ thể · Thiết bị làm đẹp.
3. **Mỗi món bạn thường chi khoảng?** Dưới 200K · 200K–500K · Trên 500K · Không quan trọng.

### 2.3 Deck quẹt `/quet`
**Thanh trên:** logo nhỏ bên trái; bên phải biểu tượng Giỏ có số. Thanh dưới cố định 5 tab: Quẹt · Danh mục · Đã thích · Deal · Giỏ. Nhãn tab luôn 1 dòng, không kèm số; số món đã thích và trong giỏ hiện bằng chấm tròn đen nhỏ ở góc biểu tượng.

**Thẻ sản phẩm** (chiếm khoảng 70% chiều cao màn):
- Ảnh tách nền ở giữa, nền hồng nhạt `#F7EEEB` hoặc bạc hà nhạt `#EAF3ED` (đổi theo danh mục).
- Góc trên trái: nhãn giảm giá nếu có (theo cột `giam_tren_tag`, ví dụ "-26%" hoặc "Giảm 50.000").
- Dưới ảnh: tên thương hiệu (chữ nhỏ, in hoa), tên sản phẩm (tối đa 2 dòng), quy cách.
- Giá bán lớn, giá gốc gạch ngang nếu có.
- Tối đa 3 chip: thành phần nổi bật hoặc vấn đề da (ví dụ "Cica", "Lỗ chân lông").
- Nếu sản phẩm nằm trong deal đang hiện: một dải dưới thẻ, ví dụ "Mua kèm sản phẩm khác: còn 186.000" (LOPOE) hoặc "Có trong COMBO PINK 999.000".

**Thao tác:**
| Thao tác | Kết quả |
|---|---|
| Kéo phải / nút tim | Thích: vào Đã thích. Dấu "THÍCH" hiện dần khi kéo |
| Kéo trái / nút ✕ | Bỏ qua. Dấu "BỎ QUA" |
| Kéo lên / nút túi | Thêm giỏ (tính là thích mạnh) |
| Chạm thẻ | Mở chi tiết (bảng trượt từ dưới lên) |
| Nút hoàn tác ↶ | Lấy lại thẻ vừa quẹt, gỡ ảnh hưởng tới hồ sơ |
| Bàn phím ← → ↑ | Như trên (máy tính) |

Ngưỡng kéo: hơn 30% chiều rộng thẻ hoặc vuốt nhanh. Thả sớm thì thẻ bật về. Có nút cho mọi cử chỉ. Tôn trọng chế độ giảm chuyển động của máy.

**Hiệu ứng** (mẫu chạy được: `design/Quet.dc.html`):
| Lúc | Thích (phải) | Bỏ qua (trái) | Vào giỏ (lên) |
|---|---|---|---|
| Đang kéo | Thẻ đi theo ngón tay, nghiêng 0,06°/px; dấu "THÍCH" (nền bạc hà) hiện dần ở góc trái ảnh; nút tim to dần tới 116% và có vòng bạc hà | Dấu "BỎ QUA" (nền hồng nhạt) hiện dần ở góc phải; nút ✕ to dần, nền chuyển hồng nhạt | Dấu "VÀO GIỎ" hiện dần ở giữa dưới ảnh; nút túi to dần |
| Thả quá ngưỡng hoặc bấm nút | Thẻ bay ra phải, xoay 26°, mờ dần, 380ms; nút tim nảy; 6 trái tim nhỏ bay lên từ nút tim (820ms); hộp "Hợp da!" nền đen bật ra | Thẻ bay ra trái, xoay −26°, 380ms; nút ✕ lắc | Thẻ bay lên trên, 380ms; nút túi nảy; biểu tượng giỏ trên đầu trang nảy, số tăng; hộp "Đã vào giỏ" |
| Thả chưa tới ngưỡng | Thẻ bật về giữa có nảy nhẹ (320ms) | như bên trái | như bên trái |
- Ngưỡng: kéo ngang hơn 110px (khoảng 30% thẻ), kéo lên hơn 120px. Thẻ sau phóng to dần từ 96% lên 100% theo độ kéo; thẻ mới vào từ 95%.
- Hoàn tác: thẻ vừa quẹt bay ngược từ phía nó đã đi về giữa.
- Máy bật giảm chuyển động: bỏ hết hiệu ứng, chỉ đổi thẻ. Rung nhẹ (navigator.vibrate 10ms) khi qua ngưỡng nếu máy hỗ trợ.
- Sản phẩm trang điểm, cơ thể, thiết bị dùng chữ "Ưng ý!" thay "Hợp da!".

**Thẻ đặc biệt** chen vào deck, tối đa 1 trên 8 thẻ, không chen 2 thẻ đặc biệt liền nhau:
- Thẻ deal hợp sở thích: "Bạn thích 2 món Medicube. Mua từ 700K tặng sữa rửa mặt LOPOE" + nút "Xem bộ gợi ý".
- Thẻ theo dõi: Facebook, Instagram, TikTok (đúng tên ở docs/03). Có nêu quà sample hay không chờ chủ dự án (kế hoạch mục 8).
- Sau 5 lượt thích: "Đã có 5 món hợp da. Xem deal cho bạn".

**Hết thẻ:** "Bạn đã xem hết sản phẩm hôm nay." + nút Đã thích và Deal cho bạn. Món đã bỏ qua có thể quay lại sau 7 ngày.

### 2.4 Chi tiết sản phẩm (bảng trượt)
Ảnh lớn, thương hiệu, tên, quy cách, giá. Mô tả ngắn 1–2 câu (cột `mo_ta`, Claude viết sau, không tuyên bố điều trị). Hợp với loại da, thành phần nổi bật. Các deal có sản phẩm này. Nút "Thêm vào giỏ" và "Thích".

### 2.5 Đã thích `/da-thich`
Lưới 2 cột, lọc theo danh mục. Mỗi ô: ảnh, tên, giá, nút thêm giỏ, nút bỏ thích. Trống thì "Quẹt phải để lưu món bạn thích."

### 2.6 Deal cho bạn `/deal`
- Đầu trang một dòng giải thích theo hồ sơ: "Vì bạn thích Cica và toner pad".
- Danh sách deal xếp theo điểm (docs/02 mục 6). Mỗi deal: câu hook, ảnh nhỏ các sản phẩm liên quan, lợi ích ("Tiết kiệm 146.000" hoặc "Tặng sữa rửa mặt LOPOE"), "Số lượng có hạn" nếu deal có giới hạn thật, hạn chương trình, nút "Thêm bộ này vào giỏ".
- Ô đăng ký email (nếu chưa đăng ký): "Nhận email khi món bạn thích có deal tốt".

### 2.7 Giỏ `/gio`
- Dòng sản phẩm và combo, chỉnh số lượng, xóa.
- Tổng tạm tính đã áp deal, dòng "Bạn tiết kiệm".
- **Quà dự kiến:** 1 quà theo hóa đơn có lợi nhất cho khách (docs/02 mục 4).
- **Thanh tới mốc quà gần nhất:** "Thêm 120.000 nữa để nhận sữa rửa mặt LOPOE" và 1–3 món gợi ý lấy từ Đã thích để vừa đủ mốc.
- **Gợi ý đổi combo** khi giỏ đã có đủ món của một combo rẻ hơn.
- Ghi chú cố định: "Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth. Quà số lượng có hạn."
- Nút "Giữ hàng tại booth".

### 2.8 Giữ hàng `/giu-hang`
- Họ tên, số điện thoại (bắt buộc, kiểm định dạng số Việt Nam), email (không bắt buộc).
- Ô "Nhận deal qua email" (không tick sẵn). Ô "Tôi đồng ý với chính sách bảo mật và giữ hàng" (bắt buộc, có link).
- Ngày đến: Hôm nay / Ngày mai.
- Mỗi số điện thoại tối đa 3 mã đang giữ.

**Màn xác nhận `/giu-hang/[ma]`:** mã lớn dạng `VIVE-4821`, QR của mã, hạn giữ ("Giữ đến 21:00 ngày 27/11"), địa chỉ booth, danh sách món, tổng ước tính, quà dự kiến, nút "Lưu ảnh màn hình", nút thêm vào lịch. Có email thì gửi email xác nhận cùng nội dung.

### 2.9 Trang nhân viên `/nhan-vien`
- Đăng nhập bằng tài khoản nhân viên (email + mật khẩu Supabase, có thể dùng chung một tài khoản cho máy tính bảng tại booth).
- Danh sách giữ hàng hôm nay theo trạng thái: Mới · Đã soạn · Đã lấy · Hủy · Hết hạn. Tự làm mới mỗi 30 giây.
- Tìm theo mã hoặc 4 số cuối SĐT.
- Chi tiết: món, số lượng, giá ước tính, quà dự kiến, ghi chú. Nút chuyển trạng thái, có ghi ai đổi và lúc nào.
- Nhân viên vẫn tính tiền trên POS KiotViet như bình thường; web không thay POS.

### 2.10 Quản trị `/quan-tri`
- **Sản phẩm:** tìm, lọc, bật tắt hiển thị, sửa giá, tồn, thẻ, mô tả, tải ảnh.
- **Deal:** bật tắt hiển thị, đánh dấu "hết quà" (chuyển sang `khi_het_qua`), xem điều kiện. Không cho bật deal may rủi khi `da_dang_ky = false`.
- **Nhập tồn:** tải CSV xuất từ KiotViet, xem trước thay đổi, xác nhận.
- **Số liệu:** khách, lượt quẹt, tỷ lệ thích theo sản phẩm và nhãn, giữ hàng và tỷ lệ lấy, email.
- **Email:** danh sách khách đã đồng ý, soạn và gửi email deal (xem trước, gửi thử cho mình trước khi gửi thật).

### 2.10b Danh mục `/danh-muc` (tìm theo cách truyền thống)
Cho khách muốn tự tìm thay vì quẹt. Dùng chung dữ liệu, giá, deal với deck.
- Ô tìm: theo tên, thương hiệu, thành phần; không phân biệt dấu ("vitamin c", "cica", "phan nuoc").
- Màn đầu: lưới 12 loại sản phẩm theo thứ tự chăm sóc da (sữa rửa mặt → nước cân bằng → toner pad → tinh chất → kem dưỡng → mặt nạ → chống nắng → trang điểm → dưỡng môi → miếng dán mụn → chăm sóc cơ thể → thiết bị), mỗi ô có số món; hàng chip "Theo vấn đề da"; hàng thương hiệu cuộn ngang có số món.
- Chọn một mục: danh sách 2 cột, hàng chip đổi loại nhanh, chip lọc vấn đề da, chọn cách xếp (Gợi ý, Đang giảm giá, Giá thấp trước, Giá cao trước), nút "Xem thêm" mỗi lần 6 món.
- Thẻ sản phẩm: ảnh, nhãn giảm giá, tim (thích, tính như quẹt phải), giá và giá gạch, ghi chú deal (ví dụ LOPOE "Mua kèm: 186.000"), nút + thêm giỏ.
- Màn chào có link "Xem theo danh mục".

### 2.11 Trang phụ
`/chinh-sach`: bảo mật dữ liệu, giữ hàng (hạn giữ, hủy), đổi trả theo quy định booth, thông tin doanh nghiệp (chờ chủ dự án cung cấp).

## 3. Email
| Email | Khi nào | Nội dung chính |
|---|---|---|
| Xác nhận giữ hàng | Ngay khi giữ hàng (nếu có email) | Mã, QR, hạn giữ, món, địa chỉ |
| Xác nhận đăng ký nhận deal | Khi tick nhận deal | Nút xác nhận; chưa bấm thì không gửi deal |
| Deal cho bạn | Bản đầu: quản trị bấm gửi. Sau pop-up: tự động khi món đã thích có deal mới hoặc giảm giá | Tối đa 3 deal, ảnh sản phẩm, nút mở web. Tối đa 2 email mỗi tuần mỗi người |
| Nhắc hạn giữ hàng | Sau bản đầu | 3 giờ trước khi hết hạn |
Mọi email marketing có link hủy nhận 1 chạm và thông tin người gửi.

## 4. Chữ trên giao diện (mẫu)
| Chỗ | Chữ |
|---|---|
| Nút chính màn chào | Bắt đầu quẹt |
| Dấu khi kéo | THÍCH · BỎ QUA · VÀO GIỎ |
| Thích | Hợp da! / Ưng ý! |
| Giỏ trống | Giỏ đang trống. Quẹt lên để thêm nhanh. |
| Nhắc mốc quà | Thêm {số tiền} nữa để nhận {quà} |
| Sau giữ hàng | Đã giữ hàng. Đưa mã này cho nhân viên VIVE. |
| Lỗi mạng | Mất kết nối. Lượt quẹt sẽ được lưu khi có mạng lại. |
Viết tiếng Việt, câu ngắn, không dùng "match", "local", "flash sale" hay đếm ngược.
