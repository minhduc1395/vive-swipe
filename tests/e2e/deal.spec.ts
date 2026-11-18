import { test, expect, datDaKhaoSat } from "./fixtures";

test.describe("W016 · Deal cho bạn (/deal) và thẻ deal trong deck", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+07:00"));
  });

  test("hiển thị trang /deal với tiêu đề, nhãn giải thích theo hồ sơ và danh sách deal", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      // Giả lập khách thích 2 món Medicube
      localStorage.setItem(
        "vive_da_thich",
        JSON.stringify(["8800256112227", "8809982769866"])
      );
      localStorage.setItem(
        "vive_ho_so",
        JSON.stringify({
          "th:Medicube": 2.5,
          "tp:PDRN": 1.5,
          "vd:cap-am": 2.0,
        })
      );
    });

    await page.goto("/deal");
    await expect(page.locator("h1")).toContainText("Deal");
    await expect(page.locator("h1")).toContainText("cho bạn");

    // Dòng giải thích theo hồ sơ: "Vì bạn thích ..."
    await expect(page.getByText("Vì bạn thích")).toBeVisible();

    // KM-08 hiển thị ở đầu danh sách
    const dealKm08 = page.locator('article[aria-label="Mua Medicube, Celimax, SKINFOOD tặng LOPOE"]');
    await expect(dealKm08).toBeVisible();
    await expect(dealKm08.getByText("Quà theo hóa đơn")).toBeVisible();
    await expect(dealKm08.getByText("Số lượng có hạn")).toBeVisible();
  });

  test("thêm combo vào giỏ (1 dòng combo) và thêm bộ gợi ý vào giỏ (nhiều dòng lẻ)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto("/deal");

    // 1. Thêm combo (COMBO PINK hoặc bất kỳ combo nào hiển thị)
    const nutThemCombo = page.getByRole("button", { name: "Thêm combo vào giỏ" }).first();
    await expect(nutThemCombo).toBeVisible();
    await nutThemCombo.click();

    // Kiểm tra toast và giỏ hàng có 1 dòng combo
    await expect(page.getByRole("status")).toBeVisible();

    const gioHangSauCombo = await page.evaluate(() => {
      const raw = localStorage.getItem("vive_gio_hang");
      return raw ? JSON.parse(raw) : [];
    });
    expect(gioHangSauCombo.length).toBe(1);
    expect(gioHangSauCombo[0].loai).toBe("combo");

    // 2. Thêm bộ gợi ý (nút "Thêm bộ")
    const nutThemBo = page.getByRole("button", { name: "Thêm bộ" }).first();
    if (await nutThemBo.isVisible()) {
      await nutThemBo.click();

      const gioHangSauBo = await page.evaluate(() => {
        const raw = localStorage.getItem("vive_gio_hang");
        return raw ? JSON.parse(raw) : [];
      });
      // Có thêm các dòng sản phẩm lẻ từ bộ gợi ý
      expect(gioHangSauBo.length).toBeGreaterThan(1);
      const coDongSanPhamLe = gioHangSauBo.some(
        (item: { loai?: string; sanPhamId?: string }) => item.loai === "san_pham" || Boolean(item.sanPhamId)
      );
      expect(coDongSanPhamLe).toBe(true);
    }
  });

  test("đăng ký email nhận deal thành công và lưu vào bộ nhớ", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto("/deal");
    await expect(
      page.getByText("Nhận email khi món bạn thích có deal tốt")
    ).toBeVisible();

    const inputEmail = page.getByPlaceholder("Nhập email của bạn...");
    await inputEmail.scrollIntoViewIfNeeded();
    await inputEmail.click();
    await inputEmail.fill("khachhang@example.com");

    const nutDangKy = page.getByRole("button", { name: "Đăng ký" });
    await nutDangKy.click({ force: true });

    await expect(
      page.getByText("Đã đăng ký nhận deal tới: khachhang@example.com")
    ).toBeVisible();

    const emailLuu = await page.evaluate(() => {
      return localStorage.getItem("vive_email_deal");
    });
    expect(emailLuu).toBe("khachhang@example.com");
  });

  test("thẻ deal trong deck (/quet) xuất hiện sau 5 lượt thích và dẫn tới /deal", async ({
    page,
  }) => {
    await datDaKhaoSat(page);
    await page.addInitScript(() => {
      // Đã có 4 món thích sẵn
      localStorage.setItem(
        "vive_da_thich",
        JSON.stringify(["sp1", "sp2", "sp3", "sp4"])
      );
    });

    await page.goto("/quet");

    // Quẹt thích thẻ hiện tại (món thứ 5)
    const nutThich = page.getByRole("button", { name: "Thích" });
    await expect(nutThich).toBeVisible();
    await nutThich.click();

    // Thẻ deal đặc biệt xuất hiện
    const theDeal = page.getByRole("article", {
      name: /(Thẻ deal trong deck|Gợi ý deal sau 5 lượt thích)/,
    });
    await expect(theDeal).toBeVisible();

    // Nút xem bộ gợi ý / xem deal dẫn tới /deal
    const nutXemDeal = theDeal.getByRole("link", { name: /(Xem bộ gợi ý|Xem deal cho bạn)/ });
    await expect(nutXemDeal).toBeVisible();
    await nutXemDeal.click();

    await expect(page).toHaveURL(/\/deal/);
  });
});
