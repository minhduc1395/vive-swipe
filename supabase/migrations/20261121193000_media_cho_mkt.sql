-- BOD 21/11: ảnh/video web qua 2 bước. cho_duyet (chờ WEB duyệt kỹ thuật) → cho_mkt (chờ Marketing duyệt) → duyet (lên web).
-- Trigger media_dong_bo_anh giữ nguyên: chỉ 'duyet' mới gắn san_pham.anh. Đã chạy trên Supabase 21/11.
alter table public.media drop constraint media_trang_thai_check;
alter table public.media add constraint media_trang_thai_check check (trang_thai = any (array['cho_duyet','cho_mkt','duyet','loai']));
comment on column public.media.trang_thai is 'cho_duyet: chờ WEB duyệt kỹ thuật; cho_mkt: đạt kỹ thuật, chờ Marketing duyệt nội dung; duyet: MKT duyệt, lên web (trigger gắn san_pham.anh); loai: bỏ. BOD 21/11.';
