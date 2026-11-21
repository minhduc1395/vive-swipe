import { test, expect, caiDatMockSupabase, datDaKhaoSat, MOCK_SESSION, MOCK_USER_ID } from "./fixtures";
import type { Browser, Page, TestInfo } from "@playwright/test";
import { SAN_PHAM, DEALS } from "../../lib/data";

/**
 * #66 · Đồng bộ đã thích + giỏ hàng lên tài khoản.
 * Hai "máy" = hai browser context riêng localStorage, chung một "Supabase" giả trong bộ nhớ của test
 * (bảng yeu_thich, gio_hang_luu). Máy A đã đăng nhập sẵn; máy B đăng nhập bằng email + mã.
 */
const CO_BAT = (process.env.NEXT_PUBLIC_DANG_NHAP_EMAIL ?? "1") === "1";
const EMAIL = "minhkhach@gmail.com";
const MA_DUNG = "123456";
const KHOA_SESSION = "sb-supabase-auth-token";

const hienThi = SAN_PHAM.filter((sp) => sp.hien_thi !== false);
const X = hienThi[0].id;
const Y = hienThi[1].id;
const P = hienThi[2].id;
const COMBO = (DEALS.find((d) => d.loai === "combo") ?? DEALS[0]).id;

interface ItemGio {
  loai?: string;
  sanPhamId?: string;
  dealId?: string;
  soLuong: number;
}

interface MayChu {
  thich: Array<{ khach_id: string; san_pham_id: string; tao_luc: string }>;
  gio: Record<string, ItemGio[]>;
  /** true: mọi lệnh ghi (POST/DELETE) tới 2 bảng bị đứt mạng. */
  chanGhi: boolean;
}

const USER_EMAIL = {
  ...MOCK_SESSION.user,
  id: MOCK_USER_ID,
  email: EMAIL,
  is_anonymous: false,
  app_metadata: { provider: "email", providers: ["email"] },
};

function giaTriLoc(url: URL, cot: string): string | null {
  const v = url.searchParams.get(cot);
  return v ? v.replace(/^(eq|in)\./, "") : null;
}

/** Mock REST yeu_thich, gio_hang_luu và auth email (đăng ký sau fixture nên chạy trước). */
async function caiDatMay(page: Page, mayChu: MayChu) {
  await caiDatMockSupabase(page);
  await page.route(
    (url) => url.pathname.includes("/rest/v1/yeu_thich") || url.pathname.includes("/rest/v1/gio_hang_luu"),
    async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const method = req.method();
      const laThich = url.pathname.includes("/yeu_thich");
      const kh = giaTriLoc(url, "khach_id") ?? "";
      const json = (status: number, body: unknown) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

      if (method === "GET") {
        if (laThich) {
          return json(
            200,
            mayChu.thich
              .filter((d) => d.khach_id === kh)
              .sort((a, b) => b.tao_luc.localeCompare(a.tao_luc))
          );
        }
        return json(200, kh in mayChu.gio ? [{ du_lieu: mayChu.gio[kh] }] : []);
      }
      if (mayChu.chanGhi) return route.abort("failed");
      if (method === "POST") {
        const body = req.postDataJSON() as unknown;
        const dong = (Array.isArray(body) ? body : [body]) as Array<Record<string, unknown>>;
        for (const d of dong) {
          if (laThich) {
            const co = mayChu.thich.some(
              (x) => x.khach_id === d.khach_id && x.san_pham_id === d.san_pham_id
            );
            if (!co) mayChu.thich.push(d as MayChu["thich"][number]);
          } else {
            mayChu.gio[d.khach_id as string] = d.du_lieu as ItemGio[];
          }
        }
        return route.fulfill({ status: 201, body: "" });
      }
      if (method === "DELETE" && laThich) {
        const ids = (giaTriLoc(url, "san_pham_id") ?? "")
          .replace(/^\(|\)$/g, "")
          .split(",")
          .map((s) => s.replace(/^"|"$/g, ""));
        mayChu.thich = mayChu.thich.filter((d) => !(d.khach_id === kh && ids.includes(d.san_pham_id)));
        return route.fulfill({ status: 204, body: "" });
      }
      return route.fallback();
    }
  );
  await page.route(
    (url) => url.pathname.includes("/auth/v1/"),
    async (route) => {
      const req = route.request();
      const path = new URL(req.url()).pathname;
      const json = (status: number, body: unknown) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (path.endsWith("/user") && req.method() === "PUT") {
        return json(200, { ...MOCK_SESSION.user, new_email: EMAIL });
      }
      if (path.endsWith("/otp")) return json(200, {});
      if (path.endsWith("/verify")) {
        return json(200, { ...MOCK_SESSION, access_token: "mock-email-token", user: USER_EMAIL });
      }
      return route.fallback();
    }
  );
}

async function moMay(browser: Browser, testInfo: TestInfo, mayChu: MayChu): Promise<Page> {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: { width: 390, height: 844 },
    locale: "vi-VN",
  });
  const page = await context.newPage();
  await datDaKhaoSat(page);
  await caiDatMay(page, mayChu);
  return page;
}

/** Đặt localStorage một lần (không đè khi tải lại trang). */
async function datLocalMotLan(page: Page, duLieu: Record<string, unknown>) {
  await page.addInitScript((d) => {
    if (localStorage.getItem("__e2e_da_dat")) return;
    localStorage.setItem("__e2e_da_dat", "1");
    for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify(v));
  }, duLieu);
}

const docLocal = (page: Page) =>
  page.evaluate(() => ({
    thich: JSON.parse(localStorage.getItem("vive_da_thich") ?? "[]") as string[],
    gio: JSON.parse(localStorage.getItem("vive_gio_hang") ?? "[]") as ItemGio[],
  }));

const thichServer = (m: MayChu) => m.thich.map((d) => d.san_pham_id).sort();
const soLuong = (gio: ItemGio[] | undefined, id: string) =>
  gio?.find((i) => i.sanPhamId === id || i.dealId === id)?.soLuong ?? 0;

test.describe("#66 · Đồng bộ đã thích và giỏ hàng lên tài khoản", () => {
  test.skip(!CO_BAT, "Cờ NEXT_PUBLIC_DANG_NHAP_EMAIL tắt");

  test("2 máy: đăng nhập gộp dữ liệu, đổi ở máy này máy kia thấy; mất mạng thì thử lại", async ({
    browser,
  }, testInfo) => {
    test.setTimeout(90_000);
    const mayChu: MayChu = { thich: [], gio: {}, chanGhi: false };

    // Máy A: đã đăng nhập sẵn, có X và P×2.
    const a = await moMay(browser, testInfo, mayChu);
    const hetHan = Math.floor(Date.now() / 1000) + 3600;
    await datLocalMotLan(a, {
      [KHOA_SESSION]: { ...MOCK_SESSION, access_token: "mock-email-token", expires_at: hetHan, user: USER_EMAIL },
      vive_da_thich: [X],
      vive_gio_hang: [{ loai: "san_pham", sanPhamId: P, soLuong: 2 }],
    });
    await a.goto("/");
    await expect.poll(() => thichServer(mayChu)).toEqual([X]);
    await expect.poll(() => soLuong(mayChu.gio[MOCK_USER_ID], P)).toBe(2);

    // Máy B: khách ẩn danh có Y, P×1, combo; đăng nhập email → gộp.
    const b = await moMay(browser, testInfo, mayChu);
    await datLocalMotLan(b, {
      vive_da_thich: [Y],
      vive_gio_hang: [
        { loai: "san_pham", sanPhamId: P, soLuong: 1 },
        { loai: "combo", dealId: COMBO, soLuong: 1 },
      ],
    });
    await b.goto("/dang-nhap");
    await b.getByRole("textbox", { name: "Email" }).fill(EMAIL);
    await b.getByRole("button", { name: "Gửi mã" }).click();
    await b.getByLabel("Mã 6 số").fill(MA_DUNG);
    await b.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(b).toHaveURL(/\/tai-khoan$/);

    await expect.poll(async () => (await docLocal(b)).thich.sort()).toEqual([X, Y].sort());
    const gioB = (await docLocal(b)).gio;
    expect(soLuong(gioB, P)).toBe(3); // cộng theo món
    expect(soLuong(gioB, COMBO)).toBe(1); // combo giữ nguyên
    await expect.poll(() => thichServer(mayChu)).toEqual([X, Y].sort());
    await expect.poll(() => soLuong(mayChu.gio[MOCK_USER_ID], P)).toBe(3);
    expect(soLuong(mayChu.gio[MOCK_USER_ID], COMBO)).toBe(1);

    // Máy A tải lại: thấy cùng dữ liệu (không cộng lại lần 2).
    await a.goto("/da-thich");
    await expect.poll(async () => (await docLocal(a)).thich.sort()).toEqual([X, Y].sort());
    await expect(a.getByRole("button", { name: "Bỏ thích" })).toHaveCount(2);
    expect(soLuong((await docLocal(a)).gio, P)).toBe(3);
    expect(soLuong((await docLocal(a)).gio, COMBO)).toBe(1);
    await testInfo.attach("may-a-da-thich", { body: await a.screenshot(), contentType: "image/png" });

    // Máy B bỏ thích 1 món trên giao diện → server xóa trong 2 giây; máy A tải lại thấy.
    await b.goto("/da-thich");
    await expect(b.getByRole("button", { name: "Bỏ thích" })).toHaveCount(2);
    await b.getByRole("button", { name: "Bỏ thích" }).first().click();
    await expect(b.getByRole("button", { name: "Bỏ thích" })).toHaveCount(1);
    const conLai = (await docLocal(b)).thich;
    expect(conLai).toHaveLength(1);
    await expect.poll(() => thichServer(mayChu), { timeout: 2_000 }).toEqual(conLai);
    await a.reload();
    await expect.poll(async () => (await docLocal(a)).thich).toEqual(conLai);
    await expect(a.getByRole("button", { name: "Bỏ thích" })).toHaveCount(1);

    // Mất mạng: máy A tăng số lượng ở giỏ, giao diện vẫn đổi ngay; có mạng lại thì tự ghi.
    mayChu.chanGhi = true;
    await a.goto("/gio");
    const tang = a.getByRole("button", { name: "Tăng số lượng" }).first();
    await expect(tang).toBeVisible();
    const truoc = (await docLocal(a)).gio.reduce((t, i) => t + i.soLuong, 0);
    await tang.click();
    await expect
      .poll(async () => (await docLocal(a)).gio.reduce((t, i) => t + i.soLuong, 0))
      .toBe(truoc + 1);
    await a.waitForTimeout(1_000);
    const tongServer = () => (mayChu.gio[MOCK_USER_ID] ?? []).reduce((t, i) => t + i.soLuong, 0);
    expect(tongServer()).toBe(truoc);
    mayChu.chanGhi = false;
    await expect.poll(tongServer, { timeout: 10_000 }).toBe(truoc + 1);

    // Máy B quay lại tab (tải lại) thấy giỏ mới.
    await b.goto("/gio");
    await expect
      .poll(async () => (await docLocal(b)).gio.reduce((t, i) => t + i.soLuong, 0))
      .toBe(truoc + 1);

    await a.context().close();
    await b.context().close();
  });
});
