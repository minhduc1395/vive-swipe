import { test, expect, datDaKhaoSat } from "./fixtures";

const CAC_MOC_MAN_HINH = [
  // 1. Điện thoại
  { name: "mobile-360", width: 360, height: 780, loai: "mobile" },
  { name: "mobile-390", width: 390, height: 844, loai: "mobile" },
  { name: "mobile-430", width: 430, height: 932, loai: "mobile" },
  // 2. Máy tính bảng
  { name: "tablet-768", width: 768, height: 1024, loai: "tablet" },
  { name: "tablet-820", width: 820, height: 1180, loai: "tablet" },
  { name: "tablet-1180", width: 1180, height: 820, loai: "tablet-ngang" },
  // 3. Máy tính
  { name: "pc-1280", width: 1280, height: 800, loai: "pc" },
  { name: "pc-1440", width: 1440, height: 900, loai: "pc" },
  { name: "pc-1920", width: 1920, height: 1080, loai: "pc" },
] as const;

const CAC_ROUTE_CHINH = [
  "/",
  "/chao",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/da-thich",
  "/deal",
  "/gio",
];

test.describe("W031 · Khung co giãn (AppShell) và điều hướng 3 mốc", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
  });

  test("1. Mốc Điện thoại (< 768px): hiện tab dưới, ẩn rail trái và thanh trên máy tính", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/quet");

    const tabMobile = page.getByRole("navigation", {
      name: "Điều hướng chính",
      exact: true,
    });
    await expect(tabMobile).toBeVisible();

    const railTablet = page.getByRole("navigation", {
      name: "Điều hướng máy tính bảng",
      exact: true,
    });
    await expect(railTablet).toBeHidden();

    const topDesktop = page.getByRole("navigation", {
      name: "Điều hướng máy tính",
      exact: true,
    });
    await expect(topDesktop).toBeHidden();
  });

  test("2. Mốc Máy tính bảng (768–1023px): hiện rail dọc trái, ẩn tab dưới và thanh trên", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/quet");

    const railTablet = page.getByRole("navigation", {
      name: "Điều hướng máy tính bảng",
      exact: true,
    });
    await expect(railTablet).toBeVisible();

    const tabMobile = page.getByRole("navigation", {
      name: "Điều hướng chính",
      exact: true,
    });
    await expect(tabMobile).toBeHidden();

    const topDesktop = page.getByRole("navigation", {
      name: "Điều hướng máy tính",
      exact: true,
    });
    await expect(topDesktop).toBeHidden();
  });

  test("3. Mốc Máy tính (>= 1024px): hiện thanh trên đủ mục (New Arrival, Quẹt, Sản phẩm, Deal, Đã thích, ô tìm, Giỏ, Đăng nhập), ẩn tab dưới và rail", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");

    const topDesktop = page.getByRole("navigation", {
      name: "Điều hướng máy tính",
      exact: true,
    });
    await expect(topDesktop).toBeVisible();

    // Kiểm tra đủ các link chính trên thanh trên máy tính
    await expect(
      topDesktop.getByRole("link", { name: "New Arrival" })
    ).toBeVisible();
    await expect(topDesktop.getByRole("link", { name: "Quẹt" })).toBeVisible();
    await expect(
      topDesktop.getByRole("link", { name: "Sản phẩm" })
    ).toBeVisible();
    await expect(topDesktop.getByRole("link", { name: "Deal" })).toBeVisible();
    await expect(
      topDesktop.getByRole("link", { name: "Đã thích" })
    ).toBeVisible();

    // Ô tìm kiếm và nút Giỏ, Đăng nhập
    const headerBanner = page.getByRole("banner");
    await expect(
      headerBanner.getByPlaceholder("Tìm sản phẩm, thương hiệu")
    ).toBeVisible();
    await expect(
      headerBanner.getByRole("link", { name: /Giỏ/ })
    ).toBeVisible();
    await expect(
      headerBanner.getByRole("link", { name: "Đăng nhập" })
    ).toBeVisible();

    // Ẩn tab mobile và rail tablet
    const tabMobile = page.getByRole("navigation", {
      name: "Điều hướng chính",
    });
    await expect(tabMobile).toBeHidden();

    const railTablet = page.getByRole("navigation", {
      name: "Điều hướng máy tính bảng",
    });
    await expect(railTablet).toBeHidden();
  });

  test("4. Không cuộn ngang (scrollWidth <= clientWidth) ở cả 9 cỡ màn hình", async ({
    page,
  }) => {
    for (const viewport of CAC_MOC_MAN_HINH) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const route of CAC_ROUTE_CHINH) {
        await page.goto(route);
        // Kiểm tra scrollWidth không vượt quá innerWidth
        const cuonNgang = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          );
        });
        expect(
          cuonNgang,
          `Bị cuộn ngang ở ${route} với cỡ ${viewport.name} (${viewport.width}x${viewport.height})`
        ).toBe(false);
      }
    }
  });

  test("5. Chụp ảnh 7 trang ở 3 cỡ chuẩn: 390 (mobile), 820 (tablet), 1440 (desktop)", async ({
    page,
  }) => {
    const cacMocChup = [
      { name: "390", width: 390, height: 844 },
      { name: "820", width: 820, height: 1180 },
      { name: "1440", width: 1440, height: 900 },
    ];

    for (const moc of cacMocChup) {
      await page.setViewportSize({ width: moc.width, height: moc.height });

      for (const route of CAC_ROUTE_CHINH) {
        await page.goto(route);
        await page.waitForTimeout(300);
        const tenFile = `test-results/w031-screenshots/${moc.name}_${route.replace(/\//g, "root_") || "home"}.png`;
        await page.screenshot({ path: tenFile });
      }
    }
  });
});
