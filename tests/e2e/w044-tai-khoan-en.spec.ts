import { test, expect, datDaKhaoSat, MOCK_SESSION, MOCK_USER_ID } from "./fixtures";
import type { Page } from "@playwright/test";

// Chữ cái có dấu tiếng Việt (không tính × • …)
const CHU_VIET = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;
const EMAIL = "minhkhach@gmail.com";
const MA_DUNG = "123456";
const CO_BAT = (process.env.NEXT_PUBLIC_DANG_NHAP_EMAIL ?? "1") === "1";

async function dongVietTrongMain(page: Page): Promise<string[]> {
  // Layout gốc không có <main> (shared): quét khung trang của module (cha của khối chứa h1), bỏ thanh trên/tab của WEB.
  const chu = await page.locator("h1").first().evaluate((h) => (h.parentElement?.parentElement as HTMLElement).innerText);
  return chu
    .split("\n")
    .map((d) => d.trim())
    .filter((d) => CHU_VIET.test(d));
}

async function caiDatAuthEmail(page: Page) {
  await page.route(
    (url) => url.pathname.includes("/auth/v1/"),
    async (route) => {
      const req = route.request();
      const path = new URL(req.url()).pathname;
      const method = req.method();
      const json = (status: number, body: unknown) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (path.endsWith("/user") && method === "PUT") return json(200, MOCK_SESSION.user);
      if (path.endsWith("/otp") && method === "POST") return json(200, {});
      if (path.endsWith("/verify") && method === "POST") {
        const body = req.postDataJSON() as { token?: string; email?: string };
        if (body.token !== MA_DUNG) {
          return json(403, { code: 403, error_code: "otp_expired", msg: "Token has expired or is invalid" });
        }
        const user = {
          ...MOCK_SESSION.user,
          id: MOCK_USER_ID,
          email: body.email ?? "",
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

test.describe("W044 · tai-khoan song ngữ", () => {
  test.skip(!CO_BAT, "Cờ NEXT_PUBLIC_DANG_NHAP_EMAIL tắt");
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
    await caiDatAuthEmail(page);
  });

  test("EN: đăng nhập 2 bước, lỗi, trang tài khoản không còn chữ Việt", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dang-nhap?lang=en");
    await expect(page.getByRole("heading", { name: "Log in to VIVE" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByText("Enter your email to get a 6-digit code.")).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
    await testInfo.attach("en-buoc-1-390", { body: await page.screenshot(), contentType: "image/png" });

    await page.getByRole("textbox", { name: "Email" }).fill("khach@");
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(page.getByTestId("loi-dang-nhap")).toHaveText("That email doesn't look right. Please check it.");
    expect(await dongVietTrongMain(page)).toEqual([]);

    await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
    await page.getByRole("button", { name: "Send code" }).click();
    const oMa = page.getByLabel("6-digit code");
    await expect(oMa).toBeVisible();
    await expect(page.getByRole("button", { name: /Resend code \(\d+s\)/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Change email" })).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
    await testInfo.attach("en-buoc-2-390", { body: await page.screenshot(), contentType: "image/png" });

    await oMa.fill("000000");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.getByTestId("loi-dang-nhap")).toHaveText("That code isn't right. Check the 6 digits in your email.");
    expect(await dongVietTrongMain(page)).toEqual([]);

    await oMa.fill(MA_DUNG);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(/\/tai-khoan$/);
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    await expect(page.getByText("Logged in with email")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Yours" }).getByRole("link", { name: /^Liked/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Yours" }).getByRole("link", { name: /^Cart/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Yours" }).getByRole("link", { name: /^Reservations/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
    await testInfo.attach("en-tai-khoan-390", { body: await page.screenshot(), contentType: "image/png" });

    await page.setViewportSize({ width: 1440, height: 900 });
    await testInfo.attach("en-tai-khoan-1440", { body: await page.screenshot(), contentType: "image/png" });
  });

  test("EN 1440px: trang đăng nhập", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dang-nhap?lang=en");
    await expect(page.getByRole("heading", { name: "Log in to VIVE" })).toBeVisible();
    expect(await dongVietTrongMain(page)).toEqual([]);
    await testInfo.attach("en-dang-nhap-1440", { body: await page.screenshot(), contentType: "image/png" });
  });

  test("mặc định vẫn tiếng Việt", async ({ page }) => {
    await page.goto("/dang-nhap");
    await expect(page.getByRole("heading", { name: "Đăng nhập VIVE" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Gửi mã" })).toBeVisible();
  });
});
