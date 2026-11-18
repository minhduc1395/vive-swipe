-- Song ngữ (vi + en), nguồn của từng trường, lịch sử sửa, vai trò kho, lô nhập liệu (W043, 18/11/2026)
alter table public.san_pham
  add column if not exists ten_en text,
  add column if not exists mo_ta_en text,
  add column if not exists nguon_truong jsonb not null default '{}'::jsonb;
comment on column public.san_pham.nguon_truong is
  'Nguồn từng trường văn bản: {"ten_en": {"nguon": "ai|nguoi|excel|dong_bo", "boi": "...", "luc": "...", "url": "..."}}. AI không ghi đè trường có nguồn nguoi/excel.';

alter table public.nhan_vien drop constraint if exists nhan_vien_vai_tro_check;
alter table public.nhan_vien add constraint nhan_vien_vai_tro_check check (vai_tro in ('nhan_vien','kho','quan_tri'));

create table if not exists public.lich_su_san_pham (
  id bigint generated always as identity primary key,
  san_pham_id text not null,
  truong text not null,
  gia_tri_cu jsonb,
  gia_tri_moi jsonb,
  nguon text not null,
  boi text,
  luc timestamptz not null default now()
);
create index if not exists lich_su_san_pham_idx on public.lich_su_san_pham (san_pham_id, luc desc);
alter table public.lich_su_san_pham enable row level security;

create table if not exists public.lo_nhap_lieu (
  id uuid primary key default gen_random_uuid(),
  ten_file text not null,
  kenh text not null check (kenh in ('excel_web','drive_ai','tay')),
  trang_thai text not null default 'xem_truoc' check (trang_thai in ('xem_truoc','da_ap_dung','huy','loi')),
  so_dong int, so_moi int, so_sua int, so_loi int,
  ket_qua jsonb,
  boi text,
  tao_luc timestamptz not null default now(),
  ap_dung_luc timestamptz
);
alter table public.lo_nhap_lieu enable row level security;

-- Ghi lịch sử; người ghi đặt set_config('vive.nguon', ..., true) và set_config('vive.boi', ..., true) trong cùng giao dịch
create or replace function private.ghi_lich_su_san_pham() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  truong text;
  cu jsonb := to_jsonb(old);
  moi jsonb := to_jsonb(new);
  nguon text := coalesce(nullif(current_setting('vive.nguon', true), ''), 'khong_ro');
  boi text := nullif(current_setting('vive.boi', true), '');
begin
  foreach truong in array array['thuong_hieu','ten_goc','ten_hien_thi','ten_en','quy_cach','danh_muc','van_de','thanh_phan','loai_da','mo_ta','mo_ta_en','gia_goc','gia_ban','hien_thi','barcode'] loop
    if cu -> truong is distinct from moi -> truong then
      insert into public.lich_su_san_pham (san_pham_id, truong, gia_tri_cu, gia_tri_moi, nguon, boi)
      values (new.id, truong, cu -> truong, moi -> truong, nguon, boi);
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists ghi_lich_su_san_pham on public.san_pham;
create trigger ghi_lich_su_san_pham after update on public.san_pham
for each row execute function private.ghi_lich_su_san_pham();

-- Kho file nhập liệu (riêng tư)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nhap-lieu', 'nhap-lieu', false, 20971520,
  array['text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- View cho web: thêm cột tiếng Anh ở cuối (giữ nguyên các cột cũ)
create or replace view public.san_pham_hien_thi as
select id, thuong_hieu, ten_hien_thi, quy_cach, gia_goc, gia_ban, giam_tren_tag, danh_muc, van_de,
       thanh_phan, loai_da, mo_ta, con_hang, anh, pho_bien, ten_en, mo_ta_en
from public.san_pham
where hien_thi and con_hang <> 'false' and anh is not null;
