# supabase/

Project Supabase của web: **dsrejhghgbvnwgxpdhee** (`https://dsrejhghgbvnwgxpdhee.supabase.co`), chủ dự án tạo 15/11/2026.

| File | Nội dung |
|---|---|
| `migrations/20261115000001_khoi_tao.sql` | Bảng, kiểu, hàm, view `san_pham_hien_thi` và `deal_hien_thi`, RLS (docs/02 mục 3) |
| `seed.sql` | 149 sản phẩm, 20 deal. Tạo bằng `python3 scripts/build_seed.py`, không sửa tay |

Đã chạy thử trên Postgres trong bộ nhớ (15/11): đủ 149 sản phẩm và 20 deal; hôm nay hiện 12 deal, 4 deal ẩn (KM-09, KM-10, DC-01 chờ chủ dự án) và 4 deal may rủi bị khóa; không bật được deal may rủi khi chưa đăng ký; số điện thoại thứ 4 bị chặn; mã quá hạn tự chuyển `het_han`.

## Cách áp dụng
1. Authentication → Providers: bật **Anonymous sign-ins**.
2. Chạy migration rồi seed, một trong hai cách:
   - Claude chạy qua Supabase MCP (cần kết nối Supabase của Claude được cấp quyền vào tổ chức chứa project này).
   - Hoặc dán lần lượt 2 file vào **SQL Editor** trên dashboard Supabase và bấm Run.
3. Tạo tài khoản nhân viên và quản trị trong Authentication → Users, rồi thêm dòng vào bảng `nhan_vien` (`vai_tro` = `nhan_vien` hoặc `quan_tri`).
4. Lấy anon key (Project Settings → API) đưa vào `.env.local` của máy chạy code. Service role key chỉ đặt ở server, không commit, không dán vào chat.
5. Kiểm tra Advisors (Security, Performance) không còn cảnh báo mức cao.

Khi giá hoặc deal đổi: sửa `data/`, chạy lại `python3 scripts/build_products.py ...` và `python3 scripts/build_seed.py`, rồi chạy lại `seed.sql` (an toàn khi chạy nhiều lần; seed không ghi đè các cờ do quản trị bật tắt như `hien_thi`, `da_dang_ky`, `het_qua`).
