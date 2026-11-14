# data/: dữ liệu gốc của web

Hai file này là dữ liệu khởi tạo (seed). Khi đã có Supabase, script import đưa chúng vào database; từ đó trang quản trị là nơi sửa hằng ngày. Đổi luật deal hoặc giá chương trình thì sửa ở đây trước (Claude hoặc chủ dự án), rồi import lại.

## products.csv (149 sản phẩm, 129 đang hiện)
Tạo bằng `python3 scripts/build_products.py ../vive_poup/docs/02-bang-gia.md`. Không sửa tay file CSV: sửa `OVERRIDES` trong script rồi chạy lại.

| Cột | Ý nghĩa |
|---|---|
| id | Mã vạch. LOPOE chưa có mã vạch nên dùng `LOPOE-CF`, `LOPOE-AMP`, `LOPOE-CR` |
| thuong_hieu | Tên hiển thị (Rep!el, ISOI, LOPOE, SKINFOOD, JUNGSAEMMOOL...) |
| ten_goc / ten_hien_thi | Tên trên bảng giá / tên có loại sản phẩm tiếng Việt đứng trước |
| gia_goc, gia_ban | Giá gạch và giá bán (VNĐ, đã gồm VAT). `gia_goc` trống = không có giá gạch, chỉ hiện giá bán |
| giam_tren_tag | Cách ghi mức giảm trên tag (`-26%` hoặc `giảm 50.000`). Giảm dưới 10% ghi số tiền, không ghi % |
| danh_muc | sua-rua-mat, nuoc-can-bang, toner-pad, tinh-chat, kem-duong, mat-na, chong-nang, trang-diem, duong-the, duong-moi, mieng-dan, thiet-bi, dich-vu |
| van_de | mun, lo-chan-long, sang-da, cap-am, lam-diu, chong-lao-hoa, chong-nang, tay-te-bao-chet, vung-mat, trang-diem, cham-soc-co-the, thiet-bi |
| thanh_phan | Thành phần nổi bật đọc được từ tên (PDRN, Cica, Vitamin C, BHA, Retinol...) |
| loai_da | da-dau, da-hon-hop, da-kho, da-nhay-cam, moi-loai-da (suy từ van_de) |
| con_hang | true / false / chua-ro (POS 12/11) |
| ton | Tồn từng mã nếu biết (POS 12/11). Trống = còn hàng nhưng chưa rõ số |
| hien_thi | false: hết hàng, dịch vụ. Web còn ẩn thêm sản phẩm chưa có ảnh |
| anh | Tên file ảnh mong đợi trong `public/products/` (xem docs/03) |

**Cần người rà:** `danh_muc`, `van_de`, `thanh_phan`, `loai_da` do Claude gắn tự động theo tên sản phẩm, chưa đối chiếu nhãn. Các dòng có `ghi_chu` cần xác nhận. Tồn từng mã phải lấy từ POS mới nhất (trang quản trị có chức năng nhập CSV KiotViet).

## deals.yaml
Chỉ gồm chương trình ĐANG CHẠY hoặc ĐÃ DUYỆT. Quy tắc hiển thị nằm ở đầu file và phải có unit test. Các mục `can_xac_nhan` là điểm lệch giữa các nguồn, chưa được tự chọn.

## Nguồn
- Bảng giá 10/11/2026: `vive_poup/docs/02-bang-gia.md` (= `claude/VIVE-bang-gia-theo-moc-thoi-gian.md`).
- Giá và chương trình LOPOE chốt 13/11: `claude/VIVE-LOPOE-chuong-trinh-da-chot.md`.
- Khuyến mãi, combo, quà: `claude/VIVE-khuyen-mai-tong-hop.md` (14/11).
- Tồn: POS KiotViet 12/11/2026 14:29 (`claude/VIVE-ton-kho-va-tai-chinh.md`).
