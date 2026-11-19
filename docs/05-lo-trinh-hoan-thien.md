# 05 · Lộ trình hoàn thiện web (landing + các trang), chạy mượt mọi cỡ màn hình

Lập 18/11/2026 (Claude). Mốc cứng: chạy thử tại booth 26/11, Black Friday 27/11, pop-up đến 29/11. Antigravity làm theo thứ tự ở mục 3, mỗi việc một task, một nhánh, một PR; Claude QA theo lịch (1:13, 12:13, 17:13) và merge; mỗi lần merge Cloud Run tự cập nhật.

## 1. Tóm tắt hiện trạng (18/11)
- **Xong và đã lên Cloud Run** (https://vive-swipe-5byasgvzsa-an.a.run.app): khung web 5 tab, dữ liệu 149 sản phẩm và 20 deal, engine giỏ hàng, gợi ý, màn chào + 3 câu hỏi, deck quẹt, Đã thích và Giỏ (W006–W012, W025).
- **Đang làm:** W013 kết nối Supabase (QA Fail lần 2, còn 3 lỗi: deck xếp trước khi có dữ liệu, vài trang còn đọc dữ liệu tĩnh, e2e chạm database thật); W026 Danh mục (chờ QA).
- **Thiết kế đã có** (canvas + `design/`): toàn bộ màn điện thoại (hàng 1–3), máy tính và máy tính bảng (4.2–4.4), landing New Arrival 3D bằng ảnh thật LOPOE (`design/landing-3d/`), thư viện khối landing (4.5), Pawlette bản tạm (4.6), hiệu ứng cuộn (4.7).
- **Quyết định mới của chủ dự án (18/11):** landing ở `/new-arrival`, sản phẩm 3D đi qua 3 khối đầu rồi dừng, các khối deal, Personal Color, booth vẫn ở dưới; thanh trên: logo chữ (không UNIVERSE) + New Arrival · Home · Quẹt · Sản phẩm · Giỏ · Đăng nhập.

## 2. Nguyên tắc để chạy mượt mọi cỡ màn hình
### 2.1 Mốc cỡ màn hình (Tailwind)
| Mốc | Rộng | Điều hướng | Bố cục |
|---|---|---|---|
| Điện thoại (mặc định) | < 768px | Thanh tab dưới 5 mục | 1 cột, như thiết kế hàng 1–3 |
| Máy tính bảng `md` | 768–1023px | Rail dọc trái | Quẹt có cột Deal phải (QuetTablet); tablet dọc thấp hơn 900px dùng bố cục điện thoại, thẻ to hơn |
| Máy tính `lg` | ≥ 1024px | Thanh trên (logo, mục, ô tìm, Giỏ) | Quẹt 3 cột (QuetPC), Danh mục lọc trái (DanhMucPC), nội dung tối đa 1280px |

### 2.2 Cách làm (bắt buộc cho mọi PR có giao diện)
- **Mobile-first:** viết cho điện thoại trước, thêm `md:` và `lg:`. Không khóa độ rộng cứng (bỏ khung 480px khi làm W031). Dùng grid `auto-fill minmax()` cho lưới sản phẩm.
- **Chiều cao màn hình:** dùng `dvh`/`svh` (không `vh`) để thanh địa chỉ iOS không cắt nút; chừa `env(safe-area-inset-*)` cho tab dưới và nút nổi.
- **Chạm và bàn phím:** mọi nút ≥ 44px; trên máy tính quẹt bằng kéo chuột và phím ← → ↑ Z Space (không bắt phím khi đang gõ); focus nhìn thấy được.
- **Ảnh:** `next/image` có `sizes` theo mốc; WebP; ảnh sản phẩm có khung tỉ lệ cố định để không giật bố cục (CLS).
- **Chuyển động:** chỉ animate `transform`, `opacity`; tôn trọng `prefers-reduced-motion`; không chặn cuộn.
- **Một mã nguồn:** không tách trang riêng cho máy tính; component đổi bố cục bằng CSS (media/container query).

### 2.3 Ngân sách hiệu năng (đo trên Cloud Run, điện thoại 4G giả lập)
- LCP < 2,5s; CLS < 0,1; INP < 200ms; Lighthouse mobile Performance ≥ 85 (landing 3D ≥ 80), Accessibility ≥ 95.
- JS tải đầu mỗi trang < 200KB gzip. three.js chỉ tải ở `/new-arrival`, tải lười sau khi chữ và ảnh đầu đã hiện; điện thoại yếu hoặc giảm chuyển động thì dùng ảnh tĩnh.
- Cloud Run: `min-instances 1` từ 26/11 đến 29/11 (W023), về 0 sau pop-up.

### 2.4 Ma trận kiểm thử (W032, chạy trong CI)
- Cỡ: 360×780, 390×844, 430×932 (điện thoại); 768×1024, 820×1180, 1180×820 (máy tính bảng); 1280×800, 1440×900, 1920×1080 (máy tính).
- Trình duyệt: Chromium và WebKit (Safari iOS) trong Playwright; kiểm tay 1 iPhone và 1 Android thật trước 26/11.
- Mỗi trang: không cuộn ngang, chụp ảnh so sánh, luồng chính chạy hết (quẹt → giỏ → giữ hàng → mã), không lỗi console.

### 2.5 Một bộ giao diện cho mọi màn hình (thêm 18/11)
Mục tiêu: sửa một chỗ là điện thoại, máy tính bảng, máy tính cùng đổi. Không làm trang riêng cho máy tính.
- **Token dùng chung** khai báo một lần trong `app/globals.css` (`@theme` của Tailwind v4):
  - màu: `--hong #E8D2CC`, `--hong-nhat #F7EEEB`, `--bac-ha #CFE3D5`, `--bac-ha-nhat #EAF3ED`, `--den #2B2B2A`, `--xam #737373`, `--vien #EEE5E2`, `--nen-phu #F4F2F1`;
  - bo góc: thẻ 20px, nút 999px;
  - khoảng cách: bậc 4px;
  - cỡ chữ: 12 / 13 / 14 / 17 / 22 / 28.
  Không gõ mã màu hay cỡ chữ lẻ trong component.
- **Component dùng chung**, mỗi thứ một file trong `components/ui/`:
  - `Nut`, `The`, `Nhan`, `DuongMoc`, `GiaTien`, `KhungChiTiet`;
  - `KhungChiTiet` tự chọn kiểu theo cỡ màn hình: ngăn kéo phải 420px từ 768px trở lên, bottom sheet trên điện thoại.
- **Co giãn bằng lưới hoặc container query**, không viết hai phiên bản giao diện:
  - Cùng một thẻ: máy tính 3 cột, máy tính bảng 2 cột, điện thoại 1 cột.
  - Hàng bộ lọc trên điện thoại cuộn ngang, không xuống dòng.
- **Bản mẫu mới** viết bằng HTML co giãn (như `design/DealPC-the.html`); kéo hẹp cửa sổ để xem bản điện thoại. Ảnh trong PR luôn có 390, 820, 1440.
- **Nút** (chủ dự án 18/11: hạn chế nút đen, viền tối):
  | Loại | Nền | Chữ | Viền | Dùng cho |
  |---|---|---|---|---|
  | Chính | `--hong` (combo, sản phẩm: `--bac-ha`) | `--den`, 600 | không | Thêm vào giỏ, hành động chính của thẻ |
  | Phụ | `--hong-nhat` hoặc `--nen-phu` | `--den` | không | Xem giỏ, xem sản phẩm, bộ lọc |
  | Chữ | trong suốt | `--xam`, gạch chân | không | Xem điều kiện, link phụ |
  | Đậm | `--den` | trắng | không | **Chỉ 1 nút trên mỗi màn**, cho bước chốt: "Giữ hàng" ở giỏ, "Xác nhận" ở form giữ hàng |
  - Không dùng viền đen/xám đậm quanh nút. Chỉ ô nhập và thẻ có viền 1px `--vien`.
  - Chiều cao nút: 40px trên máy tính, 44px trên điện thoại; chữ không xuống dòng.
  - Thanh trên: "Đăng nhập" là nút Phụ, không còn nút đen.

## 3. Thứ tự làm (Antigravity) và mốc ngày
| Giai đoạn | Ngày | Việc | Ghi chú |
|---|---|---|---|
| A. Luồng mua tại booth | 18–21/11 | Sửa W013 → merge W026 → **W031 khung co giãn** → W014 giữ hàng → W015 nhân viên | W031 làm sớm để các trang sau không phải sửa lại |
| B. Đủ trang, đủ màn | 21–24/11 | W016 Deal cho bạn → W017 quản trị → W019 chính sách, chân trang → **W028** máy tính, máy tính bảng cho từng trang | Claude QA giữa kỳ W021 ngày 22/11 |
| C. New Arrival | 23–25/11 | **W027** landing `/new-arrival` (3D ảnh thật, khối cấu hình) → W029 Pawlette bản tạm | Dùng ảnh trong `public/chien-dich/lopoe-better-balance/` |
| D. Kiểm thử, chạy thử | 25–27/11 | **W032** ma trận màn hình + hiệu năng → W023 nghiệm thu tại booth (26/11) | Sửa lỗi chặn trước 26/11 |
| Sau pop-up | từ 30/11 | W018 email deal (cần tên miền), W030 đăng nhập, mô hình 3D `.glb` | |

Việc nào bị chặn vì chờ chủ dự án thì làm việc kế tiếp, không chờ.

## 4. Việc chủ dự án cần làm để không chặn lộ trình
1. **Ảnh sản phẩm (W004):** chọn A hoặc B ở handoff 18/11 02:44; gửi ảnh nhãn có deal trước 25/11.
2. ~~**Cloud Build:**~~ xong 18/11, trigger `deploy-main` chạy khi merge vào main.
3. **Supabase → Authentication → URL Configuration:** Site URL = link Cloud Run; thêm link đó và `http://localhost:3000` vào Redirect URLs.
4. **Đăng nhập (W030):** chốt cách đăng nhập (email nhận mã, số điện thoại, Google hay Zalo) và mục đích.
5. **W001:** hạn giữ hàng, thông tin doanh nghiệp cho chân trang, tên hiển thị web. **W022:** pháp lý.
6. **Tên miền:** cần trước khi gửi email thật và in QR New Arrival.

## 5. Lượt chạy tiếp của Antigravity (giao 18/11 chiều)
Làm đúng thứ tự, mỗi việc một nhánh mới tách từ `main` mới nhất, một PR. Việc nào bị chặn thì ghi handoff `hoi` rồi làm việc kế tiếp.

| # | Việc | Làm gì | Xong khi |
|---|---|---|---|
| 1 | **W028** làm lại | Bỏ nhánh cũ. Tách nhánh mới từ main, áp bố cục máy tính/máy tính bảng lên các trang đã có (Quẹt, Danh mục, Đã thích, Giỏ, Giữ hàng, Deal, Nhân viên) theo §2 và `design/*PC*.dc.html`, `design/QuetTablet.dc.html` | Không cuộn ngang ở 9 cỡ §2.4; ảnh chụp 390/820/1440 gửi trong PR (không lưu vào `docs/`) |
| 1b | **W033** | Landing là trang đầu (`/`), một thanh menu chung trên máy tính, nút quay lại ở trang con (xem tasks/W033.md) | Theo tiêu chí trong task |
| 2 | **W027** sửa | Theo handoff 18/11 10:51: bỏ câu công dụng tự viết, chữ lấy từ yaml; vị trí lọ đọc từ `vat_the` trong yaml; sửa chồng chữ trên điện thoại; lọ không đè chữ ở khối 1 | Đổi yaml là đổi nội dung, không sửa code |
| 3 | **W017** làm lại | Quản trị phải đăng nhập Supabase (dùng lại `lib/nhan-vien/xac-thuc-server.ts`, chỉ `vai_tro = 'quan_tri'`), ghi qua server action + `layAdmin()`, không dùng localStorage | Tài khoản `nhan_vien` thường bị chặn; sửa giá/deal lưu được vào DB |
| 4 | **W019** | Trang chính sách + chân trang. Thông tin doanh nghiệp chưa có (W001) thì để chỗ trống ghi rõ `[chờ W001]` | Chân trang hiện ở cả 3 mốc màn hình |
| 1c | **W038** | Khung trang dùng chung trong layout (logo không nhấp nháy), logo về New Arrival, danh mục giữ menu + quay lại | tasks/W038.md |
| 1c1 | **W049** | Chân trang gọn theo cụm, chữ nhỏ, điện thoại tối giản theo `design/ChanTrang.html` | tasks/W049.md |
| 1c2 | **W040** | Token + nút dùng chung, bỏ nút đen/viền tối (docs/05 §2.5) | tasks/W040.md |
| 1c3 | **W042** | Trang Sản phẩm hiện hàng ngay, lọc sau; ô Xếp mới | tasks/W042.md |
| 1c4 | **W041** | Nút landing dẫn thẳng tới sản phẩm/deal (đích lấy từ yaml) | tasks/W041.md |
| 1c5 | **W048** | Khối "Đang có tại VIVE": tiêu đề có logo, ảnh sản phẩm theo cỡ ô | tasks/W048.md |
| 1d | **W039** | Trang Deal dạng thẻ gọn theo `design/DealPC-the.html` | tasks/W039.md |
| 1e | **W051** | Menu chuẩn kiểu web theo landing v3: logo về `/`, bỏ Ghé LL2, New Arrival → `/new-arrival` (thay phần "logo về New Arrival" của W038) | tasks/W051.md |
| 1f | **W050** | Trang chủ mới `/` theo `design/landing-v3`, mọi nút nối đúng trang (bảng trong task); landing cũ giữ ở `/new-arrival` | tasks/W050.md |
| 1g | **W052** | Đồng bộ thiết kế các trang khách còn lại theo landing v3 | tasks/W052.md |
| 1h | **W054** | Khối cuộn 3D LOPOE ở `/thu-nghiem/lopoe-3d` theo `design/lopoe-3d` (chưa gắn landing); tài sản thật từ W053 (Antigravity Media) | tasks/W054.md |
| 4b | **W005** | Web đọc ảnh từ kho media Supabase (tasks/W005.md, docs/06) | Đổi ảnh trong kho là web đổi, không cần deploy |
| 5 | **W029** | Trang `/personal-color` bản tạm theo `design/Pawlette.dc.html` | Có link từ New Arrival |
| 6 | **W032** | Sau khi W028 merge: ma trận §2.4 vào CI, đo hiệu năng §2.3 | CI xanh cả Chromium và WebKit |

Quy tắc bắt buộc (lặp lại vì đã sai nhiều lần):
- Ghi dữ liệu phía server dùng `layAdmin()`, không nuốt lỗi; việc của nhân viên/quản trị luôn gọi `xacThucNhanVien()` trước.
- Không bịa công dụng, giá, deal; chỉ lấy từ `data/` hoặc yaml chiến dịch.
- Trước khi mở PR: `npm run lint`, `npm run test`, `npx playwright test` đều qua; rebase lên main.
- Tài khoản thử trang nhân viên: `test@vive.vn` (vai trò `nhan_vien`, mật khẩu hỏi chủ dự án, không ghi vào repo).

Sau lượt này (chưa làm): W018 email deal (cần tên miền), W030 đăng nhập (Claude thiết kế trước), W021 QA giữa kỳ (Claude, 22/11), W023 nghiệm thu tại booth (26/11).

## 6. Ảnh và video (từ 18/11)
Chat thứ hai **Antigravity Media** lo ảnh thẻ, ảnh bối cảnh, video: W035 → W036 → W037. Quy trình và kho tập trung xem `docs/06-anh-va-video.md`. Inbox chung cho ảnh và thông tin sản phẩm: https://drive.google.com/drive/folders/1-SEBvf5iv1D1lVYi81eXogjsenpuOm5n

## 7. Song ngữ và nhập liệu (từ 18/11)
Xem `docs/07-song-ngu-va-nhap-lieu.md`. Antigravity làm sau W039: W044 (song ngữ) → W045 (trang kho) → W046 (Excel). Antigravity Media: W047 song song.
