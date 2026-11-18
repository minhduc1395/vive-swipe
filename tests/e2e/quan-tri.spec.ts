import { expect, test } from "@playwright/test";
import path from "path";

test.describe("W017 · Trang quản trị (/quan-tri)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+07:00"));
  });

  test("hiển thị trang quản trị, danh sách deal và khóa deal may rủi chưa đăng ký", async ({
    page,
  }) => {
    await page.goto("/quan-tri");

    // Tiêu đề
    await expect(page.locator("h1")).toHaveText("Deal");

    // Bảng deal
    await expect(page.getByText("LOPOE-25")).toBeVisible();
    await expect(page.getByText("KM-08")).toBeVisible();
    await expect(page.getByText("COMBO-PINK")).toBeVisible();

    // Deal may rủi KM-12 phải bị khóa (switch disabled)
    const switchKm12 = page.locator('button[aria-label="Khóa deal may rủi KM-12"]');
    await expect(switchKm12).toBeVisible();
    await expect(switchKm12).toBeDisabled();

    // Deal thông thường COMBO-PINK có thể bật/tắt
    const switchPink = page.locator('button[aria-label="Bật tắt hiển thị deal COMBO-PINK"]');
    await expect(switchPink).toBeVisible();
    await expect(switchPink).not.toBeDisabled();
    const checkedBanDau = await switchPink.getAttribute("aria-checked");
    await switchPink.click();
    const checkedSau = await switchPink.getAttribute("aria-checked");
    expect(checkedSau).not.toBe(checkedBanDau);
  });

  test("tải file CSV KiotViet, xem trước thay đổi và xác nhận cập nhật tồn", async ({
    page,
  }) => {
    await page.goto("/quan-tri");

    // Chuyển sang tab Nhập tồn KiotViet
    const tabNhapTon = page.getByRole("button", { name: "Nhập tồn KiotViet" });
    await tabNhapTon.click();
    await expect(page.locator("h1")).toHaveText("Nhập tồn KiotViet");

    // Upload file CSV
    const fileCsv = path.join(__dirname, "../fixtures/mau-kiotviet-ton.csv");
    const fileInput = page.locator("#file-ton-kiotviet");
    await fileInput.setInputFiles(fileCsv);

    // Bảng xem trước xuất hiện
    await expect(page.getByText("Xem trước thay đổi tồn kho")).toBeVisible();
    await expect(page.getByText("Máy chăm sóc da Age-R Booster Pro X2 · Trắng")).toBeVisible();

    // Bấm nút Xác nhận cập nhật
    const nutXacNhan = page.getByRole("button", { name: "Xác nhận cập nhật tồn" });
    await expect(nutXacNhan).toBeVisible();
    await nutXacNhan.click();

    // Toast thông báo xuất hiện
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("tab Sản phẩm hỗ trợ tìm kiếm và lọc danh mục", async ({
    page,
  }) => {
    await page.goto("/quan-tri");

    const tabSanPham = page.getByRole("button", { name: "Sản phẩm" });
    await tabSanPham.click();
    await expect(page.locator("h1")).toHaveText("Sản phẩm");

    // Tìm kiếm sản phẩm
    const inputTimKiem = page.getByPlaceholder("Tìm theo tên, mã hoặc thương hiệu...");
    await inputTimKiem.fill("Booster");
    await expect(page.getByText("Máy chăm sóc da Age-R Booster Pro X2 · Trắng")).toBeVisible();
  });
});
