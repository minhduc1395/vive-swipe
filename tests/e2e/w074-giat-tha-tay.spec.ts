import { test, expect } from "@playwright/test";

const URLS = ["/?fps=1", "/?glb=1&fps=1"] as const;

test.describe("W074 · Đo giật 2 giây sau thả tay ở khối LOPOE điện thoại (DIR-037)", () => {
  for (const url of URLS) {
    test(`${url} trên 390×844: không long task > 100ms và FPS trung vị >= 50 trong 2s sau thả tay`, async ({
      page,
      browserName,
    }) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width: 390, height: 844 });

      const cdp =
        browserName === "chromium"
          ? await page.context().newCDPSession(page)
          : null;
      if (cdp) {
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }

      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        const lopoe = page.locator("#lopoe");
        await expect(lopoe).toBeVisible({ timeout: 20000 });

        await page.evaluate(() => {
          const el = document.querySelector("#lopoe");
          if (el) el.scrollIntoView({ behavior: "instant" });
        });

        await page.waitForFunction(
          () =>
            Array.isArray(
              (window as unknown as { __lopoeFps?: number[] }).__lopoeFps,
            ) &&
            performance
              .getEntriesByType("resource")
              .some((e) => e.name.includes(".webp") && /khung/.test(e.name)),
          undefined,
          { timeout: 30000 },
        );
        await page.waitForTimeout(800);

        // Bắt đầu đo sau khi vuốt + thả tay (giả lập cuộn quán tính rồi dừng trong 2 giây)
        await page.evaluate(async () => {
          const w = window as unknown as {
            __lopoeFps?: number[];
            __w074LongTasks?: number[];
            __w074Observer?: PerformanceObserver;
          };
          w.__w074LongTasks = [];
          try {
            const obs = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                w.__w074LongTasks?.push(entry.duration);
              }
            });
            obs.observe({ entryTypes: ["longtask"] });
            w.__w074Observer = obs;
          } catch {
            // WebKit không hỗ trợ longtask observer
          }

          const el = document.querySelector("#lopoe");
          if (!el) return;
          const r = el.getBoundingClientRect();
          const startY = window.scrollY + r.top;
          const maxDai = Math.max(1, r.height - window.innerHeight);

          // Mô phỏng vuốt nhanh + quán tính 350ms tới ~38% khối LOPOE rồi thả tay
          const steps = 12;
          for (let i = 1; i <= steps; i++) {
            const q = 0.05 + 0.33 * (1 - Math.pow(1 - i / steps, 2));
            window.scrollTo({
              top: Math.round(startY + maxDai * q),
              behavior: "instant",
            });
            await new Promise((res) => setTimeout(res, 28));
          }

          if (w.__lopoeFps) w.__lopoeFps.length = 0;
          if (w.__w074LongTasks) w.__w074LongTasks.length = 0;

          // Quán tính nhẹ thêm 250ms sau thả tay rồi đứng hẳn tới đủ 2000ms
          for (let j = 1; j <= 8; j++) {
            const q = 0.38 + 0.08 * (1 - Math.pow(1 - j / 8, 2));
            window.scrollTo({
              top: Math.round(startY + maxDai * q),
              behavior: "instant",
            });
            await new Promise((res) => setTimeout(res, 30));
          }
          await new Promise((res) => setTimeout(res, 1760));
          w.__w074Observer?.disconnect();
        });

        const kq = await page.evaluate(() => {
          const w = window as unknown as {
            __lopoeFps?: number[];
            __w074LongTasks?: number[];
          };
          const dts = [...(w.__lopoeFps ?? [])].filter((d) => d > 0);
          const sorted = [...dts].sort((a, b) => a - b);
          const medDt = sorted.length
            ? sorted[Math.floor(sorted.length / 2)]
            : 1000;
          const medianFps = Math.round((1000 / medDt) * 10) / 10;
          const tasks = w.__w074LongTasks ?? [];
          const maxLongTaskMs = tasks.length
            ? Math.round(Math.max(...tasks) * 10) / 10
            : 0;
          const countOver100ms = tasks.filter((d) => d > 100).length;
          return {
            frameCount: dts.length,
            medianFps,
            medDt: Math.round(medDt * 10) / 10,
            maxLongTaskMs,
            countOver100ms,
          };
        });

        console.log(
          `[W074-METRICS browser=${browserName} url=${url}] ${JSON.stringify(kq)}`,
        );

        expect(kq.frameCount).toBeGreaterThan(10);
        if (browserName === "chromium") {
          expect(kq.maxLongTaskMs).toBeLessThanOrEqual(100);
          expect(kq.medianFps).toBeGreaterThanOrEqual(50);
        }
      } finally {
        if (cdp) {
          await cdp
            .send("Emulation.setCPUThrottlingRate", { rate: 1 })
            .catch(() => {});
        }
      }
    });
  }
});
