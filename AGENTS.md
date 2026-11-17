# VIVE Quẹt: chỉ dẫn cho mọi agent (Claude, Antigravity)

Repo code của web quẹt sản phẩm VIVE (kiểu Tinder). Claude = Lead (kế hoạch, dữ liệu, QA, phần tài khoản Supabase). Antigravity = Executor (viết code theo task). Chủ dự án = người quyết định.

## Trước khi làm bất cứ việc gì
1. `git pull --rebase origin main`.
2. Đọc `docs/00-ke-hoach.md`, rồi tài liệu đúng phần việc: `docs/01-trai-nghiem.md` (giao diện), `docs/02-ky-thuat.md` (code, database, giá, gợi ý), `docs/03-thuong-hieu-va-noi-dung.md` (màu, chữ, pháp lý).
3. Chạy `python3 scripts/board.py` và đọc 10 file mới nhất trong `handoff/`.
4. Nhận việc có Chủ trì = tên mình, Trạng thái = Todo, Phụ thuộc đã Done, theo Ưu tiên. Nếu phụ thuộc đang Review (đã có PR, chờ QA): được làm tiếp, tạo nhánh từ nhánh của task phụ thuộc, ghi "Dựa trên PR #x" trong mô tả PR. Claude merge theo thứ tự.
5. Giao diện bám theo `design/` (xem `design/README.md`): bố cục, màu, cỡ chữ, khoảng cách lấy từ file `.dc.html` của màn tương ứng.

## Máy Windows
- Lệnh Python: dùng `python` hoặc `py` thay cho `python3` (ví dụ `python scripts/inbox.py antigravity`).
- Tạo handoff bằng `python scripts/new_handoff.py ...` (không cần bash). Terminal mặc định PowerShell là được.
- Đặt repo ngoài thư mục đồng bộ OneDrive (ví dụ `C:\code\vive-swipe`). Git đã có `.gitattributes` giữ xuống dòng kiểu LF, không đổi `core.autocrlf`.

## Vòng làm việc tự động (hộp thư)
Claude và Antigravity nói chuyện qua `handoff/` (lịch sử chung). Chủ dự án không cần chuyển lời.
- **Antigravity, trước khi nhận mỗi việc mới và ngay sau khi báo xong mỗi việc:** `git pull --rebase origin main` rồi `python3 scripts/inbox.py antigravity`. Có mục "SỬA TRƯỚC" (QA Fail) thì sửa hết trước, xong đặt task về Review, handoff `bao-xong` ghi đã sửa gì. Có tin mới (`hoi`, `tra-loi`, `thay-doi-luat`, `canh-bao`) thì làm theo trước khi làm tiếp. Hộp thư trống mới nhận việc Todo tiếp theo.
- **Claude** chạy QA tự động theo lịch (1:13, 12:13, 17:13): `python3 scripts/inbox.py claude`, QA các task Review, ghi `qa-pass` (merge PR) hoặc `qa-fail` (nêu lỗi, cách sửa), bình luận lên PR.
- Không còn việc nào làm được (đều chờ QA hoặc chờ chủ dự án): tạo handoff `trang-thai-phien` rồi dừng.
- Câu hỏi cần chủ dự án quyết: handoff `hoi` gửi `nguoi`, đặt task Blocked, làm việc khác.

## Quy trình (giống repo vive_poup)
- Nhận việc: sửa `tasks/Wxxx.md` sang Doing, tạo handoff `nhan-viec` bằng `scripts/new_handoff.py`, commit, push.
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
