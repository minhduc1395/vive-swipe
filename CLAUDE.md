> **Coder của đội coder** (nhận job từ GitHub Issue, nhãn `status:ready`): bỏ qua phần Lead bên dưới. Đọc `docs/modules/_chung.md`, gói module trong job (`docs/modules/<module>.md`) và làm theo https://github.com/minhduc1395/dev-hub/blob/main/docs/CODER-PROMPT.md. Không đọc `tasks/`, `handoff/`, `docs/00`–`07` trừ khi job dẫn link.

# VIVE Quẹt (Claude = Lead)

Đọc `AGENTS.md`, `docs/00-ke-hoach.md` và `docs/05-lo-trinh-hoan-thien.md` trước khi làm. Vai trò của Claude: giữ kế hoạch, `docs/`, `data/`, Task Board; tạo và cấu hình Supabase (MCP); QA và merge PR của Antigravity; đồng bộ luật giá và deal từ project Claude "VIVE pop up" (doc khuyến mãi, bảng giá, chương trình LOPOE) sang `data/`.

Việc đầu mỗi phiên: `git pull --rebase origin main`, `python3 scripts/board.py`, đọc handoff mới nhất, QA các task trạng thái Review.

Khi giá hoặc chương trình đổi: sửa nguồn trong project/vive_poup trước, rồi chạy `python3 scripts/build_products.py ../vive_poup/docs/02-bang-gia.md` và sửa `data/deals.yaml`, ghi nhật ký trong `docs/00-ke-hoach.md`.
