import { test, expect } from "./fixtures";

// QD-BOD-027 / DES-013: QR để bàn /q/<ma> chuyển hướng 307 theo data/qr-ban.json.
test("/q/thu-ngan: 307, no-store, dừng ở /bat-dau", async ({ page, request }) => {
  const res = await request.get("/q/thu-ngan", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toMatch(/\/bat-dau\?nguon=qr-thu-ngan$/);
  expect(res.headers()["cache-control"]).toContain("no-store");

  const lopoe = await request.get("/q/lopoe", { maxRedirects: 0 });
  expect(lopoe.headers()["location"]).toMatch(/\/bat-dau\?nguon=qr-lopoe$/);
  const la = await request.get("/q/xyz", { maxRedirects: 0 });
  expect(la.status()).toBe(307);
  expect(la.headers()["location"]).toMatch(/\/bat-dau$/);

  await page.goto("/q/thu-ngan");
  await expect(page).toHaveURL(/\/bat-dau\?nguon=qr-thu-ngan$/);
  await expect(page.locator("body")).toBeVisible();
});
