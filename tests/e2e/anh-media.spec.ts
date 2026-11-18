import { test, expect, datDaKhaoSat } from "./fixtures";
import { SAN_PHAM } from "../../lib/data";

const MEDIA_BASE =
  "https://dsrejhghgbvnwgxpdhee.supabase.co/storage/v1/object/public/media";

const SVG_MOCK = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#F7EEEB"/><circle cx="60" cy="60" r="32" fill="#E8D2CC"/></svg>'
);

const spMau = SAN_PHAM.find(
  (sp) => sp.hien_thi && sp.con_hang !== "false" && Boolean(sp.anh?.trim())
)!;

test.describe("W005 · Kho media ảnh tập trung", () => {
  test("dùng URL kho media Supabase đúng cỡ the/the-nho và cập nhật không cần deploy lại", async ({
    page,
  }) => {
    let version = 2;

    await page.route(`${MEDIA_BASE}/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: SVG_MOCK,
      });
    });

    await page.route(
      (url) => url.pathname.includes("/rest/v1/san_pham"),
      async (route) => {
        const duLieuMoi = SAN_PHAM.map((sp) =>
          sp.anh?.trim()
            ? {
                ...sp,
                anh: `${MEDIA_BASE}/san-pham/${sp.id}/the.webp?v=${version}`,
              }
            : sp
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(duLieuMoi),
        });
      }
    );

    await datDaKhaoSat(page);
    await page.addInitScript(
      ({ id }) => {
        window.localStorage.setItem("vive_da_thich", JSON.stringify([id]));
        window.localStorage.setItem(
          "vive_gio_hang",
          JSON.stringify([{ loai: "san_pham", sanPhamId: id, soLuong: 1 }])
        );
      },
      { id: spMau.id }
    );

    // 1. Lưới sản phẩm /danh-muc dùng the.webp
    await page.goto(`/danh-muc?loai=${encodeURIComponent(spMau.danh_muc)}`);
    const anhDanhMuc = page.locator(
      `img[src*="/san-pham/${spMau.id}/the.webp?v=2"]`
    );
    await expect(anhDanhMuc).toBeVisible();
    await expect
      .poll(() =>
        anhDanhMuc.evaluate((el: HTMLImageElement) => el.naturalWidth > 0)
      )
      .toBe(true);

    // 2. Thẻ quẹt /quet dùng the.webp
    await page.goto("/quet");
    const anhQuet = page
      .locator(`img[src^="${MEDIA_BASE}/san-pham/"][src*="/the.webp?v=2"]`)
      .first();
    await expect(anhQuet).toBeVisible();

    // 3. Trang Đã thích /da-thich dùng the-nho.webp
    await page.goto("/da-thich");
    const anhDaThich = page.locator(
      `img[src*="/san-pham/${spMau.id}/the-nho.webp?v=2"]`
    );
    await expect(anhDaThich).toBeVisible();

    // 4. Trang Giỏ /gio dùng the-nho.webp
    await page.goto("/gio");
    const anhGio = page
      .locator(`img[src*="/san-pham/${spMau.id}/the-nho.webp?v=2"]`)
      .first();
    await expect(anhGio).toBeVisible();

    // 5. Đổi ảnh trong database -> reload thấy ?v=3 ngay không cần build/deploy lại
    version = 3;
    await page.reload();
    const anhGioMoi = page
      .locator(`img[src*="/san-pham/${spMau.id}/the-nho.webp?v=3"]`)
      .first();
    await expect(anhGioMoi).toBeVisible();
  });
});
