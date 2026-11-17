import { expect, test } from "@playwright/test";

test.describe("Deck quẹt sản phẩm (W011)", () => {
  test.beforeEach(async ({ page }) => {
    // Làm sạch storage trước mỗi test
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
    });
  });

  test("quẹt phải 3, trái 2, lên 1, hoàn tác 1 cho kết quả đúng ở Đã thích và Giỏ", async ({
    page,
  }) => {
    await page.goto("/quet");

    const nutThich = page.getByRole("button", { name: "Thích" });
    const nutBoQua = page.getByRole("button", { name: "Bỏ qua" });
    const nutVaoGio = page.getByRole("button", { name: "Thêm vào giỏ" });
    const nutHoanTac = page.getByRole("button", { name: "Hoàn tác" });

    await expect(nutThich).toBeVisible();

    // 1. Quẹt phải 3 lần (Thích)
    await nutThich.click();
    await nutThich.click();
    await nutThich.click();

    // Kiểm tra badge Đã thích = 3 món
    const linkDaThich = page.getByRole("link", { name: "Đã thích" });
    await expect(linkDaThich.getByLabel("3 món")).toBeVisible();

    // 2. Quẹt trái 2 lần (Bỏ qua)
    await nutBoQua.click();
    await nutBoQua.click();

    // Đã thích vẫn là 3
    await expect(linkDaThich.getByLabel("3 món")).toBeVisible();

    // 3. Quẹt lên 1 lần (Thêm vào giỏ)
    await nutVaoGio.click();

    // Giỏ = 1 món
    const linkGio = page.getByRole("link", { name: "Giỏ" });
    await expect(linkGio.getByLabel("1 món")).toBeVisible();
    // Đã thích = 4 món
    await expect(linkDaThich.getByLabel("4 món")).toBeVisible();

    // 4. Hoàn tác 1 lần (gỡ bỏ bước vào giỏ vừa rồi)
    await nutHoanTac.click();

    // Kết quả sau hoàn tác: Giỏ quay lại 0, Đã thích quay lại 3
    await expect(linkGio.getByLabel("1 món")).not.toBeVisible();
    await expect(linkDaThich.getByLabel("3 món")).toBeVisible();

    // Kiểm tra lưu trữ trong localStorage
    const daThich = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("vive_da_thich") || "[]")
    );
    expect(daThich).toHaveLength(3);

    const gioHang = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("vive_gio_hang") || "[]")
    );
    expect(gioHang).toHaveLength(0);
  });

  test("mở và đóng bảng chi tiết sản phẩm", async ({ page }) => {
    await page.goto("/quet");

    // Click nút icon (i) chi tiết
    const nutChiTiet = page.getByRole("button", { name: /Xem chi tiết/ });
    await expect(nutChiTiet).toBeVisible();
    await nutChiTiet.click();

    // Dialog chi tiết hiện lên
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Còn hàng")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Thêm vào giỏ" })).toBeVisible();

    // Đóng dialog bằng nút đóng
    const nutDong = dialog.getByLabel("Đóng chi tiết");
    await nutDong.click();
    await expect(dialog).not.toBeVisible();
  });

  test("điều khiển quẹt bằng phím mũi tên", async ({ page }) => {
    await page.goto("/quet");
    await page.waitForTimeout(300);

    const linkDaThich = page.getByRole("link", { name: "Đã thích" });
    const linkGio = page.getByRole("link", { name: "Giỏ" });

    // Nhấn ArrowRight để thích
    await page.keyboard.press("ArrowRight");
    await expect(linkDaThich.getByLabel("1 món")).toBeVisible();

    // Nhấn ArrowUp để vào giỏ
    await page.keyboard.press("ArrowUp");
    await expect(linkGio.getByLabel("1 món")).toBeVisible();
    await expect(linkDaThich.getByLabel("2 món")).toBeVisible();

    // Nhấn z để hoàn tác
    await page.keyboard.press("z");
    await expect(linkGio.getByLabel("1 món")).not.toBeVisible();
    await expect(linkDaThich.getByLabel("1 món")).toBeVisible();
  });
});
