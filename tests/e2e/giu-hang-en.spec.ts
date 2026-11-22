import { test, expect, datDaKhaoSat } from "./fixtures";
import { KHOA_GIO_HANG } from "@/lib/kho-luu-tru";

// Chữ cái có dấu tiếng Việt (không tính × • …). Tên sản phẩm/địa chỉ riêng có thể còn dấu: xem NGOAI_LE.
const CHU_VIET = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;

async function dongVietTrongMain(page: import("@playwright/test").Page): Promise<string[]> {
  const chu = await page.locator("main").innerText();
  return chu
    .split("\n")
    .map((d) => d.trim())
    .filter((d) => CHU_VIET.test(d))
    // Tên người dùng nhập và dữ liệu thiếu bản en (tên sản phẩm, quà từ deal)
    .filter((d) => !/Sữa rửa mặt|Phan Minh Đức|Quà|LOPOE/i.test(d));
}

test.describe("W044 · giu-hang song ngữ", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
  });

  test("EN: form giữ hàng, lỗi, trang mã không còn chữ Việt", async ({ page }) => {
    await page.goto("/quet?lang=en");
    await page.evaluate((key) => {
      window.localStorage.setItem(key, JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }]));
    }, KHOA_GIO_HANG);

    await page.goto("/giu-hang?lang=en");
    await expect(page.getByRole("heading", { name: "Reserve at the booth" })).toBeVisible();
    await expect(page.getByText("1 item · estimated total")).toBeVisible();
    await expect(page.getByText("249,000 VND").last()).toBeVisible();
    await expect(page.getByText("Held until 9:00 PM tomorrow")).toBeVisible();
    await page.getByRole("button", { name: "Today" }).click();
    await expect(page.getByText("Held until 9:00 PM today")).toBeVisible();

    await page.locator("input#ten").fill("Phan Minh Đức");
    await page.locator("input#sdt").fill("012345");
    await page.getByRole("button", { name: "Confirm reservation" }).click();
    await expect(page.locator("main [role=alert]")).toContainText("Invalid phone number");
    expect(await dongVietTrongMain(page)).toEqual([]);

    await page.locator("input#sdt").fill("0911222333");
    // LEG-002: ô chính sách mặc định chưa tick, khách phải tự tick
    await page.getByLabel(/privacy and reservation policy/).check();
    await page.getByRole("button", { name: "Confirm reservation" }).click();
    await expect(page).toHaveURL(/\/giu-hang\/VIVE-\d{4}/);
    await expect(page.getByRole("heading", { name: "Reserved" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save screenshot" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to calendar" })).toBeVisible();
    await expect(page.getByText("Estimated total")).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
  });

  test("EN: giỏ trống và mã không tồn tại", async ({ page }) => {
    await page.goto("/giu-hang?lang=en");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await page.goto("/giu-hang/VIVE-0000?lang=en");
    await expect(page.getByRole("heading", { name: "Code VIVE-0000 not found" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
  });

  test("VI mặc định vẫn là tiếng Việt", async ({ page }) => {
    await page.goto("/giu-hang");
    await expect(page.getByRole("heading", { name: "Giỏ hàng đang trống" })).toBeVisible();
    await page.goto("/giu-hang/VIVE-0000");
    await expect(page.getByRole("heading", { name: "Không tìm thấy mã VIVE-0000" })).toBeVisible();
  });
});
