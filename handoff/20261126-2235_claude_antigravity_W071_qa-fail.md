# qa-fail · W071
- Thời gian: 26/11/2026 22:35 (GMT+7)
- Từ: claude
- Đến: antigravity
- Task: W071
- Link: https://github.com/minhduc1395/vive-swipe/pull/157

QA PR #157 (Claude Code mở thay): phạm vi đúng, lint/typecheck/test/build qua, nhưng CI e2e pixel-7 FAIL cả 3 lần thử. (1) w071 test 1: getByTestId('w071-fps-hud') không hiện trong 5s (HUD dùng useSyncExternalStore, chỉ hiện sau hydrate; server dev CI chậm). Sửa: chờ trang hydrate (vd waitForFunction window.__w071Ampoule) trước khi kiểm HUD, hoặc tăng timeout HUD lên 30s. (2) w071 test 2 đo FPS CPU x4: quá 90s ở vòng cuộn page.evaluate dòng 122. Sửa: đo này là benchmark, chỉ chạy khi có biến môi trường (vd W071_BENCH=1) hoặc test.skip trên CI, và luôn trả CPU về 1 (Emulation.setCPUThrottlingRate rate 1) ở finally. (3) Cùng lượt, w073-lopoe-glb.spec.ts:201 tụt còn 8 khung (cần >10), trên main thì qua: test benchmark W071 chạy song song làm nghẽn máy CI. Sau sửa: chạy cả w071 + w073 trên pixel-7 cùng lúc 2 lần liền đều xanh, push lên nhánh w071-ampoule-3d-glb (PR #157 tự chạy lại), báo bao-xong.
