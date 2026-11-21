import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";

const CO_DAU_VI =
  /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]/g;

const CAC_TRANG_KHACH_DA_SONG_NGU = [
  "/",
  "/chao",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/da-thich",
  "/deal",
  "/gio",
  "/giu-hang",
  "/giu-hang/VIVE-4821",
  "/new-arrival",
  "/personal-color",
] as const;

const CAC_TRANG_CHUP_ANH = [
  { route: "/deal", slug: "deal" },
  { route: "/quet", slug: "quet" },
  { route: "/danh-muc", slug: "danh-muc" },
  { route: "/new-arrival", slug: "new-arrival" },
] as const;

async function layChuHienThiKhongTinhNgoaiLe(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const BO_QUA_SELECTOR =
      'script, style, noscript, template, [hidden], [data-thieu-en], header.sticky.top-0.z-40, [role="banner"], footer.ct-chan, nav[aria-label="Main navigation"], nav[aria-label="Điều hướng chính"]';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const dong: string[] = [];
    let node: Node | null = walker.nextNode();
    while (node) {
      const text = (node.textContent || "").trim();
      const parent = node.parentElement;
      if (text && parent && !parent.closest(BO_QUA_SELECTOR)) {
        let biAn = false;
        let cur: HTMLElement | null = parent;
        while (cur) {
          const style = window.getComputedStyle(cur);
          if (style.display === "none" || style.visibility === "hidden") {
            biAn = true;
            break;
          }
          cur = cur.parentElement;
        }
        if (!biAn) {
          dong.push(text);
        }
      }
      node = walker.nextNode();
    }
    return dong.join("\n");
  });
}

test.describe("W044 · Kiểm tra 13 trang khách ở ?lang=en không sót tiếng Việt", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await datDaKhaoSat(page);
  });

  test("12 trang đã chuyển song ngữ không còn ký tự tiếng Việt ở ?lang=en (390px & 1440px)", async ({
    page,
  }) => {
    // Thêm 1 sản phẩm có bản EN hoặc combo vào giỏ & đã thích để kiểm tra cả trạng thái có hàng ở /gio, /giu-hang, /da-thich
    await page.goto("/quet?lang=en");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "vive_gio_hang",
        JSON.stringify([
          { loai: "combo", id: "COMBO-PINK", soLuong: 1, themLuc: new Date().toISOString() },
          { loai: "san_pham", id: "LOPOE-CF", soLuong: 1, themLuc: new Date().toISOString() },
        ]),
      );
      window.localStorage.setItem("vive_da_thich", JSON.stringify(["LOPOE-CF"]));
    });

    const loi: string[] = [];

    for (const co of [
      { ten: "390", width: 390, height: 844 },
      { ten: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: co.width, height: co.height });

      for (const route of CAC_TRANG_KHACH_DA_SONG_NGU) {
        const url = `${route}?lang=en`;
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page
          .getByText(/Getting products ready/i)
          .waitFor({ state: "detached", timeout: 6000 })
          .catch(() => {});
        if (route === "/quet") {
          await page
            .getByText(/VND/i)
            .first()
            .waitFor({ state: "visible", timeout: 8000 })
            .catch(() => {});
        }
        await page.waitForTimeout(350);

        const text = await layChuHienThiKhongTinhNgoaiLe(page);
        const dongCoDau = text
          .split(/\r?\n/)
          .map((d) => d.trim())
          .filter((d) => d.length > 0 && CO_DAU_VI.test(d));

        if (dongCoDau.length > 0) {
          loi.push(`[${co.ten}px ${url}] -> ${dongCoDau.slice(0, 5).join(" | ")}`);
        }
      }
    }

    expect(loi, `Phát hiện chữ tiếng Việt ở ?lang=en:\n${loi.join("\n")}`).toEqual([]);
  });

  test("chụp ảnh 390px & 1440px cho /deal, /quet, /danh-muc, /new-arrival ở ?lang=en", async ({
    page,
  }) => {
    const dir = path.join(process.cwd(), "test-results", "screenshots", "w044-en");
    fs.mkdirSync(dir, { recursive: true });

    for (const co of [
      { ten: "390", width: 390, height: 844 },
      { ten: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: co.width, height: co.height });
      for (const item of CAC_TRANG_CHUP_ANH) {
        await page.goto(`${item.route}?lang=en`, { waitUntil: "domcontentloaded" });
        await page
          .getByText(/Getting products ready/i)
          .waitFor({ state: "detached", timeout: 6000 })
          .catch(() => {});
        if (item.route === "/quet") {
          await page
            .getByText(/VND/i)
            .first()
            .waitFor({ state: "visible", timeout: 8000 })
            .catch(() => {});
        }
        await page.waitForTimeout(450);
        await page.screenshot({
          path: path.join(dir, `${co.ten}_${item.slug}.png`),
        });
      }
    }
  });

  test("/chinh-sach?lang=en không còn ký tự tiếng Việt (390px & 1440px)", async ({
    page,
  }) => {
    const dir = path.join(process.cwd(), "test-results", "screenshots", "w068-chinh-sach");
    fs.mkdirSync(dir, { recursive: true });
    const loi: string[] = [];

    for (const co of [
      { ten: "390", width: 390, height: 844 },
      { ten: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: co.width, height: co.height });

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/chinh-sach?lang=vi", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(dir, `${co.ten}_vi.png`),
        fullPage: true,
      });

      await page.goto("/chinh-sach?lang=en", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(dir, `${co.ten}_en.png`),
        fullPage: true,
      });

      const text = await layChuHienThiKhongTinhNgoaiLe(page);
      const dongCoDau = text
        .split(/\r?\n/)
        .map((d) => d.trim())
        .filter((d) => d.length > 0 && CO_DAU_VI.test(d));
      if (dongCoDau.length > 0) {
        loi.push(`[${co.ten}px /chinh-sach?lang=en] -> ${dongCoDau.slice(0, 5).join(" | ")}`);
      }
    }

    expect(loi, `Phát hiện chữ tiếng Việt ở /chinh-sach?lang=en:\n${loi.join("\n")}`).toEqual(
      [],
    );
  });
});
