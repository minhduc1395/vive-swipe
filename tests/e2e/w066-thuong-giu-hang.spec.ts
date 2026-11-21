import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import { KHOA_NHAN_VIEN_SESSION } from "@/lib/nhan-vien/auth";

test.describe("W066 · Trang nhân viên báo thưởng +1 lượt quay từ 27/11", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
  });

  test("TIÊU CHÍ XONG: Ngày 27/11 bấm Đã lấy thấy Tặng thêm; ngày 26/11 không hiện; ảnh 390px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.setFixedTime(new Date("2026-11-27T10:00:00+07:00"));

    await page.goto("/nhan-vien?ma=VIVE-5190");
    await page.locator("input#staff-email").fill("booth@vive.vn");
    await page.locator("input#staff-password").fill("booth123");
    await page.getByRole("button", { name: "Đăng nhập quầy" }).click();

    await expect(
      page.getByRole("heading", { name: "Giữ hàng hôm nay" }),
    ).toBeVisible();
    await expect(page.getByTestId("thuong-giu-hang-nhan-vien")).toHaveCount(0);

    const btnDaLay = page.getByRole("button", { name: "Đã lấy", exact: true });
    await btnDaLay.scrollIntoViewIfNeeded();
    await btnDaLay.click();

    const khungThuong = page.getByTestId("thuong-giu-hang-nhan-vien");
    await expect(khungThuong).toBeVisible();
    await expect(khungThuong).toContainText("Tặng thêm:");
    await expect(khungThuong).toContainText("lượt quay");

    const dir = path.join(process.cwd(), "test-results", "screenshots");
    fs.mkdirSync(dir, { recursive: true });
    await khungThuong.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(dir, "w066-nhan-vien-390.png"),
      fullPage: true,
    });

    // Kiểm tra ngày 26/11: mở đơn đã lấy (VIVE-2764) -> không hiện thưởng
    await page.clock.setFixedTime(new Date("2026-11-26T10:00:00+07:00"));
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          email: "booth@vive.vn",
          ten: "Quầy VIVE",
          vaiTro: "nhan_vien",
          dangNhapLuc: "2026-11-26T10:00:00.000Z",
        }),
      );
    }, KHOA_NHAN_VIEN_SESSION);

    await page.goto("/nhan-vien?ma=VIVE-2764");
    await expect(
      page.getByRole("heading", { name: "Giữ hàng hôm nay" }),
    ).toBeVisible();
    await expect(page.getByTestId("thuong-giu-hang-nhan-vien")).toHaveCount(0);
  });
});
