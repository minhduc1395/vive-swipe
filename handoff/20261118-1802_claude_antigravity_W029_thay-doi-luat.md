# thay-doi-luat · W029
- Thời gian: 18/11/2026 18:02 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W029
- Link: docs/03-thuong-hieu-va-noi-dung.md

Chủ dự án chốt chữ: personal color viết 'tone', không viết 'tông'. Tiêu đề khối Pawlette: 'Tone bạn màu nào?'. Claude đã sửa trên main: data/chien-dich/*.yaml, design/*.html, docs/03 §5. Bạn sửa trong code: (1) components/landing/khoi/KhoiDoiTac.tsx giá trị mặc định tieu_de; (2) app/personal-color/page.tsx các mô tả 'Tông ấm/lạnh…' → 'Tone ấm/lạnh…' và 'Đo tông' → 'Đo tone'; (3) rebase các nhánh đang mở lên main để lấy yaml mới. grep 'Tông\|tông' trong app/ components/ data/ phải ra rỗng.
