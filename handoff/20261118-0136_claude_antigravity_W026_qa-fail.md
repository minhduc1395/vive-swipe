# qa-fail · W026
- Thời gian: 18/11/2026 01:36 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W026
- Link: https://github.com/minhduc1395/vive-swipe/pull/7

QA Fail · PR https://github.com/minhduc1395/vive-swipe/pull/7 (base w011-deck-quet). Lint, typecheck, unit, build, 54/54 e2e qua. Tìm "vitamin c", "cica", "phan nuoc" đúng; số món từng ô khớp dữ liệu hiển thị (128 món, Mặt nạ 28...); xếp "Đang giảm giá" đưa Rep!el -50% lên đầu. Còn lỗi:

1. Thanh tab không cố định. Ở /danh-muc thanh 5 tab nằm cuối nội dung (y=789 trên màn cao 664; y=1165 ở danh sách Mặt nạ), khách phải cuộn hết mới thấy. Nguyên nhân: khung ngoài `min-h-dvh`, khung trong `h-full overflow-hidden` không có chiều cao cố định nên vùng `flex-1 overflow-y-auto` không cuộn, cả trang dài ra. Sửa: khung `h-dvh`, vùng nội dung `flex-1 min-h-0 overflow-y-auto`, thanh tab ngoài vùng cuộn; thêm e2e kiểm thanh tab nằm trong viewport ở 390×664.
2. Nút Quay lại của trình duyệt (vuốt lùi iPhone, nút Back Android) sai: mở /quet → /danh-muc → chọn Mặt nạ → Back thì về /quet, không về lưới danh mục. Nguyên nhân: `capNhatBoLoc` luôn dùng `router.replace`. Sửa: `router.push` khi đổi loại, vấn đề da, thương hiệu, gửi ô tìm; giữ `replace` khi đổi cách xếp và khi gõ; nút ← trên trang làm giống Back. Thêm e2e dùng `page.goBack()`.
3. Ghi chú deal viết cứng `MAP_GHI_CHU_DEAL` ("Mua kèm: 186.000"...). Tiêu chí "Giá và ghi chú deal khớp engine W008" yêu cầu lấy từ dữ liệu deal đang hiện: dùng hàm chung `layGhiChuDeal` trong lib/deals (xem W011 mục 3), để khi LOPOE-25 tắt hay hết hạn thì ghi chú biến mất.
4. Màu `hover:bg-[#b8d4c0]` ngoài bảng docs/03 mục 1, dùng token có sẵn.
5. Ô tìm hiện ✕ bằng ký tự; không lỗi, nhưng nên dùng svg như các nút khác cho đều nét.

Sau khi W011 merge: rebase nhánh lên main (xung đột duy nhất là tasks/W026.md, giữ bản trên main), push, đặt Review.
