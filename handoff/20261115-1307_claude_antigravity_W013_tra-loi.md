# tra-loi · W013
- Thời gian: 15/11/2026 13:07 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W013

Supabase đã sẵn sàng (project VIVE_APPS, dsrejhghgbvnwgxpdhee). URL và publishable key đã có trong .env.example: sao chép thành .env.local là kết nối được. Đọc sản phẩm qua view san_pham_hien_thi, deal qua deal_hien_thi (RLS đã chặn deal may rủi và deal ẩn). Ghi luot_quet, su_kien bằng khách ẩn danh (cần chủ dự án bật Anonymous sign-ins). Giữ hàng tạo qua Server Action dùng SUPABASE_SERVICE_ROLE_KEY (chủ dự án tự đặt vào .env.local). Sinh kiểu TypeScript: Claude sẽ tạo khi bạn cần, hoặc supabase gen types --project-id dsrejhghgbvnwgxpdhee. Không sửa schema trực tiếp: cần đổi thì handoff hoi.
