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

    await expect(page.getByText("MỚI TẠI VIVE · NỘI ĐỊA HÀN")).toBeVisible();
    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem bộ sản phẩm" })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Phần đầu chiến dịch" })
        .getByRole("link", { name: "Giữ hàng tại booth" })
    ).toBeVisible();

    await expect(page.getByText(/BETTER BALANCE · NỘI ĐỊA HÀN/).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Đủ bộ, đỡ tốn." })).toBeVisible();
    await expect(page.getByText("Combo 2 sữa rửa mặt LOPOE")).toBeVisible();
    await expect(page.getByText("Combo kem dưỡng và ampoule LOPOE")).toBeVisible();
    await expect(page.getByText("Bộ 3 LOPOE")).toBeVisible();

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
      footer.getByRole("link", { name: /Facebook VIVE - K Beauty Experience/i })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /Instagram @vive\.k_beauty/i })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /TikTok @viveuniverse/i })
    ).toBeVisible();
  });

  test("co giãn 9 cỡ màn hình ở deviceScaleFactor 2–3: #canh khớp khung nhìn, hộp bao trong vùng, không đè chữ, không tràn quạt 430px", async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const co = [
      [360, 780],
      [390, 844],
      [430, 932],
      [768, 1024],
      [820, 1180],
      [1180, 820],
      [1280, 800],
      [1440, 900],
      [1920, 1080],
    ];

    for (const [w, h] of co) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        hasTouch: w < 1024,
        isMobile: w < 760,
        deviceScaleFactor: w < 760 ? 3 : 2,
        reducedMotion: "reduce",
      });
      const pg = await ctx.newPage();
      await caiDatMockSupabase(pg);
      const pageErrors: string[] = [];
      pg.on("pageerror", (e) => pageErrors.push(e.message));

      try {
        await pg.goto("/new-arrival");
        await pg.locator('[data-hydrated="true"]').waitFor({ state: "attached" });

        // 1. Màn retina: #canh phải đúng bằng innerWidth x innerHeight
        const cv = await pg.evaluate(() => {
          const c = document.getElementById("canh");
          return c ? [c.clientWidth - innerWidth, c.clientHeight - innerHeight] : [-1, -1];
        });
        expect(cv, `${w}x${h} #canh lệch cỡ`).toEqual([0, 0]);

        // 2. Cuộn qua 3 khối đầu kiểm tra hộp bao window.__viveBo và cột chữ .cot
        for (let k = 0; k < 3; k++) {
          await pg.evaluate((idx) => {
            const s = document.querySelectorAll("section[data-k]")[idx] as HTMLElement;
            window.scrollTo({ top: s.offsetTop, behavior: "instant" });
          }, k);
          await expect(pg.locator(`#canh[data-stage="${k}"]`)).toBeAttached();

          const loi = await pg.evaluate((idx) => {
            const b = (window as unknown as {
              __viveBo?: Record<string, { hop: [number, number, number, number]; an: number }>;
            }).__viveBo;
            const sec = document.querySelectorAll("section[data-k]")[idx];
            const cot = sec?.querySelector(".cot")?.getBoundingClientRect();
            const hdEl = Array.from(
              document.querySelectorAll<HTMLElement>("header, [role='banner']")
            ).find(
              (el) =>
                getComputedStyle(el).display !== "none" &&
                el.getBoundingClientRect().height > 0
            );
            const hd = hdEl ? hdEl.getBoundingClientRect().bottom : 0;
            const out: string[] = [];
            if (!b || !cot) return ["Thiếu __viveBo hoặc .cot"];

            for (const t of ["A", "S", "K"]) {
              const o = b[t];
              if (!o || o.an > 0.5) continue;
              const [x0, y0, x1, y1] = o.hop;
              if (x0 < -1 || y0 < hd - 1 || x1 > window.innerWidth + 1 || y1 > window.innerHeight + 1) {
                out.push(`${t} tràn khung ${o.hop.map(Math.round).join(",")}`);
              }
              const cham = !(x1 <= cot.left + 1 || x0 >= cot.right - 1 || y1 <= cot.top + 1 || y0 >= cot.bottom - 1);
              if (cham) out.push(`${t} đè chữ (${o.hop.map(Math.round).join(",")} vs ${Math.round(cot.left)},${Math.round(cot.top)})`);
            }

            sec?.querySelectorAll(".cot > *").forEach((el) => {
              if (
                el.scrollWidth > cot.width + 2 ||
                el.getBoundingClientRect().right > cot.right + 2
              ) {
                out.push(`chữ tràn khỏi .cot: ${el.tagName}`);
              }
            });
            return out;
          }, k);

          expect(loi, `Lỗi ở ${w}x${h} khối ${k + 1}`).toEqual([]);
        }

        // 3. Không cuộn ngang ở đầu và cuối trang (gồm quạt Personal Color 430px)
        const ngangTop = await pg.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(ngangTop, `${w}x${h} cuộn ngang đầu trang`).toBeLessThanOrEqual(0);

        await pg.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })
        );
        await pg.waitForTimeout(150);
        const ngangBottom = await pg.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(ngangBottom, `${w}x${h} cuộn ngang cuối trang`).toBeLessThanOrEqual(0);
        expect(pageErrors).toEqual([]);
      } finally {
        await ctx.close();
      }
    }
  });

  test("thanh trên điện thoại 390px gọn gàng và nút hero đạt tối thiểu 44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/new-arrival");

    const logoBox = await page.locator("header img[alt='VIVE']").boundingBox();
    expect(logoBox?.width).toBeLessThanOrEqual(58);

    const btnXem = page.getByRole("link", { name: "Xem bộ sản phẩm" });
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

  test("tôn trọng prefers-reduced-motion, dùng dữ liệu thật không bịa mô tả, ẩn 2 ống bên ở cảnh 1", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/new-arrival");
    await expect(page.locator('[data-reduced-motion="true"]')).toBeAttached();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain(
      "Cấp ẩm sâu, phục hồi hàng rào bảo vệ da với kết cấu mỏng nhẹ, thấm nhanh."
    );
    await expect(page.getByText("314.000đ")).toBeVisible();
    await expect(page.getByText("419.000đ")).toBeVisible();

    await page.evaluate(() => {
      const s = document.querySelectorAll("section[data-k]")[1] as HTMLElement;
      window.scrollTo({ top: s.offsetTop, behavior: "instant" });
    });
    await expect(page.locator('#canh[data-stage="1"]')).toBeAttached();
    await expect(page.locator('[data-object-id="srm"]')).toHaveCSS("opacity", "0");
    await expect(page.locator('[data-object-id="kem"]')).toHaveCSS("opacity", "0");
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

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/new-arrival");
    await expect(page.locator('[data-hydrated="true"]')).toBeAttached();

    for (const sc of screens) {
      await page.setViewportSize({ width: sc.width, height: sc.height });
      await expect(
        page.locator(`#canh[data-viewport="${sc.width}x${sc.height}"]`)
      ).toBeAttached();

      for (let k = 0; k < 3; k++) {
        await page.evaluate((idx) => {
          const s = document.querySelectorAll("section[data-k]")[idx] as HTMLElement;
          window.scrollTo({ top: s.offsetTop, behavior: "instant" });
        }, k);
        await expect(page.locator(`#canh[data-stage="${k}"]`)).toBeAttached();
        await page.screenshot({
          path: `test-results/screenshots/new-arrival/${sc.label}_k${k + 1}.png`,
          fullPage: false,
        });
      }
    }
  });
});
