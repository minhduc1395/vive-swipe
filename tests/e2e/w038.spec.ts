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

  test("2. Bấm logo từ /deal thì về /, mục New Arrival sáng (1440x900)", async ({
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

    // Mục New Arrival sáng với aria-current="page"
    const newArrival = page.locator('div[role="banner"] nav a:has-text("New Arrival")');
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
        .locator("nav a, .ml-auto a")
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
});
