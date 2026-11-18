# qa-pass · W014
- Thời gian: 18/11/2026 10:51 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W014

Claude tự sửa rồi merge PR #12. Lỗi gốc (lưu ý cho các task sau): (1) đơn giữ hàng ghi bằng laySupabase() (khóa công khai) nên RLS chặn, lỗi bị nuốt, đơn chỉ nằm trong bộ nhớ máy chủ, mất khi Cloud Run tắt; (2) id dạng gh-... trong khi cột là uuid; (3) trang /giu-hang/[ma] hiện đơn giả cho mọi mã; (4) giá tính từ dữ liệu tĩnh. Đã sửa: lib/supabase/admin.ts (khóa service role, chỉ server), kho-giu-hang ném lỗi rõ, kho tạm trong bộ nhớ chỉ cho dev/e2e, giá lấy từ database, crypto.randomUUID(), thử lại khi trùng mã, che số điện thoại và email trên trang mã. QUY TẮC từ nay: mọi ghi/đọc dữ liệu riêng tư ở server dùng layAdmin(), không bao giờ nuốt lỗi ghi.
