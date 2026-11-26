import fs from "node:fs";
import path from "node:path";
import { test, expect, datDaKhaoSat, caiDatMockSupabase } from "./fixtures";
import type { Browser, Page } from "@playwright/test";
import { parseCauHinhLopoe3D } from "../../lib/thu-nghiem/lopoe-3d";
import { MOC_CANH_AMP, pCanh } from "../../components/cuon-3d/phat-khung";

/**
 * #154 (W073 sửa QA fail 26/11): khi GLB nạp xong, ảnh phẳng cũ của chai ampoule (thân, cổ, NẮP) phải rời khỏi cảnh.
 * Lỗi cũ: ảnh nắp nằm trong nhóm `nap` nên `ampG.remove(anhNap)` không gỡ được, chai đóng có 2 nắp, nhấc nắp thì nắp cũ ở lại.
 * Cảnh ghi `window.__lopoeAnhAmpConLai` = số mesh ảnh phẳng ampoule còn trong cảnh (duyệt scene), kỳ vọng 0.
 */
const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
const AMP = cfg.khoi.find((k) => k.id === "amp-thanh-phan");
const pCanhCua = (p: number) => pCanh(p, AMP?.a ?? MOC_CANH_AMP.a, AMP?.b ?? MOC_CANH_AMP.b);
/** Mốc giống w073-lopoe-glb.spec.ts: chai đứng, nhấc nắp, giọt sắp chạm miệng */
const P_DUNG = 0.02, P_NHAC = 0.475, P_GIOT = 0.4865;
const VP = { width: 1440, height: 900 };

type KhungGlb = { p: number; o: number; mieng: { x: number; y: number }; giot: { x: number; y: number } | null; hop: { x: number; y: number; w: number; h: number } };
type Cua = { __lopoeGlb?: string; __lopoeGlbKhung?: KhungGlb; __lopoeAnhAmpConLai?: number; __p?: number };

async function trangMayTinh(browser: Browser) {
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1, locale: "vi-VN" });
  const page = await ctx.newPage();
  await caiDatMockSupabase(page);
  return page;
}

async function denP(page: Page, p: number) {
  await page.evaluate((p) => {
    const s = document.querySelector("#lopoe")!;
    const r = s.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + p * (r.height - innerHeight));
    dispatchEvent(new Event("scroll"));
    (window as unknown as Cua).__p = p;
  }, p);
}

const doc = (page: Page) => page.evaluate(() => {
  const w = window as unknown as Cua;
  return { glb: w.__lopoeGlb ?? null, khung: w.__lopoeGlbKhung ?? null, conLai: w.__lopoeAnhAmpConLai ?? null };
});

/** Chờ cảnh (đã có GLB) vẽ ở đúng p rồi đọc khung + số ảnh phẳng còn lại. */
async function khungTai(page: Page, p: number) {
  await denP(page, p);
  await expect.poll(async () => (await doc(page)).khung?.p, { timeout: 60_000 }).toBeCloseTo(pCanhCua(p), 4);
  await page.waitForTimeout(300);
  return doc(page);
}

const choNapXong = (page: Page) => expect.poll(async () => (await doc(page)).glb, { timeout: 90_000 }).toBe("da-nap");

test.describe("#154 · GLB nạp xong thì không còn ảnh nắp phẳng cũ trong cảnh", () => {
  test.beforeEach(({ browserName }) => {
    test.setTimeout(240_000);
    test.skip(browserName !== "chromium", "cảnh WebGL máy tính kiểm trên Chromium");
  });

  test("(a) GLB nạp lúc chai đóng (đầu đoạn): 0 ảnh phẳng còn lại, cả lúc đóng lẫn lúc nhấc nắp", async ({ browser }) => {
    const page = await trangMayTinh(browser);
    await datDaKhaoSat(page);
    await page.goto("/?glb=1");
    await expect(page.locator("#lopoe")).toBeAttached();
    if ((await page.locator("#lopoe canvas").count()) === 0) return; // không WebGL: bản tĩnh

    await denP(page, P_DUNG);
    await choNapXong(page);
    const dong = await khungTai(page, P_DUNG);
    expect(dong.conLai, "chai đóng: còn mesh ảnh phẳng ampoule (2 nắp chồng nhau)").toBe(0);

    // Nhấc nắp + giọt: không còn mesh nắp cũ nào ở trên miệng chai; nắp GLB đi lên, giọt rơi vào miệng
    const nhac = await khungTai(page, P_NHAC);
    expect(nhac.conLai, "nhấc nắp: nắp ảnh cũ còn ở lại trên miệng chai").toBe(0);
    expect(nhac.khung!.hop.y).toBeLessThan(nhac.khung!.mieng.y - dong.khung!.hop.h * 0.3);
    const giot = await khungTai(page, P_GIOT);
    expect(giot.conLai).toBe(0);
    expect(giot.khung!.giot, "giọt phải hiện lúc rơi").not.toBeNull();
    await page.context().close();
  });

  test("(b) GLB nạp lúc đang nhấc nắp (p ≈ 0,49): 0 ảnh phẳng còn lại, nắp GLB đứng đúng chỗ nhấc dở", async ({ browser }) => {
    const page = await trangMayTinh(browser);
    // Giữ file .glb lại cho tới khi cảnh đã cuộn tới đoạn nhấc nắp
    let tha!: () => void;
    const choTha = new Promise<void>((r) => { tha = r; });
    let daGiu = false;
    await page.route(/\/lopoe-3d-glb\/.*\.glb(\?.*)?$/, async (route) => {
      daGiu = true;
      await choTha;
      await route.continue();
    });
    await datDaKhaoSat(page);
    await page.goto("/?glb=1");
    await expect(page.locator("#lopoe")).toBeAttached();
    if ((await page.locator("#lopoe canvas").count()) === 0) return;

    await denP(page, P_DUNG); // khối gần khung nhìn: bắt đầu nạp (bị giữ)
    await expect.poll(() => daGiu, { timeout: 60_000 }).toBe(true);
    await denP(page, P_GIOT);
    await page.waitForTimeout(1500); // cảnh ảnh phẳng vẽ ở đoạn nhấc nắp
    expect((await doc(page)).glb).toBe("dang-nap");

    tha();
    await choNapXong(page);
    const k = await khungTai(page, P_GIOT);
    expect(k.conLai, "GLB nạp giữa lúc nhấc: nắp ảnh cũ treo lơ lửng trong cảnh").toBe(0);
    // Nắp GLB nhận tư thế nhấc của p hiện tại (không nằm trên miệng chai), giọt rơi gần miệng
    expect(k.khung!.hop.y).toBeLessThan(k.khung!.mieng.y - 50);
    expect(k.khung!.giot).not.toBeNull();
    expect(Math.abs(k.khung!.giot!.x - k.khung!.mieng.x)).toBeLessThanOrEqual(k.khung!.hop.w * 0.15);

    // Cuộn về chai đóng rồi nhấc lại: vẫn 0
    expect((await khungTai(page, P_DUNG)).conLai).toBe(0);
    expect((await khungTai(page, P_NHAC)).conLai).toBe(0);
    await page.context().close();
  });
});
