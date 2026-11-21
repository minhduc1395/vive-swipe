import { test, expect } from "./fixtures";

test.describe("W045 · Trang kho /quan-tri/san-pham (song ngữ, phân quyền, 3 cỡ)", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Tài khoản nhan_vien (booth@vive.vn) bị chặn truy cập trang kho", async ({
    page,
  }) => {
    await page.goto("/quan-tri/san-pham");
    await expect(
      page.getByRole("heading", { name: "Kho sản phẩm song ngữ" }),
    ).toBeVisible();

    await page.locator("#kho-email").fill("booth@vive.vn");
    await page.locator("#kho-password").fill("booth123");
    await page.getByRole("button", { name: "Đăng nhập kho / quản trị" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /Không có quyền truy cập trang kho/i }),
    ).toBeVisible();
    await expect(page.getByTestId("loc-ai-can-xem")).toHaveCount(0);
  });

  test("2. TIÊU CHÍ XONG: Đăng nhập kho -> duyệt AI -> sửa ten_en -> bản EN trên web đổi và lưu lịch sử", async ({
    page,
  }, testInfo) => {
    const maSp =
      testInfo.project.name === "iphone-13" ? "LOPOE-CF" : "LOPOE-AMP";
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/quan-tri/san-pham");

    await page.locator("#kho-email").fill("kho@vive.vn");
    await page.locator("#kho-password").fill("kho123");
    await page.getByRole("button", { name: "Đăng nhập kho / quản trị" }).click();

    await expect(page.getByTestId("loc-ai-can-xem")).toBeVisible();

    // Lọc các mã có trường AI cần xem và mở mã dành riêng cho project này để tránh đụng song song
    await page.getByTestId("loc-ai-can-xem").click();
    await page.getByRole("button", { name: `Sửa ${maSp}` }).click();

    // Vai trò kho bị khóa giá và hiển thị
    await expect(page.getByLabel("Giá bán")).toBeDisabled();
    await expect(page.getByLabel("Hiển thị trên web")).toBeDisabled();

    // Đánh dấu Đã xem trường AI
    await expect(page.getByTestId("nhan-ai-ten_en")).toBeVisible();
    await page.getByTestId("da-xem-ten_en").click();
    await expect(page.getByTestId("nhan-ai-ten_en")).toHaveCount(0);

    // Sửa bản tiếng Anh 2 cột VI | EN và lưu
    const tenEnMoi = `${maSp} Verified Gentle Daily Care 2026`;
    await page.locator("#sua-ten-en").fill(tenEnMoi);
    await page
      .locator("#sua-mo-ta-en")
      .fill("Gentle pH-balanced daily skincare formula.");
    await page.getByTestId("luu-san-pham-kho").click();

    await expect(page.getByRole("status")).toContainText("Đã lưu");

    // Kiểm tra tab Lịch sử ghi đúng thao tác nguoi
    await page.getByTestId("tab-lich-su").click();
    await expect(page.getByTestId("danh-sach-lich-su")).toContainText(tenEnMoi);
    await expect(page.getByTestId("danh-sach-lich-su")).toContainText("nguoi");

    // Đóng hộp thoại, chuyển chế độ xem EN và tải lại trang để xác nhận lưu server bền vững
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await page.getByTestId("loc-ai-can-xem").click(); // bỏ lọc AI để thấy lại mã vừa sửa

    await page
      .getByTestId("che-do-ngon-ngu-xem")
      .getByRole("button", { name: "EN", exact: true })
      .click();
    await expect(page.getByTestId(`ten-sp-${maSp}`)).toHaveText(tenEnMoi);

    await page.reload();
    await expect(page.getByTestId(`ten-sp-${maSp}`)).toHaveText(tenEnMoi);
  });

  test("3. Co giãn mượt và không cuộn ngang trên điện thoại (390), tablet/iPad (820) và máy tính (1440)", async ({
    page,
  }) => {
    await page.goto("/quan-tri/san-pham");
    await page.getByRole("button", { name: /Vào nhanh vai trò Kho/i }).click();
    await expect(page.getByTestId("loc-ai-can-xem")).toBeVisible();

    for (const vp of [
      { width: 390, height: 844 },
      { width: 820, height: 1180 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(
        cuonNgang,
        `/quan-tri/san-pham bị cuộn ngang ở ${vp.width}×${vp.height}`,
      ).toBe(false);
    }
  });
});
