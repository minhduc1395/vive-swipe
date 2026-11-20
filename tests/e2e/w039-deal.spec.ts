import { test, expect, datDaKhaoSat } from "./fixtures";

test.describe("W039 · Trang Deal dạng thẻ gọn", () => {
  test("1440×900: màn đầu thấy ít nhất 6 thẻ, 3 cột, không nút đen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);
    await page.goto("/deal");
    const the = page.locator("article[id^=deal-]");
    await expect(the.nth(5)).toBeVisible();
    let trongManDau = 0;
    for (let i = 0; i < (await the.count()); i++) {
      const b = await the.nth(i).boundingBox();
      if (b && b.y + b.height <= 900) trongManDau++;
    }
    expect(trongManDau).toBeGreaterThanOrEqual(6);
    const x = new Set<number>();
    for (let i = 0; i < 3; i++) x.add(Math.round((await the.nth(i).boundingBox())!.x));
    expect(x.size).toBe(3);
  });

  test("bấm thẻ mở ngăn kéo; Esc đóng; lọc Combo chỉ còn combo", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await datDaKhaoSat(page);
    await page.goto("/deal");
    await page.locator("article[aria-label='Quà theo hóa đơn từ 800K']").click();
    await expect(page).toHaveURL(/id=BAC-HOA-DON/);
    const keo = page.getByRole("dialog");
    await expect(keo).toBeVisible();
    // Deal quà hóa đơn không có tab gợi ý theo mốc (KM-08 có 3 tab đã dừng 20/11); ngăn kéo hiện 2 mốc quà
    await expect(keo.getByText("800K").first()).toBeVisible();
    await expect(keo.getByText(/1,2 triệu/).first()).toBeVisible();
    const hop = (await keo.locator("> div").boundingBox())!;
    expect(Math.round(hop.width)).toBe(420);
    await page.keyboard.press("Escape");
    await expect(keo).toHaveCount(0);
    await expect(page).not.toHaveURL(/id=/);

    await page.getByRole("button", { name: /^Combo · \d+$/ }).click();
    await expect(page).toHaveURL(/nhom=combo/);
    const nhom = await page.locator("article[id^=deal-]").evaluateAll((els) => els.map((e) => e.getAttribute("data-nhom")));
    expect(nhom.length).toBeGreaterThan(0);
    expect(nhom.every((t) => t === "combo")).toBe(true);
  });

  test("điện thoại: /deal?id=COMBO-PINK mở bottom sheet, Back đóng", async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto("/deal");
    await page.locator("#deal-COMBO-PINK").click();
    const keo = page.getByRole("dialog");
    await expect(keo).toBeVisible();
    await page.goBack();
    await expect(keo).toHaveCount(0);
    await page.goto("/deal?id=COMBO-PINK");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("không cuộn ngang ở 9 cỡ màn hình", async ({ page }) => {
    await datDaKhaoSat(page);
    for (const [w, h] of [[360, 740], [390, 844], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/deal");
      const tran = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(tran, `tràn ngang ở ${w}`).toBeLessThanOrEqual(0);
    }
  });
});
