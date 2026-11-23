# qa-pass · QA006
- Thời gian: 23/11/2026 17:21 (GMT+7)
- Từ: claude
- Đến: nguoi
- Task: QA006
- Link: https://vive-swipe-5byasgvzsa-an.a.run.app/deal

QA-006 (Team Hub, QD-BOD-060, QD-BOD-072): ĐẠT trên web thật sau khi WEB áp migration 20261123153000_dong_bo_deal_qd_bod_060.sql (17:22). QA: Pass. Việc trên Team Hub: WEB đóng QA-006.

## Đã kiểm (lượt QA 23/11 17:13, web thật https://vive-swipe-5byasgvzsa-an.a.run.app)
1. Bảng deal Supabase VIVE_APPS (đọc, không ghi): BAC-HOA-DON mốc 800K sữa rửa mặt (giới hạn 30), 1,2 triệu ampoule (giới hạn 15), không còn voucher; KM-09 DA_DUYET, hien_thi = true, nhom_qua cong_them, moc 1.000.000, không giới hạn, an_moc; DC-02 mỗi hóa đơn 1 lượt (tu = 1), thưởng giữ hàng từ 27/11. Các trường giá, quà, giới hạn của 8 deal hiện còn lại khớp data/deals.yaml (không lệch giá).
2. /deal VI (390×844, 1440×900): thẻ 'Quà theo hóa đơn từ 800K' = 800K sữa rửa mặt LOPOE, 1,2 triệu ampoule LOPOE; thẻ 'Voucher nhà hàng Union Square 15%' riêng, chữ không ghi mốc ('cộng thêm với quà LOPOE. Nhân viên xác nhận tại quầy'); vòng quay 'Mỗi hóa đơn tại VIVE được quay 1 lượt...', không còn 300K.
3. /deal EN: 3 thẻ trên đã tiếng Anh (Gift with purchase from 800K, 15% Union Square restaurant voucher, Lucky wheel; quà 1 LOPOE cleansing foam / 1 LOPOE ampoule / 1 lucky-wheel spin).
4. Trang chủ VI + EN (cuộn hết trang): dải thông báo 'Hóa đơn từ 800K tặng sữa rửa mặt LOPOE, từ 1,2 triệu tặng ampoule LOPOE' / 'Spend 800K ... 1.2M for a free LOPOE ampoule'; khối 'Từ 800K, tặng LOPOE' phụ đề 'Mọi nhãn hàng. Gồm cả combo. Từ 1,2 triệu tặng ampoule LOPOE.' Không chỗ nào ghi voucher kèm mốc.
5. Đơn 1.050.000đ (2 serum Celimax 600K + 450K) ở /gio: quà dự kiến 1 sữa rửa mặt LOPOE; thêm 1 lượt quay + 1 voucher 15% Union Square; 'Thêm 150.000đ để nhận 1 ampoule LOPOE'. Server giữ hàng dùng cùng tinhGio trên cùng bảng deal (lib/giu-hang/tao-giu-hang.ts), test tests/qa006-voucher-vong-quay.test.ts + gio-hang.test.ts 22/22 qua trên main 7b3aa5d.
   KHÔNG tạo đơn giữ hàng thật trên web thật (tránh đơn giả ở /nhan-vien và giữ tồn 2 ngày trước chạy thử). Đơn thử thật để W023 chạy thử 26/11 (mã thử HR).

## Lỗi KHÔNG chặn (giá, deal đúng; chỉ chữ EN, thuộc DIR-043)
A. /gio bản EN hiện tên quà tiếng Việt: 'Expected gift: 1 sữa rửa mặt LOPOE', 'Plus: 1 lượt quay vòng quay may mắn', 'Plus: 1 voucher giảm 15% nhà hàng Union Square', 'Add 150,000 VND more to get 1 ampoule LOPOE'. Nguyên nhân: tinhGio trả chuỗi quà bản vi (qua_du_kien, qua_cong_them, moc_tiep_theo.qua); app/(khach)/gio/page.tsx in thẳng, không đổi sang qua_en (dữ liệu đã có qua_en). Cách sửa: job đội coder module deal/gio: tra chuỗi quà về deal/moc rồi dùng quaMoc/quaDeal (lib/deals/ngon-ngu.ts) theo locale; kiểm luôn màn giữ hàng (FormGiuHang, ChiTietMaGiuHang) và /quet. Không đổi tinhGio, không đổi giá.
B. /deal EN còn 6 thẻ tên/điều kiện tiếng Việt: LOPOE-25 ('LOPOE giảm 25% khi mua kèm'), LOPOE-COMBO-2SRM, LOPOE-COMBO-BO3, LOPOE-COMBO-KEM-AMP (cả dòng 'Free Túi sample...'), DC-05 ('Uniura mua 4 tặng 1', '5 miếng giá 396.000...'), COMBO-PINK. Nguyên nhân: bảng deal Supabase của 6 dòng này thiếu ten_en, hook_en, dieu_kien_en, qua_en; data/deals.yaml và supabase/seed.sql đã có. Cách sửa: WEB (khung chat có quyền Supabase) upsert du_lieu 6 dòng từ seed.sql giống migration QA-006 (chỉ thêm chữ EN, giá giữ nguyên), rồi QA kiểm /deal EN.

## Chưa kiểm được
- #140/PR #141 (/nhan-vien không gửi email khách): /nhan-vien cần đăng nhập nhân viên, lượt tự động không có mã; trang trả 200. Code trên main đúng (LEG 15:22 đã đọc). Xác nhận bằng mắt khi WEB/HR chạy thử 26/11.
