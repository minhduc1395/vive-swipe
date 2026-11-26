#!/usr/bin/env node
/**
 * W073 phần B (#152): chụp lại chuỗi ảnh khung LOPOE cho điện thoại từ cảnh three.js có chai GLB.
 * Cùng số khung, cùng bảng p (tiến trình cảnh của từng khung) với chuỗi cũ `public/thu-nghiem/lopoe-khung/`,
 * cùng cỡ 780×1688 (khung nhìn 390×844 @2x), WebP. Ghi vào thư mục MỚI (mặc định `public/thu-nghiem/lopoe-khung-glb/`),
 * kèm `nhan.json` (p + vị trí nhãn thành phần đọc từ cảnh). Không đụng chuỗi cũ.
 *
 * Cần app đang chạy (npm run build && npx next start -p 3000), Chromium của Playwright.
 *   node scripts/chup-khung-glb.mjs [--url http://127.0.0.1:3000] [--q 74] [--tu 0] [--den 798] [--ra public/thu-nghiem/lopoe-khung-glb]
 * --khong-glb: chụp không GLB (để so với chuỗi cũ, kiểm cách chụp). --png-dir <thư mục>: giữ thêm ảnh PNG gốc (để nén lại theo --q khác).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import yaml from "js-yaml";

const thamSo = Object.fromEntries(
  process.argv.slice(2).reduce((ds, v, i, a) => (v.startsWith("--") ? [...ds, [v.slice(2), a[i + 1] && !a[i + 1].startsWith("--") ? a[i + 1] : "1"]] : ds), []),
);
const URL_GOC = thamSo.url ?? "http://127.0.0.1:3000";
const Q = Number(thamSo.q ?? 74);
const RA = thamSo.ra ?? "public/thu-nghiem/lopoe-khung-glb";
const KHONG_GLB = !!thamSo["khong-glb"];

const cfg = yaml.load(fs.readFileSync("data/thu-nghiem/lopoe-3d.yaml", "utf8"));
const kdCu = cfg.khung_dien_thoai;
const nhanCu = JSON.parse(fs.readFileSync(path.join("public", kdCu.nhan), "utf8"));
const P = nhanCu.p;
const TU = Number(thamSo.tu ?? 0), DEN = Number(thamSo.den ?? P.length - 1);
const amp = cfg.khoi.find((k) => k.id === "amp-thanh-phan");
const A = amp?.a ?? 0.53, B = amp?.b ?? 0.62;

/** Ngược của pCanh (components/cuon-3d/phat-khung.ts, giu = false): tiến trình cảnh → tiến trình cuộn. */
function pTuCanh(pc) {
  const MA = 0.53, MB = 0.62;
  if (pc <= MA) return (pc * A) / MA;
  if (pc < MB) return A + ((pc - MA) * (B - A)) / (MB - MA);
  return Math.min(1, B + ((pc - MB) * (1 - B)) / (1 - MB));
}

fs.mkdirSync(RA, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: kdCu.vp_rong, height: kdCu.vp_cao }, deviceScaleFactor: kdCu.rong / kdCu.vp_rong, isMobile: true, hasTouch: true, locale: "vi-VN" });
await ctx.addInitScript(() => {
  localStorage.setItem("vive_da_khao_sat", "true");
  document.cookie = "vive_da_khao_sat=true; path=/; max-age=2592000";
});
const page = await ctx.newPage();
page.on("pageerror", (e) => console.error("pageerror", e));
await page.goto(`${URL_GOC}/?${KHONG_GLB ? "" : "glb=1&"}ba-chieu=1&chup=1`);
// chỉ chụp canvas: ẩn mọi thứ khác (chữ, nhãn, thanh trên, ảnh chờ)
await page.addStyleTag({ content: "body *{visibility:hidden!important;transition:none!important} #lopoe canvas{visibility:visible!important;opacity:1!important}" });

const denP = (pc) => page.evaluate(([p]) => {
  const s = document.querySelector("#lopoe");
  const r = s.getBoundingClientRect();
  scrollTo(0, scrollY + r.top + p * (r.height - innerHeight));
  dispatchEvent(new Event("scroll"));
  window.__p = p;
}, [pTuCanh(pc)]);

await denP(0.001);
if (!KHONG_GLB) {
  await page.waitForFunction(() => window.__lopoeGlb === "da-nap" || window.__lopoeGlb === "loi", null, { timeout: 300_000 });
  const tt = await page.evaluate(() => window.__lopoeGlb);
  if (tt !== "da-nap") throw new Error(`GLB nạp lỗi: ${tt}`);
}
await page.waitForTimeout(4000); // ảnh hạt, font No.1

const nhan = new Array(P.length).fill(null);
const fileNhanTam = path.join(RA, `.nhan-${TU}-${DEN}.json`);
const r1 = (v) => Math.round(v * 10) / 10;
const doiNhan = (ds) => ds.map((v) => (v.o < 0.01 ? 0 : [r1(v.x), r1(v.y), Math.round(v.o * 100) / 100]));
const t0 = Date.now();
let chai = null;
for (let i = TU; i <= DEN; i++) {
  const pc = P[i];
  await page.evaluate(() => { window.__vt = undefined; window.__lopoeGlbKhung = undefined; });
  await denP(pc);
  // cảnh vẽ xong ở đúng pc: cảnh ghi __vt mỗi lần vẽ; với GLB còn ghi __lopoeGlbKhung.p = pc
  await page.waitForFunction(([pc, glb]) => !!window.__vt && (!glb || Math.abs((window.__lopoeGlbKhung?.p ?? -1) - pc) < 1e-7), [pc, !KHONG_GLB], { timeout: 60_000, polling: "raf" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const vt = await page.evaluate(() => ({ vt: window.__vt, k: window.__lopoeGlbKhung ?? null, conLai: window.__lopoeAnhAmpConLai }));
  // #154: có GLB thì cảnh không được còn ảnh phẳng ampoule (nắp cũ); còn thì dừng, không chụp chuỗi lỗi
  if (!KHONG_GLB && vt.conLai !== 0) throw new Error(`khung ${i}: còn ${vt.conLai} mesh ảnh phẳng ampoule trong cảnh`);
  nhan[i] = { srm: doiNhan(vt.vt.srm), amp: doiNhan(vt.vt.amp) };
  // chai GLB trên khung (px khung nhìn): [x, y, rộng, cao của hộp mô hình, miệng x, y, giọt x, y | 0]: cho e2e kiểm không chồng chữ, giọt đúng miệng
  if (vt.k) { const k = vt.k; nhan[i].chai = [k.hop.x, k.hop.y, k.hop.w, k.hop.h, k.mieng.x, k.mieng.y].map(r1).concat(k.giot ? [r1(k.giot.x), r1(k.giot.y)] : [0]); }
  if (i === 426 && vt.k) chai = { i, pc, ...vt.k };
  const png = await page.screenshot({ type: "png" });
  if (thamSo["png-dir"]) { fs.mkdirSync(thamSo["png-dir"], { recursive: true }); fs.writeFileSync(path.join(thamSo["png-dir"], `${String(i).padStart(3, "0")}.png`), png); }
  await sharp(png).resize(kdCu.rong, kdCu.cao).webp({ quality: Q, effort: 6 }).toFile(path.join(RA, `${String(i).padStart(3, "0")}.webp`));
  if (i % 20 === 0 || i === DEN) {
    fs.writeFileSync(fileNhanTam, JSON.stringify({ tu: TU, den: DEN, nhan: nhan.slice(TU, DEN + 1), chai }));
    console.log(`khung ${i}/${DEN} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}
await browser.close();

// gộp các phần nhãn đã chụp (chạy nhiều lần theo đoạn --tu/--den) thành nhan.json khi đủ
const gop = new Array(P.length).fill(null);
let chaiGop = null;
for (const f of fs.readdirSync(RA).filter((f) => f.startsWith(".nhan-"))) {
  const j = JSON.parse(fs.readFileSync(path.join(RA, f), "utf8"));
  j.nhan.forEach((n, k) => { if (n) gop[j.tu + k] = n; });
  chaiGop = chaiGop ?? j.chai;
}
if (chaiGop) console.log("chai ở cảnh 0,53 (px khung nhìn):", JSON.stringify(chaiGop));
if (gop.every(Boolean)) {
  fs.writeFileSync(path.join(RA, "nhan.json"), JSON.stringify({ p: P, nhan: gop }));
  for (const f of fs.readdirSync(RA).filter((f) => f.startsWith(".nhan-"))) fs.rmSync(path.join(RA, f));
  console.log(`xong: ${P.length} khung + nhan.json ở ${RA}`);
} else console.log(`còn thiếu ${gop.filter((n) => !n).length} khung, chạy tiếp đoạn còn lại`);
