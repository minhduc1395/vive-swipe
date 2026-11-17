# design/: bản thiết kế giao diện (tham chiếu để code)

Bản gốc là canvas Design của chủ dự án: https://claude.ai/artifact/RM3NbvY1uZ4pFibYCk1AxG (riêng tư; Antigravity không mở được thì nhờ chủ dự án xuất ảnh hoặc chia sẻ).
Các file `.dc.html` ở đây là mã nguồn của từng màn, chép ra để đọc bố cục, khoảng cách, cỡ chữ, màu (style viết thẳng trong thẻ). Chúng chạy trong trình xem của canvas, mở trực tiếp bằng trình duyệt sẽ không hiện đúng. Đường dẫn ảnh đã đổi sang file trong `public/`.

| File | Màn | Task |
|---|---|---|
| Main.dc.html | 1.1 Màn chào | W010 |
| CauHoi.dc.html | 1.2 Ba câu hỏi (chọn tối đa 3) | W010 |
| Quet.dc.html | 1.3 Deck quẹt (thẻ, 4 nút, hoàn tác, chữ "Hợp da!", hết thẻ) | W011 |
| QuetKeo.dc.html | 1.4 Trạng thái đang kéo phải (dấu THÍCH, nút tim to lên) | W011 |
| TheDeal.dc.html | 1.5 Thẻ deal chen trong deck | W011, W016 |
| ChiTiet.dc.html | 1.6 Bảng chi tiết sản phẩm | W011 |
| DanhMuc.dc.html | 1.7 Danh mục: tìm kiếm, loại sản phẩm, vấn đề da, thương hiệu; bấm vào thì ra danh sách lọc, xếp, xem thêm | W026 |
| DanhMucKetQua.dc.html | 1.8 Cùng màn Danh mục, mở sẵn Mặt nạ xếp theo giảm giá (nhúng DanhMuc với start-cat, start-sort) | W026 |
| DaThich.dc.html | 2.1 Đã thích (lọc, bỏ thích) | W012 |
| Deal.dc.html | 2.2 Deal cho bạn + ô đăng ký email | W016, W018 |
| Gio.dc.html | 2.3 Giỏ: quà dự kiến, thanh tới mốc, dòng combo, tổng ước tính | W012 |
| GiuHang.dc.html | 2.4 Form giữ hàng | W014 |
| MaGiuHang.dc.html | 2.5 Mã giữ hàng + QR | W014 |
| NhanVien.dc.html | 3.1 Trang nhân viên (máy tính bảng 1024×768) | W015 |
| QuanTri.dc.html | 3.2 Quản trị deal, nhập tồn KiotViet | W017 |
| LandingPC.dc.html | 4.1 Landing chiến dịch `/`, mẫu đợt LOPOE Better Balance (co giãn mọi cỡ màn hình). Sản phẩm vẽ bằng CSS là chỗ chờ ảnh tách nền hoặc mô hình 3D | W027 |
| LandingKhoi.dc.html | 4.5 Thư viện khối của landing: 8 loại khối, phần nào đổi mỗi đợt | W027 |
| HieuUngCuon.dc.html | 4.7 Hiệu ứng khi cuộn landing (4 khung: 0%, 25%, 55%, 85%) | W027 |
| Pawlette.dc.html | 4.6 Personal Color cùng Pawlette (bản tạm, sau làm trang riêng) | W029 |
| QuetPC.dc.html | 4.2 Quẹt trên máy tính: thanh trên, 3 cột (gu, deck, deal + giỏ mini) | W028 |
| DanhMucPC.dc.html | 4.3 Danh mục trên máy tính: bộ lọc bên trái, lưới sản phẩm | W028 |
| QuetTablet.dc.html | 4.4 Quẹt trên máy tính bảng ngang: thanh điều hướng dọc bên trái | W028 |

Quy ước rút ra từ thiết kế (bổ sung docs/03):
- Thẻ, khối: bo góc 28px (thẻ deck), 22–24px (khối), 14–16px (ô nhập, ô nhỏ). Nút chính: viên thuốc đen cao 56px.
- Chữ phụ trên nền hồng nhạt hoặc bạc hà nhạt dùng `#5C5C5B` (xám `#737373` chỉ dùng trên nền trắng để đủ độ tương phản 4.5:1).
- Chỗ chưa có ảnh: ô màu nhạt ghi tên thương hiệu bằng chữ in hoa nhỏ.
- Biểu tượng: nét mảnh 1.8px (bộ Feather), không dùng emoji.
- Thanh tab 5 mục: Quẹt · Danh mục · Đã thích · Deal · Giỏ.
- Toàn bộ web chỉ dùng Be Vietnam Pro, không font có chân (chủ dự án chốt 15/11). Chữ nhấn dùng vệt hồng thay cho chữ nghiêng.
- Giỏ mẫu trong Gio.dc.html khớp đúng luật giá (docs/02 mục 4); dùng làm test giao diện cho W012.
