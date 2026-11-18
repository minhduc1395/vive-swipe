import { test, expect } from "@playwright/test";

function giaoNhau(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

test.describe("W027 · Landing chiến dịch /new-arrival", () => {
  test("hiển thị đầy đủ thanh trên, các khối theo đợt và chân trang trên máy tính", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/new-arrival");

    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(
      header.getByRole("link", { name: "New Arrival", exact: true })
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Quẹt", exact: true })
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Sản phẩm" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Giỏ/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

    await expect(page.getByText("MỚI TẠI VIVE · NỘI ĐỊA HÀN")).toBeVisible();
    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem bộ sản phẩm" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Giữ hàng tại booth" })).toBeVisible();

    await expect(page.getByText(/BETTER BALANCE · NỘI ĐỊA HÀN/).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Đủ bộ, đỡ tốn." })).toBeVisible();
    await expect(page.getByText("Combo 2 sữa rửa mặt LOPOE")).toBeVisible();
    await expect(page.getByText("Combo kem dưỡng và ampoule LOPOE")).toBeVisible();
    await expect(page.getByText("Bộ 3 LOPOE")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Đang chạy tại booth" })).toBeVisible();
    await expect(page.getByText("COMBO PINK Medicube PDRN")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Tông nào hợp bạn?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tìm hiểu Personal Color" })).toBeVisible();

    await expect(page.getByText("LL2").first()).toBeVisible();
    await expect(page.getByText("VIVE | K-Beauty Experience").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Chỉ đường" })).toBeVisible();

    await expect(page.locator("footer")).toBeVisible();
    await expect(page.getByText("Facebook: VIVE - K Beauty Experience")).toBeVisible();
    await expect(page.getByText("Instagram: @vive.k_beauty")).toBeVisible();
    await expect(page.getByText("TikTok: @viveuniverse")).toBeVisible();
  });

  test("không có thanh cuộn ngang ở cả 9 cỡ màn hình (docs/05 §2.4)", async ({
    page,
  }) => {
    const viewports = [
      { width: 360, height: 780 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 820, height: 1180 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/new-arrival");
      await page.waitForLoadState("domcontentloaded");

      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(
        overflow,
        `Viewport ${vp.width}x${vp.height} không được có thanh cuộn ngang`
      ).toBe(false);
    }
  });

  test("kiểm hộp bao vật thể 3D nằm trọn trong khung nhìn và không chồng tiêu đề ở 7 cỡ (tasks/W027)", async ({
    page,
  }) => {
    test.setTimeout(90000);
    const viewports = [
      { width: 360, height: 780 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 820, height: 1180 },
      { width: 1180, height: 820 },
      { width: 1440, height: 900 },
    ];

    const blocks = [
      { selector: "#hero-chien-dich", headingSelector: "#hero-chien-dich h1", name: "hero" },
      {
        selector: "#ampoule-better-balance",
        headingSelector: "#ampoule-better-balance h2",
        name: "tieu-diem",
      },
      { selector: "#ke-ra-mat", headingSelector: "#ke-ra-mat h2", name: "ra-mat" },
    ];

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/new-arrival");
    await expect(page.locator('[data-hydrated="true"]')).toBeAttached();

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await expect(
        page.locator(`[data-viewport="${vp.width}x${vp.height}"]`)
      ).toBeAttached();

      for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
        const block = blocks[bIdx];
        const top = await page.locator(block.selector).evaluate((el) => {
          return Math.round(el.getBoundingClientRect().top + window.scrollY);
        });
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          top
        );
        await expect(
          page.locator(`[data-stage="${bIdx}"][data-stage-settled="true"]`)
        ).toBeAttached();

        const headingBox = await page.locator(block.headingSelector).boundingBox();
        expect(headingBox).not.toBeNull();

        const boxes = await page.evaluate(() => {
          return Array.from(
            document.querySelectorAll('[data-visible="true"] img')
          ).map((img) => {
            const r = img.getBoundingClientRect();
            return { x: r.left, y: r.top, width: r.width, height: r.height };
          });
        });
        expect(boxes.length).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < boxes.length; i++) {
          const box = boxes[i];
          if (!headingBox) continue;

          // Hộp bao (cả thân + nắp) nằm trọn trong khung nhìn cách mép >= 12px
          expect(
            box.x,
            `${vp.width}x${vp.height} ${block.name} img[${i}] tràn trái`
          ).toBeGreaterThanOrEqual(12);
          expect(
            box.y,
            `${vp.width}x${vp.height} ${block.name} img[${i}] tràn trên`
          ).toBeGreaterThanOrEqual(12);
          expect(
            box.x + box.width,
            `${vp.width}x${vp.height} ${block.name} img[${i}] tràn phải`
          ).toBeLessThanOrEqual(vp.width - 12);
          expect(
            box.y + box.height,
            `${vp.width}x${vp.height} ${block.name} img[${i}] tràn dưới`
          ).toBeLessThanOrEqual(vp.height - 12);

          expect(
            giaoNhau(box, headingBox),
            `${vp.width}x${vp.height} ${block.name} img[${i}] chồng tiêu đề`
          ).toBe(false);
        }
      }
    }
  });

  test("trên màn hình điện thoại 390px các khối hiển thị vừa vặn và nút đạt tối thiểu 44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/new-arrival");

    const btnXem = page.getByRole("link", { name: "Xem bộ sản phẩm" });
    await expect(btnXem).toBeVisible();
    const box = await btnXem.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    const btnDangNhap = page.locator("header").getByRole("link", { name: "Đăng nhập" });
    await expect(btnDangNhap).toBeVisible();
    const boxDN = await btnDangNhap.boundingBox();
    expect(boxDN?.height).toBeGreaterThanOrEqual(44);
  });

  test("tôn trọng prefers-reduced-motion, dùng dữ liệu thật không bịa mô tả, ẩn 2 ống bên ở cảnh 1", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/new-arrival");

    await expect(
      page.locator('[data-reduced-motion="true"]')
    ).toBeAttached();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain(
      "Cấp ẩm sâu, phục hồi hàng rào bảo vệ da với kết cấu mỏng nhẹ, thấm nhanh."
    );
    await expect(page.getByText("314.000đ")).toBeVisible();
    await expect(page.getByText("419.000đ")).toBeVisible();

    await page.locator("#ampoule-better-balance").scrollIntoViewIfNeeded();
    await expect(page.locator('[data-object-id="srm"]')).toHaveCSS("opacity", "0");
    await expect(page.locator('[data-object-id="kem"]')).toHaveCSS("opacity", "0");
  });

  test("không có câu nào nhắc tới quẹt trong nội dung giới thiệu sản phẩm của landing", async ({
    page,
  }) => {
    await page.goto("/new-arrival");

    const texts = await page.locator("main, section, #phan-duoi").allInnerTexts();
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

  test("chụp ảnh 3 khối đầu tại 360px, 390px, 820px, 1440px vào test-results/screenshots/new-arrival/", async ({
    page,
  }) => {
    test.setTimeout(90000);
    const screens = [
      { label: "360", width: 360, height: 780 },
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ];
    const blocks = [
      { selector: "#hero-chien-dich", name: "hero" },
      { selector: "#ampoule-better-balance", name: "tieu-diem" },
      { selector: "#ke-ra-mat", name: "ra-mat" },
    ];

    await page.goto("/new-arrival");
    await expect(page.locator('[data-hydrated="true"]')).toBeAttached();

    for (const sc of screens) {
      await page.setViewportSize({ width: sc.width, height: sc.height });
      await expect(
        page.locator(`[data-viewport="${sc.width}x${sc.height}"]`)
      ).toBeAttached();
      for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
        const b = blocks[bIdx];
        const top = await page.locator(b.selector).evaluate((el) => {
          return Math.round(el.getBoundingClientRect().top + window.scrollY);
        });
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          top
        );
        await expect(
          page.locator(`[data-stage="${bIdx}"][data-stage-settled="true"]`)
        ).toBeAttached();
        await page.waitForTimeout(100);
        await page.screenshot({
          path: `test-results/screenshots/new-arrival/${sc.label}_${b.name}.png`,
          fullPage: false,
        });
      }
    }
  });
});
