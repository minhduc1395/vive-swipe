# qa-fail · W025
- Thời gian: 18/11/2026 02:14 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W025
- Link: https://github.com/minhduc1395/vive-swipe/pull/10

QA Fail · PR https://github.com/minhduc1395/vive-swipe/pull/10. Lint, typecheck, unit, build (có `.next/standalone/server.js`) qua. Claude gọi thử bản trên mạng: `/`, `/quet`, `/bat-dau` trả 200; `/dev/email` 404; hai cron thiếu khóa trả 401 (GET và POST). Dockerfile, `.dockerignore`, `--set-secrets` đúng docs/02 mục 10; khóa publishable trong cloudbuild.yaml được phép công khai. Còn lỗi:

1. `GIU_HANG_SO_NGAY=2` trong `--set-env-vars`. Hạn giữ hàng chưa chốt (kế hoạch mục 8, ý 5: đề xuất đến 21:00 ngày hôm sau); `.env.example` và `lib/cau-hinh.ts` mặc định 1. AGENTS.md: không tự đổi luật giữ hàng. Sửa về 1.
2. `EMAIL_FROM=noreply@viveswipe.com` là tên miền tự đặt, VIVE không sở hữu. Bỏ biến này khỏi lệnh deploy cho tới khi chủ dự án có tên miền và xác thực Resend (W018).
3. `_NEXT_PUBLIC_SITE_URL: ""` để trống. Đặt `https://vive-swipe-5byasgvzsa-an.a.run.app` (docs/02 mục 10; đổi khi có tên miền), vì link email và QR sẽ dùng biến này.
4. `GIO_MO_CUA=10:00 - 21:00` có dấu cách, khác định dạng `.env.example` (`10:00-21:00`). Dùng đúng định dạng.
5. Tiêu chí "Merge một PR nhỏ vào main thì bản trên mạng tự cập nhật" đang đánh dấu xong nhưng chưa kiểm được: `cloudbuild.yaml` chưa có trên main, và chính handoff `hoi` 01:37 nhờ chủ dự án nối repo vào Cloud Build trigger. Bỏ dấu [x]; sau khi PR này merge và trigger nối xong, kiểm lại rồi đánh dấu.
6. Xung đột với main ở `next.config.ts` (W010 đã thêm `allowedDevOrigins`). Merge main vào nhánh, giữ một dòng `allowedDevOrigins` và thêm `output: "standalone"`.

Ghi chú: Antigravity đang có quyền gcloud để deploy tay, nên khi sửa xong có thể deploy lại bằng cấu hình mới để biến môi trường trên dịch vụ cũng đúng (kiểm bằng `gcloud run services describe vive-swipe --region asia-northeast1`).
