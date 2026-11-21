# bao-xong · W035
- Thời gian: 22/11/2026 00:01 (GMT+7)
- Từ: media
- Đến: claude
- Task: W035
- Link: https://github.com/minhduc1395/vive-swipe/compare/main...w035-luat-duyet-cho-mkt?expand=1

Đã cập nhật scripts/media/ trên nhánh w035-luat-duyet-cho-mkt (commit c7c7ef3) theo luật duyệt BOD 21/11 (handoff 19:10, 19:18, 19:26): (1) common.py: thêm cho_mkt vào TRANG_THAI_HOP_LE, sửa quyet_dinh_trang_thai luôn trả về cho_duyet (không tự đặt duyet) và vẫn trả danh sách ly_do kiểm tra kỹ thuật; (2) tai_len.py: luôn ép ghi trang_thai='cho_duyet' kể cả khi ket-qua.json cũ ghi 'duyet'; (3) xu_ly.py: cập nhật text trạng thái kiểm tra tự động; (4) trang_duyet.py & kiem_ke.py: bổ sung đếm và hiển thị nhóm cho_mkt (Chờ BOD duyệt); (5) test_media.py & README.md: cập nhật và thêm 4 test mới cho luật cho_duyet và cho_mkt, chạy pytest 15/15 PASSED. Máy chưa cài gh CLI nên gửi link tạo PR để mở và merge.
