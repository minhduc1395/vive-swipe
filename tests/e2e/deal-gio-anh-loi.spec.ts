import { expect, test } from "./fixtures";

// Job #147: ảnh sản phẩm lỗi (404) ở /gio hiện chữ thương hiệu, không ảnh vỡ.
const SP_ANH_LOI = "8809557517892"; // Aprilskin, anh = /products/<id>.webp (404)

test.describe("Giỏ: ảnh sản phẩm lỗi", () => {
  test("ảnh 404 hiện chữ thương hiệu", async ({ page }) => {
    test.setTimeout(60000);
    await page.route("**/products/**", (route) =>
      route.fulfill({ status: 404, body: "" })
    );
    await page.addInitScript((id) => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
      localStorage.setItem(
        "vive_gio_hang",
        JSON.stringify([{ loai: "san_pham", sanPhamId: id, soLuong: 1 }])
      );
    }, SP_ANH_LOI);

    await page.goto("/gio");
    const dong = page.locator("article", { hasText: "Aprilskin" }).first();
    await expect(dong).toBeVisible();
    await expect(dong.getByText("Aprilskin", { exact: true }).first()).toBeVisible();
    await expect(dong.locator("img")).toHaveCount(0);
  });
});
