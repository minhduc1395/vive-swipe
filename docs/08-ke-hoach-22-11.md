# Kế hoạch web: xong trong ngày 22/11/2026

BOD chốt 21/11 (tối): hoàn thiện phần web còn lại trong ngày 22/11. File này là bảng chạy chung cho WEB (khung chat), TU-DONG-E (trực đêm thay WEB, phút :10), đội coder, Antigravity, Antigravity Media và QA. Ai làm xong một mục thì sửa cột "Trạng thái" ngay trong file này (commit `[plan] <mục>: ...`) và ghi 1 dòng Nhật ký Team Hub.

Quy tắc chung
- Không ai push thẳng main trừ file kế hoạch, task, handoff, docs. Code đi qua PR, CI xanh, QA-PASS rồi mới gộp.
- Khóa việc theo TEAM-05 mục 2 (cột N tab Việc). Khóa quá 60 phút coi như hết hạn.
- Gặp việc không rõ: ghi Nhật ký "Nhờ" gửi WEB, làm mục khác, không đoán.
- Không đổi giá, deal, quà khi không có QD. Email để sau (BOD 21/11).

| # | Việc | Ai làm | Khi nào | Trạng thái |
|---|---|---|---|---|
| P1 | Gộp PR #76 (chữ 9 ô trang chủ, job #74) và #77 (thưởng giữ hàng, job #75) | WEB | 21/11 tối | Xong 21/11 22:20 |
| P2 | W045 + W046 (trang kho, Excel): sửa mặc định mã mới trong migration, mở PR, chạy 2 migration, QA, gộp. WEB làm thay vì Antigravity đã hết phiên | WEB | 21/11 tối | Xong 21/11 23:00 (PR #78, 2 migration đã chạy) |
| P3 | W044 phần nền song ngữ: next-intl, `messages/<vi|en>/<module>.json`, định dạng giá/ngày, nút VI \| EN trên thanh trên | WEB | 21/11 đêm | PR #79 chờ CI. CI xanh thì gộp (WEB hoặc TU-DONG-E), rồi đổi #80–#83 sang ready |
| P4 | W044 chuyển chữ từng module sang từ điển (5 job đội coder: #80 trang-chu, #81 quet, #82 deal, #83 giu-hang, #84 tai-khoan) | Đội coder | Đêm 22/11 sau P3 | Đã tạo issue (draft). #84 chỉ ready sau khi #65 gộp |
| P5 | #65 đăng nhập xong → gộp → đổi #66 sang `status:ready` | Đội coder, WEB/TU-DONG-E | 22/11 | Đang code |
| P6 | Ảnh/video BOD duyệt trên dashboard → đưa lên web (cách làm bên dưới) | WEB/TU-DONG-E | Mỗi lượt | Chờ BOD |
| P7 | DES-004: 4 ảnh thành phần LOPOE vào khối cuộn (cả 3D máy tính và chuỗi ảnh điện thoại) | WEB | 22/11 | Đang làm: nhánh `des-004-thanh-phan`, đang chụp lại 699 khung |
| P8 | W036: tách lại 2 ảnh Beaund (8809953160067, 8809953160081) | Antigravity Media | Khi có phiên | Chờ |
| P9 | QA PR của WEB/Antigravity ở trạng thái Review | QA (1:13, 12:13, 17:13) | Theo lịch | — |
| P10 | BOD duyệt 19 ảnh/video ở dashboard, mục Duyệt bài | BOD | 22/11 | Chờ BOD |

## Cách làm từng mục khi WEB không có mặt

**P1, P5 (gộp PR):** PR có nhãn job `status:qa-pass`, 3 kiểm tra `kiem-tra`, `e2e (pixel-7)`, `e2e (iphone-13)` xanh, chỉ sửa file trong phạm vi job → `gh api -X PUT repos/minhduc1395/vive-swipe/pulls/<n>/merge -f merge_method=squash`. Sau 5 phút mở https://vive-swipe-5byasgvzsa-an.a.run.app kiểm trang chính còn chạy; lỗi thì revert PR và ghi Cảnh báo. Gộp #65 xong: bỏ nhãn `status:draft` ở #66, gắn `status:ready`.

**P2 (nếu WEB chưa làm xong):** nhánh `w045-trang-kho-san-pham` và `w046-nhap-xuat-excel` (W046 dựa trên W045). Migration cần sửa trước khi chạy: trong `20261121183000_rpc_sua_san_pham.sql`, nhánh tạo mã mới bỏ mặc định `'LOPOE'`, `'tinh-chat'`, `1000`, thiếu `thuong_hieu`/`ten_hien_thi`/`gia_ban` thì `raise exception`. Chạy migration trên Supabase chỉ sau khi đọc hết file và chỉ thêm hàm (không xóa bảng/dữ liệu).

**P3/P4:** PR #79 có `kiem-tra`, `e2e (pixel-7)`, `e2e (iphone-13)` xanh → gộp. Sau đó với #80, #81, #82, #83: bỏ nhãn `status:draft`, gắn `status:ready` (lệnh: `gh api -X DELETE repos/minhduc1395/vive-swipe/issues/<n>/labels/status:draft` rồi `gh api repos/minhduc1395/vive-swipe/issues/<n>/labels -f "labels[]=status:ready"`). #84 làm vậy sau khi #65 gộp. Mỗi PR P4 QA-PASS và CI xanh thì gộp như P1; nếu 2 PR cùng sửa `package-lock.json` hoặc xung đột, gộp cái trước rồi comment cho coder rebase cái sau.

**P6 (đưa ảnh/video BOD đã duyệt lên web):** đọc tab "Duyệt media web" của Team Hub. Dòng có cột G = `Duyệt` và cột I = `Chưa`:
```sql
-- ảnh sản phẩm (cột D = "Ảnh sản phẩm")
update media set trang_thai='duyet' where san_pham_id='<mã>' and trang_thai='cho_mkt' and loai in ('tach_nen','the','the_nho');
-- video (cột D bắt đầu "Video")
update media set trang_thai='duyet' where san_pham_id='<mã>' and trang_thai='cho_mkt' and loai like 'video%';
```
rồi ghi cột I = `Đã lên web <YYYY-MM-DD HH:MM>`. Kiểm: `select anh from san_pham where id='<mã>'` có link (trigger tự gắn). Dòng G = `Sửa`: tạo handoff `qa-fail` gửi `media` (W036 hoặc W037) chép góp ý cột H, ghi cột I = `Trả Media`. Không bao giờ đặt `duyet` cho dòng BOD chưa chọn.

**Media làm xong ảnh mới (P8):** WEB/TU-DONG-E kiểm kỹ thuật (nét, tỷ lệ, viền tách nền, nền trong, dung lượng; xem AGENTS.md mục Antigravity Media), đạt thì `update media set trang_thai='cho_mkt'` và thêm 1 dòng vào tab "Duyệt media web" (cột F = `Đạt`, I = `Chưa`).

## Nhật ký chạy
- 21/11 23:05 WEB: P1, P2 xong. P3 mở PR #79 (đã gộp main). Tạo #80–#84. P7 đang chụp khung.
- 21/11 22:10 WEB: lập kế hoạch, bắt đầu P1.
