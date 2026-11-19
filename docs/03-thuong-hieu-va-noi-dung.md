# VIVE Quẹt: thương hiệu, nội dung và pháp lý

Phiên bản 1.1 · 15/11/2026 (bỏ font có chân trên web). Nguồn gốc: hướng dẫn chung của dự án VIVE (`vive_poup/docs/01-huong-dan-chung.md`). Nếu lệch, theo hướng dẫn chung.

## 1. Màu
| Token | Mã | Dùng cho |
|---|---|---|
| `hong` | `#E8D2CC` | Nhấn, nút phụ, chip đang chọn |
| `hong-nhat` | `#F7EEEB` | Nền thẻ sản phẩm, nền trang |
| `bac-ha` | `#CFE3D5` | Nhấn thứ hai, dấu THÍCH |
| `bac-ha-nhat` | `#EAF3ED` | Nền thẻ xen kẽ, nền ô deal |
| `den` | `#2B2B2A` | Chữ chính, nút chính (chữ trắng) |
| `xam` | `#737373` | Chữ phụ, giá gạch |
| `trang` | `#FFFFFF` | Nền |
Không thêm màu ngoài bảng này (kể cả đỏ cho giảm giá). Nhãn giảm giá: nền `den`, chữ trắng.

## 2. Chữ
- **Be Vietnam Pro** (400, 500, 600, 700): mọi chữ trên web, kể cả tiêu đề.
- **Font có chân:** chỉ **Playfair Display Italic 500**, chỉ cho một hai chữ nhấn ngắn đúng như `design/landing-v3/` (ví dụ "tone", "4+1"). Không dùng cho tiêu đề, câu hay đoạn văn (chủ dự án duyệt landing v3 ngày 19/11/2026, thay quy định 15/11). Tiêu đề dùng Be Vietnam Pro 700, khoảng cách chữ −0,5 đến −1,2px.
- Chữ cần nhấn: vệt hồng `#E8D2CC` sau chữ (`box-shadow: inset 0 -10px 0 #E8D2CC`); chữ nghiêng chỉ theo ngoại lệ Playfair ở trên.
- Cỡ tối thiểu 14px cho chữ đọc, 12px cho chú thích. Giá bán 24–28px, đậm.
- Ngoại lệ (chủ dự án 18/11): thông tin công ty và dòng © ở chân trang trên điện thoại dùng 11px.

## 3. Logo
- Dùng đúng file gốc: `public/brand/vive-logo-black.png` (nền sáng) và `public/brand/vive-logo-white.png` (nền tối). Hai file cắt từ "VIVE LOGO FINAL_VIVE BLACK.png" trên Drive, giữ nguyên hình.
- Không gõ lại chữ "vive" bằng font, không đổi màu khác đen hoặc trắng, không kéo méo, chừa khoảng trống ít nhất bằng chiều cao chữ "i".
- Thanh trên: cao khoảng 28px. Màn chào: rộng khoảng 160px.

## 4. Ảnh sản phẩm
- Ảnh tách nền PNG trong suốt, sản phẩm chiếm khoảng 80% khung vuông. Xuất WebP 1000×1000, dưới 150KB.
- Tên file: `{id}.webp` theo cột `id` của `data/products.csv` (mã vạch; LOPOE dùng `LOPOE-CF`, `LOPOE-AMP`, `LOPOE-CR`).
- Nguồn: Drive "Her Bazaar Pop up/08 Mockup sản phẩm/{Thương hiệu}/Tách nền (PNG)". Bảng đối chiếu tên file và mã vạch: tab "Mockup sản phẩm" của tracker.
- Sản phẩm chưa có ảnh không hiện trong deck. Không dùng ảnh có chữ, logo hay watermark của trang bán khác.
- Ảnh phải đúng mã (đúng màu, đúng dung tích).

## 5. Quy tắc chữ trên web
- Personal color: viết **"tone"** (từ quen với khách), không viết "tông". Tiêu đề khối Pawlette: "Tone bạn màu nào?" (chủ dự án chốt 18/11).
- Viết tiếng Việt, câu ngắn, ít chữ, sản phẩm là trung tâm. Hạn chế tiếng Anh, trừ từ quen hoặc chuyên ngành (PDRN, Cica, serum, toner pad, K-pop, check-in) và tên sản phẩm gốc.
- Viết "nội địa Hàn", không viết "local".
- Thông điệp: trải nghiệm mua sắm độc đáo; thương hiệu nội địa Hàn bán ngay tại Việt Nam; chất lượng và phù hợp làn da châu Á.
- Không nhắc tới cửa hàng chính sẽ mở sau này.
- Tên thương hiệu công khai: Rep!el (không viết Repiel). Các tên khác theo cột `thuong_hieu`.
- Tài khoản: Facebook **VIVE - K Beauty Experience** (https://www.facebook.com/weareVIVE) · Instagram **@vive.k_beauty** · TikTok **@viveuniverse** (có chữ "e" cuối). Threads theo tài khoản Instagram.
- Địa chỉ: VIVE | K-Beauty Experience, tầng LL2 Union Square, 171 Đồng Khởi, Phường Sài Gòn.
- Giờ mở cửa và ngày cuối pop-up lấy từ cấu hình, chỉ ghi khi đã chốt. Không ghi "11:59 PM".
- Hashtag (nếu có ở trang chia sẻ): tối đa 5.

## 6. Mỹ phẩm: cách mô tả
- Không tuyên bố điều trị hay chữa bệnh: không "trị mụn", "chữa", "hết nám", "tái tạo da 100%", "cam kết hiệu quả".
- Dùng từ mô tả công dụng mỹ phẩm: "làm sạch", "dưỡng ẩm", "làm dịu", "hỗ trợ giảm bóng dầu", "cho da trông sáng hơn".
- Chip vấn đề da là nhóm để lọc ("Mụn", "Lỗ chân lông"), không phải lời hứa.
- Mô tả theo thông tin trên nhãn hoặc của nhãn hàng; không chắc thì để trống.

## 7. Khuyến mại trên web
- Chỉ hiện deal theo quy tắc ở `data/deals.yaml` (ĐANG CHẠY hoặc ĐÃ DUYỆT, không may rủi chưa đăng ký).
- Vòng quay, bốc thăm, lá thăm, giải máy uốn mi: không hiện cho đến khi chủ dự án báo đã đăng ký với Sở Công Thương.
- Không viết "ô nào cũng có quà".
- "Số lượng có hạn" chỉ khi deal có giới hạn thật. Không đếm ngược, không hiện "còn X suất" nếu không có dữ liệu thật.
- Giá gốc gạch phải là giá thật theo bảng giá. Giảm dưới 10% ghi số tiền, không ghi %.
- KM-13 công khai chỉ ghi "tặng sản phẩm fullsize", không ghi tên món.
- KM-10 nếu bật: ghi "mua 2 tính tiền 1", không ghi "tặng 1 sản phẩm cùng loại".
- Không hiện giá vốn, lãi, cách tính nội bộ (giá trị quà ở docs/02 chỉ dùng trong code).
- Giá và quà trên web là ước tính; ghi rõ nhân viên xác nhận khi thanh toán.

## 8. Pháp lý cần kiểm tra trước khi quảng bá rộng
Đây là danh sách rủi ro để hỏi người phụ trách pháp lý, không phải tư vấn pháp lý.
1. **Website thương mại điện tử:** web có chức năng giữ hàng, đặt hàng có thể thuộc diện phải thông báo với Bộ Công Thương. Luật Thương mại điện tử 2025 và Nghị định 248/2026/NĐ-CP có hiệu lực từ 01/07/2026. Cần xác nhận nghĩa vụ và thông tin bắt buộc trên web.
2. **Thông tin người bán** ở chân trang: tên doanh nghiệp hoặc hộ kinh doanh, mã số thuế hoặc số đăng ký, địa chỉ, SĐT, email (chờ chủ dự án).
3. **Dữ liệu cá nhân** (tên, SĐT, email, lịch sử quẹt): chính sách bảo mật rõ ràng; xin đồng ý riêng cho email quảng cáo (ô không tick sẵn); hủy nhận 1 chạm; chỉ thu dữ liệu cần thiết; có cách xóa dữ liệu khi khách yêu cầu.
4. **Khuyến mại:** quà không quá 50% giá trị hàng được khuyến mại (cách tính đang chờ pháp lý, xem doc khuyến mãi); khuyến mại may rủi phải đăng ký.
5. **Hàng nhập khẩu tặng kèm** cần nhãn phụ tiếng Việt (nhân viên lo tại booth).

## 9. Checklist QA của Claude trước khi ra mắt
- [ ] Giá mọi sản phẩm hiện trên web khớp `data/products.csv`; giỏ chạy đúng bộ test docs/02 mục 4.3.
- [ ] Không deal may rủi hoặc ĐỀ XUẤT nào hiện.
- [ ] Chữ đúng mục 5 và 6; không "local", không nhắc cửa hàng chính, tài khoản và địa chỉ đúng.
- [ ] Màu, font, logo đúng mục 1–3; ảnh đúng mã.
- [ ] Luồng quẹt → giữ hàng → nhân viên → đã lấy chạy được trên iPhone và Android thật, cả 4G yếu.
- [ ] Email xác nhận đến hộp thư chính (không vào spam), có thông tin người gửi và link hủy nhận.
- [ ] Trang chính sách có đủ thông tin mục 8.
