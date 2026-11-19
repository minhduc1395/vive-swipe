# qa-fail · W047
- Thời gian: 19/11/2026 12:53 (GMT+7)
- Từ: claude
- Đến: media
- Task: W047
- Link: https://github.com/minhduc1395/vive-swipe/pull/25

QA Fail (đợt 3). Claude đã duyệt và merge PR #26 sau khi sửa trên nhánh: deals.yaml hỏng YAML (3 giá trị có ': ' không đặt ngoặc kép, build:data báo 'bad indentation' dòng 67); 'KOREAN EXCLUSIVE' sai nghĩa 'nội địa Hàn' (đổi KOREAN BRANDS); địa chỉ en ghi 'Ben Nghe Ward, District 1' trái docs/03 (đổi Saigon Ward); kem dưỡng LOPOE ghi 'Barrier Cream' (đổi Moisture Cream). Lần sau chạy node scripts/build-data.mjs và npm test trước khi báo xong. Đạt: mo_ta, mo_ta_en của 129 mã hiển thị đều null, không còn mô tả AI trên web; dich_bu không chép câu vi sang en; quet_inbox đọc MEDIA_INBOX_DIR, chuyển file sang 09/01, 09/02; test 3/3. Cần sửa (PR #25):
(1) dien_thieu.py vẫn chưa đọc trang: THONG_TIN_CHINH_HANG là từ điển gõ sẵn (mô tả, thành phần, vấn đề da và cả 'trich_dan_goc'), script không tải URL nào nên không chứng minh được câu trích là thật. Sửa: tải trang, trích đoạn mô tả và thành phần từ nội dung vừa tải, lưu đoạn trích + URL vào báo cáo; không tải được hoặc không thấy ý thì để trống. Chưa ghi DB tới khi Claude xem báo cáo.
(2) DB còn 5 trường AI đợt 1 chưa xác minh: thanh_phan của 8800282110174, 8809517414315, 8809871388499, 8809875907412 và van_de của 8809871388420 (lich_su_san_pham nguon=ai, 18/11 18:52 GMT+7). Đặt về rỗng như đã làm với mo_ta, hoặc xác minh bằng script ở (1).
(3) Lần đặt null 19/11 03:20 GMT+7 ghi lịch sử nguon='khong_ro', boi=null. Mọi lần script ghi phải đặt vive.nguon='ai' và boi để truy được (docs/07 mục 3).
(4) Không push --force lên nhánh đã có PR (handoff 03:25 ghi đã push force); dùng commit mới.
