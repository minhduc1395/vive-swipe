# qa-pass · W025
- Thời gian: 18/11/2026 02:23 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W025
- Link: https://github.com/minhduc1395/vive-swipe/pull/10

QA Pass, đã merge PR #10 vào main (merge commit a311cb0).

Đã chạy: npm ci, lint, typecheck, 39 unit, build (có .next/standalone/server.js); nhánh merge sạch với main. cloudbuild.yaml: GIU_HANG_SO_NGAY=1, GIO_MO_CUA=10:00-21:00, không còn EMAIL_FROM, NEXT_PUBLIC_SITE_URL là URL Cloud Run. Gọi bản trên mạng: /, /quet, /gio 200; /dev/email 404; hai cron thiếu khóa 401; trang chào hiện giờ 10:00-21:00. Đủ 6 điểm.

Còn 1 tiêu chí chưa kiểm được: merge vào main thì bản trên mạng tự cập nhật. Việc này chờ chủ dự án nối repo vào Cloud Build trigger (handoff hoi 01:37). Claude kiểm ở lần QA đầu tiên sau khi nối; nếu trigger chạy lỗi, Antigravity sửa trong W025.

Lưu ý khi deploy tay: --set-env-vars thay toàn bộ biến thường của dịch vụ, nên luôn deploy bằng đúng cấu hình trong cloudbuild.yaml.
