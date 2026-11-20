# Bản đồ module (đội coder)

Dùng cho job của đội coder (GitHub Issue, quy trình https://github.com/minhduc1395/dev-hub/blob/main/docs/PROCESS.md). Task W và handoff cũ vẫn chạy song song cho tới khi WEB chuyển hết.

Mỗi job thuộc đúng 1 module. Một module chỉ 1 job đang làm cùng lúc, kể cả task W của Antigravity: WEB không giao job vào module đang có task W Doing.

| Module | Thư mục | Làn chính | Gói ngữ cảnh |
|---|---|---|---|
| trang-chu | `components/trang-chu/`, `components/landing/`, `components/cuon-3d/`, `lib/trang-chu/`, `app/(khach)/page.tsx` (nếu có), `app/(khach)/thu-nghiem/` | fe | [trang-chu.md](trang-chu.md) |
| quet | `components/deck/`, `lib/goi-y/`, `app/(khach)/quet/`, `app/(khach)/da-thich/`, `app/(khach)/danh-muc/`, `app/(khach)/new-arrival/`, `app/(khach)/bat-dau/`, `app/(khach)/chao/` | fe | [quet.md](quet.md) |
| deal | `components/deal/`, `lib/deals/`, `app/(khach)/deal/`, `app/(khach)/gio/` | be | [deal.md](deal.md) |
| giu-hang | `lib/giu-hang/`, `lib/email/`, `app/(khach)/giu-hang/`, `app/api/` (trừ cron), `lib/qr.ts` | be | [giu-hang.md](giu-hang.md) |
| noi-bo | `app/nhan-vien/`, `app/quan-tri/`, `lib/nhan-vien/`, `lib/admin/`, `app/api/cron/` | be | [noi-bo.md](noi-bo.md) |
| shared | `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `app/layout.tsx`, `app/globals.css`, `components/` gốc (AppShell, ThanhTren…), `lib/supabase/`, `supabase/migrations/`, `data/`, `docs/`, `design/`, `public/brand/`, `.github/`, `cloudbuild.yaml`, `Dockerfile`, `CLAUDE.md`, `AGENTS.md` | WEB | (không có gói) |

`tests/`: mỗi job được thêm hoặc sửa file test của chính module mình (tên file theo module), không sửa test của module khác.
Ảnh và video (`media/`, `scripts/media/`) vẫn là việc của Antigravity Media, không giao cho đội coder.
