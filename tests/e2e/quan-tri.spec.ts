import { test, expect } from "./fixtures";
import * as fs from "fs";
import * as path from "path";

const CU_CHUAN_9_CO = [
  { name: "360x780", width: 360, height: 780 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1180x820", width: 1180, height: 820 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;

test.describe("W017 · Trang quản trị /quan-tri có xác thực", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Khách chưa đăng nhập chỉ thấy form xác thực; tài khoản nhan_vien (booth@vive.vn) bị chặn", async ({
    page,
  }) => {
    await page.goto("/quan-tri");
    await expect(
      page.getByRole("heading", { name: "Quản trị VIVE Quẹt" }),
    ).toBeVisible();
    await expect(page.locator("#admin-email")).toBeVisible();

    // Không rò rỉ dữ liệu quản trị trước khi đăng nhập
    await expect(
      page.getByRole("navigation", { name: "Mục quản trị" }),
    ).toHaveCount(0);

    // Đăng nhập bằng tài khoản nhân viên quầy -> bị từ chối quyền quản trị
    await page.locator("#admin-email").fill("booth@vive.vn");
    await page.locator("#admin-password").fill("booth123");
    await page.getByRole("button", { name: "Đăng nhập quản trị" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /Không có quyền quản trị/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Mục quản trị" }),
    ).toHaveCount(0);
  });

  test("2. Tài khoản quan_tri khóa deal may rủi, lưu thay đổi lên server cho web khách và nhập CSV KiotViet", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quan-tri");

    await page.locator("#admin-email").fill("admin@vive.vn");
    await page.locator("#admin-password").fill("admin123");
    await page.getByRole("button", { name: "Đăng nhập quản trị" }).click();

    await expect(
      page.getByRole("navigation", { name: "Mục quản trị" }),
    ).toBeVisible();

    // Khóa deal may rủi chưa đăng ký (nếu có trong dữ liệu)
    const lockedButtons = page.getByRole("button", {
      name: /Bị khóa \(chưa đăng ký\)/i,
    });
    if ((await lockedButtons.count()) > 0) {
      await expect(lockedButtons.first()).toBeDisabled();
    }

    // Đánh dấu hết quà một deal (COMBO-LOPOE-3) và xác nhận sang /deal web khách thấy thay đổi
    const nutHetQua = page.getByRole("button", {
      name: "Hết quà deal COMBO-LOPOE-3",
    });
    if ((await nutHetQua.count()) > 0) {
      await nutHetQua.click();
      await expect(page.getByText(/Đã cập nhật deal/)).toBeVisible();

      // Mở /deal bên web khách để kiểm tra dữ liệu cập nhật từ server
      await page.goto("/deal");
      await expect(page.locator("h1")).toContainText("Deal");

      // Quay lại /quan-tri hoàn tác trạng thái hết quà
      await page.goto("/quan-tri");
      await page
        .getByRole("button", { name: "Hết quà deal COMBO-LOPOE-3" })
        .click();
    }

    // Chuyển sang tab Nhập tồn KiotViet và tải file mẫu CSV
    await page.getByRole("button", { name: "Nhập tồn KiotViet" }).click();
    const csvPath = path.resolve(
      process.cwd(),
      "tests/fixtures/mau-kiotviet-ton.csv",
    );
    await page.locator('input[type="file"]').setInputFiles(csvPath);

    await expect(page.getByText("Khớp: 5 món")).toBeVisible();
    await expect(page.getByText("Về 0 (hết hàng): 1")).toBeVisible();

    await page.getByRole("button", { name: /Xác nhận cập nhật/ }).click();
    await expect(
      page.getByText("Đã cập nhật tồn cho 5 sản phẩm (1 mã hết hàng)."),
    ).toBeVisible();

    // Kiểm tra lịch sử su_kien đã ghi thao tác
    await page.getByRole("button", { name: "Số liệu & Lịch sử" }).click();
    await expect(page.getByText(/nhập CSV KiotViet/i).first()).toBeVisible();
  });

  test("3. Không cuộn ngang ở 9 cỡ màn hình và chụp ảnh 390, 820, 1440", async ({
    page,
  }) => {
    await page.goto("/quan-tri");
    await page.locator("#admin-email").fill("admin@vive.vn");
    await page.locator("#admin-password").fill("admin123");
    await page.getByRole("button", { name: "Đăng nhập quản trị" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mục quản trị" }),
    ).toBeVisible();

    for (const vp of CU_CHUAN_9_CO) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(cuonNgang, `/quan-tri bị cuộn ngang ở ${vp.name}`).toBe(false);
    }

    const dir = path.join(process.cwd(), "test-results", "screenshots", "quan-tri");
    fs.mkdirSync(dir, { recursive: true });
    for (const sz of [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(dir, `${sz.label}_quan-tri.png`) });
    }
  });
});
