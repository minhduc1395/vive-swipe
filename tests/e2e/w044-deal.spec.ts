import { test, expect, datDaKhaoSat } from "./fixtures";
import type { Page } from "@playwright/test";
import { DEALS, SAN_PHAM } from "../../lib/data";

// Chữ cái có dấu (không tính × ÷ ·)
const CO_DAU = /[À-ÖØ-öø-ỹ]/;

/** Dữ liệu deal/sản phẩm chưa có bản en: được phép còn tiếng Việt. Bỏ chúng khỏi văn bản trang rồi kiểm phần còn lại. */
function chuoiDuLieu(): string[] {
  const kq = new Set<string>();
  const them = (v?: string | null) => v && kq.add(v);
  for (const d of DEALS) {
    [d.ten, d.hook, d.dieu_kien, d.qua, d.khi_het_qua?.qua, d.khi_het_qua?.uu_dai].forEach(them);
    d.moc?.forEach((m) => them(m.qua));
    d.moc?.forEach((m) => them(m.qua.replace(/^1\s+/, "")));
    d.goi_y?.forEach((b) => them(b.ten));
    them(d.qua?.replace(/^1\s+/, ""));
  }
  for (const s of SAN_PHAM) [s.ten_hien_thi, s.thuong_hieu].forEach(them);
  return [...kq].sort((a, b) => b.length - a.length);
}

async function chuVietConLai(page: Page): Promise<string[]> {
  // Chỉ phần nội dung trang; thanh trên, thanh tab và chân trang do WEB làm (chung.json).
  let van = await page.evaluate(() => {
    const goc = document.body.cloneNode(true) as HTMLElement;
    goc.querySelectorAll("footer, nav, header.sticky, script, style").forEach((e) => e.remove());
    document.body.appendChild(goc);
    goc.style.cssText = "position:fixed;left:-9999px";
    const chu = goc.innerText;
    goc.remove();
    return chu;
  });
  for (const c of chuoiDuLieu()) van = van.split(c).join(" ");
  return van.split("\n").filter((d) => CO_DAU.test(d));
}

test.describe("W044 · Deal và Giỏ hàng song ngữ", () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== "pixel-7", "Kiểm song ngữ trên pixel-7");
    test.setTimeout(60000);
    await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+07:00"));
    await datDaKhaoSat(page);
  });

  test("/deal?lang=en: chữ giao diện là tiếng Anh, ngăn kéo cũng vậy", async ({ page }) => {
    await page.goto("/deal?lang=en");
    await expect(page.locator("h1")).toContainText("Deals");
    await expect(page.locator("h1")).toContainText("for you");
    await expect(page.getByText("Because you like")).toBeVisible();
    await expect(page.getByRole("button", { name: /^All · \d+$/ })).toBeVisible();
    await expect(page.getByText("Get an email when something you like has a great deal")).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);

    await page.locator("article[id^=deal-]").first().click();
    const keo = page.getByRole("dialog");
    await expect(keo).toBeVisible();
    await expect(keo.getByRole("button", { name: "Close deal details" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await page.screenshot({ path: "test-results/w044-deal-en-keo.png" });
  });

  test("/deal mặc định vẫn tiếng Việt", async ({ page }) => {
    await page.goto("/deal");
    await expect(page.locator("h1")).toContainText("Deal");
    await expect(page.locator("h1")).toContainText("cho bạn");
    await expect(page.getByText("Vì bạn thích")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Tất cả · \d+$/ })).toBeVisible();
  });

  test("/gio?lang=en: giỏ trống và giỏ có hàng", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/gio?lang=en");
    await expect(page.getByText("Your cart is empty. Swipe up to add quickly.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start swiping" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);

  });

  test("/gio?lang=en: giỏ có hàng, giá dạng VND", async ({ page }) => {
    const lopoe = SAN_PHAM.find((s) => s.id === "LOPOE-CF")!;
    const khac = SAN_PHAM.find((s) => s.thuong_hieu !== "LOPOE" && s.hien_thi)!;
    await page.addInitScript(
      ([a, b]) => localStorage.setItem("vive_gio_hang", JSON.stringify([{ loai: "san_pham", sanPhamId: a, soLuong: 1 }, { loai: "san_pham", sanPhamId: b, soLuong: 2 }])),
      [lopoe.id, khac.id],
    );
    await page.goto("/gio?lang=en");
    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
    await expect(page.getByText("3 items")).toBeVisible();
    await expect(page.getByText("Subtotal at list price")).toBeVisible();
    await expect(page.getByText("Estimated total")).toBeVisible();
    await expect(page.getByText(/\d,\d{3} VND/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Reserve at booth" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await page.screenshot({ path: "test-results/w044-gio-en.png", fullPage: true });
  });

  test("/gio mặc định vẫn tiếng Việt", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/gio");
    await expect(page.getByText("Giỏ đang trống. Quẹt lên để thêm nhanh.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Bắt đầu quẹt" })).toBeVisible();
  });
});
