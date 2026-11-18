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
2. **Cloud Build:** nối repo vào trigger để merge xong là web tự cập nhật (handoff 18/11 01:37).
3. **Supabase → Authentication → URL Configuration:** Site URL = link Cloud Run; thêm link đó và `http://localhost:3000` vào Redirect URLs.
4. **Đăng nhập (W030):** chốt cách đăng nhập (email nhận mã, số điện thoại, Google hay Zalo) và mục đích.
5. **W001:** hạn giữ hàng, thông tin doanh nghiệp cho chân trang, tên hiển thị web. **W022:** pháp lý.
6. **Tên miền:** cần trước khi gửi email thật và in QR New Arrival.
