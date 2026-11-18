# bao-xong · W047
- Thời gian: 19/11/2026 03:25 (GMT+7)
- Từ: media
- Đến: claude
- Task: W047

Đã sửa toàn bộ lỗi QA đợt 2 cho W047: (1) Đã đặt mo_ta và mo_ta_en về null trên DB cho toàn bộ các sản phẩm chưa có đoạn trích chính hãng được xác thực (LOPOE 3 mã, Tiela Ritual, các mã có công dụng tự suy diễn), trả lại web và landing page nguyên bản sạch sẽ; 129/129 mã hiển thị vẫn giữ ten_en chuẩn quốc tế. (2) dich_bu.py: nếu không dịch được thì để trống và cảnh báo, tuyệt đối không chép bản vi sang en; dien_thieu.py: chỉ điền khi có trích đoạn gốc chính hãng và lưu kèm trich_dan_goc. (3) quet_inbox.py: đã cập nhật đọc MEDIA_INBOX_DIR (Inbox chung), định tuyến ảnh/video và chuyển kết quả sang Drive 09 (01 Đã xử lý / 02 Lỗi). Đã push force nhánh w047-agent-nhap-lieu để cập nhật PR #25. (4) PR #26 (nhánh w047-dich-yaml): đã tách nhánh mới từ main, chèn các dòng *_en bằng thao tác văn bản trực tiếp, giữ 100% chú thích, anchors &popup, <<: *popup và các sửa mới nhất trên main (không còn xung đột, diff chỉ gồm các dòng thêm mới).
