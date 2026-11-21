-- W045: RPC sửa thông tin sản phẩm song ngữ an toàn theo nguồn và vai trò (docs/07 mục 3)
-- Chú ý: gửi Claude duyệt trước khi áp lên Supabase production.

create or replace function private.sua_san_pham(
  p_id text,
  p_thay_doi jsonb,
  p_nguon text,
  p_boi text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_thay_doi jsonb := coalesce(p_thay_doi, '{}'::jsonb);
  v_vai_tro text := coalesce(nullif(v_thay_doi ->> '_vai_tro', ''), 'quan_tri');
  v_url_truong jsonb := case
    when jsonb_typeof(v_thay_doi -> '_url_truong') = 'object' then v_thay_doi -> '_url_truong'
    else '{}'::jsonb
  end;
  v_cu public.san_pham%rowtype;
  v_cu_json jsonb;
  v_moi public.san_pham%rowtype;
  v_nguon_truong jsonb;
  v_luc text := to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  v_ap_dung jsonb := '{}'::jsonb;
  v_cac_truong text[] := array[
    'thuong_hieu', 'ten_goc', 'ten_hien_thi', 'ten_en', 'quy_cach',
    'danh_muc', 'van_de', 'thanh_phan', 'loai_da', 'mo_ta', 'mo_ta_en',
    'barcode', 'anh', 'ghi_chu'
  ];
  v_truong text;
  v_nguon_cu text;
  v_gia_tri_cu jsonb;
  v_co_du_lieu_cu boolean;
  v_entry jsonb;
  v_da_xem text;
  v_hien_thi boolean;
begin
  if p_id is null or btrim(p_id) = '' then
    raise exception 'Thiếu mã sản phẩm (id)';
  end if;

  if p_nguon not in ('nguoi', 'excel', 'ai', 'dong_bo') then
    raise exception 'Nguồn % không hợp lệ (chỉ nhận nguoi, excel, ai, dong_bo)', p_nguon;
  end if;

  -- Đặt cấu hình phiên trong giao dịch để trigger ghi_lich_su_san_pham ghi đúng nguồn & người sửa
  perform set_config('vive.nguon', p_nguon, true);
  perform set_config('vive.boi', coalesce(p_boi, ''), true);

  select * into v_cu from public.san_pham where id = p_id for update;

  if not found then
    -- Mã mới phải đủ thương hiệu, tên, danh mục, giá bán; không tự điền giá trị mặc định (Claude 21/11)
    if nullif(btrim(coalesce(v_thay_doi ->> 'thuong_hieu', '')), '') is null
       or coalesce(nullif(btrim(coalesce(v_thay_doi ->> 'ten_hien_thi', '')), ''), nullif(btrim(coalesce(v_thay_doi ->> 'ten_goc', '')), '')) is null
       or nullif(btrim(coalesce(v_thay_doi ->> 'danh_muc', '')), '') is null
       or coalesce(nullif(v_thay_doi ->> 'gia_ban', '')::integer, 0) <= 0 then
      raise exception 'Mã mới % cần đủ thương hiệu, tên, danh mục và giá bán', p_id;
    end if;
    -- AI không tạo mã mới; kho được nhập giá cho mã mới (mã mới luôn ẩn tới khi quản trị bật)
    if p_nguon = 'ai' then
      raise exception 'AI không được tạo mã sản phẩm mới';
    end if;

    -- Tạo mã sản phẩm mới: kho và AI luôn mặc định hien_thi = false
    v_hien_thi := case
      when v_vai_tro = 'quan_tri' and p_nguon <> 'ai'
        then coalesce((v_thay_doi ->> 'hien_thi')::boolean, false)
      else false
    end;

    v_nguon_truong := '{}'::jsonb;
    foreach v_truong in array v_cac_truong loop
      if v_thay_doi ? v_truong and jsonb_typeof(v_thay_doi -> v_truong) <> 'null' then
        v_entry := jsonb_build_object(
          'nguon', p_nguon,
          'boi', coalesce(p_boi, ''),
          'luc', v_luc
        );
        if v_url_truong ? v_truong and nullif(v_url_truong ->> v_truong, '') is not null then
          v_entry := v_entry || jsonb_build_object('url', v_url_truong ->> v_truong);
        end if;
        v_nguon_truong := jsonb_set(v_nguon_truong, array[v_truong], v_entry, true);
      end if;
    end loop;

    insert into public.san_pham (
      id, barcode, thuong_hieu, ten_goc, ten_hien_thi, ten_en,
      quy_cach, gia_goc, gia_ban, giam_tren_tag, danh_muc,
      van_de, thanh_phan, loai_da, mo_ta, mo_ta_en,
      con_hang, ton, hien_thi, anh, ghi_chu, nguon_truong, cap_nhat
    ) values (
      p_id,
      nullif(v_thay_doi ->> 'barcode', ''),
      btrim(v_thay_doi ->> 'thuong_hieu'),
      coalesce(nullif(v_thay_doi ->> 'ten_goc', ''), nullif(v_thay_doi ->> 'ten_hien_thi', ''), p_id),
      coalesce(nullif(v_thay_doi ->> 'ten_hien_thi', ''), nullif(v_thay_doi ->> 'ten_goc', ''), p_id),
      nullif(v_thay_doi ->> 'ten_en', ''),
      nullif(v_thay_doi ->> 'quy_cach', ''),
      case when (v_thay_doi -> 'gia_goc') is null or jsonb_typeof(v_thay_doi -> 'gia_goc') = 'null' then null else (v_thay_doi ->> 'gia_goc')::integer end,
      (v_thay_doi ->> 'gia_ban')::integer,
      nullif(v_thay_doi ->> 'giam_tren_tag', ''),
      btrim(v_thay_doi ->> 'danh_muc'),
      coalesce(array(select jsonb_array_elements_text(coalesce(v_thay_doi -> 'van_de', '[]'::jsonb))), '{}'::text[]),
      coalesce(array(select jsonb_array_elements_text(coalesce(v_thay_doi -> 'thanh_phan', '[]'::jsonb))), '{}'::text[]),
      coalesce(array(select jsonb_array_elements_text(coalesce(v_thay_doi -> 'loai_da', '[]'::jsonb))), '{}'::text[]),
      nullif(v_thay_doi ->> 'mo_ta', ''),
      nullif(v_thay_doi ->> 'mo_ta_en', ''),
      coalesce(nullif(v_thay_doi ->> 'con_hang', ''), 'true'),
      case when (v_thay_doi -> 'ton') is null or jsonb_typeof(v_thay_doi -> 'ton') = 'null' then 0 else (v_thay_doi ->> 'ton')::integer end,
      v_hien_thi,
      nullif(v_thay_doi ->> 'anh', ''),
      nullif(v_thay_doi ->> 'ghi_chu', ''),
      v_nguon_truong,
      now()
    ) returning * into v_moi;

    foreach v_truong in array v_cac_truong loop
      if v_thay_doi ? v_truong and jsonb_typeof(v_thay_doi -> v_truong) <> 'null' then
        insert into public.lich_su_san_pham (san_pham_id, truong, gia_tri_cu, gia_tri_moi, nguon, boi)
        values (v_moi.id, v_truong, null, to_jsonb(v_moi) -> v_truong, p_nguon, p_boi);
      end if;
    end loop;

    return to_jsonb(v_moi);
  end if;

  -- Cập nhật sản phẩm đã có. Kho và AI không được sửa giá hoặc trạng thái hiển thị
  if (p_nguon = 'ai' or v_vai_tro = 'kho') and (
    v_thay_doi ? 'gia_goc' or
    v_thay_doi ? 'gia_ban' or
    v_thay_doi ? 'hien_thi'
  ) then
    raise exception 'Vai trò kho hoặc AI không có quyền sửa giá và trạng thái hiển thị';
  end if;

  v_cu_json := to_jsonb(v_cu);
  v_nguon_truong := coalesce(v_cu.nguon_truong, '{}'::jsonb);

  foreach v_truong in array v_cac_truong loop
    if v_thay_doi ? v_truong then
      v_nguon_cu := coalesce(v_nguon_truong -> v_truong ->> 'nguon', 'dong_bo');
      v_gia_tri_cu := v_cu_json -> v_truong;
      v_co_du_lieu_cu := v_gia_tri_cu is not null
        and jsonb_typeof(v_gia_tri_cu) <> 'null'
        and not (jsonb_typeof(v_gia_tri_cu) = 'string' and btrim(v_gia_tri_cu #>> '{}') = '')
        and not (jsonb_typeof(v_gia_tri_cu) = 'array' and jsonb_array_length(v_gia_tri_cu) = 0);

      -- Luật ghi đè docs/07 §3: AI không bao giờ ghi đè nguoi hoặc excel khi trường đã có dữ liệu
      if p_nguon = 'ai' and v_nguon_cu in ('nguoi', 'excel') and v_co_du_lieu_cu then
        continue;
      end if;

      v_ap_dung := jsonb_set(v_ap_dung, array[v_truong], coalesce(v_thay_doi -> v_truong, 'null'::jsonb), true);
      v_entry := jsonb_build_object(
        'nguon', p_nguon,
        'boi', coalesce(p_boi, ''),
        'luc', v_luc
      );
      if v_url_truong ? v_truong and nullif(v_url_truong ->> v_truong, '') is not null then
        v_entry := v_entry || jsonb_build_object('url', v_url_truong ->> v_truong);
      end if;
      v_nguon_truong := jsonb_set(v_nguon_truong, array[v_truong], v_entry, true);
    end if;
  end loop;

  -- Đánh dấu "Đã xem" các trường AI -> nguồn chuyển thành nguoi
  if jsonb_typeof(v_thay_doi -> 'da_xem') = 'array' then
    for v_da_xem in select jsonb_array_elements_text(v_thay_doi -> 'da_xem') loop
      if v_da_xem = any(v_cac_truong) then
        v_entry := jsonb_build_object(
          'nguon', 'nguoi',
          'boi', coalesce(p_boi, ''),
          'luc', v_luc
        );
        if nullif(v_nguon_truong -> v_da_xem ->> 'url', '') is not null then
          v_entry := v_entry || jsonb_build_object('url', v_nguon_truong -> v_da_xem ->> 'url');
        end if;
        v_nguon_truong := jsonb_set(v_nguon_truong, array[v_da_xem], v_entry, true);
      end if;
    end loop;
  end if;

  update public.san_pham
  set
    barcode = case when v_ap_dung ? 'barcode' then nullif(v_ap_dung ->> 'barcode', '') else barcode end,
    thuong_hieu = case when v_ap_dung ? 'thuong_hieu' then coalesce(nullif(v_ap_dung ->> 'thuong_hieu', ''), thuong_hieu) else thuong_hieu end,
    ten_goc = case when v_ap_dung ? 'ten_goc' then coalesce(nullif(v_ap_dung ->> 'ten_goc', ''), ten_goc) else ten_goc end,
    ten_hien_thi = case when v_ap_dung ? 'ten_hien_thi' then coalesce(nullif(v_ap_dung ->> 'ten_hien_thi', ''), ten_hien_thi) else ten_hien_thi end,
    ten_en = case when v_ap_dung ? 'ten_en' then nullif(v_ap_dung ->> 'ten_en', '') else ten_en end,
    quy_cach = case when v_ap_dung ? 'quy_cach' then nullif(v_ap_dung ->> 'quy_cach', '') else quy_cach end,
    danh_muc = case when v_ap_dung ? 'danh_muc' then coalesce(nullif(v_ap_dung ->> 'danh_muc', ''), danh_muc) else danh_muc end,
    van_de = case when v_ap_dung ? 'van_de' then coalesce(array(select jsonb_array_elements_text(v_ap_dung -> 'van_de')), '{}'::text[]) else van_de end,
    thanh_phan = case when v_ap_dung ? 'thanh_phan' then coalesce(array(select jsonb_array_elements_text(v_ap_dung -> 'thanh_phan')), '{}'::text[]) else thanh_phan end,
    loai_da = case when v_ap_dung ? 'loai_da' then coalesce(array(select jsonb_array_elements_text(v_ap_dung -> 'loai_da')), '{}'::text[]) else loai_da end,
    mo_ta = case when v_ap_dung ? 'mo_ta' then nullif(v_ap_dung ->> 'mo_ta', '') else mo_ta end,
    mo_ta_en = case when v_ap_dung ? 'mo_ta_en' then nullif(v_ap_dung ->> 'mo_ta_en', '') else mo_ta_en end,
    anh = case when v_ap_dung ? 'anh' then nullif(v_ap_dung ->> 'anh', '') else anh end,
    ghi_chu = case when v_ap_dung ? 'ghi_chu' then nullif(v_ap_dung ->> 'ghi_chu', '') else ghi_chu end,
    gia_goc = case when v_thay_doi ? 'gia_goc' then (case when jsonb_typeof(v_thay_doi -> 'gia_goc') = 'null' then null else (v_thay_doi ->> 'gia_goc')::integer end) else gia_goc end,
    gia_ban = case when v_thay_doi ? 'gia_ban' then (v_thay_doi ->> 'gia_ban')::integer else gia_ban end,
    hien_thi = case when v_thay_doi ? 'hien_thi' then (v_thay_doi ->> 'hien_thi')::boolean else hien_thi end,
    ton = case when v_thay_doi ? 'ton' then (case when jsonb_typeof(v_thay_doi -> 'ton') = 'null' then null else (v_thay_doi ->> 'ton')::integer end) else ton end,
    con_hang = case when v_thay_doi ? 'con_hang' then coalesce(nullif(v_thay_doi ->> 'con_hang', ''), con_hang) else con_hang end,
    nguon_truong = v_nguon_truong,
    cap_nhat = now()
  where id = p_id
  returning * into v_moi;

  return to_jsonb(v_moi);
end;
$$;

-- Wrapper để Server Action gọi qua admin.rpc("sua_san_pham", ...), chỉ cấp quyền cho service_role
create or replace function public.sua_san_pham(
  p_id text,
  p_thay_doi jsonb,
  p_nguon text,
  p_boi text
) returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.sua_san_pham(p_id, p_thay_doi, p_nguon, p_boi);
$$;

revoke execute on function private.sua_san_pham(text, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.sua_san_pham(text, jsonb, text, text) from public, anon, authenticated;
grant execute on function private.sua_san_pham(text, jsonb, text, text) to service_role;
grant execute on function public.sua_san_pham(text, jsonb, text, text) to service_role;
