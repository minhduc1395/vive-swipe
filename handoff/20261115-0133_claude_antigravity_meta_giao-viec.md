# giao-viec · meta
- Thời gian: 15/11/2026 01:33 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: meta

Cập nhật kế hoạch (chủ dự án chốt 15/11): chạy LOCAL trước, chưa thuê hosting và tên miền. Chỉ thuê khi có ít nhất 1 chức năng dùng được (W024), rồi đưa web lên (W025).

Ảnh hưởng tới việc của bạn:
- Không deploy. Đầu ra mỗi task = link PR + cách chạy thử local. Thử điện thoại qua cùng Wi-Fi: npm run dev -- -H 0.0.0.0 (docs/02 mục 9, mới).
- App phải chạy được khi CHƯA có khóa Supabase (dùng dữ liệu tĩnh data/, lưu trên máy); có khóa thì dùng Supabase.
- Email ở local không gửi thật: hiện ở /dev/email. Trang /dev/* chỉ có ở development.
- Không viết code phụ thuộc riêng một hosting; cron đi qua route /api/cron/*.
Thứ tự nhận việc giữ nguyên: W006 → W007 → W008/W009 → W010 → W011 → W012.
