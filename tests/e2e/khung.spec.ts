import { expect, test } from "./fixtures";

const CAC_ROUTE_KHACH = [
  "/",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/da-thich",
  "/deal",
  "/gio",
  "/giu-hang",
  "/giu-hang/VIVE-4821",
  "/chinh-sach",
  "/nhan-vien",
  "/quan-tri",
];

test.describe("Khung ứng dụng VIVE Quẹt", () => {
  for (const route of CAC_ROUTE_KHACH) {
    test(`mở được route ${route}`, async ({ page }) => {
      const loiConsole: string[] = [];
      page.on("pageerror", (err) => loiConsole.push(err.message));

      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(loiConsole).toEqual([]);
    });
  }

  test("thanh tab 5 mục ở /quet đủ 5 link và nhãn 1 dòng", async ({ page }) => {
    await page.goto("/quet");
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(nav).toBeVisible();

    const links = nav.locator("a");
    await expect(links).toHaveCount(5);

    const quetLink = nav.getByRole("link", { name: "Quẹt" });
    await expect(quetLink).toHaveAttribute("aria-current", "page");

    const logo = page.locator("header img[alt='VIVE']");
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(32);
    expect(box!.width).toBeLessThan(120);
  });
});
