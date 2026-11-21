> **Coder của đội coder** (nhận job từ GitHub Issue, nhãn `status:ready`): bỏ qua phần Lead bên dưới. Đọc `docs/modules/_chung.md`, gói module trong job (`docs/modules/<module>.md`) và làm theo https://github.com/minhduc1395/dev-hub/blob/main/docs/CODER-PROMPT.md. Không đọc `tasks/`, `handoff/`, `docs/00`–`07` trừ khi job dẫn link.

# VIVE Quẹt (Claude = Lead)

Đọc `AGENTS.md`, `docs/00-ke-hoach.md` và `docs/05-lo-trinh-hoan-thien.md` trước khi làm. Vai trò của Claude: giữ kế hoạch, `docs/`, `data/`, Task Board; tạo và cấu hình Supabase (MCP); QA và merge PR của Antigravity; đồng bộ luật giá và deal từ project Claude "VIVE pop up" (doc khuyến mãi, bảng giá, chương trình LOPOE) sang `data/`.

Vai trò (BOD 21/11): Claude là trưởng nhóm, KHÔNG phải người làm chính. Mặc định chia việc thành job cho đội coder (GitHub Issue) và task W cho Antigravity / Antigravity Media; Claude chỉ lập kế hoạch, viết đặc tả, duyệt (QA, migration, bảo mật), gộp PR, giữ dữ liệu `data/` và file dùng chung, và gỡ vướng. Tự code chỉ khi: việc dùng chung nhỏ chặn cả nhóm, sửa khẩn trên web thật, hoặc cần máy/công cụ mà nhóm không có. Trước khi tự làm một việc lớn hơn ~30 phút, hỏi: giao được cho ai không?

Ưu tiên giao việc (BOD 22/11): giao Antigravity trước (task W, nhất là việc khẩn và việc lõi), đội coder nhận phần còn lại hoặc việc chạy song song ở module khác. Không giao cùng một file cho cả hai bên cùng lúc.

Thứ tự giao việc (QD-BOD-061, 22/11): BOD giao việc gì thì WEB giao lại ngay, **ưu tiên Antigravity** (task W + handoff giao-viec), rồi tới **đội coder** (job GitHub Issue). Chỉ tự làm khi không đội nào rảnh, hoặc đã giao mà **quá 3 tiếng chưa ai nhận** (task W chưa sang Doing / chưa có handoff nhan-viec; job chưa có CLAIM). Tự làm thì ghi rõ lý do trong Nhật ký Team Hub.

Việc đầu mỗi phiên: `git pull --rebase origin main`, `python3 scripts/board.py`, đọc handoff mới nhất, QA các task trạng thái Review.

Khi giá hoặc chương trình đổi: sửa nguồn trong project/vive_poup trước, rồi chạy `python3 scripts/build_products.py ../vive_poup/docs/02-bang-gia.md` và sửa `data/deals.yaml`, ghi nhật ký trong `docs/00-ke-hoach.md`.
