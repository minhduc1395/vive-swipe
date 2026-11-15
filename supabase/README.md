# supabase/

Project Supabase của web: **dsrejhghgbvnwgxpdhee** (`https://dsrejhghgbvnwgxpdhee.supabase.co`), chủ dự án tạo 15/11/2026.

| File | Nội dung |
|---|---|
| `migrations/20261115000001_khoi_tao.sql` | Bảng, kiểu, hàm, view `san_pham_hien_thi` và `deal_hien_thi`, RLS (docs/02 mục 3) |
| `migrations/20261115000002_bao_mat_hieu_nang.sql` | Sửa theo Supabase Advisors: hàm kiểm tra quyền chuyển sang schema `private`, gộp policy, thêm index |
| `seed.sql` | 149 sản phẩm, 20 deal. Tạo bằng `python3 scripts/build_seed.py`, không sửa tay |

**Trạng thái (15/11/2026): đã áp lên project.** 2 migration + seed. Kiểm tra trên project: 149 sản phẩm (129 hiện, 4 có ảnh), 20 deal; khách chưa đăng nhập thấy đúng 129 sản phẩm, 13 deal, 0 deal may rủi, 0 mã giữ hàng; mã kiểm (md5) giá và tên khớp `data/`; Security Advisors sạch, Performance chỉ còn ghi chú index chưa dùng (bình thường khi chưa có dữ liệu). 3 deal ẩn chờ chủ dự án: KM-09, KM-10, DC-01. Chạy thử trước đó trên Postgres trong bộ nhớ: không bật được deal may rủi khi chưa đăng ký; số điện thoại thứ 4 bị chặn; mã quá hạn tự chuyển `het_han`.

## Cách áp dụng
1. Authentication → Providers (hoặc Sign In / Providers): bật **Anonymous sign-ins**. Việc này chủ dự án tự bật trên dashboard.
2. Chạy migration rồi seed, một trong hai cách:
   - Claude chạy qua Supabase MCP (cần kết nối Supabase của Claude được cấp quyền vào tổ chức chứa project này).
   - Hoặc dán lần lượt 2 file vào **SQL Editor** trên dashboard Supabase và bấm Run.
3. Tạo tài khoản nhân viên và quản trị trong Authentication → Users, rồi thêm dòng vào bảng `nhan_vien` (`vai_tro` = `nhan_vien` hoặc `quan_tri`).
4. Lấy anon key (Project Settings → API) đưa vào `.env.local` của máy chạy code. Service role key chỉ đặt ở server, không commit, không dán vào chat.
5. Kiểm tra Advisors (Security, Performance) không còn cảnh báo mức cao.

Khi giá hoặc deal đổi: sửa `data/`, chạy lại `python3 scripts/build_products.py ...` và `python3 scripts/build_seed.py`, rồi chạy lại `seed.sql` (an toàn khi chạy nhiều lần; seed không ghi đè các cờ do quản trị bật tắt như `hien_thi`, `da_dang_ky`, `het_qua`).
