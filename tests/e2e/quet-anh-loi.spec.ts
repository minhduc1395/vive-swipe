import { test, expect } from "@playwright/test";

// #146: ảnh sản phẩm lỗi (404) thì /danh-muc và /da-thich hiện chữ thương hiệu, không hiện ảnh vỡ.
test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 60000 });

const MA_LOI = "8809557517892"; // Aprilskin, ảnh /products/<mã>.webp không có file
const CHAN = (url: URL) => url.pathname.startsWith("/products/") && url.pathname.includes(MA_LOI);

test.describe("#146 · ảnh lỗi hiện chữ thương hiệu", () => {
  test("/danh-muc: ảnh 404 đổi sang chữ thương hiệu, không còn ảnh vỡ", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
    });
    await page.route(CHAN, (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/danh-muc?tim=Magic%20Snow%20Cushion");

    const the = page.locator("article", { hasText: "#21 Light Beige" }).first();
    await expect(the).toBeVisible();
    await expect(the.locator("[data-anh-loi='1']")).toHaveText("Aprilskin");
    await expect(the.locator("img")).toHaveCount(0);
  });

  test("/da-thich: ảnh 404 đổi sang chữ thương hiệu, không còn ảnh vỡ", async ({ page }) => {
    await page.addInitScript((ma) => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
      localStorage.setItem("vive_da_thich", JSON.stringify([ma]));
    }, MA_LOI);
    await page.route(CHAN, (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/da-thich");

    const the = page.locator("article").first();
    await expect(the).toBeVisible();
    await expect(the.locator("[data-anh-loi='1']")).toHaveText("Aprilskin");
    await expect(the.locator("[data-anh-loi='1']")).toHaveAttribute("role", "img");
    await expect(the.locator("img")).toHaveCount(0);
  });
});
