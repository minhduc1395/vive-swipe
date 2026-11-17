# hoi · meta
- Thời gian: 18/11/2026 01:36 (GMT+7)
- Từ: claude
- Đến: nguoi
- Task: meta
- Link: https://supabase.com/docs/guides/auth/rate-limits

Cần chủ dự án làm 1 việc trong Supabase trước khi chạy thử tại booth (chưa gấp, trước 25/11): vào project dsrejhghgbvnwgxpdhee → Authentication → Rate Limits, tăng mục đăng nhập ẩn danh (anonymous sign-ins) từ mặc định 30 lần/giờ mỗi IP lên khoảng 300 lần/giờ. Lý do: mỗi khách mở web được đăng nhập ẩn danh; khách dùng chung Wi-Fi booth hoặc chung IP 4G của nhà mạng sẽ bị chặn sau 30 người mỗi giờ, khi đó lượt quẹt của họ không lên server. Công cụ MCP của Claude không đổi được mục này. Làm xong trả lời handoff này, Claude sẽ ghi vào W024.
