# VIVE Quẹt: đặc tả kỹ thuật

Phiên bản 1.0 · 15/11/2026. Antigravity code theo file này. Muốn đổi kiến trúc hoặc quy tắc giá thì tạo handoff `hoi` cho Claude trước.

## 1. Công nghệ
| Phần | Chọn | Ghi chú |
|---|---|---|
| Khung | Next.js bản ổn định mới nhất, App Router, TypeScript strict | Server Components cho trang đọc; Server Actions cho ghi |
| Giao diện | Tailwind CSS, Framer Motion (kéo thẻ), `next/font/google` | Không thêm bộ UI lớn |
| Kiểm dữ liệu | zod | Mọi input từ khách và CSV |
| Database | Supabase (Postgres, Auth, Storage, RLS) | Thư viện `@supabase/ssr` |
| Khách | Supabase anonymous sign-in | Mỗi máy một `khach_id`, không cần đăng nhập |
| Nhân viên, quản trị | Supabase Auth email + mật khẩu, vai trò trong bảng `nhan_vien` | |
| Email | Resend + React Email | Cần tên miền đã xác thực |
| Việc định kỳ | Vercel Cron hoặc pg_cron gọi route `/api/cron/*` có khóa bí mật | Hết hạn giữ hàng, tính độ phổ biến |
| Test | Vitest (logic `lib/`), Playwright (luồng chính, khung iPhone 13 và Pixel 7) | |
| Hosting | Vercel Pro hoặc Cloudflare | Chờ chủ dự án chọn |

Biến môi trường (`.env.example`, không commit khóa thật): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `GIO_MO_CUA` (ví dụ `10:00-21:00`), `GIU_HANG_DEN_GIO` (mặc định `21:00`), `GIU_HANG_SO_NGAY` (mặc định `1`).

## 2. Cấu trúc thư mục
```
app/
  page.tsx                  màn chào
  bat-dau/                  3 câu hỏi
  quet/  da-thich/  deal/  gio/
  giu-hang/  giu-hang/[ma]/
  chinh-sach/
  nhan-vien/                cần đăng nhập vai trò nhan_vien
  quan-tri/                 cần vai trò quan_tri
  api/cron/het-han-giu-hang/route.ts
  api/cron/pho-bien/route.ts
components/                 the-san-pham, deck, thanh-tab, ...
lib/
  deals/                    hàm thuần: hien-thi.ts, gio-hang.ts, qua.ts, goi-y-moc.ts
  goi-y/                    hàm thuần: dac-trung.ts, ho-so.ts, diem.ts, deck.ts
  supabase/                 client, server, kiểu dữ liệu sinh tự động
  dinh-dang.ts              định dạng tiền "186.000"
supabase/migrations/        SQL
scripts/
  build_products.py         tạo data/products.csv (Claude giữ)
  import-seed.ts            đưa data/ vào Supabase
data/                       products.csv, deals.yaml
public/brand/  public/products/
tests/
```

## 3. Database (bản nháp, Claude tạo migration đầu tiên ở W003)
```sql
create table san_pham (
  id text primary key,                -- mã vạch hoặc LOPOE-CF/AMP/CR
  barcode text,
  thuong_hieu text not null,
  ten_goc text not null,
  ten_hien_thi text not null,
  quy_cach text,
  gia_goc integer,                    -- null = không có giá gạch
  gia_ban integer not null,
  giam_tren_tag text,
  danh_muc text not null,
  van_de text[] default '{}',
  thanh_phan text[] default '{}',
  loai_da text[] default '{}',
  mo_ta text,
  con_hang text default 'true',       -- true / false / chua-ro
  ton integer,
  hien_thi boolean default true,
  anh text,                           -- đường dẫn ảnh; null thì không hiện trong deck
  pho_bien real default 0.5,          -- tính hằng đêm (mục 5.4)
  cap_nhat timestamptz default now()
);

create table deal (
  id text primary key,
  du_lieu jsonb not null,             -- nguyên khối từ deals.yaml
  trang_thai text not null,           -- DANG_CHAY / DA_DUYET / DE_XUAT / HUY
  may_rui boolean default false,
  da_dang_ky boolean default false,
  hien_thi boolean default false,
  het_qua boolean default false,      -- true thì dùng nhánh khi_het_qua
  bat_dau date, ket_thuc date,
  cap_nhat timestamptz default now()
);

create table khach (
  id uuid primary key references auth.users,   -- anonymous user
  tra_loi jsonb,                       -- 3 câu hỏi
  ho_so jsonb default '{}',            -- trọng số sở thích (mục 5)
  ten text, sdt text, email text,
  dong_y_email boolean default false,
  email_xac_nhan_luc timestamptz,
  huy_email_luc timestamptz,
  tao_luc timestamptz default now()
);

create type hanh_dong as enum ('thich','bo_qua','gio','xem_chi_tiet','hoan_tac','bo_thich');
create table luot_quet (
  id bigserial primary key,
  khach_id uuid references khach,
  san_pham_id text references san_pham,
  hanh_dong hanh_dong not null,
  thoi_gian_xem_ms integer,
  nguon text,                          -- goi_y / kham_pha / pho_bien
  vi_tri integer,
  tao_luc timestamptz default now()
);

create type trang_thai_giu as enum ('moi','da_soan','da_lay','huy','het_han');
create table giu_hang (
  id uuid primary key default gen_random_uuid(),
  ma text unique not null,             -- VIVE-4821
  khach_id uuid references khach,
  ten text not null, sdt text not null, email text,
  ngay_den date not null,
  het_han timestamptz not null,
  trang_thai trang_thai_giu default 'moi',
  tong_uoc_tinh integer, qua_du_kien text,
  ghi_chu text,
  cap_nhat_boi uuid, cap_nhat_luc timestamptz,
  tao_luc timestamptz default now()
);
create table giu_hang_dong (
  giu_hang_id uuid references giu_hang on delete cascade,
  san_pham_id text, deal_id text,      -- dòng combo có deal_id
  so_luong integer not null,
  gia_uoc_tinh integer not null
);

create table nhan_vien (id uuid primary key references auth.users, ten text, vai_tro text check (vai_tro in ('nhan_vien','quan_tri')));
create table su_kien (id bigserial primary key, khach_id uuid, ten text not null, du_lieu jsonb, tao_luc timestamptz default now());
create table email_gui (id bigserial primary key, khach_id uuid, loai text, tieu_de text, deal_ids text[], trang_thai text, gui_luc timestamptz default now());
```
**RLS:** khách (anonymous) chỉ đọc `san_pham` có `hien_thi` và `deal` hiển thị được (mục 4.1, làm bằng view); chỉ đọc và ghi dòng của chính mình ở `khach`, `luot_quet`, `su_kien`, `giu_hang`. Nhân viên đọc và đổi trạng thái `giu_hang`. Quản trị toàn quyền. Tạo giữ hàng qua Server Action (kiểm giỏ và tính lại giá ở server, không tin giá từ máy khách).

**Mã giữ hàng:** `VIVE-` + 4 chữ số ngẫu nhiên, không trùng với mã đang ở trạng thái `moi` hoặc `da_soan`. QR chứa URL `/nhan-vien?ma=VIVE-4821`. Hết hạn: `ngay_den` + `GIU_HANG_DEN_GIO`, giờ Việt Nam (Asia/Ho_Chi_Minh).

## 4. Quy tắc giá và deal (`lib/deals`, hàm thuần, có test)
Nguồn luật: `data/deals.yaml` (đọc chú thích đầu file). Không tự thêm luật.

### 4.1 Deal nào được hiện
`hienThi(deal, homNay) = trang_thai ∈ {DANG_CHAY, DA_DUYET} ∧ hien_thi ∧ (¬may_rui ∨ da_dang_ky) ∧ bat_dau ≤ homNay ≤ ket_thuc`.
Test bắt buộc: mọi deal `may_rui: true, da_dang_ky: false` không bao giờ hiện, kể cả khi `hien_thi` bị bật nhầm.

### 4.2 Tính giỏ: `tinhGio(gio, sanPham, deals, homNay)`
Đầu ra: các dòng (giá gốc dòng, giá sau ưu đãi, deal áp dụng), `tong_le`, `tong_tam_tinh`, `tiet_kiem`, `qua_du_kien`, `moc_tiep_theo`, `goi_y_doi_combo`, `canh_bao`.
1. Chỉ dùng deal hiện được (4.1). Sản phẩm `hien_thi = false` không cho vào giỏ.
2. **Combo** là một dòng riêng khách chủ động thêm (từ trang Deal hoặc gợi ý đổi combo). Giá = `gia_combo`, hoặc `khi_het_qua.gia_combo` nếu `het_qua`. Không tự gộp món lẻ thành combo, chỉ gợi ý.
3. **LOPOE-25:** nếu giỏ có ít nhất 1 dòng không phải LOPOE (sản phẩm hoặc combo của nhãn khác), mỗi món LOPOE lẻ lấy `gia_uu_dai`. Không áp cho dòng combo LOPOE và KM-10.
4. **DC-05 Uniura:** cứ đủ 5 miếng Uniura (trộn loại được) thì 5 miếng đó tính 396.000; phần lẻ tính 99.000 một miếng.
5. **Quà theo hóa đơn** (`nhom_qua: hoa_don` và quà của combo LOPOE): mỗi hóa đơn chỉ 1 quà, chọn quà có giá trị cao nhất cho khách. Theo bảng tra nhanh 13/11, quà của combo LOPOE cũng tính là "quà theo hóa đơn"; Claude đã hỏi lại chủ dự án, khi chưa có trả lời thì giữ cách hiểu này vì không hứa quá.
   - KM-13: giỏ có đúng 1 món LOPOE lẻ (không combo): tra `bang_qua` theo giá khách trả cho món đó.
   - KM-11: giỏ có dòng combo Mask Party.
   - KM-08: cộng tiền sau ưu đãi của các dòng nhãn Medicube, Celimax, SKINFOOD; lấy mốc cao nhất đạt được.
   - BAC-HOA-DON: `tong_tam_tinh` đạt mốc.
   - Giá trị quà để so sánh (nội bộ, không hiện cho khách): sữa rửa mặt LOPOE 249.000, ampoule 419.000, kem 549.000, muối tắm 49.000, tẩy tế bào chết salTherapy 130.000, sữa tắm salTherapy 150.000, mặt nạ Uniura 99.000.
   - Deal đánh dấu `het_qua` thì bỏ quà đó (hoặc dùng nhánh `khi_het_qua`).
6. **Cộng thêm** (không tính vào 1 quà): KM-09 khi hóa đơn trên 1.000.000 (đang ẩn), DC-06 khi mua Age-R Booster.
7. **Mốc tiếp theo:** với KM-08 và BAC-HOA-DON, nếu còn thiếu từ 1 đến 30% giá trị mốc thì trả `{deal, con_thieu, qua, goi_y}`; `goi_y` là tối đa 3 món trong Đã thích có giá ≥ `con_thieu`, rẻ nhất trước (với KM-08 chỉ lấy món nhãn Medicube, Celimax, SKINFOOD).
8. Luôn trả `canh_bao: "uoc_tinh"` để giao diện ghi chú giá ước tính.

### 4.3 Bộ test tối thiểu (`tests/gio-hang.test.ts`)
| Giỏ | Kỳ vọng |
|---|---|
| 1 sữa rửa mặt LOPOE | 249.000; quà KM-13 muối tắm |
| Sữa rửa mặt LOPOE + Rep!el Gel Cleanser (209.000) | LOPOE 186.000, tổng 395.000; không quà |
| Combo LOPOE bộ 3 | 911.000; quà 1 kem LOPOE. Khi `het_qua`: 889.000, không quà |
| Combo LOPOE bộ 3 + 1 Rep!el serum 319.000 | LOPOE-25 không áp cho combo; tổng 1.230.000; quà: kem LOPOE (549K) cao hơn ampoule mốc 1,2 triệu (419K) |
| COMBO PINK | 999.000; quà sữa rửa mặt LOPOE (KM-08 mốc 700K) |
| Medicube Triple Collagen toner + serum | 1.135.000; quà ampoule LOPOE (KM-08 mốc 1,1 triệu cao hơn BAC-HOA-DON mốc 800K) |
| 6 miếng Uniura bất kỳ | 396.000 + 99.000 = 495.000 |
| Celimax serum 600.000 | `moc_tiep_theo`: KM-08 còn thiếu 100.000 |
| Deal `may_rui` có `hien_thi: true` | Không hiện |
| Ngày 30/11/2026 | Không deal pop-up nào hiện |

## 5. Gợi ý v1 (`lib/goi-y`, hàm thuần, chạy trên máy khách)
Khoảng 130 sản phẩm, nên tải hết danh sách và chấm điểm tại chỗ. Lượt quẹt gửi về server theo lô (tối đa 5 giây một lần, giữ hàng đợi khi mất mạng).

### 5.1 Đặc trưng sản phẩm
Mỗi sản phẩm là tập khóa có trọng số:
| Khóa | Ví dụ | Trọng số |
|---|---|---|
| `dm:` danh mục | `dm:toner-pad` | 1,0 |
| `vd:` vấn đề da | `vd:lo-chan-long` | 1,0 |
| `tp:` thành phần | `tp:Cica` | 0,8 |
| `th:` thương hiệu | `th:Medicube` | 0,6 |
| `ld:` loại da | `ld:da-dau` | 0,5 |
| `gia:` khoảng giá | `gia:duoi-200k`, `gia:200-500k`, `gia:tren-500k` | 0,5 |

### 5.2 Hồ sơ khách
`ho_so` là bảng khóa → trọng số, khởi đầu từ 3 câu hỏi: loại da +1,5 cho `ld:`; mỗi mối quan tâm +1,5 cho `vd:` (Trang điểm → `dm:trang-diem`, Thiết bị → `dm:thiet-bi`, Chăm sóc cơ thể → `dm:duong-the`); ngân sách +1,0 cho `gia:`. "Da nhạy cảm" thêm +0,5 `vd:lam-diu`.

Cập nhật mỗi hành động: `ho_so[k] += η · h · w_k` cho mọi khóa k của sản phẩm.
| Hành động | h |
|---|---|
| thích | +1,0 |
| thêm giỏ | +2,0 |
| giữ hàng (mỗi món) | +3,0 |
| xem chi tiết ≥ 3 giây | +0,3 |
| bỏ qua | −0,4 (riêng `gia:` −0,6, `th:` −0,3) |
| bỏ thích | −1,0 |
| hoàn tác | đảo ngược đúng lần cập nhật trước |
`η = max(0,3; 1/(1 + 0,05·n))` với n là số lượt đã quẹt. Kẹp mỗi trọng số trong [−3; 5].

### 5.3 Điểm và xếp deck
`diem(p) = hop(p) + 0,6·deal(p) + 0,3·(pho_bien(p) − 0,5) − phat(p)`
- `hop(p) = Σ ho_so[k]·w_k / √(Σ w_k²)` trên các khóa của p.
- `deal(p)` trong [0; 1]: `min(1; %giảm/50)`; cộng 0,3 nếu p nằm trong deal đang hiện (combo, KM-08, LOPOE-25); kẹp 1.
- `phat(p)`: 0,5 nếu cùng thương hiệu với 2 thẻ ngay trước; 0,3 nếu cùng danh mục với 2 thẻ ngay trước.
- Loại khỏi deck: đã thích, đã vào giỏ, đã bỏ qua trong 7 ngày, `hien_thi = false`, `con_hang = false`, chưa có ảnh.
- **Khám phá:** cứ 5 thẻ thì 1 thẻ chọn ngẫu nhiên (trọng số theo `pho_bien`) trong các sản phẩm chưa xem, ngoài top 20. Ghi `nguon = kham_pha`.
- **Khách chưa trả lời câu hỏi:** xếp theo `0,6·deal + pho_bien`, vẫn áp chống lặp.
- Xếp lại sau mỗi lượt quẹt (chỉ thay các thẻ phía sau thẻ đang hiện, không đổi thẻ khách đang nhìn).

### 5.4 Độ phổ biến (cron hằng đêm)
`pho_bien(p) = (so_thich + 2) / (so_thich + so_bo_qua + 4)` trên toàn bộ khách, thêm giỏ tính như 2 lượt thích.

### 5.5 Sau pop-up (chưa làm)
Gợi ý "người thích A cũng thích B" từ ma trận cùng thích khi có trên khoảng 2.000 lượt thích; trộn vào `diem` với trọng số nhỏ rồi tăng dần.

## 6. Deal cho bạn và email
`diem_deal(d, khach) = lien_quan(d) × gia_tri(d)`
- `lien_quan`: trung bình 2 giá trị `hop(p)` cao nhất trong các sản phẩm của deal (với KM-08: sản phẩm 3 nhãn khách đã thích hoặc có trong giỏ; LOPOE-25: sản phẩm LOPOE), đưa về [0; 1].
- `gia_tri`: combo = tiết kiệm / tổng giá lẻ; quà theo mốc = giá trị quà / mốc (dùng bảng 4.2 bước 5, chỉ dùng nội bộ).
- Trang Deal cho bạn: deal hiện được, xếp giảm dần theo `diem_deal`.
- **"Deal tốt" để gửi email** (sau pop-up chạy tự động): `gia_tri ≥ 0,15` và `lien_quan ≥ 0,5`, deal mới hoặc đổi sau email gần nhất, khách đã xác nhận email và chưa hủy, tối đa 2 email mỗi 7 ngày. Bản đầu: quản trị chọn deal và bấm gửi cho nhóm khách có `lien_quan ≥ 0,5`.

## 7. Sự kiện đo lường (`su_kien.ten`)
`mo_web`, `xong_cau_hoi`, `bo_qua_cau_hoi`, `quet_10`, `xem_deal`, `them_combo`, `bat_dau_giu_hang`, `giu_hang_xong`, `dang_ky_email`, `xac_nhan_email`, `huy_email`, `bam_kenh` (`du_lieu.kenh`), `loi`. Kèm `du_lieu.nguon_vao` từ tham số `?src=` (qr-ban, ig-bio, tiktok-bio, fb, ads).

## 8. Chất lượng
- Lighthouse trên điện thoại: hiệu năng ≥ 85, truy cập ≥ 95. Ảnh WebP, tải trước 3 thẻ kế tiếp.
- Mất mạng: deck vẫn chạy với dữ liệu đã tải; lượt quẹt xếp hàng đợi.
- Không lưu SĐT, email ở localStorage. localStorage chỉ dùng cho giỏ và đọc ghi trong try/catch.
- Giữ hàng: chống gửi trùng (khóa nút, khóa idempotency), giới hạn 3 mã đang giữ mỗi SĐT.
- Mọi số tiền định dạng `186.000` (dấu chấm hàng nghìn), không dùng "đ" sau số trên thẻ; trong giỏ ghi "186.000đ".
