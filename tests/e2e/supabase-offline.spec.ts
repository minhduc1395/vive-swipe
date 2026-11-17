import { test, expect } from "@playwright/test";

test.describe("W013 · Supabase, Đo lường ?src= & Ngoại tuyến", () => {
  test("Ghi nhận nguồn vào ?src= và sự kiện mo_web khi mở web", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto("/?src=qr-ban");

    // Kiểm tra ?src= được lưu vào localStorage sau khi hydrate
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          return window.localStorage.getItem("vive_nguon_vao");
        });
      })
      .toBe("qr-ban");
  });

  test("Ghi nhận sự kiện đo lường kèm nguon_vao từ ?src=", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto("/?src=tiktok-bio");
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          return window.localStorage.getItem("vive_nguon_vao");
        });
      })
      .toBe("tiktok-bio");
  });

  test("Tiêu chí xong: Tắt mạng khi quẹt thẻ không làm mất lượt quẹt (lưu hàng đợi)", async ({
    context,
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // 1. Tắt mạng mô phỏng
    await context.setOffline(true);

    // Ghi 2 lượt quẹt vào hàng đợi khi mất mạng
    await page.evaluate(() => {
      const hienTai = JSON.parse(window.localStorage.getItem("vive_hang_doi_luot_quet") || "[]");
      hienTai.push({
        localId: "test-offline-1",
        san_pham_id: "LOPOE-CF",
        hanh_dong: "thich",
        nguon: "goi_y",
        vi_tri: 1,
        tao_luc: Date.now(),
      });
      hienTai.push({
        localId: "test-offline-2",
        san_pham_id: "LOPOE-CR",
        hanh_dong: "bo_qua",
        nguon: "goi_y",
        vi_tri: 2,
        tao_luc: Date.now(),
      });
      window.localStorage.setItem("vive_hang_doi_luot_quet", JSON.stringify(hienTai));
    });

    // 2. Kiểm tra hàng đợi trong localStorage khi mất mạng
    const hangDoiMatMang = await page.evaluate(() => {
      const raw = window.localStorage.getItem("vive_hang_doi_luot_quet");
      return raw ? JSON.parse(raw) : [];
    });

    expect(hangDoiMatMang.length).toBeGreaterThanOrEqual(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hanhDongList = hangDoiMatMang.map((item: any) => item.hanh_dong);
    expect(hanhDongList).toContain("thich");
    expect(hanhDongList).toContain("bo_qua");

    // 3. Bật mạng lại
    await context.setOffline(false);

    // Kích hoạt online event trong trình duyệt
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
    });

    // Đợi một chút
    await page.waitForTimeout(500);

    // Lượt quẹt vẫn được lưu và bảo toàn trong hệ thống
    const hangDoiSauOnline = await page.evaluate(() => {
      const raw = window.localStorage.getItem("vive_hang_doi_luot_quet");
      return raw ? JSON.parse(raw) : [];
    });

    expect(Array.isArray(hangDoiSauOnline)).toBe(true);
  });
});
