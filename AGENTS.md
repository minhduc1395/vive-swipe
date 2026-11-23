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

## Antigravity Media (chat thứ hai, làm ảnh và video)
- Tên trong handoff: `media`; Chủ trì trong task: `Antigravity Media`. Hộp thư: `python scripts/inbox.py media`.
- Làm trong **worktree riêng** để không đụng thư mục của Antigravity code:
  `git worktree add ../vive-swipe-media main`, rồi mở thư mục `vive-swipe-media` trong chat Media. Chép `.env.local` sang.
- Chỉ sửa `scripts/media/`, `scripts/du_lieu/`, `media/`, task W035–W037, W047, W070 và handoff của mình. Không sửa `app/`, `components/`, `lib/`, `data/`, `docs/`.
- QA ảnh/video (BOD 21/11): Claude chỉ duyệt KỸ THUẬT: nét hay mờ, đúng tỷ lệ và kích thước, viền tách nền sạch, nền trong thật, đúng định dạng và dung lượng cho web (ảnh webp/avif, video H.264, tải nhanh trên điện thoại), chữ trong vùng an toàn, đúng mã sản phẩm. Nội dung và hình thức (bố cục, màu, chữ, cảm giác thương hiệu) do BOD duyệt, Claude không Fail vì lý do này.
- Quy trình lên web (BOD 21/11, 2 bước, BOD duyệt cuối): Media tải lên luôn để `cho_duyet` (KHÔNG tự đặt `duyet`, kể cả khi đạt hết tiêu chí tự duyệt cũ docs/06 mục 5) → Claude duyệt kỹ thuật, đạt thì `cho_mkt` (tên giữ nguyên, nghĩa là chờ BOD) và thêm dòng vào tab "Duyệt media web" của Team Hub → BOD duyệt trên dashboard VIVE Điều hành, mục Duyệt bài → Claude chỉ đặt `duyet` (lên web) cho dòng BOD đã Duyệt. Dòng BOD ghi Sửa: Claude chuyển góp ý cho Media.
- Quy trình, nguồn ảnh được phép, quy chuẩn: `docs/06-anh-va-video.md`.

## Lộ trình
Thứ tự làm và nguyên tắc co giãn mọi cỡ màn hình: `docs/05-lo-trinh-hoan-thien.md`. Song ngữ và nhập liệu: `docs/07-song-ngu-va-nhap-lieu.md`. Mọi PR có giao diện phải đạt mục 2.2 (mobile-first, không khóa độ rộng, dvh, nút ≥ 44px, chỉ animate transform/opacity).

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
- Chữ giao diện: tiếng Việt, "thương hiệu Hàn Quốc" (không "local", không "nội địa Hàn" theo LEG-003), không nhắc cửa hàng chính, tài khoản mạng xã hội đúng docs/03.
- Logo: chỉ dùng file trong `public/brand/`, không gõ lại bằng font.
- Không tự thêm thư viện lớn hoặc dịch vụ trả phí; hỏi trước.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
