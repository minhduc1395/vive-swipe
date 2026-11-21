import { test, expect, datDaKhaoSat } from "./fixtures";
import { DOANH_NGHIEP } from "@/lib/data";
import * as fs from "fs";
import * as path from "path";

const CU_CHUAN_9_CO = [
  { name: "360x780", width: 360, height: 780 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1180x820", width: 1180, height: 820 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;

test.describe("W019 · Trang chính sách (/chinh-sach) và chân trang (ChanTrang)", () => {
  test("1. /chinh-sach đọc đúng thông tin doanh nghiệp từ data/doanh-nghiep.yaml, ẩn SĐT khi null, không còn [chờ W001]", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/chinh-sach");

    await expect(
      page.getByRole("heading", { name: "Chính sách bảo mật & giữ hàng" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /1\. Bảo mật dữ liệu cá nhân/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /2\. Quy định giữ hàng tại booth/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /3\. Đổi trả, nhãn phụ & khuyến mại/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /4\. Thông tin doanh nghiệp/ }),
    ).toBeVisible();

    await expect(page.getByText(DOANH_NGHIEP.ten_cong_ty).first()).toBeVisible();
    await expect(page.getByText(DOANH_NGHIEP.ma_so_thue).first()).toBeVisible();
    await expect(page.getByText(DOANH_NGHIEP.dia_chi).first()).toBeVisible();
    await expect(page.getByText(DOANH_NGHIEP.email).first()).toBeVisible();
    await expect(page.getByText("[chờ W001]")).toHaveCount(0);
    if (DOANH_NGHIEP.so_dien_thoai === null) {
      await expect(page.locator("dl").getByText("Số điện thoại")).toHaveCount(0);
    }

    await expect(page.getByRole("button", { name: /Quay lại/i })).toBeVisible();
  });

  test("2. Chân trang xuất hiện trên các trang khách cuộn dọc (/deal, /gio, /chinh-sach) với thông tin doanh nghiệp và MXH", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await datDaKhaoSat(page);

    for (const route of ["/deal", "/gio", "/chinh-sach"]) {
      await page.goto(route);
      const footer = page.locator("footer");
      await expect(footer).toHaveCount(1);
      await expect(footer).toBeVisible();
      await expect(
        footer.getByRole("link", { name: /Facebook VIVE/i }),
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: /Instagram @vive\.vers/i }),
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: /TikTok @viveuniverse/i }),
      ).toBeVisible();
      await expect(
        footer.getByText(new RegExp(DOANH_NGHIEP.ma_so_thue)),
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: "Giữ hàng tại booth" }),
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: "Đổi trả" }),
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: "Bảo mật dữ liệu" }),
      ).toBeVisible();
    }
  });

  test("3. Không cuộn ngang ở 9 cỡ màn hình và chụp ảnh /chinh-sach ở 390, 820, 1440", async ({
    page,
  }) => {
    test.setTimeout(90000);
    for (const vp of CU_CHUAN_9_CO) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/chinh-sach");
      const cuonNgang = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(cuonNgang, `/chinh-sach bị cuộn ngang ở ${vp.name}`).toBe(false);
    }

    const dir = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "chinh-sach",
    );
    fs.mkdirSync(dir, { recursive: true });
    for (const sz of [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(dir, `${sz.label}_chinh-sach.png`),
      });
    }
  });
});
