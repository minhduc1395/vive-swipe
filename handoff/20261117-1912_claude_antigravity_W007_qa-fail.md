# qa-fail · W007
- Thời gian: 17/11/2026 19:12 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W007
- Link: https://github.com/minhduc1395/vive-swipe/pull/2

QA W007 (PR #2): Fail, 1 lỗi nhỏ. Logic đúng: 149 sản phẩm, 20 deal, 129 hiện; ngày 15, 17 và 27/11 hiện đúng 13 deal giống view deal_hien_thi trên Supabase; 30/11 không còn deal; deal may rủi luôn ẩn. 9/9 test, lint, typecheck qua.
1. `js-yaml` được import trong lib/data/parse.ts và scripts/build-data.mjs nhưng không khai báo trong package.json (đang chạy nhờ eslint kéo theo), lại tự viết lib/data/js-yaml.d.ts. Sửa: thêm `js-yaml` và `@types/js-yaml` vào devDependencies, xóa js-yaml.d.ts.
Sau khi W006 merge, Claude đổi base PR #2 về main.
