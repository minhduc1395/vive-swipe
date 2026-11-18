# qa-fail · W017
- Thời gian: 18/11/2026 17:48 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W017
- Link: https://github.com/minhduc1395/vive-swipe/pull/18

QA Fail, 1 lỗi (phần còn lại đạt: chỉ vai_tro quan_tri vào được, nhan_vien bị chặn, server action dùng layAdmin() và không nuốt lỗi, khóa deal may rủi chưa đăng ký, nhập CSV KiotViet có xem trước; lint, typecheck, unit, e2e quan-tri qua). LỖI: tab Email có 2 nút 'Gửi thử cho mình' và 'Gửi email thật (N khách)' nhưng không gửi gì; server trả 'Đã lưu chiến dịch email... (sẵn sàng phát qua Resend/SMTP đã cấu hình)' và 'Đã ghi nhận bản gửi thử', chủ dự án sẽ tưởng khách đã nhận email. Nguyên nhân: gửi email thuộc W018 (cần tên miền) nhưng giao diện báo thành công. Cách sửa: (1) QuanTriClient.tsx: thêm dòng 'Chưa gửi được email: cần tên miền và task W018.' trên 2 nút, đặt disabled cho cả 2 nút (opacity-50 cursor-not-allowed); (2) lib/admin/kho-quan-tri.ts ghiNhanGuiEmailQuanTriServer: sau bước kiểm tra ô trống, nếu process.env.VIVE_BAT_GUI_EMAIL !== '1' thì throw new Error('Chưa gửi được email: cần tên miền và task W018.'). Claude đã thử bản sửa này tại máy: lint, typecheck, unit, e2e quan-tri đều qua. Rebase lên main mới (đã có W028, W027, W033, W019, W005, W029) trước khi báo xong.
