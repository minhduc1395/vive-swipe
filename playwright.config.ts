import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "iphone-13",
      // W044: khách VN mặc định tiếng Việt; test tiếng Anh dùng ?lang=en
      use: { ...devices["iPhone 13"], locale: "vi-VN" },
    },
    {
      name: "pixel-7",
      use: { ...devices["Pixel 7"], locale: "vi-VN" },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://supabase.e2e.test",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "mock-publishable-key-for-e2e",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key-for-e2e",
      // #65: bật đăng nhập email cho e2e; chạy NEXT_PUBLIC_DANG_NHAP_EMAIL=0 để kiểm trang chờ khi tắt cờ
      NEXT_PUBLIC_DANG_NHAP_EMAIL: process.env.NEXT_PUBLIC_DANG_NHAP_EMAIL ?? "1",
    },
  },
});
