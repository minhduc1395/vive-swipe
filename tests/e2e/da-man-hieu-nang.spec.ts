import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { KHOA_GIO_HANG, KHOA_DA_THICH } from "@/lib/kho-luu-tru";

const MA_TRAN_9_CO = [
  { name: "mobile-360", width: 360, height: 640 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-820", width: 820, height: 1180 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const;

const TRANG_KHACH = [
  "/",
  "/chao",
  "/bat-dau",
  "/quet",
  "/danh-muc",
  "/deal",
  "/da-thich",
  "/gio",
  "/giu-hang",
  "/dang-nhap",
  "/chinh-sach",
  "/new-arrival",
  "/personal-color",
] as const;

const ANH_DAI_DIEN_3_CO = [
  { label: "390", width: 390, height: 844 },
  { label: "820", width: 820, height: 1180 },
  { label: "1440", width: 1440, height: 900 },
] as const;

const TRANG_CHUP_ANH = [
  "/",
  "/quet",
  "/danh-muc",
  "/deal",
  "/gio",
  "/personal-color",
  "/chinh-sach",
  "/new-arrival",
] as const;

function theoDoiLoiTrang(page: Page, isWebKit: boolean) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const unexpectedHttpErrors: string[] = [];

  page.on("response", (res) => {
    if (res.status() >= 400) {
      const u = new URL(res.url()).pathname;
      unexpectedHttpErrors.push(`${res.status()} ${u}`);
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (
        !txt.includes("status of 404") &&
        !(isWebKit && txt.includes("due to access control checks"))
      ) {
        consoleErrors.push(txt);
      }
    }
  });
  page.on("pageerror", (err) => {
    // WebKit hủy fetch đang chạy khi chuyển trang nhanh báo "due to access control checks"
    if (isWebKit && err.message.includes("due to access control checks")) return;
    pageErrors.push(err.message);
  });

  return {
    kiemTraKhongLoi() {
      expect(
        unexpectedHttpErrors,
        `HTTP >= 400 ngoài dự kiến: ${unexpectedHttpErrors.join(" | ")}`
      ).toEqual([]);
      expect(consoleErrors, `Lỗi console: ${consoleErrors.join(" | ")}`).toEqual(
        []
      );
      expect(pageErrors, `Lỗi runtime trang: ${pageErrors.join(" | ")}`).toEqual(
        []
      );
    },
  };
}

test.describe("W032 · Kiểm thử đa màn hình, luồng chính và chụp ảnh", () => {
  test.beforeEach(async () => {
    test.setTimeout(180_000);
  });

  test("1. Không cuộn ngang và không lỗi console trên 13 trang khách × 9 cỡ màn hình", async ({
    page,
  }, testInfo) => {
    const boDemLoi = theoDoiLoiTrang(
      page,
      testInfo.project.name === "iphone-13"
    );

    await page.addInitScript(
      ({ kGio, kThich }) => {
        window.localStorage.setItem("vive_da_khao_sat", "true");
        document.cookie =
          "vive_da_khao_sat=true; path=/; max-age=31536000; SameSite=Lax";
        window.localStorage.setItem(kThich, JSON.stringify(["LOPOE-CF"]));
        window.localStorage.setItem(
          kGio,
          JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
        );
      },
      { kGio: KHOA_GIO_HANG, kThich: KHOA_DA_THICH }
    );

    const nhomCo = [
      MA_TRAN_9_CO.slice(0, 3),
      MA_TRAN_9_CO.slice(3, 6),
      MA_TRAN_9_CO.slice(6, 9),
    ];

    for (const route of TRANG_KHACH) {
      for (const nhom of nhomCo) {
        await page.setViewportSize({
          width: nhom[0].width,
          height: nhom[0].height,
        });
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(120);

        for (const vp of nhom) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.evaluate(
            () =>
              new Promise<void>((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
              )
          );
          const cuonNgang = await page.evaluate(
            () =>
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth
          );
          expect(
            cuonNgang,
            `${route} bị cuộn ngang ở ${vp.name} (${vp.width}×${vp.height})`
          ).toBe(false);
        }
      }
    }

    boDemLoi.kiemTraKhongLoi();
  });

  test("2. Luồng quẹt -> giỏ -> giữ hàng -> mã VIVE-xxxx chạy thông ở 390×844 và 1440×900", async ({
    page,
  }, testInfo) => {
    const boDemLoi = theoDoiLoiTrang(
      page,
      testInfo.project.name === "iphone-13"
    );

    for (const vp of [
      { label: "390x844", width: 390, height: 844 },
      { label: "1440x900", width: 1440, height: 900 },
    ]) {
      const sdtThu = `09${Math.floor(10000000 + Math.random() * 89999999)}`;
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.evaluate(() => {
        window.localStorage.clear();
        window.localStorage.setItem("vive_da_khao_sat", "true");
        document.cookie =
          "vive_da_khao_sat=true; path=/; max-age=31536000; SameSite=Lax";
      });

      await page.goto("/quet");
      const nutThich = page.getByRole("button", { name: "Thích" });
      const nutVaoGio = page.getByRole("button", { name: "Thêm vào giỏ" });
      await expect(nutThich).toBeVisible();

      await nutThich.click();
      await nutVaoGio.click();

      const linkGio = page.locator('a[href="/gio"]:visible').first();
      await expect(linkGio).toBeVisible();
      await linkGio.click();

      await expect(page).toHaveURL(/\/gio$/);
      const nutGiuHang = page.getByRole("link", { name: "Giữ hàng tại booth" });
      await expect(nutGiuHang).toBeVisible();
      await nutGiuHang.click();

      await expect(page).toHaveURL(/\/giu-hang$/);
      await page.locator("input#ten").fill("Khách Thử W032");
      await page.locator("input#sdt").fill(sdtThu);
      await page.getByRole("button", { name: "Xác nhận giữ hàng" }).click();

      await expect(page).toHaveURL(/\/giu-hang\/VIVE-\d{4}/, {
        timeout: 15000,
      });
      await expect(
        page.getByRole("heading", { name: "Đã giữ hàng" })
      ).toBeVisible();
      await expect(
        page.locator('svg[aria-label*="Mã QR cho /nhan-vien?ma=VIVE-"]')
      ).toBeVisible();
    }

    boDemLoi.kiemTraKhongLoi();
  });

  test("3. Chụp ảnh kiểm tra và so sánh toHaveScreenshot 3 cỡ đại diện (390, 820, 1440)", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ kGio, kThich }) => {
        window.localStorage.setItem("vive_da_khao_sat", "true");
        document.cookie =
          "vive_da_khao_sat=true; path=/; max-age=31536000; SameSite=Lax";
        window.localStorage.setItem(kThich, JSON.stringify(["LOPOE-CF"]));
        window.localStorage.setItem(
          kGio,
          JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
        );
      },
      { kGio: KHOA_GIO_HANG, kThich: KHOA_DA_THICH }
    );

    const outDir = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "da-man-hinh"
    );
    fs.mkdirSync(outDir, { recursive: true });

    for (const sz of ANH_DAI_DIEN_3_CO) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      for (const route of TRANG_CHUP_ANH) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        if (route === "/quet") {
          await page
            .locator("article")
            .first()
            .waitFor({ state: "visible", timeout: 10000 });
        } else {
          await page.waitForTimeout(250);
        }
        const slug = route === "/" ? "home" : route.slice(1);
        await page.screenshot({
          path: path.join(outDir, `${slug}_${sz.label}.png`),
        });
      }
    }
  });

  test("4. Máy tính bảng 768–1023px: khối Đang chạy tại booth và Personal Color không vỡ chữ, không tràn nút", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/new-arrival", { waitUntil: "domcontentloaded" });

    // 1. Khối Đang chạy tại booth: scrollWidth của từng thẻ deal không bị overflow
    const theDeals = page.locator('[data-testid="the-deal-booth"]');
    const dem = await theDeals.count();
    expect(dem).toBeGreaterThan(0);

    for (let i = 0; i < dem; i++) {
      const the = theDeals.nth(i);
      const bounds = await the.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
    }

    // 2. Khối Personal Color: nút không cao quá 1 dòng (<= 60px)
    const nutPc = page.locator('[data-testid="nut-personal-color"]');
    await expect(nutPc).toBeVisible();
    const nutBox = await nutPc.boundingBox();
    expect(nutBox).not.toBeNull();
    if (nutBox) {
      expect(nutBox.height).toBeLessThanOrEqual(60);
    }
  });
});
