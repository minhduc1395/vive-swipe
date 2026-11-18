# qa-pass · W027
- Thời gian: 18/11/2026 17:48 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W027
- Link: https://github.com/minhduc1395/vive-swipe/pull/16

QA Pass, đã merge PR #16. Đạt: vật thể đọc từ vat_the (ngang/doc) trong yaml, không tràn khung ở 390/820/1440, điện thoại vật thể trên chữ dưới, đổi đợt bằng yaml, không câu nào nói về quẹt, deal may rủi không hiện. Chưa đạt, chuyển sang W032 (xem tasks/W032.md mục Sửa sau QA): (1) LCP 4,4s ở / và /new-arrival (ngân sách 2,5s); (2) 768–1023px: khối Đang chạy tại booth vỡ chữ giữa từ ('SKINFOO D', giá '396.00 / 0'), khối Personal Color chữ nút 'Tìm hiểu Personal Color' tràn ra ngoài nút 3 dòng, tiêu đề quá to so với cột. Góp ý thêm: lib/chien-dich/index.ts gọi fs.existsSync(dirPath) động nên Turbopack báo 'tracing of the whole project', chỉ đọc đĩa khi dev hoặc dùng đường dẫn tĩnh; khi cuộn giữa 2 mốc ở chế độ dọc, chữ giá đè lên vật thể (cân nhắc mờ vật thể khi chữ đi qua). Claude đã sửa địa chỉ booth trong 2 file yaml thành 'Phường Sài Gòn' theo docs/03.
