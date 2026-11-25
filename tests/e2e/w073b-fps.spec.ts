import { test, expect, datDaKhaoSat } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * W073 phần B (#152): đo khung/giây đoạn LOPOE trên điện thoại (Pixel 7, CPU chậm 4 lần qua CDP), để chọn
 * (a) chạy cảnh three.js có GLB trực tiếp (cần ≥ 50 fps) hay (b) chuỗi ảnh khung chụp từ cảnh GLB.
 * Đo nặng (vài phút) nên chỉ chạy khi đặt DO_FPS=1:
 *   DO_FPS=1 npx playwright test tests/e2e/w073b-fps.spec.ts --project=pixel-7
 * Số in ra console (dòng "W073B fps"). Test luôn chạy phần nhẹ: ?fps=1 hiện ô số khung/giây, không có thì không hiện.
 */

type KetQua = { soKhung: number; fpsTb: number; khungLauNhat: number; p95: number };

async function moTrang(page: Page, url: string) {
  await datDaKhaoSat(page);
  await page.goto(url);
  await expect(page.locator("#lopoe")).toBeAttached();
}

/** Cuộn đều cả khối LOPOE (0 → 1) trong `ms` mili giây, đọc thời gian từng khung từ window.__lopoeFps (?fps=1). */
async function cuonDo(page: Page, ms: number): Promise<KetQua> {
  return page.evaluate(async (DAI) => {
    const s = document.querySelector("#lopoe")!;
    const r = s.getBoundingClientRect();
    const goc = scrollY + r.top, dai = r.height - innerHeight;
    const lich = (window as unknown as { __lopoeFps?: number[] }).__lopoeFps!;
    const batDau = lich.length;
    await new Promise<void>((xong) => {
      let dau = -1;
      const buoc = (t: number) => {
        if (dau < 0) dau = t;
        const q = (t - dau) / DAI;
        if (q > 1) return xong();
        scrollTo(0, goc + q * dai);
        requestAnimationFrame(buoc);
      };
      requestAnimationFrame(buoc);
    });
    const khung = lich.slice(batDau);
    const tong = khung.reduce((x, y) => x + y, 0);
    const sx = [...khung].sort((x, y) => x - y);
    return { soKhung: khung.length, fpsTb: +(1000 / (tong / Math.max(1, khung.length))).toFixed(1), khungLauNhat: +(sx[sx.length - 1] ?? 0).toFixed(1), p95: +(sx[Math.floor(sx.length * 0.95)] ?? 0).toFixed(1) };
  }, ms);
}

test.describe("W073 phần B · đo khung/giây điện thoại (#152)", () => {
  test("?fps=1 hiện ô số khung/giây; không có tham số thì không hiện", async ({ page }) => {
    await moTrang(page, "/");
    await expect(page.locator("[data-fps]")).toHaveCount(0);
    await moTrang(page, "/?fps=1");
    await expect(page.locator("#lopoe [data-fps]")).toHaveCount(1);
    await expect.poll(() => page.locator("#lopoe [data-fps]").textContent(), { timeout: 10_000 }).toMatch(/\d+ fps/);
  });

  test("Pixel 7, CPU x4: cuộn cả khối, 3D trực tiếp có GLB vs chuỗi khung (ghi số vào PR)", async ({ page, browserName }, testInfo) => {
    test.skip(!process.env.DO_FPS, "đo nặng: đặt DO_FPS=1");
    test.skip(browserName !== "chromium", "CDP chỉ có trên Chromium");
    test.setTimeout(900_000);
    const cdp = await page.context().newCDPSession(page);
    const ca = [
      { ten: "chuỗi khung cũ (tắt GLB)", url: "/?fps=1", dpr: 0 },
      { ten: "chuỗi khung GLB (?glb=1)", url: "/?glb=1&fps=1", dpr: 0 },
      { ten: "3D trực tiếp GLB, pixelRatio 1,5", url: "/?glb=1&ba-chieu=1&fps=1", dpr: 0 },
      { ten: "3D trực tiếp GLB, pixelRatio 1", url: "/?glb=1&ba-chieu=1&fps=1", dpr: 1 },
    ];
    for (const c of ca) {
      if (c.dpr) await cdp.send("Emulation.setDeviceMetricsOverride", { width: 412, height: 839, deviceScaleFactor: c.dpr, mobile: true });
      await moTrang(page, c.url);
      // đưa khối vào khung nhìn (bắt đầu tải cảnh / ảnh khung), chờ GLB nạp xong khi chạy 3D
      await page.evaluate(() => { const s = document.querySelector("#lopoe")!; scrollTo(0, scrollY + s.getBoundingClientRect().top + 10); });
      if (c.url.includes("ba-chieu")) await expect.poll(() => page.evaluate(() => (window as unknown as { __lopoeGlb?: string }).__lopoeGlb), { timeout: 180_000 }).toBe("da-nap");
      else await page.waitForTimeout(8000);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const kq = await cuonDo(page, 15_000);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      if (c.dpr) await cdp.send("Emulation.clearDeviceMetricsOverride");
      console.log(`W073B fps · ${c.ten}: ${JSON.stringify(kq)}`);
      testInfo.annotations.push({ type: c.ten, description: JSON.stringify(kq) });
      expect(kq.soKhung).toBeGreaterThan(5);
    }
  });
});
