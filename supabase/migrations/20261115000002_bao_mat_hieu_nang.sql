-- VIVE Quẹt: sửa theo Supabase Advisors sau khi áp 20261115000001 (15/11/2026)
-- 1) Hàm kiểm tra nhân viên/quản trị chuyển sang schema riêng, không gọi được qua API /rpc
-- 2) Mỗi bảng chỉ còn 1 policy SELECT cho mỗi vai trò (bớt policy chồng nhau)
-- 3) Thêm index cho các khóa ngoại còn thiếu
-- 4) Thu quyền gọi hàm rls_auto_enable (hàm mặc định của Supabase, chỉ dùng cho event trigger)

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.la_nhan_vien() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nhan_vien where id = (select auth.uid()));
$$;

create or replace function private.la_quan_tri() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nhan_vien where id = (select auth.uid()) and vai_tro = 'quan_tri');
$$;

revoke execute on function private.la_nhan_vien() from public;
revoke execute on function private.la_quan_tri() from public;
grant execute on function private.la_nhan_vien() to anon, authenticated;
grant execute on function private.la_quan_tri() to anon, authenticated;

-- Bỏ policy cũ
drop policy san_pham_doc on public.san_pham;
drop policy san_pham_quan_tri on public.san_pham;
drop policy deal_doc on public.deal;
drop policy deal_quan_tri on public.deal;
drop policy khach_cua_minh on public.khach;
drop policy khach_quan_tri_doc on public.khach;
drop policy luot_quet_doc on public.luot_quet;
drop policy su_kien_doc on public.su_kien;
drop policy giu_hang_doc on public.giu_hang;
drop policy giu_hang_nhan_vien_sua on public.giu_hang;
drop policy giu_hang_dong_doc on public.giu_hang_dong;
drop policy nhan_vien_doc on public.nhan_vien;
drop policy nhan_vien_quan_tri on public.nhan_vien;
drop policy email_gui_quan_tri on public.email_gui;

drop function public.la_nhan_vien();
drop function public.la_quan_tri();

-- Sản phẩm
create policy san_pham_doc on public.san_pham for select to anon, authenticated
  using (hien_thi or (select private.la_quan_tri()));
create policy san_pham_them on public.san_pham for insert to authenticated with check ((select private.la_quan_tri()));
create policy san_pham_sua on public.san_pham for update to authenticated
  using ((select private.la_quan_tri())) with check ((select private.la_quan_tri()));
create policy san_pham_xoa on public.san_pham for delete to authenticated using ((select private.la_quan_tri()));

-- Deal: khách chỉ đọc deal hợp lệ (cùng điều kiện với view deal_hien_thi)
create policy deal_doc on public.deal for select to anon, authenticated
  using (
    (trang_thai in ('DANG_CHAY', 'DA_DUYET') and hien_thi and (not may_rui or da_dang_ky)
      and (bat_dau is null or bat_dau <= public.hom_nay_vn())
      and (ket_thuc is null or ket_thuc >= public.hom_nay_vn()))
    or (select private.la_quan_tri())
  );
create policy deal_them on public.deal for insert to authenticated with check ((select private.la_quan_tri()));
create policy deal_sua on public.deal for update to authenticated
  using ((select private.la_quan_tri())) with check ((select private.la_quan_tri()));
create policy deal_xoa on public.deal for delete to authenticated using ((select private.la_quan_tri()));

-- Khách
create policy khach_doc on public.khach for select to authenticated
  using (id = (select auth.uid()) or (select private.la_quan_tri()));
create policy khach_them on public.khach for insert to authenticated with check (id = (select auth.uid()));
create policy khach_sua on public.khach for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy khach_xoa on public.khach for delete to authenticated using (id = (select auth.uid()));

-- Lượt quẹt, sự kiện (policy ghi giữ nguyên)
create policy luot_quet_doc on public.luot_quet for select to authenticated
  using (khach_id = (select auth.uid()) or (select private.la_quan_tri()));
create policy su_kien_doc on public.su_kien for select to authenticated
  using ((select private.la_quan_tri()));

-- Giữ hàng
create policy giu_hang_doc on public.giu_hang for select to authenticated
  using (khach_id = (select auth.uid()) or (select private.la_nhan_vien()));
create policy giu_hang_nhan_vien_sua on public.giu_hang for update to authenticated
  using ((select private.la_nhan_vien())) with check ((select private.la_nhan_vien()));
create policy giu_hang_dong_doc on public.giu_hang_dong for select to authenticated
  using (
    (select private.la_nhan_vien())
    or exists (select 1 from public.giu_hang g where g.id = giu_hang_id and g.khach_id = (select auth.uid()))
  );

-- Nhân viên
create policy nhan_vien_doc on public.nhan_vien for select to authenticated
  using (id = (select auth.uid()) or (select private.la_quan_tri()));
create policy nhan_vien_them on public.nhan_vien for insert to authenticated with check ((select private.la_quan_tri()));
create policy nhan_vien_sua on public.nhan_vien for update to authenticated
  using ((select private.la_quan_tri())) with check ((select private.la_quan_tri()));
create policy nhan_vien_xoa on public.nhan_vien for delete to authenticated using ((select private.la_quan_tri()));

-- Email
create policy email_gui_quan_tri on public.email_gui for all to authenticated
  using ((select private.la_quan_tri())) with check ((select private.la_quan_tri()));

-- Index cho khóa ngoại
create index if not exists email_gui_khach_idx on public.email_gui (khach_id);
create index if not exists giu_hang_cap_nhat_boi_idx on public.giu_hang (cap_nhat_boi);
create index if not exists giu_hang_dong_deal_idx on public.giu_hang_dong (deal_id);
create index if not exists giu_hang_dong_san_pham_idx on public.giu_hang_dong (san_pham_id);
create index if not exists su_kien_khach_idx on public.su_kien (khach_id);

-- Hàm mặc định của Supabase cho event trigger ensure_rls: không cần gọi qua API
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
