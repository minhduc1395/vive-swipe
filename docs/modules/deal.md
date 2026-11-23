# Module: deal

## Mục đích
Hiển thị deal và tính giỏ hàng theo luật giá, quà.

## Thư mục và file chính
- `lib/deals/`: hàm thuần `tinhGio`, deal nào được hiện, quà, mốc gợi ý. Đặc tả bắt buộc: `docs/02-ky-thuat.md` mục 4. Test: `tests/gio-hang.test.ts`, `deal-*.test.ts`, `deals-ghi-chu.test.ts`.
- `components/deal/`: `TheDeal.tsx`, `NganKeoDeal.tsx`.
- Trang: `app/(khach)/deal`, `app/(khach)/gio`.
- Dữ liệu: `data/deals.yaml` và bảng Supabase `deal` (dùng chung, chỉ WEB sửa theo doc của SALE).

## Quy ước riêng
- Từ 20/11 chỉ 3 ưu đãi (QD-SALE-012): LOPOE −25% khi mua kèm; quà theo mốc 800K và 1,2 triệu (chỉ mốc cao nhất); hóa đơn từ 300K quay 1 lượt. Vòng quay được chạy (QD-DIR-018).
- Combo giá cố định là mã giá trên POS.
- Mọi đổi về luật deal phải có test.

## Lịch sử ngắn
- 2026-11-20 W062 (QA-003): deal web theo 3 ưu đãi (PR #50).
- 2026-11-21 #53: bước 6 của tinhGio duyệt mọi deal `nhom_qua: cong_them` (không gõ cứng id); /gio hiện "Thêm: …" (lượt quay DC-02).
- 2026-11-21 #63 (W064): trang /deal và /gio theo bảng nội thất: `hong-nhat`→`kem`, `bac-ha`→`be`, `bac-ha-nhat`→`oliu-nhat`; nhãn loại thẻ deal `be`/`oliu-nhat`/`cat`; khối tổng tiền `/gio` nền `kem`.
- 2026-11-21 #82 (W044): /deal, /gio, ngăn kéo deal song ngữ VI | EN (`messages/*/deal.json`, `lib/deals/ngon-ngu.ts`). Chữ trong lib nhận `t` (mặc định bản vi). Tên/điều kiện/hook/quà en đọc qua trường `*_en`, cần schema deal (WEB) cho qua trường này.
- 2026-11-23 #144 (QA-007 A): bản EN hiện tên quà tiếng Anh ở /gio, giữ hàng, /quet qua `dichQua` (lib/deals/ngon-ngu.ts); tinhGio và đơn giữ hàng vẫn chuỗi vi.
