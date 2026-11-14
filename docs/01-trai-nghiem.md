# VIVE Quẹt: trải nghiệm và giao diện

Phiên bản 1.0 · 15/11/2026. Thiết kế cho điện thoại trước (rộng 360–430px). Trên máy tính hiện một cột rộng tối đa 480px ở giữa.
Quy tắc chữ, màu, font: `docs/03-thuong-hieu-va-noi-dung.md`.

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

### 2.1 Màn chào `/`
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
**Thanh trên:** logo nhỏ bên trái; bên phải biểu tượng Giỏ có số. Thanh dưới cố định 4 tab: Quẹt · Đã thích (số) · Deal cho bạn · Giỏ.

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

**Phản hồi khi thích:** rung nhẹ nếu máy hỗ trợ, chữ "Hợp da!" (Playfair Display Italic) hiện dưới 0,6 giây. Sản phẩm trang điểm, cơ thể, thiết bị dùng "Ưng ý!".

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
