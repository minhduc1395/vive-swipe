import fs from "node:fs";
import path from "node:path";
import { test, expect, datDaKhaoSat } from "./fixtures";
import type { Page } from "@playwright/test";
import { parseCauHinhLopoe3D } from "../../lib/thu-nghiem/lopoe-3d";
import { khungTuP, MOC_CANH_AMP, pCanh } from "../../components/cuon-3d/phat-khung";

/**
 * W073 phần B (#152): điện thoại (390×844) bật GLB (`?glb=1` / `glb.bat`) thì đoạn LOPOE chạy chuỗi ảnh khung MỚI chụp từ
 * cảnh 3D có chai GLB (cách b: 3D trực tiếp chỉ ~5–13 fps trên Pixel 7 CPU x4, xem w073b-fps.spec.ts). Tắt thì y hệt main.
 * Vị trí chai GLB trên từng khung (hộp mô hình, miệng, giọt) ghi lúc chụp trong nhan.json (`chai`), dùng để kiểm không chồng chữ.
 */
const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
const KD = cfg.glb!.khung_dien_thoai!;
const NHAN = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", KD.nhan), "utf8")) as {
  p: number[]; nhan: { chai?: number[] }[];
};
const AMP = cfg.khoi.find((k) => k.id === "amp-thanh-phan");
const pCanhCua = (p: number) => pCanh(p, AMP?.a ?? MOC_CANH_AMP.a, AMP?.b ?? MOC_CANH_AMP.b);
/** Khung gần nhất ứng với tiến trình cuộn p (giống veAnh trong CuonLopoe3D) */
const khungCua = (p: number) => Math.round(khungTuP(NHAN.p, pCanhCua(p)));
/** Mốc cuộn: chai đứng, nhấc nắp, giọt sắp chạm miệng, cuối đoạn (cùng mốc với w073-lopoe-glb.spec.ts) */
const P_DUNG = 0.02, P_NHAC = 0.475, P_GIOT = 0.4865, P_CUOI = 0.97;
const KHUNG_GLB = /\/thu-nghiem\/lopoe-khung-glb\//;
const KHUNG_CU = /\/thu-nghiem\/lopoe-khung\//;
const LA_GLB = /\/lopoe-3d-glb\//;

type Hop = { x: number; y: number; width: number; height: number };
const chong = (a: Hop, b: Hop) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;

function ghiRequest(page: Page) {
  const ds: string[] = [];
  page.on("request", (r) => ds.push(r.url()));
  return ds;
}
function batLoi(page: Page) {
  const loi: string[] = [];
  page.on("pageerror", (e) => loi.push(String(e)));
  page.on("console", (m) => {
    // bỏ lỗi mạng Supabase giả của e2e (không liên quan khối LOPOE)
    if (m.type() === "error" && !/Failed to load resource|Supabase|supabase/i.test(m.text())) loi.push(m.text());
  });
  return loi;
}

async function moTrang(page: Page, url: string) {
  await page.setViewportSize({ width: 390, height: 844 });
  await datDaKhaoSat(page);
  await page.goto(url);
  await expect(page.locator("#lopoe")).toBeAttached();
}

async function cuonToi(page: Page, p: number) {
  await page.evaluate((p) => {
    const s = document.querySelector("#lopoe")!;
    const r = s.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + p * (r.height - innerHeight));
    dispatchEvent(new Event("scroll"));
  }, p);
}

const khungDangHien = (page: Page) => page.evaluate(() => (window as unknown as { __lopoeKhung?: { thuMuc: string; i: number } }).__lopoeKhung ?? null);

/** Hộp chữ, nút đang hiện trong lớp chữ khối LOPOE */
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

const coKhung = async (page: Page) => (await page.locator("#lopoe canvas").count()) > 0;

test.describe("W073 phần B · chai GLB trên điện thoại bằng chuỗi khung mới (#152)", () => {
  test.beforeEach(() => test.setTimeout(180_000));

  for (const url of ["/", "/new-arrival"]) {
    test(`tắt (không ?glb): ${url} 390×844 dùng chuỗi khung cũ, 0 request tới chuỗi GLB / GLB`, async ({ page }) => {
      const ds = ghiRequest(page);
      const loi = batLoi(page);
      await moTrang(page, url);
      if (!(await coKhung(page))) return; // giảm chuyển động / không WebGL: bản tĩnh
      for (const p of [P_DUNG, 0.3, P_NHAC, 0.7, P_CUOI]) { await cuonToi(page, p); await page.waitForTimeout(1200); }
      await expect.poll(() => ds.some((u) => KHUNG_CU.test(u)), { timeout: 60_000 }).toBe(true);
      expect(ds.filter((u) => KHUNG_GLB.test(u) || LA_GLB.test(u))).toEqual([]);
      expect(await khungDangHien(page)).toBeNull();
      expect(loi).toEqual([]);
    });
  }

  test("?glb=1 390×844: chuỗi khung GLB, nhấc nắp đủ, giọt đúng miệng, không chồng chữ/nút, không lỗi", async ({ page }) => {
    const ds = ghiRequest(page);
    const loi = batLoi(page);
    await moTrang(page, "/?glb=1");
    if (!(await coKhung(page))) return;

    const toi = async (p: number) => {
      await cuonToi(page, p);
      const i = khungCua(p);
      await expect.poll(async () => {
        const k = await khungDangHien(page);
        return k && k.thuMuc === KD.thu_muc ? Math.abs(k.i - i) : 999;
      }, { timeout: 60_000 }).toBeLessThanOrEqual(1);
      await page.waitForTimeout(600); // chữ hiện xong
      const c = NHAN.nhan[i].chai!;
      expect(c, `khung ${i} thiếu số đo chai`).toBeDefined();
      return { i, hop: { x: c[0], y: c[1], width: c[2], height: c[3] }, mieng: { x: c[4], y: c[5] }, giot: c.length > 7 ? { x: c[6], y: c[7] } : null };
    };
    const trongKhung = (h: Hop) => {
      expect(h.x).toBeGreaterThanOrEqual(0);
      expect(h.y).toBeGreaterThanOrEqual(0);
      expect(h.x + h.width).toBeLessThanOrEqual(390);
      expect(h.y + h.height).toBeLessThanOrEqual(844);
    };
    const khongChong = async (h: Hop, ten: string) => {
      for (const c of await hopChuDangHien(page)) expect(chong(h, c), `${ten}: chai chồng ${c.ten} ${JSON.stringify({ h, c })}`).toBe(false);
    };

    const dung = await toi(P_DUNG);
    trongKhung(dung.hop);
    await khongChong(dung.hop, "chai đứng");

    const nhac = await toi(P_NHAC);
    trongKhung(nhac.hop);
    await khongChong(nhac.hop, "nhấc nắp");
    // nắp (collar + bulb + pipette) đã rời chai: đỉnh hộp cao hơn miệng nhiều
    expect(nhac.hop.y).toBeLessThan(nhac.mieng.y - dung.hop.height * 0.3);

    const giot = await toi(P_GIOT);
    expect(giot.giot, "giọt phải hiện lúc rơi").not.toBeNull();
    expect(Math.abs(giot.giot!.x - giot.mieng.x)).toBeLessThanOrEqual(giot.hop.width * 0.15);
    expect(giot.giot!.y).toBeLessThan(giot.mieng.y + 4);
    expect(giot.mieng.y - giot.giot!.y).toBeLessThan(844 * 0.08);
    await khongChong(giot.hop, "giọt");

    const cuoi = await toi(P_CUOI);
    trongKhung(cuoi.hop);
    await khongChong(cuoi.hop, "cuối đoạn");

    expect(ds.some((u) => KHUNG_GLB.test(u))).toBe(true);
    expect(ds.filter((u) => KHUNG_CU.test(u)), "bật GLB không tải chuỗi cũ").toEqual([]);
    expect(ds.filter((u) => LA_GLB.test(u)), "điện thoại không tải GLB / Draco").toEqual([]);
    expect(loi).toEqual([]);
  });
});
