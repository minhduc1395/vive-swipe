import { test, expect, datDaKhaoSat } from "./fixtures";

test.describe("W041 · nút landing dẫn thẳng tới sản phẩm, deal", () => {
  test("Xem bộ sản phẩm ra đúng 3 sản phẩm LOPOE", async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto("/new-arrival");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Xem bộ sản phẩm" }).first().click();
    await expect(page).toHaveURL(/thuong-hieu=LOPOE/);
    await expect(page.locator("article")).toHaveCount(3);
  });

  test("/danh-muc?sp=LOPOE-AMP mở sẵn bảng chi tiết; đóng thì bỏ sp; Back cũng đóng", async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto("/danh-muc?thuong-hieu=LOPOE&sp=LOPOE-AMP");
    await page.waitForLoadState("networkidle");
    const bang = page.getByRole("dialog", { name: /Chi tiết sản phẩm .*Ampoule/i });
    await expect(bang).toBeVisible();
    await page.mouse.click(5, 20); // bấm nền mờ phía trên bảng để đóng
    await expect(bang).toHaveCount(0);
    await expect(page).not.toHaveURL(/sp=/);

    // mở từ lưới rồi Back
    await page.waitForLoadState("networkidle");
    await page.locator("article").first().click();
    await expect(page).toHaveURL(/sp=/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/sp=/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Khối ampoule: Xem sản phẩm mở bảng chi tiết LOPOE-AMP", async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto("/new-arrival");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Xem sản phẩm" }).first().click();
    await expect(page).toHaveURL(/sp=LOPOE-AMP/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("W048 · khối Đang có tại VIVE", () => {
  for (const [w, h] of [[1440, 900], [820, 1180], [390, 844]] as const) {
    test(`tiêu đề có logo, ô dẫn tới /deal?id=, ảnh không đè chữ (${w})`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await datDaKhaoSat(page);
      await page.goto("/new-arrival");
      const khoi = page.locator("#dang-chay");
      await khoi.scrollIntoViewIfNeeded();
      await expect(khoi.getByRole("heading", { level: 2 })).toContainText("Đang có tại");
      await expect(khoi.getByRole("img", { name: "VIVE" })).toBeVisible();

      const o = khoi.locator("a[data-deal]");
      const so = await o.count();
      expect(so).toBeGreaterThan(0);
      for (let i = 0; i < so; i++) {
        const href = await o.nth(i).getAttribute("href");
        expect(href).toMatch(/^\/deal\?id=/);
        const hopO = (await o.nth(i).boundingBox())!;
        const chu = await o.nth(i).locator("strong").boundingBox();
        const anh = o.nth(i).locator("img:visible");
        for (let j = 0; j < (await anh.count()); j++) {
          const a = (await anh.nth(j).boundingBox())!;
          // ảnh nằm trong ô
          expect(a.x).toBeGreaterThanOrEqual(hopO.x - 1);
          expect(a.y).toBeGreaterThanOrEqual(hopO.y - 1);
          expect(a.x + a.width).toBeLessThanOrEqual(hopO.x + hopO.width + 1);
          expect(a.y + a.height).toBeLessThanOrEqual(hopO.y + hopO.height + 1);
          // không giao với tiêu đề deal
          if (chu) {
            const giao = a.x < chu.x + chu.width && a.x + a.width > chu.x && a.y < chu.y + chu.height && a.y + a.height > chu.y;
            expect(giao, `ảnh đè chữ ở ô ${i}`).toBe(false);
          }
        }
      }
    });
  }
});
