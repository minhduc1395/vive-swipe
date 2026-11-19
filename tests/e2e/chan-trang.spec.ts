import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import { DOANH_NGHIEP } from "@/lib/data";

test.describe("W049 · Chân trang gọn 4 cụm (bản 2)", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Ở 1440 và 820 (có rail trái): 4 cụm trên 1 hàng, © căn giữa < 4px, không cuộn ngang, cao <= 300px ở 1440", async ({
    page,
  }) => {
    await datDaKhaoSat(page);

    for (const vp of [
      { width: 1440, height: 900 },
      { width: 820, height: 1180 },
      { width: 1024, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      await page.goto("/deal");

      const footer = page.locator("footer.ct-chan");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();

      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(cuonNgang, `Bị cuộn ngang ở ${vp.width}x${vp.height}`).toBe(false);

      if (vp.width === 820 || vp.width === 1440) {
        const cumBoxes = await footer.locator("section.ct-cum").evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          })
        );
        expect(cumBoxes).toHaveLength(4);
        const yDau = cumBoxes[0].y;
        for (const box of cumBoxes) {
          expect(
            Math.abs(box.y - yDau),
            `Cụm chân trang không nằm trên cùng 1 hàng ở ${vp.width}px`
          ).toBeLessThan(12);
        }

        // Kiểm tâm chữ © 2026 VIVE lệch tâm chân trang < 4px
        const chenhLechTam = await footer.evaluate((el) => {
          const span = el.querySelector(".ct-ban-quyen-chu");
          if (!span) return 999;
          const footerRect = el.getBoundingClientRect();
          const spanRect = span.getBoundingClientRect();
          const tamFooter = footerRect.left + footerRect.width / 2;
          const tamChu = spanRect.left + spanRect.width / 2;
          return Math.abs(tamFooter - tamChu);
        });
        expect(
          chenhLechTam,
          `Tâm © lệch tâm chân trang ở ${vp.width}px`
        ).toBeLessThan(4);
      }

      if (vp.width === 1440) {
        const footerBox = await footer.boundingBox();
        expect(footerBox).not.toBeNull();
        expect(footerBox!.height).toBeLessThanOrEqual(300);
      }
    }
  });

  test("2. Ở điện thoại 390x844 trên /deal: © nằm trên tab dưới không bị che, nút >= 44px, công ty 11px, cao <= 400px (trừ tab)", async ({
    page,
  }) => {
    await datDaKhaoSat(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/deal");

    const footer = page.locator("footer.ct-chan");
    await expect(footer).toBeVisible();

    // Cuộn hết trang /deal xuống đáy
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await page.waitForTimeout(200);

    const cuonNgang = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(cuonNgang).toBe(false);

    // Dòng © 2026 VIVE nằm phía trên thanh tab dưới
    const banQuyen = footer.locator(".ct-ban-quyen-chu");
    await expect(banQuyen).toBeVisible();
    const banQuyenBox = await banQuyen.boundingBox();
    const tabDuoi = page.locator('nav[aria-label="Điều hướng chính"]');
    await expect(tabDuoi).toBeVisible();
    const tabBox = await tabDuoi.boundingBox();

    expect(banQuyenBox).not.toBeNull();
    expect(tabBox).not.toBeNull();
    expect(banQuyenBox!.y + banQuyenBox!.height).toBeLessThanOrEqual(
      tabBox!.y + 1
    );

    // 3 nút mạng xã hội và nút Chỉ đường >= 44px
    const mxhLinks = footer.locator('nav[aria-label="Mạng xã hội"] a');
    await expect(mxhLinks).toHaveCount(3);
    for (let i = 0; i < 3; i += 1) {
      const box = await mxhLinks.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }

    const chiDuong = footer.getByRole("link", { name: "Chỉ đường" });
    const chiDuongBox = await chiDuong.boundingBox();
    expect(chiDuongBox).not.toBeNull();
    expect(chiDuongBox!.height).toBeGreaterThanOrEqual(44);

    // Chữ cụm Đơn vị vận hành là 11px
    const congTyFontSize = await footer
      .locator(".ct-cong-ty p")
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(congTyFontSize).toBe("11px");

    // Chiều cao chân trang chưa tính phần chừa tab <= 400px
    const chieuCaoKhongTinhTab = await footer.evaluate((el) => {
      const khung = el.querySelector(".ct-khung") || el;
      const pb = Number.parseFloat(getComputedStyle(khung).paddingBottom) || 0;
      const chieuCao = el.getBoundingClientRect().height;
      // Trừ phần chừa tab ~72px
      return chieuCao - Math.max(0, pb - 16);
    });
    expect(chieuCaoKhongTinhTab).toBeLessThanOrEqual(400);
  });

  test("3. Kiểm tra link MXH chính xác, địa chỉ booth Phường Sài Gòn và ẩn SĐT", async ({
    page,
  }) => {
    await datDaKhaoSat(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/deal");

    const footer = page.locator("footer.ct-chan");
    const fb = footer.getByRole("link", {
      name: /Facebook VIVE - K Beauty Experience/i,
    });
    const ig = footer.getByRole("link", { name: /Instagram @vive\.k_beauty/i });
    const tt = footer.getByRole("link", { name: /TikTok @viveuniverse/i });

    await expect(fb).toHaveAttribute(
      "href",
      "https://www.facebook.com/weareVIVE"
    );
    await expect(ig).toHaveAttribute(
      "href",
      "https://www.instagram.com/vive.k_beauty"
    );
    await expect(tt).toHaveAttribute(
      "href",
      "https://www.tiktok.com/@viveuniverse"
    );

    await expect(footer).toContainText("Phường Sài Gòn");
    if (DOANH_NGHIEP.so_dien_thoai === null) {
      await expect(footer).not.toContainText("SĐT:");
    }
  });

  test("4. Chụp ảnh chân trang ở 390, 820 (có rail), 1024, 1440 vào test-results/screenshots/w049", async ({
    page,
  }) => {
    await datDaKhaoSat(page);
    const dir = path.join(process.cwd(), "test-results", "screenshots", "w049");
    fs.mkdirSync(dir, { recursive: true });

    for (const vp of [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1024", width: 1024, height: 900 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/deal");
      const footer = page.locator("footer.ct-chan");
      await expect(footer).toBeVisible();
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await page.screenshot({
        path: path.join(dir, `${vp.label}_chan-trang.png`),
      });
    }
  });
});
