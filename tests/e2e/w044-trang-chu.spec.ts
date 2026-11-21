import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { DEALS } from "../../lib/data";

/** Chữ có dấu tiếng Việt (bỏ × và ÷) */
const CO_DAU_VI = /[À-ÖØ-öø-ỹ]/;

/** `vung`: chỉ quét phần của module (thanh trên, chân trang, nút Quay lại là của WEB) */
const TRANG = [
  { duong: "/", goc: "#cua-hang", vung: "main", chuDeal: false },
  { duong: "/new-arrival", goc: "#trang-landing", vung: "#trang-landing, #phan-duoi section:not(footer *)", chuDeal: true },
  { duong: "/personal-color", goc: "h1", vung: "section:not(footer *)", chuDeal: false },
] as const;

/**
 * Chữ của deal (tên, hook, quà) lấy từ lib/data: schema deal dùng chung chưa có trường `*_en`
 * nên ở en vẫn hiện bản vi. Đó là "dữ liệu thiếu bản en" (job #80). Chỉ nới cho landing, nơi hiện thẳng chữ của deal.
 */
const CHU_DEAL_THIEU_EN = DEALS.flatMap((d) => [d.ten, d.hook, d.qua].filter((x): x is string => Boolean(x)));
const laChuDeal = (c: string) => CHU_DEAL_THIEU_EN.some((d) => c.includes(d));

/** Mọi chữ khách thấy hoặc đọc được (nội dung, aria-label, alt, title, placeholder) trong vùng <main> / trang */
async function layChuHienRa(page: Page, vung: string): Promise<string[]> {
  return page.evaluate((chon) => {
    const kq: string[] = [];
    document.querySelectorAll(chon).forEach((goc) => {
      const duyet = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
      for (let n = duyet.nextNode(); n; n = duyet.nextNode()) {
        const v = (n.nodeValue ?? "").trim();
        const cha = n.parentElement;
        if (v && cha && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(cha.tagName)) kq.push(v);
      }
      [goc, ...Array.from(goc.querySelectorAll("[aria-label],[alt],[title],[placeholder]"))].forEach((el) => {
        for (const a of ["aria-label", "alt", "title", "placeholder"]) {
          const v = el.getAttribute(a);
          if (v) kq.push(`${a}=${v}`);
        }
      });
    });
    return kq;
  }, vung);
}

async function cuonHet(page: Page) {
  // ảnh và khối dưới tải khi cuộn
  await page.evaluate(async () => {
    const cao = () => document.documentElement.scrollHeight;
    for (let y = 0; y < cao(); y += 900) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
}

test.describe("W044 · trang-chu song ngữ VI | EN", () => {
  test.beforeEach(async () => {
    test.setTimeout(120000); // khối LOPOE 3D: WebGL phần mềm trên máy CI chậm
  });

  for (const { duong, goc, vung, chuDeal } of TRANG) {
    test(`?lang=en: ${duong} không còn chữ tiếng Việt (trừ dữ liệu thiếu bản en)`, async ({ page }) => {
      await page.goto(`${duong}?lang=en`);
      await expect(page.locator(goc).first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await cuonHet(page);
      const loi = (await layChuHienRa(page, vung)).filter((c) => CO_DAU_VI.test(c) && !(chuDeal && laChuDeal(c)));
      expect(loi).toEqual([]);
    });

    test(`mặc định: ${duong} vẫn là tiếng Việt`, async ({ page }) => {
      await page.goto(duong);
      await expect(page.locator(goc).first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "vi");
      await cuonHet(page);
      expect((await layChuHienRa(page, vung)).some((c) => CO_DAU_VI.test(c))).toBe(true);
    });
  }

  test("trang chủ ở en: tiêu đề khối, nút, giá và dải thông báo bằng tiếng Anh", async ({ page }) => {
    await page.goto("/?lang=en");
    await expect(page.locator(".tc-v3 .dai")).toContainText("View ›", { timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Picked by Koreans." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More combos." })).toBeAttached();
    await expect(page.getByRole("link", { name: "View all deals" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Previous combos" })).toBeAttached();
  });

  test("personal-color ở en: giá dạng 378,000 VND", async ({ page }) => {
    await page.goto("/personal-color?lang=en");
    await expect(page.getByText("378,000 VND")).toBeVisible();
    for (const nhom of ["Warm Spring", "Cool Summer", "Warm Autumn", "Cool Winter"]) {
      await expect(page.getByRole("heading", { name: nhom })).toBeVisible();
    }
  });
});
