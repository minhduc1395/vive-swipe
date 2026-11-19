import { test, expect, datDaKhaoSat } from "./fixtures";

test.describe("W054 · Khối cuộn 3D LOPOE (thử nghiệm)", () => {
  test("trang có noindex, đủ khối chữ, không cuộn ngang, không có trên menu", async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto("/thu-nghiem/lopoe-3d");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("heading", { name: "LOPOE Better Balance" })).toBeAttached();
    await expect(page.locator("[data-khoi]")).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator('a[href="/thu-nghiem/lopoe-3d"]')).toHaveCount(0);
  });

  test("giảm chuyển động: hiện bản tĩnh, đủ chữ", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/thu-nghiem/lopoe-3d");
    await expect(page.getByText("pH 5.5")).toBeVisible();
    await expect(page.getByText("Sẵn sàng trang điểm")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await ctx.close();
  });
});
