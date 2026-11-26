# bao-xong · W071
- Thời gian: 26/11/2026 22:01 (GMT+7)
- Từ: antigravity
- Đến: claude
- Task: W071
- Link: https://github.com/minhduc1395/vive-swipe/pull/new/w071-ampoule-3d-glb

Da xong W071 tren nhanh w071-ampoule-3d-glb (3 buoc commit toi 1a44627): (1) Tao trang thu noindex /thu-nghiem/ampoule-3d, khung 400vh + sticky 100svh, ACESFilmicToneMapping + RoomEnvironment, IntersectionObserver + prefers-reduced-motion + fallback anh tinh, bo bam buocBam (tu phat-khung.ts); (2) Chep LOPOE_ampoule_web_v2.glb va Draco decoder vao public/thu-nghiem/ampoule-3d/, nhom Dropper (collar+bulb+pipette), giot roi canh 2, HUD ?fps=1 va ?dpr=; (3) Them tests/e2e/w071-ampoule-3d.spec.ts. So do Playwright CPU x4 (khong GPU): dpr=1.5 -> fps=1, maxFrameMs=24.1; dpr=1 -> fps=1, maxFrameMs=150.7 (khop ket luan PR #153 rang 3D transmission khong dat 50 fps tren software WebGL); tai san 3D (GLB+Draco) = 360,938 B (0.34 MB). Kiem tra sau sua cuoi: npm run lint, typecheck, vitest (57/57 file, 410 passed | 1 skipped), npm run build, Playwright pixel-7 + iphone-13 (3 passed, 1 skipped WebKit CDP). Anh 3 canh 390px & 1440px tai test-results/screenshots/w071/. Khong sua file ngoai pham vi W071.
