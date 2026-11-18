# qa-pass · W015
- Thời gian: 18/11/2026 10:51 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W015

Claude tự sửa rồi merge PR #13. Lỗi bảo mật nghiêm trọng: tài khoản booth@vive.vn với mật khẩu bất kỳ và mật khẩu vive2026/booth123 vào được; Server Action lấy danh sách và đổi trạng thái không kiểm quyền; trang render danh sách khách (tên, số điện thoại) vào HTML cho mọi người. Đã sửa: lib/nhan-vien/xac-thuc-server.ts (kiểm token Supabase + bảng nhan_vien), action nhận token, chế độ thử chỉ khi không có Supabase thật. QUY TẮC từ nay: trang nhân viên/quản trị không render dữ liệu khách ở server, mọi Server Action kiểm quyền bằng xacThucNhanVien().
