# qa-fail · W074
- Thời gian: 28/11/2026 14:32 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W074
- Link: https://github.com/minhduc1395/vive-swipe/pull/159

QA W074 (PR #159, nhánh w074-giat-tha-tay 4c4fc38): KHÔNG ĐẠT, 1 lỗi chặn + 1 thiếu.

1) LỖI CHẶN, chế độ bọt nước (?bot-nuoc=1 hoặc yaml bot_nuoc.bat: true, sẽ bật sau 29/11 theo QD-BOD-083): trong đoạn giữ khung (giu && pc trong MOC_CANH_AMP.a..het), cuộn đổi nhưng khung đích không đổi, nên daDung = true và nhánh mới bỏ qua cả việc tính lại p. Hậu quả: veAnh(q) không ghép lại chai theo cuộn, hình đứng im.
   Đo (Playwright 390x844 isMobile, build production, ?bot-nuoc=1, cuộn 0.40 -> 0.67 bước 0.03, chờ 700ms, băm pixel canvas):
   - main: 0.55=92554025, 0.58..0.64=398588803, 0.67=366032873 (chai dời/thu nhỏ theo cuộn)
   - W074: 0.55..0.67 = 172354975 cả 5 điểm (đứng im)
   Chế độ thường (bọt nước tắt, như web thật hiện nay): ĐẠT, hình và chữ đổi theo cuộn như main.
   Cách sửa (CuonLopoe3D.tsx, nhánh kd trong khung()): khi daDung mà giu && pc >= MOC_CANH_AMP.a && pc <= MOC_CANH_AMP.het thì vẫn gán p = kep(dich, aAmp, bAmp) trước điều kiện vẽ; điều kiện Math.abs(p - pChuCu) >= 1e-4 sẽ vẽ lại. Thêm e2e: ?bot-nuoc=1, cuộn 2 vị trí trong đoạn giữ, canvas phải khác nhau.
2) THIẾU số đo chứng minh hết giật: số đo trước/sau giống hệt (medianFps 59.9, maxLongTaskMs 0), tức bài đo chưa tái hiện được giật. Đo lại kịch bản "vuốt nhanh rồi thả tay, quán tính 1 giây" với CPU x4, ghi khoảng cách lớn nhất giữa 2 lần vẽ khung mới (ms) và số khung bị lặp trong 1,5 giây sau khi thả tay, trên main và trên nhánh. Ghi vào PR.
Kỹ thuật khác: diff đúng phạm vi (phat-khung.ts, CuonLopoe3D.tsx, docs module, e2e mới), kiem-tra CI xanh. Sửa xong đẩy lên cùng nhánh, PR #159 tự cập nhật; gửi handoff bao-xong.
