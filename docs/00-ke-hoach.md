# VIVE Quẹt: kế hoạch tổng

Phiên bản 1.0 · 15/11/2026 · Claude (Lead) soạn, chủ dự án duyệt. Chỉ Claude hoặc chủ dự án sửa file này.
Tên làm việc: **VIVE Quẹt** (repo `vive-swipe`). Tên hiển thị chính thức chờ chủ dự án chốt.

## 1. Ý tưởng
Web bán hàng của VIVE theo kiểu Tinder: mỗi lần hiện một sản phẩm, quẹt phải nếu thích, quẹt trái để bỏ qua. Hệ thống học từ các lượt quẹt, rồi đề xuất deal hợp với từng người và báo khi có deal tốt.

Mục tiêu theo thứ tự của dự án VIVE: (1) tăng người theo dõi, (2) tăng lượt ghé booth, (3) tăng đơn hàng. Web phục vụ cả ba: khách khám phá sản phẩm nhanh như lướt mạng xã hội, giữ hàng rồi đến booth lấy, và để lại email để nhận deal.

## 2. Quyết định đã chốt (chủ dự án, 15/11/2026)
| Câu hỏi | Chốt |
|---|---|
| Dùng bao lâu | Lâu dài. Bản đầu phải chạy tại booth trước Black Friday 27/11 |
| Khách mua thế nào | Giữ hàng trên web, đến booth trả tiền và nhận hàng (nhân viên tính trên POS KiotViet) |
| Báo deal qua đâu | Mục "Deal cho bạn" trong web và email |
| Code ở đâu | Repo riêng `minhduc1395/vive-swipe`. Repo `vive_poup` chỉ giữ task điều phối (T016) |
| Hosting | Chạy local trên máy trước. Chỉ thuê hosting và tên miền khi web hoàn chỉnh hoặc ít nhất có 1 chức năng dùng được (W024) |

## 3. Phạm vi bản đầu (ra mắt 26–27/11)
**Có:**
- 3 câu hỏi nhanh (loại da, mối quan tâm, ngân sách), bỏ qua được.
- Deck quẹt: phải = thích, trái = bỏ qua, lên = thêm giỏ, có nút thay cho cử chỉ và nút hoàn tác.
- Gợi ý v1: chấm điểm theo hồ sơ sở thích, có phần khám phá và chống lặp nhãn (docs/02 mục 5).
- Danh mục: tìm và lọc theo loại sản phẩm, vấn đề da, thương hiệu (cho khách không muốn quẹt).
- Đã thích, Deal cho bạn, Giỏ với giá ước tính đã áp deal và quà dự kiến, thanh "thêm X để nhận quà".
- Giữ hàng tại booth: tên + SĐT (+ email tùy chọn), mã giữ hàng và QR, email xác nhận.
- Trang nhân viên: tra mã, đánh dấu đã soạn / đã lấy / hủy.
- Quản trị tối thiểu: bật tắt sản phẩm và deal, nhập CSV tồn KiotViet, số liệu cơ bản.
- Đăng ký nhận deal qua email (có xác nhận, hủy nhận 1 chạm); quản trị gửi email deal thủ công.

**Chưa làm ở bản đầu (sau pop-up):** thanh toán online và giao hàng, đăng nhập tài khoản, email deal tự động theo lịch, gợi ý "người thích A cũng thích B", Zalo, thông báo trình duyệt, quét QR bằng camera ở trang nhân viên.

**Nếu trễ, cắt theo thứ tự:** quản trị (tạm dùng bảng Supabase) → email deal (giữ email xác nhận giữ hàng) → trang Deal cho bạn (chỉ giữ gợi ý trong giỏ). Không cắt: quẹt, giỏ đúng giá, giữ hàng, trang nhân viên.

## 4. Kiến trúc tóm tắt
- Next.js (App Router, TypeScript) + Tailwind + Framer Motion, chạy tốt trên điện thoại.
- Supabase: Postgres, khách ẩn danh (anonymous sign-in), RLS, lưu ảnh, lịch chạy việc.
- Email: Resend (cần tên miền để gửi).
- Giai đoạn đầu chạy local (`npm run dev`), thử trên điện thoại qua cùng Wi-Fi (docs/02 mục 9). Hosting chọn ở W024: Vercel Pro hoặc Cloudflare (gói Hobby của Vercel chỉ cho dùng phi thương mại).
- Logic giá, deal và gợi ý viết thành hàm thuần trong `lib/`, có unit test, không phụ thuộc giao diện.
- Khoảng 130 sản phẩm nên deck được chấm điểm ngay trên máy khách; lượt quẹt gửi về server để học và làm số liệu.
Chi tiết: `docs/02-ky-thuat.md`.

## 5. Lịch (hôm nay CN 15/11; Black Friday T6 27/11; pop-up đến CN 29/11)
| Giai đoạn | Ngày | Việc chính | Ai |
|---|---|---|---|
| 0. Nền | 15–17/11 | Repo, plan, dữ liệu (xong); chủ dự án trả lời mục 8; tạo Supabase; gom ảnh sản phẩm | Claude, Người |
| 1. Quẹt chạy được | 17–20/11 | Khung app, thương hiệu, 3 câu hỏi, deck, chi tiết, đã thích, giỏ với dữ liệu tĩnh; chạy local | Antigravity |
| QA giữa kỳ | 20/11 | Claude chạy bản local, rà giá trong giỏ, chữ, trải nghiệm khung điện thoại | Claude |
| Quyết định hosting | từ 20/11 | Chủ dự án xem bản local; nếu dùng được thì thuê hosting và tên miền (W024), rồi đưa web lên (W025) | Người, Antigravity |
| 2. Có server | 20–23/11 | Khách ẩn danh, ghi lượt quẹt, gợi ý v1, giữ hàng, trang nhân viên, email xác nhận | Antigravity |
| 3. Deal | 23–25/11 | Deal cho bạn, thanh "thêm X để nhận quà", quản trị, đăng ký email, gửi email thủ công | Antigravity |
| 4. Nghiệm thu | 25–26/11 | Claude QA toàn bộ; thử tại booth với nhân viên; in QR để bàn (task bên vive_poup) | Claude, Người |
| Ra mắt | 26/11 chạy thử, 27/11 chính thức | Cần web đã lên hosting. Muốn kịp Black Friday thì W024 phải xong trước 24/11; trễ hơn thì dời ngày ra mắt | |
| Sau pop-up | từ 30/11 | Email deal tự động, gợi ý theo hành vi cộng đồng, tài khoản, đặt online, báo cáo | |

## 6. Đo lường
Bảng `su_kien` trong Supabase, xem ở trang quản trị:
- Số khách mở web, % khách quẹt đủ 10 thẻ, tỷ lệ quẹt phải.
- Số mã giữ hàng mỗi ngày, % mã được lấy, giá trị trung bình đơn giữ hàng.
- Số email đăng ký và xác nhận, tỷ lệ mở và bấm email deal.
- Lượt bấm sang Facebook, Instagram, TikTok.
Chỉ tiêu cụ thể đặt sau 3 ngày chạy đầu, khi đã có số thật.

## 7. Rủi ro và cách xử lý
| Rủi ro | Xử lý |
|---|---|
| Thiếu ảnh sản phẩm: trên Drive mới có ảnh tách nền Dermal (11/12 mã) | Web chỉ hiện sản phẩm có ảnh. Ưu tiên các nhãn có deal (LOPOE, Medicube, Celimax, SKINFOOD, Rep!el, Uniura...). Task W004 |
| Tồn và quà không theo thời gian thực | Mọi giá và quà ghi "ước tính, nhân viên xác nhận tại quầy". Nhập CSV tồn POS mỗi tối. Quản trị bật "hết quà" từng deal |
| Lệch giá giữa các nguồn | Không tự chọn. Các mục `can_xac_nhan` trong `data/deals.yaml` và `ghi_chu` trong `products.csv` chờ chủ dự án |
| Pháp lý: web có chức năng giữ hàng, thu SĐT/email | docs/03 mục 4. Hỏi người phụ trách pháp lý trước khi quảng bá rộng |
| Khuyến mại may rủi chưa đăng ký | Có trong dữ liệu nhưng bị khóa hiển thị bằng quy tắc có unit test |
| Antigravity không có quyền Supabase, hosting, Drive | Claude và chủ dự án làm phần tài khoản, đưa khóa vào biến môi trường; Antigravity chỉ code |
| Ít thời gian (12 ngày) | Cắt phạm vi theo mục 3, giữ phần lõi |

## 8. Chủ dự án cần quyết định hoặc cung cấp
1. ~~Tên miền~~ và 2. ~~Hosting~~: **để sau** (chốt 15/11). Chạy local đến khi có chức năng dùng được, khi đó làm W024: chọn Vercel Pro (khoảng 20 USD/tháng) hay Cloudflare (miễn phí, cài đặt phức tạp hơn), mua tên miền để chạy web và gửi email.
3. **Supabase lúc chạy local:** project cloud gói miễn phí (0 đồng, Claude tạo qua MCP, Antigravity không cần cài thêm) hay Supabase chạy trên máy bằng Docker (cần Docker Desktop trên máy Antigravity). Claude đề xuất cloud miễn phí. Cần trước W013, khoảng 20/11.
4. **Ảnh sản phẩm** tách nền, đặt tên theo mã vạch (W004).
5. **Giữ hàng bao lâu:** đề xuất đến 21:00 ngày hôm sau.
6. **Quà follow (sample):** có được nêu trên web không (hướng dẫn chung đang để nhân viên nói miệng).
7. **Thông tin doanh nghiệp** cho chân trang và trang chính sách (tên, mã số thuế, địa chỉ, SĐT, email).
8. **Tên hiển thị** của web.
9. **Điểm lệch dữ liệu:** giá Mask Party 449K hay 500K; thương hiệu ISOI hay Isol; Tiela Ritual Cleanser rửa mặt hay body; tên, giá kem chống nắng và kem mềm da tặng kèm combo 2 sữa rửa mặt; danh sách 2 mặt nạ trong từng mã Mask Party.

## 9. Tài liệu
| File | Nội dung |
|---|---|
| `docs/01-trai-nghiem.md` | Luồng, màn hình, chữ trên giao diện, email |
| `docs/02-ky-thuat.md` | Công nghệ, database, quy tắc giá và deal, thuật toán gợi ý, test |
| `docs/03-thuong-hieu-va-noi-dung.md` | Màu, font, logo, ảnh, quy tắc chữ, pháp lý |
| `data/` | Sản phẩm và deal khởi tạo |
| `tasks/`, `handoff/` | Việc và tin nhắn giữa Claude và Antigravity (cách dùng: AGENTS.md) |

## Nhật ký thay đổi
- 15/11/2026: Thêm trang Danh mục (W026) và tab thứ 5; màn chào đổi tiêu đề "Thích thì quẹt phải", font Be Vietnam Pro.
- 15/11/2026: v1.1. Chủ dự án chốt chạy local trước, thuê hosting và tên miền sau khi có ít nhất 1 chức năng dùng được. Thêm W024 (thuê hosting), W025 (đưa web lên); W023 phụ thuộc W025; email ở local chỉ xem trước, không gửi thật.
- 15/11/2026: v1.0.
