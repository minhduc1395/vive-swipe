import fs from "node:fs";
import path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import type { Page } from "@playwright/test";
import { parseCauHinhLopoe3D } from "../../lib/thu-nghiem/lopoe-3d";

/**
 * W072 phần A (#126): đoạn "4 hoạt chất" của khối LOPOE theo bố cục bọt nước, sau công tắc `bot_nuoc` / `?bot-nuoc=1`.
 * Bọt đứng yên đúng chỗ (chưa bay); chuyển động là job sau.
 */
const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
const AMP = cfg.khoi.find((k) => k.id === "amp-thanh-phan")!;
const GIUA_DOAN = AMP.a + (AMP.b - AMP.a) * 0.75; // bọt đã hiện hết, khối chữ chưa mờ
const CO_MAN = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 360, height: 780 },
] as const;
const TIENG_VIET = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

type Hop = { x: number; y: number; width: number; height: number };
const chong = (a: Hop, b: Hop) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;

async function moTrang(page: Page, url: string) {
  await datDaKhaoSat(page);
  await page.goto(url);
  await expect(page.locator("#lopoe")).toBeAttached();
}

/** Cuộn tới tiến trình p của khối LOPOE (đoạn dính) và chờ 4 bọt hiện hết. */
async function denDoan(page: Page, p: number) {
  await page.evaluate((p) => {
    const s = document.querySelector("#lopoe")!;
    const r = s.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + p * (r.height - innerHeight));
    dispatchEvent(new Event("scroll"));
  }, p);
  await expect
    .poll(() => page.locator("#lopoe [data-bot]").evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity)), { timeout: 30_000 })
    .toEqual(["1", "1", "1", "1"]);
}

/** Khối dính (canvas / chuỗi ảnh) hay bản tĩnh (không WebGL) */
const laBanDinh = async (page: Page) => (await page.locator("#lopoe canvas").count()) > 0;

test.describe("W072 · Đoạn 4 hoạt chất kiểu bọt nước (#126)", () => {
  test.beforeEach(() => test.setTimeout(240_000));

  test("công tắc tắt (mặc định, không ?bot-nuoc): đoạn giữ như cũ, không có bọt", async ({ page }) => {
    await moTrang(page, "/");
    await expect(page.locator("#lopoe")).not.toHaveAttribute("data-bot-nuoc-bat", "1");
    await expect(page.locator("#lopoe [data-bot]")).toHaveCount(0);
    if (await laBanDinh(page)) await expect(page.locator('#lopoe [data-nhom-nhan="amp"] [data-nhan]')).toHaveCount(4);
  });

  for (const vp of CO_MAN) {
    test(`?bot-nuoc=1 ở ${vp.width}×${vp.height}: không đường kẻ/thẻ/số; chữ + nút cùng mép trái; 4 bọt trọn khung, không chồng`, async ({ page }) => {
      await page.setViewportSize(vp);
      await moTrang(page, "/?bot-nuoc=1");
      const doan = page.locator("#lopoe");
      await expect(doan).toHaveAttribute("data-bot-nuoc-bat", "1");
      await expect(doan.locator('[data-nhom-nhan="amp"], [data-nhom-nhan="amp"] [data-nhan]')).toHaveCount(0);
      await expect(doan.locator("[data-bot]")).toHaveCount(4);
      const khoi = doan.locator('[data-khoi="amp-thanh-phan"]');
      const chuDoan = (await khoi.textContent()) + " " + (await doan.locator("[data-bot-nuoc]").textContent());
      expect(chuDoan).not.toMatch(/\b0[1-4]\b|03\/04/);

      // Chữ + nút: "4 hoạt chất", "Phục hồi & khóa ẩm." và 2 nút cùng mép trái (lệch ≤ 2px), nút ngay dưới câu
      const nut = khoi.locator("[data-nut-khoi] > *");
      await expect(nut).toHaveCount(2);
      if (await laBanDinh(page)) await denDoan(page, GIUA_DOAN);
      else await khoi.scrollIntoViewIfNeeded();
      const doMep = await khoi.evaluate((el) => {
        const tu = el.querySelector("h3 [data-tu]")!.getBoundingClientRect();
        const cau = el.querySelector("h3 + p")!;
        const r = document.createRange();
        r.selectNodeContents(cau);
        const hopCau = r.getClientRects()[0];
        const nut = [...el.querySelectorAll("[data-nut-khoi] > *")].map((n) => n.getBoundingClientRect());
        return { tu: tu.left, cau: hopCau.left, cauDuoi: cau.getBoundingClientRect().bottom, nut0: nut[0].left, nut1: nut[1].left, nutTren: nut[0].top, nut1Tren: nut[1].top };
      });
      expect(Math.abs(doMep.tu - doMep.cau)).toBeLessThanOrEqual(2);
      expect(Math.abs(doMep.nut0 - doMep.tu)).toBeLessThanOrEqual(2);
      expect(doMep.nut1).toBeGreaterThan(doMep.nut0);
      expect(Math.abs(doMep.nut1Tren - doMep.nutTren)).toBeLessThanOrEqual(2);
      expect(doMep.nutTren - doMep.cauDuoi).toBeGreaterThanOrEqual(0);
      expect(doMep.nutTren - doMep.cauDuoi).toBeLessThanOrEqual(40);

      if (!(await laBanDinh(page))) return; // máy không có WebGL: bản tĩnh, không đo bố cục dính
      const bot = await doan.locator("[data-bot-anh]").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
      const chu = await khoi.evaluate((el) => [...el.children].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
      expect(bot).toHaveLength(4);
      for (const b of bot) {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.y).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(vp.width);
        expect(b.y + b.height).toBeLessThanOrEqual(vp.height);
        if (vp.width >= 768) {
          expect(b.x).toBeGreaterThanOrEqual(vp.width * 0.06);
          expect(vp.width - b.x - b.width).toBeGreaterThanOrEqual(vp.width * 0.06);
        }
        for (const c of chu) expect(chong(b, c), `bọt chồng chữ: ${JSON.stringify({ b, c })}`).toBe(false);
      }
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(chong(bot[i], bot[j]), `bọt ${i} chồng bọt ${j}`).toBe(false);
      const co = bot.map((b) => b.width);
      expect(Math.max(...co) / Math.min(...co)).toBeLessThanOrEqual(1.15);
      // Máy tính: bọt bên phải chai (chai ở ~29% bề rộng)
      if (vp.width >= 768) for (const b of bot) expect(b.x).toBeGreaterThan(vp.width * 0.36);
    });
  }

  test("giảm chuyển động: bọt và chữ hiện sẵn", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem("vive_da_khao_sat", "true"));
    await page.goto("/?bot-nuoc=1");
    const bot = page.locator("#lopoe [data-bot]");
    await expect(bot).toHaveCount(4);
    await bot.first().scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++) {
      await bot.nth(i).scrollIntoViewIfNeeded();
      await expect(bot.nth(i)).toBeVisible();
      await expect(bot.nth(i).locator("[data-bot-anh]")).toBeVisible();
    }
    await expect(page.locator('#lopoe [data-khoi="amp-thanh-phan"]')).toContainText("Phục hồi");
    await ctx.close();
  });

  test("?lang=en: chữ bọt theo yaml bản en, không còn tiếng Việt trong đoạn", async ({ page }) => {
    await moTrang(page, "/?lang=en&bot-nuoc=1");
    const doan = page.locator("#lopoe");
    await expect(doan.locator("[data-bot]")).toHaveCount(4);
    const chu = await doan.locator("[data-bot-chu]").allTextContents();
    expect(chu).toEqual(cfg.thanh_phan.ampoule.map((t) => (t.ten_en ?? t.ten) + (t.loi_en ?? t.loi)));
    const khoi = (await doan.locator('[data-khoi="amp-thanh-phan"]').textContent()) ?? "";
    expect(khoi).toContain("4 actives");
    expect(khoi + chu.join(" ")).not.toMatch(TIENG_VIET);
  });
});
