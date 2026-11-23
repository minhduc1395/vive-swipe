import { test, expect, datDaKhaoSat } from "./fixtures";

test.describe("#131 · font và icon nhẹ, chữ Việt đúng", () => {
  for (const duongDan of ["/", "/quet", "/deal", "/new-arrival"]) {
    test(`${duongDan}: Be Vietnam Pro tải được, dấu tiếng Việt đúng`, async ({
      page,
    }) => {
      await datDaKhaoSat(page);
      await page.goto(duongDan);
      // Font gắn sau khung vẽ đầu (KhoiTaoSupabase), chờ biến font có mặt.
      await page.waitForFunction(
        () => /variable/.test(document.documentElement.className)
      );
      for (const dam of ["400", "500", "600", "700"]) {
        const ok = await page.evaluate(async (d) => {
          const mau = `${d} 16px "Be Vietnam Pro"`;
          await document.fonts.load(mau, "ếộữ");
          return document.fonts.check(mau, "ếộữ");
        }, dam);
        expect(ok, `độ đậm ${dam}`).toBe(true);
      }
    });
  }

  test("icon trang nhỏ hơn 8 KB", async ({ page }) => {
    await page.goto("/");
    const href = await page.evaluate(
      () => (document.querySelector('link[rel~="icon"]') as HTMLLinkElement).href
    );
    const res = await page.request.get(href);
    expect(res.status()).toBe(200);
    expect((await res.body()).length).toBeLessThanOrEqual(8 * 1024);
  });
});
