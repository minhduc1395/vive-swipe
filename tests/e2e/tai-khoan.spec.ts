import { test, expect, datDaKhaoSat, MOCK_SESSION, MOCK_USER_ID } from "./fixtures";
import type { Page } from "@playwright/test";

const EMAIL = "minhkhach@gmail.com";
const EMAIL_CHE = "m***h@gmail.com";
const MA_DUNG = "123456";
/** Cờ đăng nhập email: playwright.config.ts bật mặc định; NEXT_PUBLIC_DANG_NHAP_EMAIL=0 để chạy nhóm "tắt cờ". */
const CO_BAT = (process.env.NEXT_PUBLIC_DANG_NHAP_EMAIL ?? "1") === "1";

/**
 * Mock thêm cho /auth/v1/otp, /verify, /user, /logout (đăng ký sau fixture nên chạy trước).
 * Nhánh khác rơi về mock chung trong fixtures.ts (session ẩn danh).
 */
async function caiDatAuthEmail(page: Page) {
  let emailMoi = "";
  await page.route(
    (url) => url.pathname.includes("/auth/v1/"),
    async (route) => {
      const req = route.request();
      const path = new URL(req.url()).pathname;
      const method = req.method();
      const json = (status: number, body: unknown) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

      if (path.endsWith("/user") && method === "PUT") {
        emailMoi = (req.postDataJSON() as { email?: string }).email ?? "";
        return json(200, { ...MOCK_SESSION.user, new_email: emailMoi });
      }
      if (path.endsWith("/otp") && method === "POST") return json(200, {});
      if (path.endsWith("/verify") && method === "POST") {
        const body = req.postDataJSON() as { token?: string; type?: string; email?: string };
        if (body.token !== MA_DUNG) {
          return json(403, {
            code: 403,
            error_code: "otp_expired",
            msg: "Token has expired or is invalid",
          });
        }
        const user = {
          ...MOCK_SESSION.user,
          id: MOCK_USER_ID,
          email: body.email ?? emailMoi,
          is_anonymous: false,
          app_metadata: { provider: "email", providers: ["email"] },
        };
        return json(200, { ...MOCK_SESSION, access_token: "mock-email-token", user });
      }
      if (path.endsWith("/logout")) return route.fulfill({ status: 204, body: "" });
      return route.fallback();
    }
  );
}

/** Thanh trên điện thoại (AppShell, < 768px). */
const thanhDienThoai = (page: Page) =>
  page.locator("header", { has: page.getByRole("link", { name: "Trang chủ VIVE" }) });

async function khongCuonNgang(page: Page) {
  const tran = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(tran).toBeLessThanOrEqual(0);
}

async function kiemNut44(page: Page) {
  const nut = page.locator("[data-nut]:visible");
  const n = await nut.count();
  for (let i = 0; i < n; i++) {
    const box = await nut.nth(i).boundingBox();
    expect(box?.height ?? 0, await nut.nth(i).innerText()).toBeGreaterThanOrEqual(44);
  }
}

test.describe("#65 · Đăng nhập email + mã 6 số", () => {
  test.skip(!CO_BAT, "Cờ NEXT_PUBLIC_DANG_NHAP_EMAIL tắt");
  test.beforeEach(async ({ page }) => {
    await datDaKhaoSat(page);
    await caiDatAuthEmail(page);
  });

  test("nhập email → mã đúng → /tai-khoan thấy email che, thanh trên đổi 'Tài khoản'; đăng xuất giữ đã thích và giỏ", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dang-nhap");
    await page.evaluate(() => {
      localStorage.setItem("vive_da_thich", JSON.stringify(["LOPOE-CF"]));
      localStorage.setItem(
        "vive_gio_hang",
        JSON.stringify([{ sanPhamId: "LOPOE-CF", soLuong: 2, loai: "san_pham" }])
      );
    });
    const thichTruoc = await page.evaluate(() => localStorage.getItem("vive_da_thich"));
    const gioTruoc = await page.evaluate(() => localStorage.getItem("vive_gio_hang"));

    // Bước 1
    await expect(page.getByRole("heading", { name: "Đăng nhập VIVE" })).toBeVisible();
    await kiemNut44(page);
    await testInfo.attach("buoc-1-390", { body: await page.screenshot(), contentType: "image/png" });
    await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
    await page.getByRole("button", { name: "Gửi mã" }).click();

    // Bước 2
    const oMa = page.getByLabel("Mã 6 số");
    await expect(oMa).toBeVisible();
    await expect(oMa).toHaveAttribute("inputmode", "numeric");
    await expect(oMa).toHaveAttribute("autocomplete", "one-time-code");
    await expect(page.getByRole("button", { name: /Gửi lại mã \(\d+s\)/ })).toBeDisabled();
    await kiemNut44(page);
    await testInfo.attach("buoc-2-390", { body: await page.screenshot(), contentType: "image/png" });
    await oMa.fill(MA_DUNG);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

    // Trang tài khoản
    await expect(page).toHaveURL(/\/tai-khoan$/);
    await expect(page.getByTestId("email-tai-khoan")).toHaveText(EMAIL_CHE);
    await expect(page.getByText(EMAIL)).toHaveCount(0);
    await kiemNut44(page);
    await testInfo.attach("tai-khoan-390", { body: await page.screenshot(), contentType: "image/png" });

    // Thanh trên (điện thoại 390px) đổi thành "Tài khoản"
    await expect(thanhDienThoai(page).getByRole("link", { name: "Tài khoản" })).toHaveAttribute("href", "/tai-khoan");
    await expect(thanhDienThoai(page).getByRole("link", { name: "Đăng nhập" })).toHaveCount(0);

    // Thanh trên (máy tính) đổi thành "Tài khoản"
    await page.setViewportSize({ width: 1280, height: 900 });
    const banner = page.locator('div[role="banner"]');
    await expect(banner.getByRole("link", { name: "Tài khoản" })).toHaveAttribute("href", "/tai-khoan");
    await expect(banner.getByRole("link", { name: "Đăng nhập" })).toHaveCount(0);

    // Đăng xuất
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(thanhDienThoai(page).getByRole("link", { name: "Đăng nhập" })).toBeVisible();
    await expect(thanhDienThoai(page).getByRole("link", { name: "Tài khoản" })).toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(banner.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
    await expect(banner.getByRole("link", { name: "Tài khoản" })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("vive_da_thich"))).toBe(thichTruoc);
    expect(await page.evaluate(() => localStorage.getItem("vive_gio_hang"))).toBe(gioTruoc);
  });

  test("mã sai → lỗi tiếng Việt, ở lại bước 2", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dang-nhap");
    await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await page.getByLabel("Mã 6 số").fill("000000");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(page.getByTestId("loi-dang-nhap")).toHaveText("Mã chưa đúng. Kiểm tra lại 6 số trong email.");
    await expect(page.getByLabel("Mã 6 số")).toBeVisible();
    await expect(page).toHaveURL(/\/dang-nhap$/);
  });

  test("email sai → lỗi tiếng Việt, không sang bước 2", async ({ page }) => {
    await page.goto("/dang-nhap");
    await page.getByRole("textbox", { name: "Email" }).fill("khach@");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByTestId("loi-dang-nhap")).toContainText("Email chưa đúng");
    await expect(page.getByLabel("Mã 6 số")).toHaveCount(0);
  });

  test("360px: 2 bước và trang tài khoản không cuộn ngang", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto("/dang-nhap");
    await khongCuonNgang(page);
    await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByLabel("Mã 6 số")).toBeVisible();
    await khongCuonNgang(page);
    await page.getByLabel("Mã 6 số").fill(MA_DUNG);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(page.getByTestId("email-tai-khoan")).toBeVisible();
    await khongCuonNgang(page);
  });
});

test.describe("#65 · Tắt cờ đăng nhập email: giữ trang chờ", () => {
  test.skip(CO_BAT, "Chạy với NEXT_PUBLIC_DANG_NHAP_EMAIL=0");
  test.beforeEach(async ({ page }) => {
    await datDaKhaoSat(page);
  });

  test("/dang-nhap là trang chờ, không có form email; /tai-khoan về /dang-nhap", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dang-nhap");
    await expect(page.getByRole("heading", { name: "Đăng nhập VIVE" })).toBeVisible();
    await expect(page.getByText(/đang được chuẩn bị/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Tiếp tục quẹt sản phẩm" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toHaveCount(0);
    await page.goto("/tai-khoan");
    await expect(page).toHaveURL(/\/dang-nhap$/);
    await expect(page.getByRole("textbox", { name: "Email" })).toHaveCount(0);
  });

  test("thanh điện thoại 390px: nút 'Đăng nhập' vẫn hiện toast sắp ra mắt", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nut = thanhDienThoai(page).getByRole("link", { name: "Đăng nhập" });
    await expect(nut).toHaveAttribute("data-sap-co", "true");
    await nut.click();
    await expect(page.getByText("Tính năng sắp ra mắt")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
