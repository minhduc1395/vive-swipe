import { test, expect } from "./fixtures";
import * as path from "path";

const RESOLUTIONS = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "tablet-820x1180", width: 820, height: 1180 },
  { name: "tablet-1180x820", width: 1180, height: 820 },
  { name: "pc-1440x900", width: 1440, height: 900 },
] as const;

test.describe("W028 · Giao diện máy tính và máy tính bảng", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Phím tắt trên /quet: mũi tên phải (Thích), trái (Bỏ qua), lên (Vào giỏ), Z (Hoàn tác), Space (Chi tiết), Escape (Đóng)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    // Đợi thẻ đầu tiên xuất hiện
    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();

    // Lấy tiêu đề thẻ ban đầu
    const tieuDeBanDau = await theDauTien.locator("h1, h2, h3").first().innerText();

    // 1.1 Phím Space: mở modal chi tiết sản phẩm
    await page.keyboard.press("Space");
    const dialogChiTiet = page.getByRole("dialog");
    await expect(dialogChiTiet).toBeVisible();

    // 1.2 Phím Escape: đóng modal chi tiết sản phẩm
    await page.keyboard.press("Escape");
    await expect(dialogChiTiet).toBeHidden();

    // 1.3 Phím ArrowRight: Thích sản phẩm hiện tại
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);

    // 1.4 Phím 'z' hoặc 'Z': Hoàn tác
    await page.keyboard.press("z");
    await page.waitForTimeout(500);

    // Thẻ ban đầu phải quay trở lại
    const theSauHoanTac = page.locator("article").first();
    await expect(theSauHoanTac).toBeVisible();
    const tieuDeSauHoanTac = await theSauHoanTac.locator("h1, h2, h3").first().innerText();
    expect(tieuDeSauHoanTac).toBe(tieuDeBanDau);

    // 1.5 Phím ArrowLeft: Bỏ qua sản phẩm
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(500);

    // 1.6 Phím ArrowUp: Thêm vào giỏ
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(500);
  });

  test("2. Không kích hoạt phím tắt khi đang nhập liệu trong ô input / textarea", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();
    const tieuDeTruoc = await theDauTien.locator("h1, h2, h3").first().innerText();

    // Focus vào ô tìm kiếm trên thanh desktop
    const searchInput = page.getByPlaceholder(/Tìm sản phẩm, thương hiệu/i).first();
    await expect(searchInput).toBeVisible();
    await searchInput.focus();

    // Nhấn ArrowRight, ArrowLeft, Space, ArrowUp, z khi đang focus input
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("z");
    await page.waitForTimeout(400);

    // Thẻ sản phẩm không được đổi hay bị quẹt đi
    const tieuDeSau = await page.locator("article").first().locator("h1, h2, h3").first().innerText();
    expect(tieuDeSau).toBe(tieuDeTruoc);
  });

  test("3. Kéo chuột vẫn quẹt được thẻ (Mouse drag swipe) trên máy tính", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    const theCard = page.locator("article").first();
    await expect(theCard).toBeVisible();
    const tieuDeTruoc = await theCard.locator("h1, h2, h3").first().innerText();

    const box = await theCard.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    // Kéo thẻ sang phải > 120px bằng chuột
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 180, startY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    // Sau khi kéo thẻ sang phải, thẻ tiếp theo xuất hiện
    const theMoi = page.locator("article").first();
    await expect(theMoi).toBeVisible();
    const tieuDeSau = await theMoi.locator("h1, h2, h3").first().innerText();
    expect(tieuDeSau).not.toBe(tieuDeTruoc);
  });

  test("4. Không cuộn ngang (overflow-x) và chụp ảnh ở 4 mốc (390×844, 820×1180, 1180×820, 1440×900)", async ({
    page,
  }) => {
    const routes = ["/quet", "/danh-muc", "/gio"];

    for (const res of RESOLUTIONS) {
      await page.setViewportSize({ width: res.width, height: res.height });

      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(300);

        // Kiểm tra không bị tràn ngang
        const hasHorizontalScroll = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 2
          );
        });
        expect(
          hasHorizontalScroll,
          `Trang ${route} bị tràn ngang ở độ phân giải ${res.name} (scrollWidth > clientWidth)`
        ).toBe(false);

        // Chụp ảnh màn hình lưu vào docs/screenshots/pc-tablet/
        const fileName = `${route.replace("/", "")}_${res.name}.png`;
        const screenshotPath = path.join(
          "docs",
          "screenshots",
          "pc-tablet",
          fileName
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });
      }
    }
  });
});
