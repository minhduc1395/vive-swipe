# Kế hoạch web: xong trong ngày 22/11/2026

BOD chốt 21/11 (tối): hoàn thiện phần web còn lại trong ngày 22/11. File này là bảng chạy chung cho WEB (khung chat), TU-DONG-E (trực đêm thay WEB, phút :10), đội coder, Antigravity, Antigravity Media và QA. Ai làm xong một mục thì sửa cột "Trạng thái" ngay trong file này (commit `[plan] <mục>: ...`) và ghi 1 dòng Nhật ký Team Hub.

Quy tắc chung
- Không ai push thẳng main trừ file kế hoạch, task, handoff, docs. Code đi qua PR, CI xanh, QA-PASS rồi mới gộp.
- Khóa việc theo TEAM-05 mục 2 (cột N tab Việc). Khóa quá 60 phút coi như hết hạn.
- Gặp việc không rõ: ghi Nhật ký "Nhờ" gửi WEB, làm mục khác, không đoán.
- Không đổi giá, deal, quà khi không có QD. Email để sau (BOD 21/11).

| # | Việc | Ai làm | Khi nào | Trạng thái |
|---|---|---|---|---|
| P1 | Gộp PR #76 (chữ 9 ô trang chủ, job #74) và #77 (thưởng giữ hàng, job #75) | WEB | 21/11 tối | Đang làm |
| P2 | W045 + W046 (trang kho, Excel): sửa mặc định mã mới trong migration, mở PR, chạy 2 migration, QA, gộp. WEB làm thay vì Antigravity đã hết phiên | WEB | 21/11 tối | Chờ |
| P3 | W044 phần nền song ngữ: next-intl, `messages/<vi|en>/<module>.json`, định dạng giá/ngày, nút VI \| EN trên thanh trên | WEB | 21/11 đêm | Chờ |
| P4 | W044 chuyển chữ từng module sang từ điển (5 job đội coder: trang-chu, quet, deal, giu-hang, tai-khoan) | Đội coder | Đêm 22/11 sau P3 | Chờ P3 |
| P5 | #65 đăng nhập xong → gộp → đổi #66 sang `status:ready` | Đội coder, WEB/TU-DONG-E | 22/11 | Đang code |
| P6 | Ảnh/video BOD duyệt trên dashboard → đưa lên web (cách làm bên dưới) | WEB/TU-DONG-E | Mỗi lượt | Chờ BOD |
| P7 | DES-004: 4 ảnh thành phần LOPOE vào khối cuộn (cả 3D máy tính và chuỗi ảnh điện thoại) | WEB | 22/11 | Chờ |
| P8 | W036: tách lại 2 ảnh Beaund (8809953160067, 8809953160081) | Antigravity Media | Khi có phiên | Chờ |
| P9 | QA PR của WEB/Antigravity ở trạng thái Review | QA (1:13, 12:13, 17:13) | Theo lịch | — |
| P10 | BOD duyệt 19 ảnh/video ở dashboard, mục Duyệt bài | BOD | 22/11 | Chờ BOD |

## Cách làm từng mục khi WEB không có mặt

**P1, P5 (gộp PR):** PR có nhãn job `status:qa-pass`, 3 kiểm tra `kiem-tra`, `e2e (pixel-7)`, `e2e (iphone-13)` xanh, chỉ sửa file trong phạm vi job → `gh api -X PUT repos/minhduc1395/vive-swipe/pulls/<n>/merge -f merge_method=squash`. Sau 5 phút mở https://vive-swipe-5byasgvzsa-an.a.run.app kiểm trang chính còn chạy; lỗi thì revert PR và ghi Cảnh báo. Gộp #65 xong: bỏ nhãn `status:draft` ở #66, gắn `status:ready`.

**P2 (nếu WEB chưa làm xong):** nhánh `w045-trang-kho-san-pham` và `w046-nhap-xuat-excel` (W046 dựa trên W045). Migration cần sửa trước khi chạy: trong `20261121183000_rpc_sua_san_pham.sql`, nhánh tạo mã mới bỏ mặc định `'LOPOE'`, `'tinh-chat'`, `1000`, thiếu `thuong_hieu`/`ten_hien_thi`/`gia_ban` thì `raise exception`. Chạy migration trên Supabase chỉ sau khi đọc hết file và chỉ thêm hàm (không xóa bảng/dữ liệu).

**P4 (job đội coder):** WEB tạo 5 issue `status:draft` khi P3 mở PR; P3 gộp xong thì đổi sang `status:ready`. Job `tai-khoan` chỉ ready sau khi #65 gộp.

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
- 21/11 22:10 WEB: lập kế hoạch, bắt đầu P1.
