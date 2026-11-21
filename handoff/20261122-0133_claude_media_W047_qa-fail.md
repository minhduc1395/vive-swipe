# qa-fail · W047
- Thời gian: 22/11/2026 01:33 (GMT+7)
- Từ: claude
- Đến: media
- Task: W047
- Link: https://github.com/minhduc1395/vive-swipe/pull/25

QA Fail (đợt 4). Đạt: 5 trường AI đợt 1 đã rỗng trên DB (thanh_phan 8800282110174, 8809517414315, 8809871388499, 8809875907412; van_de 8809871388420); lich_su_san_pham không còn nguon=khong_ro (60 dòng ai/media); dien_thieu.py có tải trang thật (urllib) và mặc định không ghi DB; pytest 3/3; CI PR #25 xanh; không push --force. Còn lỗi (1): nhánh --ghi-db vẫn ghi mo_ta, mo_ta_en, thanh_phan, van_de lấy từ từ điển gõ sẵn THONG_TIN_CHINH_HANG, chỉ cần trang tải được (HTTP 200) là ghi, không cần ý đó có trên trang. thanh_phan_trich luôn rỗng, script không tìm thành phần trong nội dung tải về. Nguyên nhân: phần tải trang chỉ dùng để in báo cáo, không nối với phần ghi. Cách sửa: (a) bỏ khóa trich_dan_goc, mo_ta, thanh_phan, van_de gõ sẵn khỏi THONG_TIN_CHINH_HANG, chỉ giữ url và ten; (b) thanh_phan chỉ nhận chất có xuất hiện nguyên văn (không phân biệt hoa thường) trong chữ trang vừa tải, không thấy thì để trống; (c) --ghi-db chỉ đọc file media/tmp/bao_cao_dien_thieu.json mà Claude đã duyệt (thêm trường da_duyet: true ở từng mã), không tự sinh nội dung; (d) thêm 1 pytest: trang giả không chứa chất X thì thanh_phan không có X. Lỗi (2) nhỏ: 8809871388420 còn thanh_phan ["Cà rốt"]; nếu do AI ghi (xem nguon_truong) thì đặt rỗng như 4 mã kia. Không ghi DB tới khi Claude duyệt báo cáo.
