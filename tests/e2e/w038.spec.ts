import { test, expect, datDaKhaoSat } from "./fixtures";

const DANH_SACH_TRANG_KHACH = [
  "/",
  "/new-arrival",
  "/chao",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/da-thich",
  "/deal",
  "/gio",
  "/giu-hang",
  "/chinh-sach",
  "/dang-nhap",
  "/personal-color",
] as const;

const NHAN_DESKTOP_CHUAN = [
  "New Arrival",
  "Quẹt",
  "Sản phẩm",
  "Deal",
  "Đã thích",
  "Giỏ",
  "Đăng nhập",
];

const NHAN_TABLET_CHUAN = [
  "New Arrival",
  "Quẹt",
  "Sản phẩm",
  "Deal",
  "Đã thích",
  "Giỏ",
  "Đăng nhập",
];

const NHAN_MOBILE_TAB_CHUAN = [
  "Quẹt",
  "Sản phẩm",
  "Đã thích",
  "Deal",
  "Giỏ",
];

test.describe("W038 · Khung trang cố định & điều hướng dùng chung", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Logo giữ nguyên DOM node không nhấp nháy khi chuyển trang (1440x900)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    await page.goto("/quet");
    await expect(page).toHaveURL(/\/quet/);

    const logo = page.locator('div[role="banner"] [data-testid="logo"]');
    await expect(logo).toBeVisible();

    // Gắn thuộc tính đánh dấu lên DOM node của logo
    await logo.evaluate((el) => {
      el.setAttribute("data-nav-test", "persistent-logo-w038");
    });

    const kiemTraLogoConNguyen = async () => {
      const val = await logo.evaluate((el) => el.getAttribute("data-nav-test"));
      expect(val).toBe("persistent-logo-w038");
    };

    // Bấm Sản phẩm
    await page.locator('div[role="banner"] nav a:has-text("Sản phẩm")').click();
    await expect(page).toHaveURL(/\/danh-muc/);
    await kiemTraLogoConNguyen();

    // Bấm Deal
    await page.locator('div[role="banner"] nav a:has-text("Deal")').click();
    await expect(page).toHaveURL(/\/deal/);
    await kiemTraLogoConNguyen();

    // Bấm Giỏ
    await page.locator('div[role="banner"] a:has-text("Giỏ")').click();
    await expect(page).toHaveURL(/\/gio/);
    await kiemTraLogoConNguyen();
  });

  test("2. Bấm logo từ /deal thì về /, không mục nào sáng; bấm New Arrival về /new-arrival, mục đó sáng (1440x900)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    await page.goto("/deal");
    await expect(page).toHaveURL(/\/deal/);

    // Bấm logo
    const logoLink = page.locator('div[role="banner"] a[aria-label="Trang chủ VIVE"]');
    await logoLink.click();

    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    // Ở /: không mục nào sáng theo W051
    const newArrival = page.locator('div[role="banner"] nav a:has-text("New Arrival")');
    await expect(newArrival).not.toHaveAttribute("aria-current", "page");

    // Bấm New Arrival -> /new-arrival, mục đó sáng
    await newArrival.click();
    await expect(page).toHaveURL(/\/new-arrival/);
    await expect(newArrival).toHaveAttribute("aria-current", "page");
  });

  test("3. Duyệt mọi trang khách ở 1440, 820 và 390 kiểm tra nhãn và thứ tự điều hướng", async ({
    page,
  }) => {
    await datDaKhaoSat(page);

    // Mốc 1440px (Desktop)
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const duongDan of DANH_SACH_TRANG_KHACH) {
      await page.goto(duongDan);
      const topBar = page.locator('div[role="banner"]');
      await expect(topBar).toBeVisible();

      // Lấy danh sách text của các nút điều hướng (bỏ qua logo text rỗng)
      const menuTexts = await topBar
        .locator('nav a, [data-testid="menu-phai"] a')
        .evaluateAll((els) =>
          els
            .map((el) => {
              // Lấy text cấp cao nhất hoặc span
              const spans = el.querySelectorAll("span");
              if (spans.length > 0) {
                // span đầu tiên chứa nhãn
                for (const s of spans) {
                  const t = s.textContent?.trim();
                  if (t && !/^\d+$/.test(t) && t !== "99+") return t;
                }
              }
              return el.textContent?.trim() || "";
            })
            .filter(Boolean)
        );

      expect(menuTexts).toEqual(NHAN_DESKTOP_CHUAN);
    }

    // Mốc 820px (Tablet rail)
    await page.setViewportSize({ width: 820, height: 1180 });
    for (const duongDan of DANH_SACH_TRANG_KHACH) {
      await page.goto(duongDan);
      const rail = page.locator('nav[aria-label="Điều hướng máy tính bảng"]');
      await expect(rail).toBeVisible();

      const railTexts = await rail
        .locator("div a")
        .evaluateAll((els) =>
          els
            .map((el) => {
              const span = el.querySelector("span:not([aria-label])");
              return span ? span.textContent?.trim() : el.textContent?.trim();
            })
            .filter(Boolean)
        );

      expect(railTexts).toEqual(NHAN_TABLET_CHUAN);
    }

    // Mốc 390px (Mobile top 52px + bottom tab)
    await page.setViewportSize({ width: 390, height: 844 });
    for (const duongDan of DANH_SACH_TRANG_KHACH) {
      await page.goto(duongDan);

      // Thanh trên mảnh 52px
      const headerMobile = page.locator("header.md\\:hidden");
      await expect(headerMobile).toBeVisible();
      await expect(headerMobile.locator('[data-testid="logo"]')).toBeVisible();
      await expect(headerMobile.locator('a:has-text("Đăng nhập")')).toBeVisible();

      // Tab dưới 5 mục
      const tabDuoi = page.locator('nav[aria-label="Điều hướng chính"]');
      await expect(tabDuoi).toBeVisible();

      const tabTexts = await tabDuoi
        .locator("a span.text-\\[11px\\]")
        .evaluateAll((els) => els.map((el) => el.textContent?.trim()).filter(Boolean));

      expect(tabTexts).toEqual(NHAN_MOBILE_TAB_CHUAN);
    }
  });

  test("4. Danh mục: chọn Mặt nạ có menu + nút Quay lại, back trình duyệt về danh mục gốc", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    await page.goto("/danh-muc");
    await expect(page).toHaveURL(/\/danh-muc/);

    // Thanh menu luôn hiện
    await expect(page.locator('div[role="banner"]')).toBeVisible();

    // Chọn danh mục "Mặt nạ"
    const nutMatNa = page.locator('button:has-text("Mặt nạ")').first();
    await nutMatNa.click();

    // URL đổi thành ?loai=mat-na
    await expect(page).toHaveURL(/\/danh-muc\?.*loai=mat-na/);

    // Menu vẫn hiện
    await expect(page.locator('div[role="banner"]')).toBeVisible();

    // Nút "← Quay lại" xuất hiện
    const nutQuayLai = page.locator('button[aria-label*="Quay lại"]');
    await expect(nutQuayLai).toBeVisible();

    // Bấm Back của trình duyệt
    await page.goBack();

    // URL quay về danh mục gốc
    await expect(page).toHaveURL(/\/danh-muc$/);
  });

  test("5. Bấm Đăng nhập hiện toast 'Tính năng sắp ra mắt', URL không đổi (W051 sap_co)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    await page.goto("/deal");
    const nutDangNhap = page.locator('div[role="banner"] a[data-sap-co="true"]');
    await expect(nutDangNhap).toBeVisible();
    await nutDangNhap.click();

    // URL không đổi
    await expect(page).toHaveURL(/\/deal/);

    // Toast xuất hiện với text "Tính năng sắp ra mắt"
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Tính năng sắp ra mắt");
  });

  test("6. Khoảng cách logo desktop tới New Arrival >= 24px (1024, 1440) và vùng bấm logo tablet >= 44px", async ({
    page,
  }) => {
    await datDaKhaoSat(page);

    for (const vp of [
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      for (const route of ["/", "/new-arrival"]) {
        await page.goto(route);
        const topBar = page.locator('div[role="banner"]');
        const logoBox = await topBar.locator('[data-testid="logo"]').boundingBox();
        const firstNavBox = await topBar.locator("nav a").first().boundingBox();
        expect(logoBox).not.toBeNull();
        expect(firstNavBox).not.toBeNull();
        if (logoBox && firstNavBox) {
          const gap = firstNavBox.x - (logoBox.x + logoBox.width);
          expect(
            gap,
            `Khoảng cách logo -> New Arrival tại ${route} (${vp.width}px) phải >= 24px, đo được ${gap}px`
          ).toBeGreaterThanOrEqual(24);
        }
      }
    }

    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/");
    const tabletLogoLink = page
      .locator('nav[aria-label="Điều hướng máy tính bảng"] a[href="/"]')
      .first();
    const box = await tabletLogoLink.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
