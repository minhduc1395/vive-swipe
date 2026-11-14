# VIVE Quẹt: chỉ dẫn cho mọi agent (Claude, Antigravity)

Repo code của web quẹt sản phẩm VIVE (kiểu Tinder). Claude = Lead (kế hoạch, dữ liệu, QA, phần tài khoản Supabase). Antigravity = Executor (viết code theo task). Chủ dự án = người quyết định.

## Trước khi làm bất cứ việc gì
1. `git pull --rebase origin main`.
2. Đọc `docs/00-ke-hoach.md`, rồi tài liệu đúng phần việc: `docs/01-trai-nghiem.md` (giao diện), `docs/02-ky-thuat.md` (code, database, giá, gợi ý), `docs/03-thuong-hieu-va-noi-dung.md` (màu, chữ, pháp lý).
3. Chạy `python3 scripts/board.py` và đọc 10 file mới nhất trong `handoff/`.
4. Nhận việc có Chủ trì = tên mình, Trạng thái = Todo, Phụ thuộc đã Done, theo Ưu tiên.

## Quy trình (giống repo vive_poup)
- Nhận việc: sửa `tasks/Wxxx.md` sang Doing, tạo handoff `nhan-viec` bằng `scripts/new_handoff.sh`, commit, push.
- Làm trên nhánh `wxxx-mo-ta-ngan`, mở Pull Request vào `main`. Không push thẳng code lên `main`. Tài liệu, task, handoff được push thẳng `main`.
- Xong: chạy `npm run lint`, `npm run typecheck`, `npm test` (và `npm run e2e` nếu task có giao diện) đều qua; ghi link PR vào dòng "Đầu ra" (chưa có hosting: ghi cách chạy thử local, docs/02 mục 9); Trạng thái = Review; handoff `bao-xong` nêu đã làm gì, chưa chắc chỗ nào, cách thử.
- Chỉ Claude đặt QA = Pass và merge PR sau khi QA.
- Cuối phiên: handoff `trang-thai-phien`.
- Commit: `[Wxxx] ten-ben: mô tả ngắn`. Không `push --force`. Xung đột: pull --rebase, giữ cả hai thay đổi, hỏi nếu không chắc.

## Quy tắc cứng
- Không tự đổi giá, luật deal, quà, giờ, tên tài khoản. `data/` và `docs/` chỉ Claude hoặc chủ dự án sửa. Cần đổi: handoff `hoi` hoặc `thay-doi-luat`.
- Không đoán số liệu. Thiếu dữ liệu thì handoff `hoi`, đặt task Blocked.
- Giá trong giỏ luôn tính lại ở server khi giữ hàng; không tin giá từ trình duyệt.
- Deal may rủi chưa đăng ký không bao giờ được hiện (có unit test).
- Không commit khóa bí mật (`.env*` đã bị bỏ qua). Khóa do Claude hoặc chủ dự án đưa vào hosting.
- Chữ giao diện: tiếng Việt, "nội địa Hàn" (không "local"), không nhắc cửa hàng chính, tài khoản mạng xã hội đúng docs/03.
- Logo: chỉ dùng file trong `public/brand/`, không gõ lại bằng font.
- Không tự thêm thư viện lớn hoặc dịch vụ trả phí; hỏi trước.
