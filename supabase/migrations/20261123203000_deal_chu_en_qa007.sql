-- QA-007 (B): bổ sung chữ EN (*_en) cho 6 deal, lấy nguyên từ supabase/seed.sql.
-- Chỉ gộp khóa *_en vào du_lieu; không đổi giá, quà, trạng thái; không xóa gì.
update public.deal set du_lieu = du_lieu || '{"ten_en": "25% off LOPOE with any other item", "dieu_kien_en": "Cart contains at least 1 non-LOPOE item", "hook_en": "Get 25% off LOPOE when you buy any other item at VIVE"}'::jsonb where id = 'LOPOE-25';
update public.deal set du_lieu = du_lieu || '{"ten_en": "LOPOE 2x Cleansing Foam Combo", "qua_en": "Sample pouch and 1 sunscreen or skin softening cream", "hook_en": "LOPOE Cleansing Foam combo: 2 bottles for 349K"}'::jsonb where id = 'LOPOE-COMBO-2SRM';
update public.deal set du_lieu = du_lieu || '{"ten_en": "LOPOE Better Balance Trio", "qua_en": "1 LOPOE moisture cream", "hook_en": "Buy the LOPOE Trio, get an extra Moisture Cream"}'::jsonb where id = 'LOPOE-COMBO-BO3';
update public.deal set du_lieu = du_lieu || '{"ten_en": "LOPOE Moisture Cream & Ampoule Combo", "qua_en": "1 LOPOE ampoule"}'::jsonb where id = 'LOPOE-COMBO-KEM-AMP';
update public.deal set du_lieu = du_lieu || '{"ten_en": "Uniura Buy 4 Get 1 Free", "dieu_kien_en": "5 masks for 396,000 (unit price 99,000)"}'::jsonb where id = 'DC-05';
update public.deal set du_lieu = du_lieu || '{"ten_en": "Medicube PDRN PINK COMBO"}'::jsonb where id = 'COMBO-PINK';
