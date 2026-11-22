import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// W069 (#124): cách tải ảnh ở trang chủ và /new-arrival. Kiểm nguồn (không chạy trình duyệt).
const doc = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

const TRANG_CHU = doc("components/trang-chu/TrangChuClient.tsx");
const TRANG_CHU_PAGE = doc("app/(khach)/page.tsx");
const NEW_ARRIVAL_PAGE = doc("app/(khach)/new-arrival/page.tsx");
const KHOI_LANDING = fs
  .readdirSync(path.join(process.cwd(), "components/landing/khoi"))
  .map((f) => doc(`components/landing/khoi/${f}`));

const dem = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("W069 · tải ảnh trang chủ", () => {
  it("chỉ ảnh mặt tiền đầu màn hình có fetchPriority=high và loading=eager", () => {
    expect(dem(TRANG_CHU, /fetchPriority="high"/g)).toBe(1);
    expect(dem(TRANG_CHU, /loading="eager"/g)).toBeLessThanOrEqual(3);
    expect(TRANG_CHU).toMatch(/fetchPriority="high"\s+loading="eager"/);
  });

  it("ảnh mặt tiền có khung width/height (không giật bố cục) và nguồn mobile riêng", () => {
    expect(TRANG_CHU).toMatch(/media="\(max-width: 767px\)"\s+srcSet="\/trang-chu\/mt\/0-mobile\.webp"/);
    expect(TRANG_CHU).toMatch(/width=\{1600\}\s+height=\{891\}/);
  });

  it("trang chủ preload ảnh LCP theo mốc 767px (mobile) và 768px (máy tính)", () => {
    expect(TRANG_CHU_PAGE).toMatch(/href="\/trang-chu\/mt\/0-mobile\.webp"[\s\S]*?max-width: 767px/);
    expect(TRANG_CHU_PAGE).toMatch(/min-width: 768px/);
    expect(dem(TRANG_CHU_PAGE, /fetchPriority="high"/g)).toBe(2);
  });

  it("ảnh dưới màn hình đầu của trang chủ tải lười", () => {
    const anh = TRANG_CHU.match(/<img\b[\s\S]*?\/>/g) ?? [];
    const khongLazy = anh.filter((a) => !/loading="lazy"/.test(a));
    // chỉ logo h1 (fetchPriority=low) và ảnh mặt tiền (eager) không lazy
    expect(khongLazy.length).toBeLessThanOrEqual(2);
    for (const a of khongLazy) expect(a).toMatch(/fetchPriority="(low|high)"/);
  });

  it("/new-arrival preload hai ảnh sản phẩm lớn nhất đầu màn hình của khối LOPOE với ưu tiên cao", () => {
    expect(NEW_ARRIVAL_PAGE).toMatch(/rel="preload"\s+as="image"\s+href=\{href\}\s+fetchPriority="high"/);
    for (const k of ["sua_rua_mat", "kem_duong"]) {
      expect(NEW_ARRIVAL_PAGE).toContain(`lopoe3D.tai_san.${k}`);
    }
  });

  it("các khối landing dưới màn hình đầu không ép tải sớm", () => {
    for (const src of KHOI_LANDING) {
      expect(src).not.toMatch(/loading="eager"/);
      expect(src).not.toMatch(/fetchPriority="high"/);
    }
  });
});
