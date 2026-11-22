import { test, expect } from "./fixtures";

// W069 (#124): hiệu năng tải trang chủ và /new-arrival ở màn điện thoại 390×844.
test.use({ viewport: { width: 390, height: 844 } });
test.describe.configure({ timeout: 120000 });

const TRANG = ["/", "/new-arrival"] as const;

for (const duong of TRANG) {
  test(`${duong}: không lỗi console, CLS ≤ 0,1, ảnh đầu màn ưu tiên đúng`, async ({ page }) => {
    const loi: string[] = [];
    page.on("pageerror", (e) => loi.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") loi.push(m.text());
    });

    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(duong, { waitUntil: "load" });
    await page.waitForTimeout(3000);

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls, `CLS ${duong}`).toBeLessThanOrEqual(0.1);

    // Ảnh tải sớm (eager) ≤ 3 trong phần tử <img> có mặt trên trang lúc đầu
    const soEager = await page.locator("img[loading=eager]").count();
    expect(soEager, "số ảnh loading=eager").toBeLessThanOrEqual(3);

    if (duong === "/") {
      // ảnh mặt tiền đầu màn hình: ưu tiên cao
      const hinh = page.locator("img.anh-mat-tien-goc");
      await expect(hinh).toHaveAttribute("fetchpriority", "high");
    } else {
      // preload ảnh sản phẩm đầu màn hình nằm trong head, ưu tiên cao
      const preload = await page.evaluate(() =>
        Array.from(document.querySelectorAll('link[rel="preload"][as="image"]')).map((l) => ({
          href: l.getAttribute("href"),
          pri: l.getAttribute("fetchpriority"),
        }))
      );
      const anhSanPham = preload.filter((p) => p.href?.startsWith("/thu-nghiem/lopoe-3d/"));
      expect(anhSanPham.length).toBeGreaterThanOrEqual(2);
      expect(anhSanPham.every((p) => p.pri === "high")).toBe(true);
    }

    expect(loi, `lỗi console ${duong}`).toEqual([]);
  });
}
