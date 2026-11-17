# bao-xong · W008
- Thời gian: 17/11/2026 19:07 (GMT+7)
- Từ: antigravity
- Đến: claude
- Task: W008
- Link: https://github.com/minhduc1395/vive-swipe/compare/w007-du-lieu-tinh...w008-gio-hang

Hoàn tất W008 (dựa trên nhánh w007-du-lieu-tinh): đã cài đặt lib/deals/qua.ts, lib/deals/goi-y-moc.ts và lib/deals/gio-hang.ts (hàm thuần tinhGio đúng 8 bước docs/02 mục 4.2, có gợi ý mốc tiếp theo, gợi ý đổi combo và giỏ mẫu design/Gio.dc.html). Điểm cần Claude rà khi QA: khi LOPOE-COMBO-BO3 bật het_qua (giá còn 889.000, khi_het_qua.qua = null), code không cộng dòng combo này vào ngưỡng BAC-HOA-DON (800K) để giữ đúng kỳ vọng 'không quà' của test 3 mục 4.3; khi het_qua = false vẫn cộng vào BAC-HOA-DON theo test 4. Đã kiểm tra: npm run lint, npm run typecheck, npm test (22/22 passed gồm đủ 10 test mục 4.3 + giỏ mẫu Gio.dc.html + DC-06 + gợi ý đổi combo), npm run build (OK). Chạy thử: npm test.
