import { test as base, expect, type Page } from "@playwright/test";
import { SAN_PHAM, DEALS } from "../../lib/data";

export const MOCK_USER_ID = "mock-user-e2e-id";

export const MOCK_SESSION = {
  access_token: "mock-access-token-e2e",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token-e2e",
  user: {
    id: MOCK_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "",
    app_metadata: { provider: "anonymous", providers: ["anonymous"] },
    user_metadata: {},
    created_at: "2026-11-18T00:00:00.000Z",
    updated_at: "2026-11-18T00:00:00.000Z",
    is_anonymous: true,
  },
};

export const MOCK_DEALS_SUPABASE = DEALS.map((d) => ({
  id: d.id,
  het_qua: d.het_qua ?? false,
  bat_dau: d.bat_dau,
  ket_thuc: d.ket_thuc,
  du_lieu: d,
}));

export interface LuotQuetRecord {
  khach_id: string;
  san_pham_id: string;
  hanh_dong: string;
  nguon?: string;
  tao_luc: string;
  vi_tri?: number;
}

export interface MockSupabaseOptions {
  chanRest?: boolean | (() => boolean);
  chanAuth?: boolean | (() => boolean);
  onInsertLuotQuet?: (records: LuotQuetRecord[]) => void;
}

/**
 * Đăng ký page.route chặn toàn bộ kết nối Supabase (cả auth và rest),
 * trả về dữ liệu mẫu có ảnh và session giả lập để E2E độc lập hoàn toàn với database thật.
 */
export async function caiDatMockSupabase(
  page: Page,
  options?: MockSupabaseOptions
) {
  await page.route(
    (url) =>
      url.hostname === "supabase.e2e.test" ||
      url.pathname.includes("/auth/v1") ||
      url.pathname.includes("/rest/v1"),
    async (route) => {
      const req = route.request();
      const url = req.url();
      const pathname = new URL(url).pathname;
      const method = req.method();

      // 1. Chặn Auth endpoints (/auth/v1/**)
      if (pathname.includes("/auth/v1")) {
        const isAuthBlocked =
          typeof options?.chanAuth === "function"
            ? options.chanAuth()
            : Boolean(options?.chanAuth);

        if (isAuthBlocked) {
          await route.abort("failed");
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SESSION),
        });
        return;
      }

      // 2. Chặn REST endpoints (/rest/v1/**)
      if (pathname.includes("/rest/v1")) {
        const isRestBlocked =
          typeof options?.chanRest === "function"
            ? options.chanRest()
            : Boolean(options?.chanRest);

        if (isRestBlocked) {
          await route.abort("failed");
          return;
        }

        if (method === "GET") {
          if (pathname.includes("/san_pham")) {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(SAN_PHAM),
            });
            return;
          }
          if (pathname.includes("/deal")) {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(MOCK_DEALS_SUPABASE),
            });
            return;
          }
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
          return;
        }

        // POST / PATCH / PUT / DELETE (luot_quet, su_kien, khach...)
        if (pathname.includes("/luot_quet") && method === "POST") {
          try {
            const postData = req.postDataJSON();
            if (options?.onInsertLuotQuet && Array.isArray(postData)) {
              options.onInsertLuotQuet(postData as LuotQuetRecord[]);
            }
          } catch {
            // bỏ qua nếu parse lỗi
          }
        }

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }

      // Mặc định cho các endpoint khác trên host supabase giả lập
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    }
  );
}

export async function datDaKhaoSat(page: Page) {
  try {
    await page.context().addCookies([
      {
        name: "vive_da_khao_sat",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);
  } catch {
    // ignore
  }
  await page.addInitScript(() => {
    window.localStorage.setItem("vive_da_khao_sat", "true");
    document.cookie = "vive_da_khao_sat=true; path=/; max-age=2592000";
  });
}

export const test = base.extend<{ mockSupabase: void }>({
  mockSupabase: [
    async ({ page }, use) => {
      await caiDatMockSupabase(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
