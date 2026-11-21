import { test, expect, caiDatMockSupabase } from "./fixtures";

test.describe("W027 · Landing chiến dịch /new-arrival", () => {
  test("hiển thị đầy đủ thanh trên, các khối theo đợt và chân trang trên máy tính", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/new-arrival");

    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(
      header.getByRole("link", { name: "New Arrival", exact: true })
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Quẹt", exact: true })
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Sản phẩm" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Deal", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Đã thích" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Giỏ/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeAttached();
    const moDau = page.locator("#lopoe [data-mo-dau]");
    await expect(moDau.getByRole("heading", { name: "LOPOE Better Balance" })).toBeVisible();
    await expect(moDau.getByRole("link", { name: "Mua" })).toHaveAttribute("href", "/danh-muc?thuong-hieu=LOPOE");
    // Trang chủ "Tìm hiểu thêm" về /new-arrival; ở đây đổi thành "Xem combo" xuống khối combo
    await expect(moDau.getByRole("link", { name: "Xem combo" })).toHaveAttribute("href", "#ke-ra-mat");

    await expect(page.getByText(/BETTER BALANCE · NỘI ĐỊA HÀN/).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Đủ bộ, đỡ tốn." })).toBeVisible();
    const keRaMat = page.locator("#ke-ra-mat");
    await expect(keRaMat.getByText("Combo 2 sữa rửa mặt LOPOE")).toBeVisible();
    await expect(keRaMat.getByText("Combo kem dưỡng và ampoule LOPOE")).toBeVisible();
    await expect(keRaMat.getByText("Bộ 3 LOPOE")).toBeVisible();

    await expect(page.getByRole("heading", { name: /Đang có tại|Đang chạy tại booth/ })).toBeVisible();
    await expect(page.getByText("COMBO PINK Medicube PDRN")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Tone bạn màu nào?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tìm hiểu Personal Color" })).toBeVisible();

    await expect(page.getByText("LL2").first()).toBeVisible();
    await expect(page.getByText("VIVE | K-Beauty Experience").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Chỉ đường" }).first()
    ).toBeVisible();

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /Facebook VIVE/i })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /Instagram @vive\.vers/i })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /TikTok @viveuniverse/i })
    ).toBeVisible();
  });

  test("W064: phần đầu là khối cuộn LOPOE như trang chủ, không tràn ngang ở 360–1920px, không lỗi", async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const co = [
      [360, 780],
      [390, 844],
      [820, 1180],
      [1440, 900],
      [1920, 1080],
    ];
    for (const [w, h] of co) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        hasTouch: w < 1024,
        isMobile: w < 760,
        deviceScaleFactor: 2,
        reducedMotion: "reduce",
      });
      const pg = await ctx.newPage();
      await caiDatMockSupabase(pg);
      const pageErrors: string[] = [];
      pg.on("pageerror", (e) => pageErrors.push(e.message));
      try {
        await pg.goto("/new-arrival");
        await pg.locator('[data-hydrated="true"]').waitFor({ state: "attached" });
        await expect(pg.locator("#trang-landing #lopoe")).toBeAttached();
        await expect(pg.locator("#ke-ra-mat")).toBeAttached();
        // Sân khấu 3D cũ không còn
        await expect(pg.locator("#canh")).toHaveCount(0);
        for (const y of [0, 0.5, 1]) {
          await pg.evaluate((t) => window.scrollTo(0, (document.body.scrollHeight - innerHeight) * t), y);
          const tran = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          expect(tran, `${w}x${h} tràn ngang ở ${y}`).toBeLessThanOrEqual(0);
        }
        expect(pageErrors).toEqual([]);
      } finally {
        await ctx.close();
      }
    }
  });

  test("thanh trên điện thoại 390px gọn gàng và nút mở đầu đạt tối thiểu 44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/new-arrival");

    const logoBox = await page.locator("header img[alt='VIVE']").boundingBox();
    expect(logoBox?.width).toBeLessThanOrEqual(58);

    const btnXem = page.locator("#lopoe [data-mo-dau]").getByRole("link", { name: "Mua" });
    await expect(btnXem).toBeVisible();
    const box = await btnXem.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    const btnDangNhap = page
      .locator("header")
      .getByRole("link", { name: "Đăng nhập" });
    await expect(btnDangNhap).toBeVisible();
    const boxDN = await btnDangNhap.boundingBox();
    expect(boxDN?.height).toBeGreaterThanOrEqual(44);
  });

  test("tôn trọng prefers-reduced-motion (bản tĩnh, không canvas), dùng dữ liệu thật không bịa mô tả", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/new-arrival");
    await expect(page.locator("#lopoe canvas")).toHaveCount(0);
    await expect(page.locator("#lopoe")).toContainText("pH 5.5");

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain(
      "Cấp ẩm sâu, phục hồi hàng rào bảo vệ da với kết cấu mỏng nhẹ, thấm nhanh."
    );
    // Giá combo lấy từ data/deals.yaml
    await expect(page.locator("#ke-ra-mat").getByText("349.000đ")).toBeVisible();
    await expect(page.locator("#ke-ra-mat").getByText("911.000đ")).toBeVisible();

  });

  test("không có câu nào nhắc tới quẹt trong nội dung giới thiệu sản phẩm của landing", async ({
    page,
  }) => {
    await page.goto("/new-arrival");
    const texts = await page.locator("main, #phan-duoi").allInnerTexts();
    const fullText = texts.join(" ").toLowerCase();
    expect(fullText).not.toContain("quẹt phải");
    expect(fullText).not.toContain("quẹt trái");
    expect(fullText).not.toContain("deck quẹt");
    expect(fullText).not.toContain("bắt đầu quẹt");
  });

  test("không hiển thị deal may rủi chưa đăng ký hoặc deal ẩn", async ({ page }) => {
    await page.goto("/new-arrival");
    await expect(page.getByText("Vòng quay may mắn 10 ô")).not.toBeVisible();
    await expect(page.getByText("Lá thăm trong sample")).not.toBeVisible();
    await expect(page.getByText("Vòng quay LOPOE")).not.toBeVisible();
  });

  test("chụp ảnh đầu trang và khối combo tại 360px, 390px, 820px, 1440px vào test-results/screenshots/new-arrival/", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "chụp ảnh chỉ chạy trên Chromium");
    test.setTimeout(90000);
    const screens = [
      { label: "360", width: 360, height: 780 },
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ];
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/new-arrival");
    await expect(page.locator('[data-hydrated="true"]')).toBeAttached();
    for (const sc of screens) {
      await page.setViewportSize({ width: sc.width, height: sc.height });
      for (const [ten, sel] of [["dau", "#lopoe"], ["combo", "#ke-ra-mat"]] as const) {
        await page.evaluate((s) => {
          const el = document.querySelector(s) as HTMLElement;
          window.scrollTo({ top: el.offsetTop, behavior: "instant" });
        }, sel);
        await page.screenshot({
          path: `test-results/screenshots/new-arrival/${sc.label}_${ten}.png`,
          fullPage: false,
        });
      }
    }
  });
});
