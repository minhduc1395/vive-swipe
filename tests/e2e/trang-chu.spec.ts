import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import { DOANH_NGHIEP } from "@/lib/data";

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

test.describe("W050 · Trang chủ mới / theo landing v3", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Trang chủ / mới đủ 6 khối + dải + footer + số liệu từ data/, /new-arrival còn nguyên, không lỗi console", async ({
    page,
  }) => {
    const loiConsole: string[] = [];
    page.on("pageerror", (err) => {
      if (!err.message.includes("due to access control checks")) {
        loiConsole.push(`pageerror: ${err.message}`);
      }
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          !text.includes("supabase.e2e.test") &&
          !text.includes("due to access control checks")
        ) {
          loiConsole.push(`console.error: ${text}`);
        }
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    await expect(page.getByRole("heading", { name: /VIVE/i, level: 1 })).toBeVisible();
    await expect(page.getByText("K-Beauty Experience").first()).toBeVisible();
    await expect(page.locator(".tc-v3 .dai")).toBeVisible();

    for (const selector of [
      "#cua-hang",
      "#lopoe",
      "#chon-loc",
      ".luoi",
      "#qua-lopoe",
      "#ghe-vive",
      "footer",
    ]) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    // Số liệu đọc từ data/ hiện đúng
    await expect(page.locator("#deal-pdrn")).toContainText("999K");
    await expect(page.locator("#deal-mat-na")).toContainText("396K");
    await expect(page.locator("#qua-lopoe")).toContainText("700K");
    await expect(page.locator("#ghe-vive")).toContainText("10:00 – 21:00");

    // /new-arrival vẫn giữ nguyên landing chiến dịch LOPOE 3D
    await page.goto("/new-arrival");
    await expect(page).toHaveURL(/\/new-arrival/);
    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();

    expect(loiConsole).toEqual([]);
  });

  test("2. Bấm từng nút trên dải khuyến mãi và khối 1–6 tới đúng URL (sap_co hiện toast)", async ({
    page,
  }) => {
    // Dải khuyến mãi trên điện thoại (390x844): link Xem › vùng bấm cao >= 44px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const daiLinkBox = await page.locator(".tc-v3 .dai a").boundingBox();
    expect(daiLinkBox).not.toBeNull();
    if (daiLinkBox) {
      expect(daiLinkBox.height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    // Dải khuyến mãi: Xem › -> /deal?id=KM-13
    await page.goto("/");
    await page.locator(".tc-v3 .dai a").evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/deal\?id=KM-13/);

    // Khối 1: Ghé cửa hàng -> #ghe-vive cùng trang
    await page.goto("/");
    await page.locator('#cua-hang a:has-text("Ghé cửa hàng")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/#ghe-vive$/);

    // Khối 1: Xem sản phẩm -> /danh-muc
    await page.goto("/");
    await page.locator('#cua-hang a:has-text("Xem sản phẩm")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/danh-muc$/);

    // Khối 2: Mua -> /danh-muc?thuong-hieu=LOPOE
    await page.goto("/");
    await page.locator('#lopoe a:has-text("Mua")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("LOPOE");

    // Khối 2: Tìm hiểu thêm -> /new-arrival
    await page.goto("/");
    await page.locator('#lopoe a:has-text("Tìm hiểu thêm")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/new-arrival$/);

    // Khối 3: Logo thương hiệu Medicube và Rep!el
    await page.goto("/");
    await page.locator("#chon-loc").scrollIntoViewIfNeeded();
    const linkMedicube = page.locator('#chon-loc a[aria-label="Medicube"]');
    await expect(linkMedicube).toHaveAttribute("href", "/danh-muc?thuong-hieu=Medicube");
    await linkMedicube.evaluate((el: HTMLElement) => el.click()); // hàng logo đang chạy: bấm thẳng phần tử, không theo tọa độ
    await expect(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("Medicube");

    await page.goto("/");
    await page.locator("#chon-loc").scrollIntoViewIfNeeded();
    const linkRepiel = page.locator('#chon-loc a[aria-label="Rep!el"]');
    await expect(linkRepiel).toHaveAttribute("href", "/danh-muc?thuong-hieu=Rep%21el");
    await linkRepiel.evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("Rep!el");

    // Khối 4 Personal color: Tìm hiểu thêm -> /personal-color
    await page.goto("/");
    await page.locator('#personal-color a:has-text("Tìm hiểu thêm")').evaluate((el: HTMLElement) => el.click()); // WebKit cuộn mượt làm lệch tọa độ
    await expect(page).toHaveURL(/\/personal-color$/);

    // Khối 4 Check-in: Xem quà (sap_co) -> hiện toast, URL không đổi
    await page.goto("/");
    const nutXemQua = page.locator('#check-in button[data-sap-co="true"]');
    await expect(nutXemQua).toBeVisible();
    await nutXemQua.evaluate((el: HTMLElement) => el.click());
    expect(new URL(page.url()).pathname).toBe("/");
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Tính năng sắp ra mắt");

    // Khối 4 Combo PDRN Pink: Xem deal -> /deal?id=COMBO-PINK
    await page.goto("/");
    await page.locator('#deal-pdrn a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("COMBO-PINK");

    // Khối 4 Mặt nạ Uniura: Xem deal -> /deal?id=DC-05
    await page.goto("/");
    await page.locator('#deal-mat-na a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("DC-05");

    // Khối 5 Quà LOPOE: Xem deal -> /deal?id=KM-08
    await page.goto("/");
    await page.locator('#qua-lopoe a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("KM-08");

    // Khối 6 Ghé VIVE: Chỉ đường (link ngoài đúng doanh_nghiep.ban_do + tab mới + noopener) và Giữ hàng -> /gio
    await page.goto("/");
    const nutChiDuong = page.locator('#ghe-vive a:has-text("Chỉ đường")');
    await expect(nutChiDuong).toHaveAttribute("href", DOANH_NGHIEP.ban_do!);
    await expect(nutChiDuong).toHaveAttribute("target", "_blank");
    const rel = await nutChiDuong.getAttribute("rel");
    expect(rel).toContain("noopener");

    await page.locator('#ghe-vive a:has-text("Giữ hàng")').evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/gio$/);
  });

  test("3. Hiệu ứng: 24 mảnh ghép, 16 logo chạy, LOPOE cuộn 2 chiều và prefers-reduced-motion", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("#ghep .manh")).toHaveCount(24);
    await expect(page.locator(".tuong-logo .nhom")).toHaveCount(2);
    await expect(page.locator(".tuong-logo .nhom").first().locator("a")).toHaveCount(16);

    // Cuộn tới giữa khối LOPOE rồi cuộn lên lại đầu trang
    await page.locator("#lopoe .bo-ba").evaluate((el) => {
      el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(200);

    for (const sel of ["#dich-bay", "#sp-giua", "#sp-phai"]) {
      const opacity = await page
        .locator(sel)
        .evaluate((el) => Number(getComputedStyle(el).opacity));
      expect(opacity, `${sel} phải rõ khi #lopoe ở giữa màn hình`).toBeGreaterThan(0.8);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    expect(pageErrors).toEqual([]);

    // Giảm chuyển động (prefers-reduced-motion: reduce)
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    for (const sel of ["#dich-bay", "#sp-giua", "#sp-phai"]) {
      const opacity = await page
        .locator(sel)
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(opacity, `${sel} phải hiện opacity 1 khi giảm chuyển động`).toBe("1");
    }

    const anim = await page.locator(".tuong-logo .chay").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, duration: cs.animationDuration };
    });
    expect(anim.name === "none" || anim.duration === "0s").toBe(true);
  });

  test("4. Không cuộn ngang ở 9 cỡ màn hình và chụp ảnh 390, 820, 1440 vào test-results/screenshots/w050", async ({
    page,
  }) => {
    for (const vp of CU_CHUAN_9_CO) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForTimeout(150);
      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(
        cuonNgang,
        `Trang chủ / bị cuộn ngang ở ${vp.name} (${vp.width}x${vp.height})`
      ).toBe(false);
    }

    const dir = path.join(process.cwd(), "test-results", "screenshots", "w050");
    fs.mkdirSync(dir, { recursive: true });
    for (const moc of [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: moc.width, height: moc.height });
      await page.goto("/");
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(dir, `${moc.label}_home.png`) });

      for (const idKhoi of [
        "#lopoe",
        "#chon-loc",
        "#personal-color",
        "#deal-pdrn",
        "#qua-lopoe",
        "#ghe-vive",
      ]) {
        await page.locator(idKhoi).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(dir, `${moc.label}_home_full.png`),
        fullPage: true,
      });
    }
  });
});
