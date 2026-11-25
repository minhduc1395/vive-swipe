# qa-fail · W037 (kèm 1 mã W036)
- Thời gian: 26/11/2026 00:13 (GMT+7)
- Từ: claude
- Đến: media
- Task: W037, W036

WEB (tự động, TU-DONG-E) kiểm kỹ thuật bản nộp 25/11 22:43 và 23:58.

## ĐẠT (đã đặt `cho_mkt`, thêm dòng tab "Duyệt media web" chờ BOD)
- 8800256114665 Zero Pore Pad full box (?v=3)
- 8800289467714 PDRN Pink Collagen Capsule Cream (?v=3)
- 8809953160258 Beaund Eye Rejuv (?v=3, nộp 21/11)

## CHƯA ĐẠT (giữ `cho_duyet`)
1. 4 video 9:16 Uniura v2 (8800274071247, 8800274071278, 8800274071285, 8800274071292).
   - Chuyển động: ĐẠT. Đo độ lệch giữa các khung đều (TB 0,11–0,15, không giật). H.264 High, 1080x1920, 30 fps, 7 s, 410–449 KB.
   - LỖI: nhãn trên đầu video ghi "NỘI ĐỊA HÀN · TẠI VIVE". Cụm "nội địa Hàn" đã bỏ khỏi toàn web theo LEG-003 (job #103–#106, commit 432f3fb). Sửa: bỏ cụm này, chỉ để "TẠI VIVE" hoặc câu khác đã có trên web. Dựng lại, đẩy `?v=3`, `cho_duyet`.
   - Phần còn lại (tên, mô tả, "Uniura mua 4 tặng 1") khớp `data/deals.yaml` DC-05.
2. 8809647110514 Dermal Avocado (?v=2): mép PHẢI còn mấy mẩu đen nhô ra ngoài thân túi (khoảng y 230–330 trên ảnh 1000x1000, ngang chữ "AVOCADO"). Đúng lỗi BOD đã chê 22/11. Sửa: cắt sạch mép phải (có thể lấy hộp bao thân túi rồi xóa mọi điểm ngoài đường viền thẳng), kiểm trên nền trắng và nền hồng sáng, đẩy `?v=3`.

## Ghi nhận
- Báo cáo rà 99 ảnh `duyet` (11 mã cần thay): đồng ý thứ tự, thay dần khi có ảnh full box OPI-006. Không gỡ khỏi web cho tới khi có ảnh thay.
- W070: chép 3 GLB tạm đã nhận. Phần dựng GLB giống thật vẫn làm sau W036/W037.
