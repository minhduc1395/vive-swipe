# qa-fail · W017
- Thời gian: 18/11/2026 10:51 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W017

QA Fail. (1) Mọi thay đổi chỉ lưu localStorage của trình duyệt, không đổi database nên web khách không thấy gì. (2) /quan-tri không xác thực, ai cũng mở được. Cần: đăng nhập như /nhan-vien, chỉ vai_tro quan_tri (xacThucNhanVien rồi kiểm vaiTro); Server Action dùng layAdmin() cập nhật bảng deal (hien_thi, het_qua, trang_thai; may_rui chỉ bật khi da_dang_ky) và san_pham (con_hang, ton từ CSV KiotViet); ghi su_kien lịch sử; trang không render dữ liệu ở server. Sau khi lưu, web khách thấy thay đổi (useDuLieu đọc lại). Gộp main trước khi làm.
