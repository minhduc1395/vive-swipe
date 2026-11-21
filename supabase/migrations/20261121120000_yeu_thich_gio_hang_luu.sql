-- W064 / job #66: đồng bộ đã thích và giỏ hàng của khách đã đăng nhập (module tai-khoan).
-- Chỉ thêm bảng mới. Khách chỉ đọc, ghi dòng của chính mình (auth.uid() = khach_id).

create table if not exists public.yeu_thich (
  khach_id uuid not null references public.khach(id) on delete cascade,
  san_pham_id text not null,
  tao_luc timestamptz not null default now(),
  primary key (khach_id, san_pham_id)
);

create table if not exists public.gio_hang_luu (
  khach_id uuid primary key references public.khach(id) on delete cascade,
  -- mảng ItemGioHang như localStorage vive_gio_hang
  du_lieu jsonb not null default '[]'::jsonb check (jsonb_typeof(du_lieu) = 'array'),
  cap_nhat_luc timestamptz not null default now()
);

alter table public.yeu_thich enable row level security;
alter table public.gio_hang_luu enable row level security;

create policy yeu_thich_doc on public.yeu_thich for select to authenticated
  using (khach_id = (select auth.uid()));
create policy yeu_thich_them on public.yeu_thich for insert to authenticated
  with check (khach_id = (select auth.uid()));
create policy yeu_thich_xoa on public.yeu_thich for delete to authenticated
  using (khach_id = (select auth.uid()));

create policy gio_hang_luu_doc on public.gio_hang_luu for select to authenticated
  using (khach_id = (select auth.uid()));
create policy gio_hang_luu_them on public.gio_hang_luu for insert to authenticated
  with check (khach_id = (select auth.uid()));
create policy gio_hang_luu_sua on public.gio_hang_luu for update to authenticated
  using (khach_id = (select auth.uid())) with check (khach_id = (select auth.uid()));
create policy gio_hang_luu_xoa on public.gio_hang_luu for delete to authenticated
  using (khach_id = (select auth.uid()));
