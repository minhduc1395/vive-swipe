-- VIVE Quẹt: khởi tạo database (W003)
-- Soạn: Claude, 15/11/2026. Đặc tả: docs/02-ky-thuat.md mục 3–5.
-- Chạy trên project Supabase dsrejhghgbvnwgxpdhee. Cần bật Anonymous sign-ins (Authentication → Providers).

-- ========== Kiểu dữ liệu ==========
create type public.hanh_dong as enum ('thich', 'bo_qua', 'gio', 'xem_chi_tiet', 'hoan_tac', 'bo_thich');
create type public.trang_thai_giu as enum ('moi', 'da_soan', 'da_lay', 'huy', 'het_han');

-- ========== Bảng ==========
create table public.san_pham (
  id text primary key,                      -- mã vạch hoặc LOPOE-CF / LOPOE-AMP / LOPOE-CR
  barcode text,
  thuong_hieu text not null,
  ten_goc text not null,
  ten_hien_thi text not null,
  quy_cach text,
  gia_goc integer check (gia_goc is null or gia_goc > 0),
  gia_ban integer not null check (gia_ban > 0),
  giam_tren_tag text,
  danh_muc text not null,
  van_de text[] not null default '{}',
  thanh_phan text[] not null default '{}',
  loai_da text[] not null default '{}',
  mo_ta text,
  con_hang text not null default 'true' check (con_hang in ('true', 'false', 'chua-ro')),
  ton integer check (ton is null or ton >= 0),
  hien_thi boolean not null default true,
  anh text,
  pho_bien real not null default 0.5,
  ghi_chu text,
  cap_nhat timestamptz not null default now()
);

create table public.deal (
  id text primary key,
  du_lieu jsonb not null,                   -- nguyên khối từ data/deals.yaml
  trang_thai text not null check (trang_thai in ('DANG_CHAY', 'DA_DUYET', 'DE_XUAT', 'HUY')),
  may_rui boolean not null default false,
  da_dang_ky boolean not null default false,
  hien_thi boolean not null default false,
  het_qua boolean not null default false,
  bat_dau date,
  ket_thuc date,
  cap_nhat timestamptz not null default now(),
  -- Khuyến mại may rủi chưa đăng ký với Sở Công Thương thì không được bật hiển thị
  constraint may_rui_phai_dang_ky check (not (may_rui and not da_dang_ky and hien_thi))
);

create table public.khach (
  id uuid primary key references auth.users (id) on delete cascade,
  tra_loi jsonb,
  ho_so jsonb not null default '{}',
  ten text,
  sdt text,
  email text,
  dong_y_email boolean not null default false,
  email_xac_nhan_luc timestamptz,
  huy_email_luc timestamptz,
  tao_luc timestamptz not null default now()
);

create table public.luot_quet (
  id bigint generated always as identity primary key,
  khach_id uuid not null references public.khach (id) on delete cascade,
  san_pham_id text not null references public.san_pham (id),
  hanh_dong public.hanh_dong not null,
  thoi_gian_xem_ms integer check (thoi_gian_xem_ms is null or thoi_gian_xem_ms >= 0),
  nguon text check (nguon is null or nguon in ('goi_y', 'kham_pha', 'pho_bien', 'danh_muc')),
  vi_tri integer,
  tao_luc timestamptz not null default now()
);
create index luot_quet_khach_idx on public.luot_quet (khach_id, tao_luc desc);
create index luot_quet_san_pham_idx on public.luot_quet (san_pham_id, hanh_dong);

create table public.giu_hang (
  id uuid primary key default gen_random_uuid(),
  ma text not null check (ma ~ '^VIVE-[0-9]{4}$'),
  khach_id uuid references public.khach (id) on delete set null,
  ten text not null,
  sdt text not null check (sdt ~ '^0[0-9]{9}$'),
  email text,
  ngay_den date not null,
  het_han timestamptz not null,
  trang_thai public.trang_thai_giu not null default 'moi',
  tong_uoc_tinh integer not null check (tong_uoc_tinh >= 0),
  qua_du_kien text,
  ghi_chu text,
  cap_nhat_boi uuid references auth.users (id),
  cap_nhat_luc timestamptz,
  tao_luc timestamptz not null default now()
);
-- Mã chỉ cần không trùng trong các mã đang giữ (4 chữ số sẽ được dùng lại về sau)
create unique index giu_hang_ma_dang_giu on public.giu_hang (ma) where trang_thai in ('moi', 'da_soan');
create index giu_hang_ngay_idx on public.giu_hang (ngay_den, trang_thai);
create index giu_hang_sdt_idx on public.giu_hang (sdt, trang_thai);
create index giu_hang_khach_idx on public.giu_hang (khach_id);

create table public.giu_hang_dong (
  id bigint generated always as identity primary key,
  giu_hang_id uuid not null references public.giu_hang (id) on delete cascade,
  san_pham_id text references public.san_pham (id),
  deal_id text references public.deal (id),
  so_luong integer not null check (so_luong > 0),
  gia_uoc_tinh integer not null check (gia_uoc_tinh >= 0),
  check (san_pham_id is not null or deal_id is not null)
);
create index giu_hang_dong_giu_idx on public.giu_hang_dong (giu_hang_id);

create table public.nhan_vien (
  id uuid primary key references auth.users (id) on delete cascade,
  ten text not null,
  vai_tro text not null check (vai_tro in ('nhan_vien', 'quan_tri'))
);

create table public.su_kien (
  id bigint generated always as identity primary key,
  khach_id uuid references public.khach (id) on delete cascade,
  ten text not null,
  du_lieu jsonb,
  tao_luc timestamptz not null default now()
);
create index su_kien_ten_idx on public.su_kien (ten, tao_luc desc);

create table public.email_gui (
  id bigint generated always as identity primary key,
  khach_id uuid references public.khach (id) on delete cascade,
  loai text not null,
  tieu_de text,
  deal_ids text[],
  trang_thai text not null default 'cho',
  gui_luc timestamptz not null default now()
);

-- ========== Hàm phụ ==========
create or replace function public.la_nhan_vien() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nhan_vien where id = (select auth.uid()));
$$;

create or replace function public.la_quan_tri() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nhan_vien where id = (select auth.uid()) and vai_tro = 'quan_tri');
$$;

create or replace function public.hom_nay_vn() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

create or replace function public.dat_cap_nhat() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.cap_nhat := now();
  return new;
end;
$$;
create trigger san_pham_cap_nhat before update on public.san_pham for each row execute function public.dat_cap_nhat();
create trigger deal_cap_nhat before update on public.deal for each row execute function public.dat_cap_nhat();

-- Mỗi số điện thoại tối đa 3 mã đang giữ
create or replace function public.gioi_han_giu_hang() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.giu_hang where sdt = new.sdt and trang_thai in ('moi', 'da_soan')) >= 3 then
    raise exception 'Mỗi số điện thoại giữ tối đa 3 mã cùng lúc' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger giu_hang_gioi_han before insert on public.giu_hang for each row execute function public.gioi_han_giu_hang();

-- Cron: chuyển mã quá hạn sang het_han (gọi từ /api/cron/het-han-giu-hang)
create or replace function public.het_han_giu_hang() returns integer
language sql security definer set search_path = '' as $$
  with doi as (
    update public.giu_hang set trang_thai = 'het_han', cap_nhat_luc = now()
    where trang_thai in ('moi', 'da_soan') and het_han < now()
    returning 1
  )
  select count(*)::integer from doi;
$$;

-- Cron: độ phổ biến (docs/02 mục 5.4); thêm giỏ tính như 2 lượt thích
create or replace function public.cap_nhat_pho_bien() returns void
language sql security definer set search_path = '' as $$
  update public.san_pham sp set pho_bien = coalesce(t.diem, 0.5)
  from (
    select san_pham_id,
      (sum(case hanh_dong when 'thich' then 1 when 'gio' then 2 else 0 end) + 2)::real
      / (sum(case hanh_dong when 'thich' then 1 when 'gio' then 2 when 'bo_qua' then 1 else 0 end) + 4)::real as diem
    from public.luot_quet group by san_pham_id
  ) t
  where t.san_pham_id = sp.id;
$$;
revoke execute on function public.het_han_giu_hang() from public, anon, authenticated;
revoke execute on function public.cap_nhat_pho_bien() from public, anon, authenticated;

-- ========== View cho khách ==========
create view public.deal_hien_thi with (security_invoker = true) as
  select id, du_lieu, het_qua, bat_dau, ket_thuc
  from public.deal
  where trang_thai in ('DANG_CHAY', 'DA_DUYET')
    and hien_thi
    and (not may_rui or da_dang_ky)
    and (bat_dau is null or bat_dau <= public.hom_nay_vn())
    and (ket_thuc is null or ket_thuc >= public.hom_nay_vn());

create view public.san_pham_hien_thi with (security_invoker = true) as
  select id, thuong_hieu, ten_hien_thi, quy_cach, gia_goc, gia_ban, giam_tren_tag, danh_muc,
         van_de, thanh_phan, loai_da, mo_ta, con_hang, anh, pho_bien
  from public.san_pham
  where hien_thi and con_hang <> 'false' and anh is not null;

-- ========== RLS ==========
alter table public.san_pham enable row level security;
alter table public.deal enable row level security;
alter table public.khach enable row level security;
alter table public.luot_quet enable row level security;
alter table public.giu_hang enable row level security;
alter table public.giu_hang_dong enable row level security;
alter table public.nhan_vien enable row level security;
alter table public.su_kien enable row level security;
alter table public.email_gui enable row level security;

-- Sản phẩm: ai cũng đọc được hàng đang hiện; quản trị toàn quyền
create policy san_pham_doc on public.san_pham for select to anon, authenticated
  using (hien_thi or (select public.la_quan_tri()));
create policy san_pham_quan_tri on public.san_pham for all to authenticated
  using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));

-- Deal: khách chỉ đọc deal hợp lệ (cùng điều kiện với view); quản trị toàn quyền
create policy deal_doc on public.deal for select to anon, authenticated
  using (
    (trang_thai in ('DANG_CHAY', 'DA_DUYET') and hien_thi and (not may_rui or da_dang_ky)
      and (bat_dau is null or bat_dau <= public.hom_nay_vn())
      and (ket_thuc is null or ket_thuc >= public.hom_nay_vn()))
    or (select public.la_quan_tri())
  );
create policy deal_quan_tri on public.deal for all to authenticated
  using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));

-- Khách: chỉ dòng của mình
create policy khach_cua_minh on public.khach for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy khach_quan_tri_doc on public.khach for select to authenticated
  using ((select public.la_quan_tri()));

-- Lượt quẹt, sự kiện: khách ghi và đọc của mình; quản trị đọc hết
create policy luot_quet_ghi on public.luot_quet for insert to authenticated
  with check (khach_id = (select auth.uid()));
create policy luot_quet_doc on public.luot_quet for select to authenticated
  using (khach_id = (select auth.uid()) or (select public.la_quan_tri()));
create policy su_kien_ghi on public.su_kien for insert to authenticated
  with check (khach_id = (select auth.uid()));
create policy su_kien_doc on public.su_kien for select to authenticated
  using ((select public.la_quan_tri()));

-- Giữ hàng: tạo qua Server Action (service role, tính lại giá ở server); khách đọc của mình; nhân viên đọc và đổi trạng thái
create policy giu_hang_doc on public.giu_hang for select to authenticated
  using (khach_id = (select auth.uid()) or (select public.la_nhan_vien()));
create policy giu_hang_nhan_vien_sua on public.giu_hang for update to authenticated
  using ((select public.la_nhan_vien())) with check ((select public.la_nhan_vien()));
create policy giu_hang_dong_doc on public.giu_hang_dong for select to authenticated
  using (
    (select public.la_nhan_vien())
    or exists (select 1 from public.giu_hang g where g.id = giu_hang_id and g.khach_id = (select auth.uid()))
  );

-- Nhân viên: tự đọc dòng của mình; quản trị toàn quyền
create policy nhan_vien_doc on public.nhan_vien for select to authenticated
  using (id = (select auth.uid()) or (select public.la_quan_tri()));
create policy nhan_vien_quan_tri on public.nhan_vien for all to authenticated
  using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));

-- Email: chỉ quản trị
create policy email_gui_quan_tri on public.email_gui for all to authenticated
  using ((select public.la_quan_tri())) with check ((select public.la_quan_tri()));

grant select on public.deal_hien_thi, public.san_pham_hien_thi to anon, authenticated;
