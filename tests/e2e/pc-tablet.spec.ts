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

const ANH_CHUP_RESOLUTIONS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1180x820", width: 1180, height: 820 },
  { name: "1440x900", width: 1440, height: 900 },
] as const;

test.describe("W028 · Giao diện máy tính và máy tính bảng", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript(() => {
      localStorage.setItem("vive_da_khao_sat", "true");
    });
  });

  test("1. Phím tắt trên /quet: mũi tên phải (Thích), trái (Bỏ qua), lên (Vào giỏ), Z (Hoàn tác), Space (Chi tiết), Escape (Đóng)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();

    const tieuDeBanDau = await theDauTien.locator("h1, h2, h3").first().innerText();

    // Space: mở modal chi tiết giữa màn
    await page.keyboard.press("Space");
    const dialogChiTiet = page.getByRole("dialog");
    await expect(dialogChiTiet).toBeVisible();

    // Escape: đóng modal chi tiết
    await page.keyboard.press("Escape");
    await expect(dialogChiTiet).toBeHidden();

    // ArrowRight: Thích
    await page.keyboard.press("ArrowRight");
    await expect(
      page.locator("article").first().locator("h1, h2, h3").first()
    ).not.toHaveText(tieuDeBanDau, { timeout: 5000 });

    // Z: Hoàn tác
    await page.keyboard.press("z");
    await expect(
      page.locator("article").first().locator("h1, h2, h3").first()
    ).toHaveText(tieuDeBanDau, { timeout: 5000 });

    // ArrowLeft: Bỏ qua
    await page.keyboard.press("ArrowLeft");
    await expect(
      page.locator("article").first().locator("h1, h2, h3").first()
    ).not.toHaveText(tieuDeBanDau, { timeout: 5000 });

    // ArrowUp: Vào giỏ
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("2. Không kích hoạt phím tắt khi đang gõ trong ô nhập trên desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/quet");
    await page.waitForLoadState("domcontentloaded");

    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();
    const tieuDeTruoc = await theDauTien.locator("h1, h2, h3").first().innerText();

    await page.evaluate(() => {
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("data-testid", "test-typing-input");
      input.setAttribute("aria-label", "Ô nhập thử");
      document.body.appendChild(input);
    });

    const typingInput = page.getByTestId("test-typing-input");
    await expect(typingInput).toBeVisible();
    await typingInput.focus();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("z");
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      document.querySelector('[data-testid="test-typing-input"]')?.remove();
    });

    const tieuDeSau = await page.locator("article").first().locator("h1, h2, h3").first().innerText();
    expect(tieuDeSau).toBe(tieuDeTruoc);
  });

  test("3. Kéo chuột vẫn quẹt được thẻ trên máy tính", async ({ page }) => {
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

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 180, startY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    const theMoi = page.locator("article").first();
    await expect(theMoi).toBeVisible();
    const tieuDeSau = await theMoi.locator("h1, h2, h3").first().innerText();
    expect(tieuDeSau).not.toBe(tieuDeTruoc);
  });

  test("4. Không cuộn ngang ở 9 cỡ màn hình (docs/05 §2.4) cho các trang khách & nhân viên", async ({
    page,
  }) => {
    const routes = [
      "/quet",
      "/danh-muc",
      "/da-thich",
      "/deal",
      "/gio",
      "/giu-hang",
      "/nhan-vien",
    ];

    for (const route of routes) {
      for (const res of CU_CHUAN_9_CO) {
        await page.setViewportSize({ width: res.width, height: res.height });
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(150);

        const hasHorizontalScroll = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 2
          );
        });

        expect(
          hasHorizontalScroll,
          `Trang ${route} bị tràn ngang ở ${res.name}`
        ).toBe(false);
      }
    }
  });

  test("5. Chụp ảnh Playwright ở 390×844, 820×1180, 1180×820, 1440×900 vào test-results/screenshots/pc-tablet/", async ({
    page,
  }) => {
    const dirOut = path.join("test-results", "screenshots", "pc-tablet");
    fs.mkdirSync(dirOut, { recursive: true });

    const routes = ["/quet", "/danh-muc", "/gio"];
    for (const res of ANH_CHUP_RESOLUTIONS) {
      await page.setViewportSize({ width: res.width, height: res.height });
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(300);

        const fileName = `${route.replace("/", "")}_${res.name}.png`;
        await page.screenshot({
          path: path.join(dirOut, fileName),
          fullPage: false,
        });
      }
    }
  });
});
