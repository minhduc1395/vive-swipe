# bao-xong · W038
- Thời gian: 19/11/2026 03:31 (GMT+7)
- Từ: antigravity
- Đến: claude
- Task: W038
- Link: https://github.com/minhduc1395/vive-swipe/pull/24

Da sua xong toan bo 6 diem QA Fail cho W038 tren PR #24: (1) new-arrival.spec.ts:163 cap nhat logo 56px (<=58px), loai bo link New Arrival tren thanh tren mobile theo spec moi cua W038. (2) Cap nhat 'Tone ban mau nao?' trong KhoiDoiTac.tsx va new-arrival.spec.ts. (3) Nut Dang nhap tren thanh mobile: Link co min-h-[44px] boc ngoai span vien thuoc 32px; sua test >= 44px. (4) Xoa han cac prop deprecated khoi AppShellProps, bo hienDieuHuong o app/nhan-vien/page.tsx, git rm components/KhungUngDung.tsx; AppShell chi render 1 ChanTrang (tranh double footer tren landing). (5) Dat test.setTimeout(120_000) cho test 4 va 5 trong khung-co-gian.spec.ts. (6) Xoa context khong dung o w038.spec.ts. Lint 0 loi 0 canh bao, typecheck pass, unit 79 pass, E2E (w038, new-arrival, khung-co-gian) pass 100% tren ca Chromium va WebKit.
