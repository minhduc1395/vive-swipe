import { test, expect, datDaKhaoSat } from "./fixtures";
import { SAN_PHAM } from "../../lib/data";

// #128: /quet hiện ảnh thẻ đầu nhanh. Kiểm ở điện thoại 390×844 (cách đo LCP: scripts/do-lcp-quet.mjs).
test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 120000 });

const MEDIA_BASE =
  "https://dsrejhghgbvnwgxpdhee.supabase.co/storage/v1/object/public/media";
const GOC_SUPABASE_E2E = "http://supabase.e2e.test";

const SVG_MOCK = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="236" height="236"><rect width="236" height="236" fill="#F7EEEB"/><circle cx="118" cy="118" r="60" fill="#E8D2CC"/></svg>'
);

test("/quet: không lỗi console, thẻ đầu hiện ảnh ưu tiên cao, CLS ≤ 0,1, preconnect tới Supabase", async ({
  page,
}) => {
  const loi: string[] = [];
  page.on("pageerror", (e) => loi.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") loi.push(m.text());
  });

  await page.route(`${MEDIA_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "image/svg+xml", body: SVG_MOCK })
  );
  // Máy chủ dev dùng chung giữa các test: nếu test quản trị chạy trước đã sửa kho dev,
  // DuLieuProvider lấy dữ liệu tĩnh (ảnh /products/<id>.webp, phần lớn không có trong repo -> 404).
  // Trả ảnh giả cho đường này để test không phụ thuộc thứ tự chạy.
  await page.route(
    (url) => url.pathname.startsWith("/products/") && /\.(webp|png|jpe?g)$/i.test(url.pathname),
    (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: SVG_MOCK })
  );
  await page.route(
    (url) => url.pathname.includes("/rest/v1/san_pham"),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          SAN_PHAM.map((sp) =>
            sp.anh?.trim()
              ? { ...sp, anh: `${MEDIA_BASE}/san-pham/${sp.id}/the.webp?v=2` }
              : sp
          )
        ),
      })
  );

  await datDaKhaoSat(page);
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  const phanHoi = await page.goto("/quet", { waitUntil: "load" });

  // Thẻ đầu hiện ảnh thật (đã giải mã, rộng > 0)
  const anhDau = page.locator("article img").first();
  await expect(anhDau).toBeVisible({ timeout: 30000 });
  await expect
    .poll(() => anhDau.evaluate((el) => (el as HTMLImageElement).naturalWidth), { timeout: 15000 })
    .toBeGreaterThan(0);

  // Ảnh thẻ trên cùng: ưu tiên cao, không lazy, có khung kích thước
  await expect(anhDau).toHaveAttribute("fetchpriority", "high");
  await expect(anhDau).not.toHaveAttribute("loading", "lazy");
  await expect(anhDau).toHaveAttribute("width", "236");
  await expect(anhDau).toHaveAttribute("height", "236");

  // Chỉ có 1 ảnh fetchpriority=high trong khu deck (thẻ phía sau không ưu tiên cao)
  expect(await page.locator("article img[fetchpriority=high]").count()).toBe(1);

  // preconnect tới gốc Supabase: trong HTML (<link>) hoặc trong header Link của phản hồi
  const linkTrongHtml = await page.evaluate((goc) =>
    Array.from(document.querySelectorAll('link[rel="preconnect"]')).some((l) =>
      (l.getAttribute("href") ?? "").startsWith(goc)
    ), GOC_SUPABASE_E2E
  );
  const linkHeader = phanHoi?.headers()["link"] ?? "";
  expect(
    linkTrongHtml || (linkHeader.includes(GOC_SUPABASE_E2E) && linkHeader.includes("preconnect")),
    "preconnect tới gốc Supabase"
  ).toBe(true);

  await page.waitForTimeout(2500);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, "CLS /quet").toBeLessThanOrEqual(0.1);
  expect(loi, `Lỗi console:\n${loi.join("\n")}`).toEqual([]);
});
