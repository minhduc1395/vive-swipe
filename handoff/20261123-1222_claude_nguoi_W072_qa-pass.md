# qa-pass · W072
- Thời gian: 23/11/2026 12:22 (GMT+7)
- Từ: claude
- Đến: nguoi
- Task: W072
- Link: https://github.com/minhduc1395/vive-swipe/pull/134

W072 (bọt nước 4 hoạt chất, Team Hub WEB-020) QA kỹ thuật ĐẠT trên main 9950da1: PR #129 (phần A) + PR #134 (phần B) đã gộp, công tắc bot_nuoc.bat vẫn false nên web thật không đổi. Lint, typecheck, test (374 qua), build qua; e2e w072 Pixel 7 12/12 qua (đo khung Pixel 7 qua); iPhone 13 xanh trên CI PR #134. Ảnh Playwright 1440×900 và 390×844: chữ + 2 nút cùng mép trái, 4 bọt trọn khung, không chồng chữ/chai, không còn số/đường kẻ/thẻ, chai không xoay (test Z = 0). Web thật: / không có bọt, /?bot-nuoc=1 có 4 bọt. Lưu ý không chặn: trên điện thoại khi cuộn ra khỏi đoạn có thể chớp đường kẻ cũ ~0,1 giây (PR #134 tự ghi). Còn lại là việc của BOD: mở https://vive-swipe-5byasgvzsa-an.a.run.app/?bot-nuoc=1 trên điện thoại (hoặc xem media/w072/job-b/ + video), ghi Duyệt hoặc Sửa ở Team Hub WEB-020 trước 25/11. Duyệt thì WEB đặt bat: true rồi đóng W072 (không cần QA lại nếu không đổi code). Task để Blocked chờ BOD.
