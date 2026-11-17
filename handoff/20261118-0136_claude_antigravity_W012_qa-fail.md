# qa-fail · W012
- Thời gian: 18/11/2026 01:36 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W012
- Link: https://github.com/minhduc1395/vive-swipe/pull/8

QA Fail · PR https://github.com/minhduc1395/vive-swipe/pull/8 (nhánh 792f4f4, tách từ main). Lint, typecheck, unit, build, 42/42 e2e qua. Đã tự đối chiếu các giỏ docs/02 mục 4.3 trên /gio: bộ 3 LOPOE + Rep!el serum 1.230.000 quà kem LOPOE; COMBO PINK 999.000 quà sữa rửa mặt LOPOE; Medicube Triple Collagen 1.135.000 quà ampoule; 6 mặt nạ Uniura 495.000; không hiện giá trị nội bộ của quà. Số đúng. Còn lỗi:

1. Ngày tính giỏ bị viết cứng. `layNgayTinhGio()` trong app/gio trả "2026-11-17" khi hôm nay ngoài 14–29/11, nên sau khi pop-up kết thúc giỏ vẫn áp deal và quà pop-up. Trái docs/02 mục 4.3 ("Ngày 30/11/2026: không deal pop-up nào hiện") và docs/03 mục 7. Sửa: dùng `chuanHoaNgay(new Date())` (giờ Việt Nam), không có ngày dự phòng; e2e cố định ngày bằng `page.clock` thay vì sửa code.
2. Màu ngoài bảng docs/03 mục 1 (cấm thêm màu, kể cả đỏ): `text-[#1F7A4C]` (xanh lá ở dòng tiết kiệm), `text-[#D96B6B]` (đỏ ở biểu tượng giỏ trống và Đã thích trống), `hover:bg-[#BCD7C4]`. Dùng `den`, `xam` hoặc token có sẵn.
3. Chữ: dòng tiết kiệm phải là "Bạn tiết kiệm" (docs/01 mục 2.7), đang ghi "Ưu đãi".
4. Ghi chú LOPOE viết cứng trong app/da-thich ("Mua kèm: còn 186.000"...). Dùng hàm chung `layGhiChuDeal` từ lib/deals (W011 mục 3).
5. Nên sửa: giỏ 6 mặt nạ Uniura hiện giá từng dòng 237.600 và 257.400 (engine chia phần tặng theo dòng), khách khó hiểu. Hiện giá lẻ từng dòng, phần tặng gộp vào "Bạn tiết kiệm".
6. Nhánh: bản mới chép `components/deck/BangChiTiet.tsx` và `lib/kho-luu-tru.ts` của W011 nên xung đột với W011 ở lib/kho-luu-tru.ts. W012 phụ thuộc W011: sau khi W011 merge, rebase W012 lên main (giữ bản lib/kho-luu-tru.ts mở rộng của W012), không chép lại file của task khác.
7. AGENTS.md: khối "nextjs-agent-rules" do `next dev` tự thêm. Claude đã đưa khối này vào main (commit này), nên sau khi rebase thay đổi AGENTS.md trong nhánh sẽ tự hết.

Sửa xong đặt Review, ghi link PR #8 ở dòng Đầu ra.
