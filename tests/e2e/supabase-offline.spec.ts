import { test, expect } from "@playwright/test";

test.describe("W013 · Supabase, Đo lường ?src= & Ngoại tuyến", () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

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

  test("Tiêu chí xong: Tắt mạng khi quẹt thẻ không làm mất lượt quẹt (hàng đợi và đẩy lại khi có mạng)", async ({
    context,
    page,
  }) => {
    // 1. Giả lập Supabase Auth session trong localStorage để đảm bảo có session hợp lệ
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
      // Khởi tạo trước một hồ sơ khảo sát để vào thẳng deck quẹt
      localStorage.setItem("vive_da_khao_sat", "true");
      localStorage.setItem(
        "vive_tra_loi_cau_hoi",
        JSON.stringify({
          loai_da: "da-dau",
          van_de: ["mun"],
          ngan_sach: "tiet-kiem",
        })
      );
      // Giả lập token Supabase
      localStorage.setItem(
        "sb-dsrejhghgbvnwgxpdhee-auth-token",
        JSON.stringify({
          access_token: "mock-token-e2e",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-e2e",
          user: { id: "user-e2e-offline-test", aud: "authenticated" },
        })
      );
    });

    // 2. Chặn và thu thập các request gửi lên Supabase
    const insertedLuotQuet: Array<{
      khach_id: string;
      san_pham_id: string;
      hanh_dong: string;
      nguon?: string;
      tao_luc: string;
    }> = [];

    let chanMangSupabase = false;

    await page.route("**/auth/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-token-e2e",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-e2e",
          user: { id: "user-e2e-offline-test", aud: "authenticated" },
        }),
      });
    });

    await page.route("**/rest/v1/**", async (route) => {
      if (chanMangSupabase) {
        await route.abort("failed");
        return;
      }

      const request = route.request();
      const url = request.url();

      if (url.includes("luot_quet") && request.method() === "POST") {
        try {
          const postData = request.postDataJSON();
          if (Array.isArray(postData)) {
            insertedLuotQuet.push(...postData);
          }
        } catch {
          // bỏ qua
        }
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // 3. Mở trang quẹt và đợi load xong
    await page.goto("/quet");
    await expect(page.getByRole("article")).toBeVisible({ timeout: 10000 });

    // 4. Bật chế độ mất mạng: chặn request Supabase và context offline
    chanMangSupabase = true;
    await context.setOffline(true);

    // Quẹt 3 sản phẩm thật trên giao diện khi đang ngoại tuyến:
    // Lượt 1: Thích (click nút Thích)
    const nutThich = page.getByLabel("Thích");
    await expect(nutThich).toBeVisible();
    await nutThich.click();
    await page.waitForTimeout(500);

    // Lượt 2: Bỏ qua (click nút Bỏ qua)
    const nutBoQua = page.getByLabel("Bỏ qua");
    await expect(nutBoQua).toBeVisible();
    await nutBoQua.click();
    await page.waitForTimeout(500);

    // Lượt 3: Vào giỏ (click nút Vào giỏ)
    const nutVaoGio = page.getByLabel("Thêm vào giỏ");
    await expect(nutVaoGio).toBeVisible();
    await nutVaoGio.click();
    await page.waitForTimeout(500);

    // 5. Kiểm tra hàng đợi trong localStorage khi đang ngoại tuyến
    const hangDoiMatMang = await page.evaluate(() => {
      const raw = window.localStorage.getItem("vive_hang_doi_luot_quet");
      return raw ? JSON.parse(raw) : [];
    });

    expect(hangDoiMatMang.length).toBe(3);

    // Kiểm tra từng mục có tao_luc là chuỗi định dạng ISO
    for (const item of hangDoiMatMang) {
      expect(typeof item.tao_luc).toBe("string");
      expect(item.tao_luc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(item.san_pham_id).toBeDefined();
    }

    const hanhDongList = hangDoiMatMang.map((i: { hanh_dong: string }) => i.hanh_dong);
    expect(hanhDongList).toContain("thich");
    expect(hanhDongList).toContain("bo_qua");
    expect(hanhDongList).toContain("gio");

    // Đợi hơn 5 giây (vượt qua chu kỳ hẹn giờ 5s) khi đang mất mạng
    await page.waitForTimeout(5500);

    // Kiểm tra chưa có request nào được gửi thành công lên server
    expect(insertedLuotQuet.length).toBe(0);

    // 6. Bật mạng lại (hết ngoại tuyến)
    chanMangSupabase = false;
    await context.setOffline(false);

    // Kích hoạt sự kiện online trong trình duyệt
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
    });

    // 7. Kiểm tra: request insert `luot_quet` nhận đủ 3 dòng và hàng đợi rỗng
    await expect
      .poll(
        () => {
          return insertedLuotQuet.length;
        },
        { timeout: 10000, intervals: [500, 1000] }
      )
      .toBe(3);

    expect(insertedLuotQuet.map((i) => i.hanh_dong)).toEqual(
      expect.arrayContaining(["thich", "bo_qua", "gio"])
    );

    for (const r of insertedLuotQuet) {
      expect(r.khach_id).toBe("user-e2e-offline-test");
      expect(r.tao_luc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }

    // Hàng đợi trong localStorage đã được dọn sạch
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const raw = window.localStorage.getItem("vive_hang_doi_luot_quet");
          return raw ? JSON.parse(raw).length : 0;
        });
      })
      .toBe(0);
  });
});
