import { test, expect } from "./fixtures";
import * as path from "path";

const MA_TRAN_CO_MAN_HINH = [
  { name: "mobile-360x780", width: 360, height: 780 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-430x932", width: 430, height: 932 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "tablet-820x1180", width: 820, height: 1180 },
  { name: "tablet-1180x820", width: 1180, height: 820 },
  { name: "pc-1280x800", width: 1280, height: 800 },
  { name: "pc-1440x900", width: 1440, height: 900 },
  { name: "pc-1920x1080", width: 1920, height: 1080 },
] as const;

const TRANG_KHACH = [
  "/",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/da-thich",
  "/deal",
  "/gio",
  "/new-arrival",
] as const;

test.describe("W032 · Kiểm thử đa màn hình và hiệu năng", () => {
  test.beforeEach(async () => {
    test.setTimeout(120000);
  });

  test("1. Ma trận 9 cỡ màn hình: không cuộn ngang và không lỗi console trên mọi trang khách", async ({
    page,
  }) => {
    const loiConsole: { url: string; loi: string }[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Bỏ qua cảnh báo hydration hoặc 404 ảnh tĩnh test
        if (
          !text.includes("hydration") &&
          !text.includes("Failed to load resource")
        ) {
          loiConsole.push({ url: page.url(), loi: text });
        }
      }
    });

    for (const res of MA_TRAN_CO_MAN_HINH) {
      await page.setViewportSize({ width: res.width, height: res.height });

      for (const route of TRANG_KHACH) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(150);

        // Kiểm tra không cuộn ngang (scrollWidth <= clientWidth + 2)
        const hasHorizontalOverflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 2
          );
        });

        expect(
          hasHorizontalOverflow,
          `Trang ${route} bị tràn ngang ở độ phân giải ${res.name} (scrollWidth > clientWidth)`
        ).toBe(false);
      }
    }

    expect(
      loiConsole,
      `Phát hiện lỗi console nghiêm trọng: ${JSON.stringify(loiConsole)}`
    ).toHaveLength(0);
  });

  test("2. Luồng hoàn chỉnh: Quẹt -> Giỏ -> Giữ hàng -> Mã giữ hàng (Mobile 390×844)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    // 2.1 Thêm sản phẩm vào giỏ từ deck quẹt
    const nutThemGio = page.getByRole("button", { name: "Vào giỏ" }).first();
    await expect(nutThemGio).toBeVisible();
    await nutThemGio.click();
    await page.waitForTimeout(500);

    // 2.2 Vào trang Giỏ hàng
    await page.goto("/gio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Giỏ hàng");

    // 2.3 Bấm Giữ hàng tại booth
    const nutGiuHang = page.getByRole("link", { name: "Giữ hàng tại booth" });
    await expect(nutGiuHang).toBeVisible();
    await nutGiuHang.click();

    // 2.4 Màn hình nhập thông tin giữ hàng
    await expect(page).toHaveURL(/\/giu-hang/);
    const tenInput = page.getByLabel(/Họ và tên/i);
    const sdtInput = page.getByLabel(/Số điện thoại/i);

    if (await tenInput.isVisible()) {
      await tenInput.fill("Nguyễn Văn A");
    }
    if (await sdtInput.isVisible()) {
      await sdtInput.fill("0901234567");
    }

    const nutXacNhan = page.getByRole("button", { name: /Xác nhận|Giữ hàng/i });
    if (await nutXacNhan.isVisible()) {
      await nutXacNhan.click();
      await page.waitForTimeout(1000);
      // Kiểm tra có mã giữ hàng hoặc điều hướng đến trang chi tiết mã
      await expect(page.locator("body")).toContainText(/Mã giữ hàng|VIVE-|Đã giữ/i);
    }
  });

  test("3. Luồng hoàn chỉnh: Quẹt -> Giỏ -> Giữ hàng -> Mã giữ hàng (Desktop 1440×900)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    // 3.1 Dùng nút hoặc phím mũi tên lên để thêm vào giỏ
    const theCard = page.locator("article").first();
    await theCard.click();
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(400);

    // Đảm bảo có ít nhất 1 món trong giỏ
    const nutThemGio = page.getByRole("button", { name: "Vào giỏ" }).first();
    if (await nutThemGio.isVisible()) {
      await nutThemGio.click();
      await page.waitForTimeout(400);
    }

    // 3.2 Vào giỏ hàng
    await page.goto("/gio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Giỏ hàng");

    // 3.3 Bấm Giữ hàng tại booth
    const nutGiuHang = page.getByRole("link", { name: "Giữ hàng tại booth" });
    await expect(nutGiuHang).toBeVisible();
    await nutGiuHang.click();

    // 3.4 Nhập thông tin giữ hàng
    await expect(page).toHaveURL(/\/giu-hang/);
    const tenInput = page.getByLabel(/Họ và tên/i);
    const sdtInput = page.getByLabel(/Số điện thoại/i);

    if (await tenInput.isVisible()) {
      await tenInput.fill("Trần Thị B");
    }
    if (await sdtInput.isVisible()) {
      await sdtInput.fill("0987654321");
    }

    const nutXacNhan = page.getByRole("button", { name: /Xác nhận|Giữ hàng/i });
    if (await nutXacNhan.isVisible()) {
      await nutXacNhan.click();
      await page.waitForTimeout(1000);
      await expect(page.locator("body")).toContainText(/Mã giữ hàng|VIVE-|Đã giữ/i);
    }
  });

  test("4. Chụp ảnh màn hình so sánh 8 trang khách ở 3 cỡ đại diện (390, 820, 1440)", async ({
    page,
  }) => {
    const cacCo = [
      { name: "390", width: 390, height: 844 },
      { name: "820", width: 820, height: 1180 },
      { name: "1440", width: 1440, height: 900 },
    ];

    for (const co of cacCo) {
      await page.setViewportSize({ width: co.width, height: co.height });

      for (const route of TRANG_KHACH) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(200);

        const tenTrang = route === "/" ? "home" : route.replace("/", "");
        const fileName = `${tenTrang}_${co.name}.png`;
        const filePath = path.join("docs", "screenshots", "da-man-hinh", fileName);
        await page.screenshot({ path: filePath, fullPage: false });
      }
    }
  });
});
