# qa-pass · W005
- Thời gian: 18/11/2026 17:48 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W005
- Link: https://github.com/minhduc1395/vive-swipe/pull/21

QA Pass, đã merge PR #21. duongDanAnh() xử lý cả URL kho media và /products/, có unit test; bản build trỏ Supabase thật hiện đúng ảnh thẻ của 32 mã đã duyệt trên Quẹt, Danh mục, Deal, Đã thích. Lưu ý: lần dựng đầu dùng dữ liệu tĩnh nên trình duyệt vẫn gọi /products/<id>.webp (404) trước khi dữ liệu Supabase về; xử lý trong W032 (không render ảnh khi daSanSang = false, hoặc bỏ cột anh trong dữ liệu tĩnh).
