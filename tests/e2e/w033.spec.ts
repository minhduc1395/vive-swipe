import { test, expect, datDaKhaoSat } from "./fixtures";
import { KHOA_GIO_HANG } from "@/lib/kho-luu-tru";
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

const TRANG_KHACH_MENU = [
  "/",
  "/chao",
  "/bat-dau",
  "/danh-muc",
  "/chinh-sach",
  "/personal-color",
  "/dang-nhap",
  "/giu-hang",
  "/giu-hang/VIVE-KHONG-CO",
] as const;

test.describe("W033 · Landing là trang đầu, menu thống nhất, nút quay lại", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Vào / ở cả 3 mốc màn hình đều thấy landing, kể cả khách đã từng quẹt; chưa khảo sát vào /quet bị đưa về /chao", async ({
    page,
  }) => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 820, height: 1180 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      // Khách mới
      await page.goto("/");
      await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
      await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();

      // Khách đã khảo sát/quẹt quay lại
      await page.evaluate(() => {
        localStorage.setItem("vive_da_khao_sat", "true");
        localStorage.setItem("vive_da_thich", JSON.stringify(["LOPOE-CF"]));
      });
      await page.goto("/");
      await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
      await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();

      await page.evaluate(() => localStorage.clear());
    }

    // Khách chưa khảo sát vào /quet bị đưa về /chao
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/quet");
    await expect(page).toHaveURL(/\/chao/);
    await expect(page.locator("h1")).toContainText("Thích thì");
  });

  test("2. Menu 1440×900 thống nhất trên mọi trang khách; rail tablet 820px có New Arrival đầu tiên; /nhan-vien không dùng menu khách", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const route of TRANG_KHACH_MENU) {
      await page.goto(route);
      const nav = page.getByRole("navigation", { name: "Điều hướng máy tính" });
      const banner = page
        .locator('[role="banner"]')
        .filter({ has: nav });
      await expect(banner).toBeVisible();

      await expect(nav).toBeVisible();

      const links = await nav.locator("a").allInnerTexts();
      expect(links.map((s) => s.replace(/\s+/g, " ").trim())).toEqual([
        "New Arrival",
        "Quẹt",
        "Sản phẩm",
        "Deal",
        "Đã thích",
      ]);

      await expect(banner.getByRole("link", { name: /Giỏ/ })).toBeVisible();
      await expect(banner.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

      const logo = banner.getByRole("link", { name: "Trang chủ VIVE" });
      await expect(logo).toHaveAttribute("href", "/");

      if (route === "/") {
        await expect(nav.getByRole("link", { name: "New Arrival" })).toHaveAttribute(
          "aria-current",
          "page"
        );
      }
    }

    // Tablet rail 820×1180 đồng bộ thứ tự với New Arrival đứng đầu
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/");
    const rail = page.getByRole("navigation", { name: "Điều hướng máy tính bảng" });
    await expect(rail).toBeVisible();
    const railLabels = await rail.locator("div a").allInnerTexts();
    expect(railLabels.map((s) => s.replace(/\s+/g, " ").trim())).toEqual([
      "New Arrival",
      "Quẹt",
      "Sản phẩm",
      "Deal",
      "Đã thích",
      "Giỏ",
    ]);

    // /nhan-vien không dùng menu khách
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/nhan-vien");
    await expect(
      page.getByRole("navigation", { name: "Điều hướng máy tính" })
    ).toHaveCount(0);
  });

  test("3. Nút Quay lại trên 390×844 ở các trang con có vùng bấm >= 44px và quay về đúng trang", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await datDaKhaoSat(page);

    // a) Mở thẳng /chao -> fallback về /
    await page.goto("/chao");
    const backChao = page.getByRole("button", { name: /Quay lại/i });
    await expect(backChao).toBeVisible();
    const boxChao = await backChao.boundingBox();
    expect(boxChao!.height).toBeGreaterThanOrEqual(44);
    await backChao.click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    // b) Mở thẳng /chinh-sach và /personal-color -> fallback về /
    await page.goto("/chinh-sach");
    const backChinhSach = page.getByRole("button", { name: /Quay lại/i });
    await expect(backChinhSach).toBeVisible();
    await backChinhSach.click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    await page.goto("/personal-color");
    const backPersonalColor = page.getByRole("button", { name: /Quay lại/i });
    await expect(backPersonalColor).toBeVisible();
    const boxPc = await backPersonalColor.boundingBox();
    expect(boxPc!.height).toBeGreaterThanOrEqual(44);
    await backPersonalColor.click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    // c) Đi từ / -> /dang-nhap -> quay lại về /
    await page.goto("/");
    await page.goto("/dang-nhap");
    const backDangNhap = page.getByRole("button", { name: /Quay lại/i });
    await backDangNhap.click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);

    // d) /danh-muc khi đang lọc -> quay lại về /danh-muc gốc
    await page.goto("/danh-muc?loai=mat-na");
    const backDanhMuc = page.getByRole("button", { name: /Quay lại/i });
    await expect(backDanhMuc).toBeVisible();
    await backDanhMuc.click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/danh-muc$/);

    // e) BangChiTiet sản phẩm trên /quet -> nút Quay lại đóng modal
    await page.goto("/quet");
    await expect(page.getByRole("article")).toBeVisible();
    await page.getByRole("button", { name: /Xem chi tiết/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const backChiTiet = dialog.getByRole("button", { name: /Quay lại/i });
    await expect(backChiTiet).toBeVisible();
    await backChiTiet.click();
    await expect(dialog).toBeHidden();

    // f) /giu-hang (đi từ /gio) -> về /gio; /giu-hang/[ma] (mở thẳng) -> fallback /gio
    await page.evaluate((k) => {
      localStorage.setItem(k, JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }]));
    }, KHOA_GIO_HANG);
    await page.goto("/gio");
    await page.getByRole("link", { name: "Giữ hàng tại booth" }).click();
    await expect(page).toHaveURL(/\/giu-hang$/);
    const backGiuHang = page.getByRole("button", { name: /Quay lại/i });
    await expect(backGiuHang).toBeVisible();
    await backGiuHang.click();
    await expect(page).toHaveURL(/\/gio$/);

    await page.evaluate(() => sessionStorage.removeItem("vive_lich_su_noi_bo"));
    await page.goto("/giu-hang/VIVE-KHONG-CO");
    const backMa = page.getByRole("button", { name: /Quay lại/i });
    await expect(backMa).toBeVisible();
    await backMa.click();
    await expect(page).toHaveURL(/\/gio$/);
  });

  test("4. Không cuộn ngang ở 9 cỡ màn hình và chụp ảnh /, /danh-muc, /chinh-sach ở 390, 820, 1440", async ({
    page,
  }) => {
    await datDaKhaoSat(page);
    const routesCheck = ["/", "/danh-muc", "/chinh-sach"];

    for (const vp of CU_CHUAN_9_CO) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const r of routesCheck) {
        await page.goto(r);
        const cuonNgang = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(cuonNgang, `${r} bị cuộn ngang ở ${vp.name}`).toBe(false);
      }
    }

    const dir = path.join(process.cwd(), "test-results", "screenshots", "w033");
    fs.mkdirSync(dir, { recursive: true });
    const snapSizes = [
      { label: "390", width: 390, height: 844 },
      { label: "820", width: 820, height: 1180 },
      { label: "1440", width: 1440, height: 900 },
    ];
    for (const sz of snapSizes) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      for (const r of routesCheck) {
        await page.goto(r);
        await page.waitForTimeout(250);
        const slug = r === "/" ? "home" : r.slice(1);
        await page.screenshot({ path: path.join(dir, `${sz.label}_${slug}.png`) });
      }
    }
  });
});
