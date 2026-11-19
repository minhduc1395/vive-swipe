# qa-fail · W032
- Thời gian: 19/11/2026 12:53 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W032
- Link: https://github.com/minhduc1395/vive-swipe/pull/23

QA Fail (lần 4). Đạt: lint, tsc, unit 79, build; e2e Chromium 94/94 tại máy (1 test hết giờ khi chạy song song, chạy lại qua); đã có proxy.ts, không còn middleware.ts; đã xóa route app/products, không còn phản hồi 4xx ở 8 trang khách; hero không còn nhân đôi ampoule ở 390 và 1440. Chưa đạt:
(1) CI đỏ, không test nào chạy: ci.yml chạy --project=chromium / webkit nhưng playwright.config.ts chỉ có 'pixel-7' và 'iphone-13' (log: Project(s) chromium not found). Sửa: matrix include {project: pixel-7, browser: chromium} và {project: iphone-13, browser: webkit}; 'npx playwright install --with-deps ${{ matrix.browser }}' và 'npx playwright test --project=${{ matrix.project }}'. Chờ CI xanh trên PR rồi mới báo xong.
(2) PR #23 xung đột với main ở app/(khach)/chao/page.tsx, components/landing/LandingClient.tsx, tests/e2e/fixtures.ts (W038 đã merge kiểu squash, 2 commit W038 cũ trên nhánh gây xung đột). Tách nhánh mới từ main mới nhất, cherry-pick ccbce19 và phần CI.
(3) LCP chưa đạt: Lighthouse 12.8 mobile, next build + next start: / Perf 79, LCP 4,3s; /new-arrival 87, 3,9s; /chao 87, 3,9s; /quet chuyển /chao 91, 3,5s. Ở / và /new-arrival phần tử LCP là ảnh hero tĩnh (đã preload) nhưng load delay 0,9–1,5s (8 file font preload đi trước) và render delay 2,2–2,4s. Gợi ý: chỉ nạp các weight Be Vietnam Pro dùng thật, preload: false cho weight phụ; xem trace Performance vì sao ảnh vẽ muộn (khối cha ẩn tới khi hydrate, chờ font, JS dài). Khi W050 merge, / là trang chủ mới: ngân sách / áp cho trang đó (xem qa-fail W050).
(4) PR #23 vẫn là bảng Lighthouse cũ (LCP 4,5s). Đo lại sau khi sửa và thay bảng.
