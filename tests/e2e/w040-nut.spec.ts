import { test, expect, datDaKhaoSat } from "./fixtures";

// W040: mỗi trang khách tối đa 1 nút nền đen (--den), và không còn nút viền đen.
const TRANG = ["/", "/chao", "/bat-dau", "/quet", "/danh-muc", "/da-thich", "/deal", "/gio", "/dang-nhap", "/personal-color"];

for (const duongDan of TRANG) {
  test(`W040 ${duongDan}: tối đa 1 nút nền đen, không nút viền đen`, async ({ page }) => {
    await datDaKhaoSat(page);
    await page.goto(duongDan);
    await page.waitForLoadState("networkidle");
    const ketQua = await page.evaluate(() => {
      const DEN = "rgb(43, 43, 42)";
      const nut = [...document.querySelectorAll<HTMLElement>("button, a[href], [role=button]")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
      });
      const nenDen = nut.filter((el) => getComputedStyle(el).backgroundColor === DEN).map((el) => el.textContent?.trim() ?? "");
      const vienDen = nut.filter((el) => {
        const cs = getComputedStyle(el);
        return parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopColor === DEN && cs.borderTopStyle !== "none";
      }).map((el) => el.textContent?.trim() ?? "");
      return { nenDen, vienDen };
    });
    expect(ketQua.nenDen.length, `nút nền đen: ${ketQua.nenDen.join(" | ")}`).toBeLessThanOrEqual(1);
    expect(ketQua.vienDen, "nút viền đen").toEqual([]);
  });
}
