import fs from "node:fs";
import path from "node:path";
import { test, expect, datDaKhaoSat, caiDatMockSupabase } from "./fixtures";
import type { Browser, Page } from "@playwright/test";
import { parseCauHinhLopoe3D } from "../../lib/thu-nghiem/lopoe-3d";
import { MOC_CANH_AMP, pCanh } from "../../components/cuon-3d/phat-khung";

/**
 * W073 phần A (#150): chai ampoule là mô hình 3D GLB trên máy tính, sau công tắc `glb` (mặc định tắt) / `?glb=1`.
 * Điện thoại giữ chuỗi ảnh khung. GLB + Draco nạp lười khi khối LOPOE gần khung nhìn.
 */
const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
const MAY_TINH = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
] as const;
/** Mốc cảnh (giống canh.ts): chai đứng (bộ 3 đầu khối), nhấc nắp + giọt sắp chạm miệng, cuối đoạn (bộ 3 cuối) */
const P_DUNG = 0.02, P_NHAC = 0.475, P_GIOT = 0.4865, P_CUOI = 0.97;
const LA_GLB = /\/lopoe-3d-glb\//;
const AMP = cfg.khoi.find((k) => k.id === "amp-thanh-phan");
/** Tiến trình cảnh 3D ứng với tiến trình cuộn p (W072 nới đoạn 4 hoạt chất trong yaml, cảnh giữ mốc gốc) */
const pCanhCua = (p: number) => pCanh(p, AMP?.a ?? MOC_CANH_AMP.a, AMP?.b ?? MOC_CANH_AMP.b);

type Hop = { x: number; y: number; width: number; height: number };
type KhungGlb = { p: number; o: number; mieng: { x: number; y: number }; giot: { x: number; y: number } | null; hop: { x: number; y: number; w: number; h: number } };
const chong = (a: Hop, b: Hop) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;

/** Ghi mọi request tới thư mục GLB (GLB + bộ giải mã Draco) và số byte tải về. */
function batRequestGlb(page: Page) {
  const ds: { url: string; byte: number }[] = [];
  page.on("request", (r) => { if (LA_GLB.test(r.url())) ds.push({ url: r.url(), byte: 0 }); });
  page.on("response", async (r) => {
    if (!LA_GLB.test(r.url())) return;
    const b = await r.body().catch(() => Buffer.alloc(0));
    const d = ds.find((x) => x.url === r.url() && x.byte === 0);
    if (d) d.byte = b.length;
  });
  return ds;
}

/** Trang máy tính thật (không giả lập điện thoại: tỉ lệ điểm ảnh 1, không cảm ứng). */
async function trangMayTinh(browser: Browser, vp: { width: number; height: number }) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: "vi-VN" });
  const page = await ctx.newPage();
  await caiDatMockSupabase(page);
  return page;
}

async function moTrang(page: Page, url: string) {
  await datDaKhaoSat(page);
  await page.goto(url);
  await expect(page.locator("#lopoe")).toBeAttached();
}

/** Cuộn tới tiến trình p của khối LOPOE và ghim p cho cảnh (window.__p, chỉ dùng khi kiểm thử) để không phải chờ lò xo. */
async function denP(page: Page, p: number) {
  await page.evaluate((p) => {
    const s = document.querySelector("#lopoe")!;
    const r = s.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + p * (r.height - innerHeight));
    dispatchEvent(new Event("scroll"));
    (window as unknown as { __p?: number }).__p = p;
  }, p);
}

const docKhung = (page: Page) => page.evaluate(() => (window as unknown as { __lopoeGlbKhung?: KhungGlb }).__lopoeGlbKhung ?? null);
/** Chờ cảnh vẽ xong ở đúng p (khung ghi ra window.__lopoeGlbKhung). */
async function khungTai(page: Page, p: number): Promise<KhungGlb> {
  await denP(page, p);
  await expect.poll(async () => (await docKhung(page))?.p, { timeout: 60_000 }).toBeCloseTo(pCanhCua(p), 4);
  await page.waitForTimeout(300);
  return (await docKhung(page))!;
}

/** Hộp của chữ, nút đang hiện trong lớp chữ khối LOPOE (khối mở đầu + khối chữ có visibility visible). */
const hopChuDangHien = (page: Page) =>
  page.locator("#lopoe").evaluate((doan) => {
    const ra: { x: number; y: number; width: number; height: number; ten: string }[] = [];
    const lay = (el: Element, ten: string) => {
      for (const c of el.querySelectorAll("h2, h3, p, a, button, img")) {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && Number(getComputedStyle(c).opacity) > 0.05) ra.push({ x: r.x, y: r.y, width: r.width, height: r.height, ten: `${ten} ${c.tagName}` });
      }
    };
    const moDau = doan.querySelector<HTMLElement>("[data-mo-dau]");
    if (moDau && getComputedStyle(moDau).visibility === "visible" && Number(moDau.style.opacity || 1) > 0.05) lay(moDau, "mo-dau");
    for (const k of doan.querySelectorAll<HTMLElement>("[data-khoi]")) if (getComputedStyle(k).visibility === "visible") lay(k, k.dataset.khoi!);
    return ra;
  });

const coBanDinh = async (page: Page) => (await page.locator("#lopoe canvas").count()) > 0;

test.describe("W073 · Chai ampoule 3D GLB sau công tắc (#150)", () => {
  test.beforeEach(() => test.setTimeout(240_000));

  test("yaml: công tắc mặc định tắt, đường dẫn GLB trỏ tới file có thật", () => {
    expect(cfg.glb?.bat).toBe(false);
    expect(cfg.glb?.ampoule).toBe("/lopoe-3d-glb/LOPOE_ampoule_web_v2.glb");
  });

  for (const url of ["/", "/new-arrival"]) {
    test(`công tắc tắt, không ?glb: ${url} cuộn qua cả khối không tải GLB, chạy ảnh phẳng như cũ`, async ({ browser }) => {
      const page = await trangMayTinh(browser, MAY_TINH[0]);
      const ds = batRequestGlb(page);
      await moTrang(page, url);
      if (!(await coBanDinh(page))) return; // không WebGL: bản tĩnh
      for (const p of [P_DUNG, P_NHAC, 0.7, P_CUOI]) {
        await denP(page, p);
        await page.waitForTimeout(1500);
      }
      expect(ds.map((d) => d.url)).toEqual([]);
      expect(await page.evaluate(() => (window as unknown as { __lopoeGlb?: string }).__lopoeGlb ?? null)).toBeNull();
      await page.context().close();
    });
  }

  for (const vp of MAY_TINH) {
    test(`?glb=1 ở ${vp.width}×${vp.height}: nạp lười, mô hình 3D, nhấc đủ nắp, giọt rơi đúng miệng, không chồng chữ/nút`, async ({ browser }) => {
      const page = await trangMayTinh(browser, vp);
      const ds = batRequestGlb(page);
      await moTrang(page, "/?glb=1");
      if (!(await coBanDinh(page))) return; // không WebGL: bản tĩnh, không có mô hình

      // Chưa cuộn tới khối: không tải GLB / Draco (kể cả sau mốc "trang rảnh 3 giây")
      await page.waitForTimeout(5000);
      expect(ds.map((d) => d.url), "GLB/Draco tải khi chưa cuộn gần khối LOPOE").toEqual([]);

      // Cuộn tới khối: nạp xong mô hình
      await denP(page, P_DUNG);
      await expect.poll(() => page.evaluate(() => (window as unknown as { __lopoeGlb?: string }).__lopoeGlb), { timeout: 90_000 }).toBe("da-nap");
      await expect.poll(() => ds.every((d) => d.byte > 0), { timeout: 10_000 }).toBe(true);
      const tong = ds.reduce((t, d) => t + d.byte, 0);
      console.log(`W073 tải thêm khi bật GLB: ${JSON.stringify(ds.map((d) => `${d.url.replace(/.*\/lopoe-3d-glb\//, "")} ${d.byte}`))}, tổng ${tong} byte`);
      expect(ds.some((d) => /\.glb$/.test(d.url))).toBe(true);
      expect(tong).toBeLessThanOrEqual(1024 * 1024);

      // Nắp nhỏ giọt = collar + bulb + pipette
      const nap = await page.evaluate(() => (window as unknown as { __lopoeGlbNap?: string[] }).__lopoeGlbNap ?? []);
      expect([...nap].sort()).toEqual(["bulb", "collar", "pipette"]);

      const trongKhung = (h: KhungGlb["hop"]) => {
        expect(h.x).toBeGreaterThanOrEqual(0);
        expect(h.y).toBeGreaterThanOrEqual(0);
        expect(h.x + h.w).toBeLessThanOrEqual(vp.width);
        expect(h.y + h.h).toBeLessThanOrEqual(vp.height);
      };
      const khongChong = async (k: KhungGlb, ten: string) => {
        const chai = { x: k.hop.x, y: k.hop.y, width: k.hop.w, height: k.hop.h };
        for (const c of await hopChuDangHien(page)) expect(chong(chai, c), `${ten}: chai chồng ${c.ten} ${JSON.stringify({ chai, c })}`).toBe(false);
      };

      // Chai đứng (đầu khối): mô hình nằm trọn khung, không chồng chữ/nút mở đầu
      const dung = await khungTai(page, P_DUNG);
      trongKhung(dung.hop);
      await khongChong(dung, "chai đứng");
      const caoDong = dung.hop.h;

      // Nhấc nắp: hộp mô hình cao hơn lúc đóng (nắp đã rời chai), vẫn trọn khung và không chồng chữ
      const nhac = await khungTai(page, P_NHAC);
      trongKhung(nhac.hop);
      await khongChong(nhac, "nhấc nắp");
      expect(nhac.hop.y).toBeLessThan(nhac.mieng.y - (caoDong * 0.3));

      // Giọt rơi: lọt trong miệng chai (cổ chai rộng ~1/3 thân: lệch ngang ≤ 15% bề rộng chai), ngay trên miệng
      const giot = await khungTai(page, P_GIOT);
      expect(giot.giot, "giọt phải hiện lúc rơi").not.toBeNull();
      expect(Math.abs(giot.giot!.x - giot.mieng.x)).toBeLessThanOrEqual(dung.hop.w * 0.15);
      expect(giot.giot!.y).toBeLessThan(giot.mieng.y + 4);
      expect(giot.mieng.y - giot.giot!.y).toBeLessThan(vp.height * 0.08);

      // Cuối đoạn: bộ 3, không chồng chữ/nút khối kết
      const cuoi = await khungTai(page, P_CUOI);
      trongKhung(cuoi.hop);
      await khongChong(cuoi, "cuối đoạn");
      await page.context().close();
    });
  }

  test("điện thoại 390×844 với ?glb=1: vẫn chạy chuỗi ảnh khung, không tải GLB, không lỗi console", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const ds = batRequestGlb(page);
    const loi: string[] = [];
    page.on("pageerror", (e) => loi.push(String(e)));
    page.on("console", (m) => {
      // bỏ lỗi mạng Supabase giả của e2e (không liên quan khối LOPOE)
      if (m.type() === "error" && !/Failed to load resource|Supabase|supabase/i.test(m.text())) loi.push(m.text());
    });
    await moTrang(page, "/?glb=1");
    if (!(await coBanDinh(page))) return;
    for (const p of [P_DUNG, 0.3, P_NHAC, 0.7, P_CUOI]) {
      await denP(page, p);
      await page.waitForTimeout(1500);
    }
    if (cfg.khung_dien_thoai) {
      await expect.poll(() => page.evaluate(() => performance.getEntriesByType("resource").some((e) => e.name.includes(".webp") && /khung/.test(e.name))), { timeout: 60_000 }).toBe(true);
    }
    expect(ds.map((d) => d.url)).toEqual([]);
    expect(loi).toEqual([]);
  });

  test("máy tính 1440×900: đo khung/giây khi cuộn qua cả khối, tắt và bật ?glb=1 (ghi số vào PR)", async ({ browser, browserName }, testInfo) => {
    test.skip(browserName !== "chromium", "đo trên Chromium");
    for (const url of ["/", "/?glb=1"]) {
      const page = await trangMayTinh(browser, MAY_TINH[0]);
      await moTrang(page, url);
      if (!(await coBanDinh(page))) { await page.context().close(); return; }
      await denP(page, P_DUNG);
      if (url.includes("glb")) await expect.poll(() => page.evaluate(() => (window as unknown as { __lopoeGlb?: string }).__lopoeGlb), { timeout: 90_000 }).toBe("da-nap");
      await page.evaluate(() => { delete (window as unknown as { __p?: number }).__p; });
      await page.waitForTimeout(3000);
      const kq = await page.evaluate(async () => {
        const s = document.querySelector("#lopoe")!;
        const r = s.getBoundingClientRect();
        const goc = scrollY + r.top, dai = r.height - innerHeight;
        const khung: number[] = [];
        await new Promise<void>((xong) => {
          const DAI = 10_000; // cuộn đều 0 → 1 trong 10 giây (theo thời gian, không theo số khung)
          let dau = -1, truoc = 0;
          const buoc = (t: number) => {
            if (dau < 0) dau = t; else khung.push(t - truoc);
            truoc = t;
            const q = (t - dau) / DAI;
            if (q > 1) return xong();
            scrollTo(0, goc + q * dai);
            requestAnimationFrame(buoc);
          };
          requestAnimationFrame(buoc);
        });
        const tong = khung.reduce((x, y) => x + y, 0);
        const sx = [...khung].sort((x, y) => x - y);
        return { soKhung: khung.length, fpsTb: +(1000 / (tong / khung.length)).toFixed(1), khungLauNhat: +sx[sx.length - 1].toFixed(1), p95: +sx[Math.floor(sx.length * 0.95)].toFixed(1) };
      });
      console.log(`W073 máy tính 1440×900 ${url} cuộn cả khối: ${JSON.stringify(kq)}`);
      testInfo.annotations.push({ type: `khung ${url}`, description: JSON.stringify(kq) });
      expect(kq.soKhung).toBeGreaterThan(10);
      await page.context().close();
    }
  });
});
