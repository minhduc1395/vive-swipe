import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect } from "@playwright/test";

const ROUTE = "/thu-nghiem/ampoule-3d";

test.describe("W071 · Trang thử 3D GLB ampoule LOPOE", () => {
  test("noindex, tài sản 3D <= 1MB, nạp GLB 3 cảnh theo cuộn trên 390px và 1440px, ?fps=1", async ({
    page,
  }) => {
    test.setTimeout(150000);
    let tongBytes = 0;
    let taiSan3dBytes = 0;

    page.on("response", async (res) => {
      try {
        const len = Number(res.headers()["content-length"]);
        let size = Number.isFinite(len) && len > 0 ? len : 0;
        if (size === 0) {
          const buf = await res.body().catch(() => null);
          if (buf) size = buf.byteLength;
        }
        tongBytes += size;
        if (res.url().includes("/thu-nghiem/ampoule-3d/")) {
          taiSan3dBytes += size;
        }
      } catch {
        // Bỏ qua response đã đóng
      }
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${ROUTE}?fps=1`, { waitUntil: "domcontentloaded" });

    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots ?? "").toContain("noindex");

    await page.waitForFunction(
      () => Boolean((window as unknown as { __w071Ampoule?: unknown }).__w071Ampoule),
      undefined,
      { timeout: 30000 },
    );

    await expect(page.getByTestId("w071-fps-hud")).toBeVisible({ timeout: 30000 });

    await page.waitForFunction(
      () =>
        (window as unknown as { __w071Ampoule?: { trangThai?: string } })
          .__w071Ampoule?.trangThai === "da-nap",
      undefined,
      { timeout: 30000 },
    );

    const shotDir = path.join(process.cwd(), "test-results", "screenshots", "w071");
    fs.mkdirSync(shotDir, { recursive: true });

    const mocCanh = [
      { p: 0.12, canh: "1", tieuDe: "LOPOE Better Balance Ampoule" },
      { p: 0.5, canh: "2", tieuDe: "4 hoạt chất, phục hồi & khóa ẩm" },
      { p: 0.88, canh: "3", tieuDe: "Hwahae Awards 2025 · No.1" },
    ] as const;

    for (const vp of [
      { label: "390", width: 390, height: 844 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      for (const m of mocCanh) {
        await page.evaluate((p) => {
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          window.scrollTo({ top: Math.round(maxScroll * p), behavior: "instant" });
        }, m.p);
        await page.waitForTimeout(450);

        await expect(page.getByTestId("w071-canh-noi-dung")).toHaveAttribute(
          "data-canh",
          m.canh,
          { timeout: 20000 },
        );
        await expect(page.getByRole("heading", { name: m.tieuDe })).toBeVisible();

        await page.screenshot({
          path: path.join(shotDir, `canh-${m.canh}-${vp.label}.png`),
        });
      }
    }

    const taiSanMb = Math.round((taiSan3dBytes / (1024 * 1024)) * 100) / 100;
    const tongMb = Math.round((tongBytes / (1024 * 1024)) * 100) / 100;
    console.log(
      `[W071-PAYLOAD] 3dAssets=${taiSan3dBytes} (${taiSanMb} MB), devTotal=${tongBytes} (${tongMb} MB)`,
    );
    expect(taiSan3dBytes).toBeGreaterThan(0);
    expect(taiSan3dBytes).toBeLessThanOrEqual(1024 * 1024);
  });

  test("đo FPS khi cuộn dưới CPU chậm 4 lần (dpr=1.5 và dpr=1)", async ({
    page,
    browserName,
  }) => {
    test.skip(
      process.env.W071_BENCH !== "1" || browserName !== "chromium",
      "Benchmark CPU x4 chỉ chạy khi W071_BENCH=1 trên Chromium",
    );
    test.setTimeout(90000);

    await page.setViewportSize({ width: 390, height: 844 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    try {
      for (const dpr of [1.5, 1]) {
        await page.goto(`${ROUTE}?fps=1&dpr=${dpr}`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForFunction(
          () =>
            (window as unknown as { __w071Ampoule?: { trangThai?: string } })
              .__w071Ampoule?.trangThai === "da-nap",
          undefined,
          { timeout: 25000 },
        );

        for (let i = 1; i <= 10; i++) {
          await page.evaluate((ratio) => {
            const maxScroll = Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            );
            window.scrollTo({ top: Math.round(maxScroll * ratio), behavior: "instant" });
          }, i / 10);
          await page.waitForTimeout(160);
        }

        const metric = await page.evaluate(
          () =>
            (
              window as unknown as {
                __w071Ampoule?: { fps: number; maxFrameMs: number; dpr: number };
              }
            ).__w071Ampoule,
        );
        console.log(
          `[W071-BENCH dpr=${dpr}] fps=${metric?.fps ?? 0}, maxFrameMs=${metric?.maxFrameMs ?? 0}, actualDpr=${metric?.dpr ?? 0}`,
        );
        expect(metric?.fps ?? 0).toBeGreaterThan(0);
      }
    } finally {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }).catch(() => {});
    }
  });
});
