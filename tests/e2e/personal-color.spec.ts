import fs from "node:fs";
import path from "node:path";
import { test, expect } from "./fixtures";

const CU_CHUAN_9_CO = [
  { name: "mobile-360", width: 360, height: 640 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-820", width: 820, height: 1180 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

test.describe("W029 · Trang Personal Color cùng Pawlette (/personal-color)", () => {
  test("1. Hiển thị đủ 4 mùa, 3 bước, giá 378.000đ, placeholder và liên kết #ghe-vive", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/personal-color");

    await expect(
      page.getByText("PAWLETTE × VIVE · BẢN TẠM")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Personal\s*Color/i })
    ).toBeVisible();
    await expect(page.getByText("378.000đ")).toBeVisible();
    await expect(page.getByText("[Nội dung gói do Pawlette xác nhận]")).toBeVisible();

    for (const nhom of ["Xuân ấm", "Hạ mát", "Thu ấm", "Đông lạnh"]) {
      await expect(page.getByRole("heading", { name: nhom })).toBeVisible();
    }

    for (const buoc of ["Đo tông", "Nhận bảng màu", "Thử ngay lớp nền"]) {
      await expect(page.getByRole("heading", { name: buoc })).toBeVisible();
    }

    const ctaBooth = page.getByRole("link", { name: /Đặt lịch tại booth/i });
    await expect(ctaBooth).toHaveAttribute("href", "/#ghe-vive");
    await ctaBooth.click();
    await expect(page).toHaveURL(/\/#ghe-vive$/);
    await expect(page.locator("#ghe-vive")).toBeVisible();
  });

  test("2. Vòng màu xoay bình thường và tắt khi prefers-reduced-motion: reduce", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/personal-color");

    const wheel = page.getByTestId("vong-mau-xoay");
    await expect(wheel).toBeVisible();
    const normalAnim = await wheel.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(normalAnim.name).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedAnim = await wheel.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(reducedAnim.name).toBe("none");
    expect(reducedAnim.duration).toBe("0s");
  });

  test("3. Không cuộn ngang ở 9 cỡ màn hình và chụp ảnh 390, 820, 1440", async ({
    page,
  }) => {
    for (const vp of CU_CHUAN_9_CO) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/personal-color");
      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(cuonNgang, `/personal-color bị cuộn ngang ở ${vp.name}`).toBe(
        false
      );
    }

    const dir = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "personal-color"
    );
    fs.mkdirSync(dir, { recursive: true });
    for (const sz of [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      await page.goto("/personal-color");
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(dir, `${sz.label}_personal-color.png`),
      });
    }
  });
});
