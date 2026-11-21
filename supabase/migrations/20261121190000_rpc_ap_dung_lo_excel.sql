-- W046: Áp dụng lô nhập Excel trong một giao dịch duy nhất và cập nhật lo_nhap_lieu (docs/07 mục 4.2)
-- Chú ý: phụ thuộc migration W045 (private.sua_san_pham); gửi Claude duyệt trước khi chạy lên Supabase.

create or replace function private.ap_dung_lo_excel(
  p_lo_id uuid,
  p_danh_sach jsonb,
  p_vai_tro text,
  p_boi text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lo public.lo_nhap_lieu%rowtype;
  v_vai_tro text := coalesce(nullif(p_vai_tro, ''), 'kho');
  v_item jsonb;
  v_thay_doi jsonb;
  v_dem integer := 0;
begin
  if p_lo_id is null then
    raise exception 'Thiếu mã lô nhập liệu (p_lo_id)';
  end if;

  if v_vai_tro not in ('kho', 'quan_tri') then
    raise exception 'Vai trò % không có quyền áp dụng lô Excel', v_vai_tro;
  end if;

  if jsonb_typeof(p_danh_sach) <> 'array' then
    raise exception 'Danh sách áp dụng phải là mảng JSON';
  end if;

  select * into v_lo from public.lo_nhap_lieu where id = p_lo_id for update;
  if not found then
    raise exception 'Không tìm thấy lô nhập liệu %', p_lo_id;
  end if;
  if v_lo.trang_thai = 'da_ap_dung' then
    raise exception 'Lô nhập liệu % đã được áp dụng trước đó', p_lo_id;
  end if;

  for v_item in select * from jsonb_array_elements(p_danh_sach) loop
    v_thay_doi := coalesce(v_item -> 'thay_doi', '{}'::jsonb) || jsonb_build_object('_vai_tro', v_vai_tro);
    perform private.sua_san_pham(v_item ->> 'id', v_thay_doi, 'excel', coalesce(p_boi, ''));
    v_dem := v_dem + 1;
  end loop;

  update public.lo_nhap_lieu
  set
    trang_thai = 'da_ap_dung',
    ap_dung_luc = now(),
    boi = coalesce(nullif(p_boi, ''), boi)
  where id = p_lo_id
  returning * into v_lo;

  return jsonb_build_object(
    'lo_id', v_lo.id,
    'trang_thai', v_lo.trang_thai,
    'so_ma_da_ghi', v_dem,
    'ap_dung_luc', v_lo.ap_dung_luc
  );
end;
$$;

create or replace function public.ap_dung_lo_excel(
  p_lo_id uuid,
  p_danh_sach jsonb,
  p_vai_tro text,
  p_boi text
) returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.ap_dung_lo_excel(p_lo_id, p_danh_sach, p_vai_tro, p_boi);
$$;

revoke execute on function private.ap_dung_lo_excel(uuid, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.ap_dung_lo_excel(uuid, jsonb, text, text) from public, anon, authenticated;
grant execute on function private.ap_dung_lo_excel(uuid, jsonb, text, text) to service_role;
grant execute on function public.ap_dung_lo_excel(uuid, jsonb, text, text) to service_role;
