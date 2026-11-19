import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import { DOANH_NGHIEP } from "@/lib/data";

// Trang chủ có khối WebGL: trên máy CI (đồ họa phần mềm) điều hướng sau khi cảnh 3D tải có thể chậm vài giây
const expectCham = expect.configure({ timeout: 15000 });

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
    test.setTimeout(180000); // khối LOPOE 3D: WebGL phần mềm trên máy CI biên dịch shader chậm
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
    await expectCham(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    await expect(page.getByRole("heading", { name: /VIVE/i, level: 1 })).toBeVisible();
    await expect(page.getByText("K-Beauty Experience").first()).toBeVisible();
    await expect(page.locator(".tc-v3 .dai")).toBeVisible();

    for (const selector of [
      "#cua-hang",
      "#lopoe",
      "#chon-loc",
      ".luoi",
      "#qua-lopoe",
      "#hang-combo",
      "#ghe-vive",
      "footer",
    ]) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    // Số liệu đọc từ data/ hiện đúng
    await expect(page.locator("#deal-pdrn")).toContainText("999K");
    await expect(page.locator("#deal-mat-na")).toContainText("396K");
    await expect(page.locator("#qua-lopoe")).toContainText("700K");
    // W055: ô combo và hàng trượt lấy giá, quà từ data/deals.yaml
    await expect(page.locator("#combo-lopoe-bo3")).toContainText("911K");
    await expect(page.locator("#combo-lopoe-bo3")).toContainText("Số lượng có hạn");
    await expect(page.locator("#combo-lopoe-kem-amp")).toContainText("725K");
    await expect(page.locator("#combo-vampire-glow")).toContainText("896K");
    await expect(page.locator("#hang-combo .the-combo")).toHaveCount(7);
    // Huy hiệu Hwahae gắn khối giải thưởng Ampoule, không còn "Winner" ở sữa rửa mặt
    await expect(page.locator('#lopoe [data-khoi="amp-giai-thuong"] img[alt*="Hwahae"]')).toHaveCount(1);
    await expect(page.locator("#lopoe")).not.toContainText("Winner");
    await expect(page.locator("#ghe-vive")).toContainText("10:00 – 21:00");

    // /new-arrival vẫn giữ nguyên landing chiến dịch LOPOE 3D
    await page.goto("/new-arrival");
    await expectCham(page).toHaveURL(/\/new-arrival/);
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
    await expectCham(page).toHaveURL(/\/deal\?id=KM-13/);

    // Khối 1: Ghé cửa hàng -> #ghe-vive cùng trang
    await page.goto("/");
    await page.locator('#cua-hang a:has-text("Ghé cửa hàng")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/#ghe-vive$/);

    // Khối 1: Xem sản phẩm -> /danh-muc
    await page.goto("/");
    await page.locator('#cua-hang a:has-text("Xem sản phẩm")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/danh-muc$/);

    // Khối 2: Mua -> /danh-muc?thuong-hieu=LOPOE
    await page.goto("/");
    await page.locator('#lopoe [data-mo-dau] a:has-text("Mua")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("LOPOE");

    // Khối 2: Tìm hiểu thêm -> /new-arrival
    await page.goto("/");
    await page.locator('#lopoe [data-mo-dau] a:has-text("Tìm hiểu thêm")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/new-arrival$/);

    // Khối 2 cuối đoạn 3D: Xem combo -> neo #combo-lopoe-bo3
    await page.goto("/");
    await page.locator('#lopoe [data-khoi="ket"] a:has-text("Xem combo")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/#combo-lopoe-bo3$/);

    // Hàng combo trượt: thẻ Bộ 3 -> /deal?id=LOPOE-COMBO-BO3
    await page.goto("/");
    await page.locator('#hang-combo a.the-combo[href*="LOPOE-COMBO-BO3"]').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/deal\?id=LOPOE-COMBO-BO3/);

    // Khối 3: Logo thương hiệu Medicube và Rep!el
    await page.goto("/");
    await page.locator("#chon-loc").scrollIntoViewIfNeeded();
    const linkMedicube = page.locator('#chon-loc a[aria-label="Medicube"]');
    await expect(linkMedicube).toHaveAttribute("href", "/danh-muc?thuong-hieu=Medicube");
    await linkMedicube.evaluate((el: HTMLElement) => el.click()); // hàng logo đang chạy: bấm thẳng phần tử, không theo tọa độ
    await expectCham(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("Medicube");

    await page.goto("/");
    await page.locator("#chon-loc").scrollIntoViewIfNeeded();
    const linkRepiel = page.locator('#chon-loc a[aria-label="Rep!el"]');
    await expect(linkRepiel).toHaveAttribute("href", "/danh-muc?thuong-hieu=Rep%21el");
    await linkRepiel.evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/danh-muc\?/);
    expect(new URL(page.url()).searchParams.get("thuong-hieu")).toBe("Rep!el");

    // Khối 4 Personal color: Tìm hiểu thêm -> /personal-color
    await page.goto("/");
    await page.locator('#personal-color a:has-text("Tìm hiểu thêm")').evaluate((el: HTMLElement) => el.click()); // WebKit cuộn mượt làm lệch tọa độ
    await expectCham(page).toHaveURL(/\/personal-color$/);

    // Khối 4 Check-in: Xem quà (sap_co) -> hiện toast, URL không đổi
    await page.goto("/");
    const nutXemQua = page.locator('#check-in button[data-sap-co="true"]');
    await expect(nutXemQua).toBeVisible();
    const toast = page.locator('[role="status"]');
    // Nút toast cần JS: bấm lại tới khi trang hydrate xong
    await expect(async () => {
      await nutXemQua.evaluate((el: HTMLElement) => el.click());
      await expect(toast).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 20000 });
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(toast).toContainText("Tính năng sắp ra mắt");

    // Khối 4 Combo PDRN Pink: Xem deal -> /deal?id=COMBO-PINK
    await page.goto("/");
    await page.locator('#deal-pdrn a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("COMBO-PINK");

    // Khối 4 Mặt nạ Uniura: Xem deal -> /deal?id=DC-05
    await page.goto("/");
    await page.locator('#deal-mat-na a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("DC-05");

    // Khối 5 Quà LOPOE: Xem deal -> /deal?id=KM-08
    await page.goto("/");
    await page.locator('#qua-lopoe a:has-text("Xem deal")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/deal\?/);
    expect(new URL(page.url()).searchParams.get("id")).toBe("KM-08");

    // Khối 6 Ghé VIVE: Chỉ đường (link ngoài đúng doanh_nghiep.ban_do + tab mới + noopener) và Giữ hàng -> /gio
    await page.goto("/");
    const nutChiDuong = page.locator('#ghe-vive a:has-text("Chỉ đường")');
    await expect(nutChiDuong).toHaveAttribute("href", DOANH_NGHIEP.ban_do!);
    await expect(nutChiDuong).toHaveAttribute("target", "_blank");
    const rel = await nutChiDuong.getAttribute("rel");
    expect(rel).toContain("noopener");

    await page.locator('#ghe-vive a:has-text("Giữ hàng")').evaluate((el: HTMLElement) => el.click());
    await expectCham(page).toHaveURL(/\/gio$/);
  });

  test("3. Hiệu ứng: 24 mảnh ghép, 16 logo chạy, LOPOE cuộn 3D và prefers-reduced-motion", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("#ghep .manh")).toHaveCount(24);
    await expect(page.locator(".tuong-logo .nhom")).toHaveCount(2);
    await expect(page.locator(".tuong-logo .nhom").first().locator("a")).toHaveCount(16);

    // Khối LOPOE 3D: đoạn dính dài, có canvas; cuộn tới giữa rồi lên lại không lỗi
    const lopoe = page.locator("#lopoe");
    const cao = await lopoe.evaluate((el) => el.getBoundingClientRect().height);
    expect(cao).toBeGreaterThan(900 * 10);
    await expect(lopoe.locator("canvas")).toHaveCount(1);
    await lopoe.evaluate((el: HTMLElement) => window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.4));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    expect(pageErrors).toEqual([]);

    // Giảm chuyển động: bản tĩnh, không canvas, đủ chữ
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#lopoe canvas")).toHaveCount(0);
    await expect(page.locator("#lopoe")).toContainText("pH 5.5");

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
        "#hang-combo",
        "#ghe-vive",
      ]) {
        await page.locator(idKhoi).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      // Trang dài hơn giới hạn ảnh chụp toàn trang (khối 3D 1500vh): chụp từng khối thay cho fullPage
      for (const idKhoi of ["#lopoe", "#combo-lopoe-bo3", "#hang-combo"]) {
        await page.locator(idKhoi).evaluate((el: HTMLElement) => el.scrollIntoView({ block: "start" }));
        await page.waitForTimeout(400);
        await page.screenshot({
          path: path.join(dir, `${moc.label}_${idKhoi.slice(1)}.png`),
        });
      }
    }
  });
});
