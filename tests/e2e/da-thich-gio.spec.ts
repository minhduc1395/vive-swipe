import { expect, test } from "@playwright/test";

test.describe("W012 · Đã thích và Giỏ hàng (giao diện)", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+07:00"));
  });
  test.describe("Màn Đã thích (/da-thich)", () => {
    test("trạng thái trống hiển thị đúng chữ mẫu và nút điều hướng", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem("vive_da_khao_sat", "true");
      });

      await page.goto("/da-thich");
      await expect(page.locator("h1")).toHaveText("Đã thích");
      await expect(page.getByText("0 món")).toBeVisible();
      await expect(
        page.getByText("Quẹt phải để lưu món bạn thích.")
      ).toBeVisible();

      const nutQuet = page.getByRole("link", { name: "Bắt đầu quẹt" });
      await expect(nutQuet).toBeVisible();
      await nutQuet.click();
      await expect(page).toHaveURL(/\/quet/);
    });

    test("hiển thị danh sách món đã thích, lọc danh mục, bỏ thích và thêm vào giỏ", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        // Thêm 2 món: LOPOE-CF (sữa rửa mặt) và 8809198846184 (Rep!el Gel Cleanser)
        localStorage.setItem(
          "vive_da_thich",
          JSON.stringify(["LOPOE-CF", "8809198846184"])
        );
      });

      await page.goto("/da-thich");
      await expect(page.locator("h1")).toHaveText("Đã thích");
      await expect(page.getByText("2 món")).toBeVisible();

      // Kiểm tra bộ lọc danh mục có "Tất cả (2)" và danh mục con
      await expect(page.getByRole("button", { name: /Tất cả \(2\)/ })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Sữa rửa mặt \(2\)/ })
      ).toBeVisible();

      // Kiểm tra 2 thẻ sản phẩm
      const cards = page.locator("article");
      await expect(cards).toHaveCount(2);

      // Thêm 1 món vào giỏ
      const nutThemGio = cards.first().getByRole("button", { name: "Thêm vào giỏ" });
      await nutThemGio.click();

      // Chấm số giỏ trên thanh tab chuyển thành 1
      const tabGio = page.locator("nav[aria-label='Điều hướng chính']").getByRole("link", { name: "Giỏ" });
      await expect(tabGio.getByLabel("1 món")).toBeVisible();

      // Bỏ thích món thứ 2
      const nutBoThich = cards.nth(1).getByRole("button", { name: "Bỏ thích" });
      await nutBoThich.click();

      // Sau khi bỏ thích, danh sách chỉ còn 1 món
      await expect(page.getByText("1 món")).toBeVisible();
      await expect(page.locator("article")).toHaveCount(1);
    });
  });

  test.describe("Màn Giỏ hàng (/gio)", () => {
    test("trạng thái trống hiển thị đúng câu chữ", async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem("vive_da_khao_sat", "true");
      });

      await page.goto("/gio");
      await expect(page.locator("h1")).toHaveText("Giỏ hàng");
      await expect(page.getByText("0 món")).toBeVisible();
      await expect(
        page.getByText("Giỏ đang trống. Quẹt lên để thêm nhanh.")
      ).toBeVisible();
    });

    test("Case 1 docs/02 mục 4.3: 1 SRM LOPOE -> 249.000đ; quà KM-13 muối tắm; không hiện giá trị nội bộ", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([{ sanPhamId: "LOPOE-CF", soLuong: 1 }])
        );
      });

      await page.goto("/gio");
      await expect(page.getByText("1 món")).toBeVisible();

      // Tổng ước tính 249.000đ
      await expect(page.getByText("249.000đ").first()).toBeVisible();

      // Quà dự kiến: 1 muối tắm salTherapy
      await expect(
        page.getByText(/Quà dự kiến:\s*1 muối tắm salTherapy/)
      ).toBeVisible();

      // TIÊU CHÍ XONG QUAN TRỌNG: Không hiện giá trị nội bộ của quà (49.000)
      const toanBoText = await page.innerText("body");
      // Đảm bảo không có số tiền đứng độc lập 49.000 (249.000 của SRM thì được có)
      expect(toanBoText).not.toMatch(/(?<!\d)49\.000/);

      // Ghi chú cố định đúng văn bản
      await expect(
        page.getByText(
          "Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth. Quà số lượng có hạn."
        )
      ).toBeVisible();
    });

    test("Case 2 docs/02 mục 4.3: SRM LOPOE + Rep!el Cleanser -> LOPOE giảm 25% còn 186K, tổng 395K; không quà", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([
            { sanPhamId: "LOPOE-CF", soLuong: 1 },
            { sanPhamId: "8809198846184", soLuong: 1 },
          ])
        );
      });

      await page.goto("/gio");
      await expect(page.getByText("2 món")).toBeVisible();

      // LOPOE có tag "Giảm 25% vì mua kèm"
      await expect(page.getByText("Giảm 25% vì mua kèm")).toBeVisible();

      // Tổng ước tính 395.000đ
      await expect(page.getByText("395.000đ")).toBeVisible();

      // Ưu đãi -63.000đ
      await expect(page.getByText("−63.000đ")).toBeVisible();

      // Không có quà dự kiến
      await expect(page.getByText(/Quà dự kiến:/)).toHaveCount(0);
    });

    test("Case 3 docs/02 mục 4.3: Combo LOPOE bộ 3 -> 911K, quà 1 kem dưỡng LOPOE; không hiện 549K", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([
            { loai: "combo", dealId: "LOPOE-COMBO-BO3", soLuong: 1 },
          ])
        );
      });

      await page.goto("/gio");
      await expect(page.getByText("911.000đ").first()).toBeVisible();
      await expect(
        page.getByText(/Quà dự kiến:\s*1 kem dưỡng LOPOE/)
      ).toBeVisible();

      // Không hiện giá trị nội bộ của quà (549.000)
      const toanBoText = await page.innerText("body");
      expect(toanBoText).not.toContain("549.000");
    });

    test("Case 8 docs/02 mục 4.3: Celimax serum 600K -> mốc tiếp theo thiếu 100K; gợi ý từ Đã thích", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([{ sanPhamId: "8809875907412", soLuong: 1 }])
        );
        localStorage.setItem(
          "vive_da_thich",
          JSON.stringify([
            "8809463992615", // Celimax BHA Peeling Pad 260.000
            "8809032673631", // SKINFOOD Egg White Foam 238.000
          ])
        );
      });

      await page.goto("/gio");
      // Thông báo mốc tiếp theo thiếu 100.000
      await expect(page.getByText(/100\.000đ/)).toBeVisible();
      await expect(page.getByText(/1 sữa rửa mặt LOPOE/)).toBeVisible();

      // Có thẻ gợi ý từ Đã thích
      await expect(page.getByText("Gợi ý từ danh sách Đã thích:")).toBeVisible();
      await expect(page.getByText(/Heartleaf BHA/)).toBeVisible();

      // Bấm nút + Thêm gợi ý vào giỏ
      const nutThemGoiY = page.getByRole("button", { name: "+ Thêm" }).first();
      await nutThemGoiY.click();

      // Số món tăng lên 2
      await expect(page.getByText("2 món")).toBeVisible();
    });

    test("tăng/giảm số lượng và xóa món khỏi giỏ", async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([{ sanPhamId: "8809198846184", soLuong: 1 }])
        );
      });

      await page.goto("/gio");
      await expect(page.getByText("1 món")).toBeVisible();
      await expect(page.getByText("209.000đ").first()).toBeVisible();

      // Tăng lên 2
      const nutTang = page.getByRole("button", { name: "Tăng số lượng" });
      await nutTang.click();
      await expect(page.getByText("2 món")).toBeVisible();
      await expect(page.getByText("418.000đ").first()).toBeVisible();

      // Giảm về 1
      const nutGiam = page.getByRole("button", { name: "Giảm số lượng" });
      await nutGiam.click();
      await expect(page.getByText("1 món")).toBeVisible();
      await expect(page.getByText("209.000đ").first()).toBeVisible();

      // Giảm lần nữa để xóa món khỏi giỏ
      await nutGiam.click();
      await expect(
        page.getByText("Giỏ đang trống. Quẹt lên để thêm nhanh.")
      ).toBeVisible();
    });
  });
});
