import { expect, test, datDaKhaoSat } from "./fixtures";

// W069 (phần trợ năng): vùng bấm thanh trên và thanh tab trên điện thoại ≥ 44×44px.
test.use({ viewport: { width: 390, height: 844 } });

const CAC_TRANG = ["/", "/deal", "/new-arrival"];

test.describe("W069 vùng bấm ≥ 44px trên điện thoại", () => {
  test.beforeEach(async ({ page }) => {
    await datDaKhaoSat(page);
  });

  for (const route of CAC_TRANG) {
    test(`thanh trên và thanh tab ở ${route}`, async ({ page }) => {
      await page.goto(route);
      const thanhTren = page.locator("header").first();
      const thanhTab = page.getByRole("navigation").last();
      await expect(thanhTren).toBeVisible();
      await expect(thanhTab).toBeVisible();

      const phanTu = [
        ...(await thanhTren.locator("a, button").all()),
        ...(await thanhTab.locator("a, button").all()),
      ];
      expect(phanTu.length).toBeGreaterThanOrEqual(8);

      const loi: string[] = [];
      for (const pt of phanTu) {
        if (!(await pt.isVisible())) continue;
        const hop = await pt.boundingBox();
        const ten = ((await pt.getAttribute("aria-label")) ?? (await pt.innerText())).trim();
        if (!hop || hop.width < 44 || hop.height < 44) {
          loi.push(`${ten || "(không tên)"}: ${hop?.width}x${hop?.height}`);
        }
        // Nút/link phải có tên đọc được
        const tenTruyCap = ten || (await pt.textContent())?.trim();
        expect(tenTruyCap, "link/nút cần tên truy cập").toBeTruthy();
      }
      expect(loi, loi.join("; ")).toEqual([]);
    });
  }
});
