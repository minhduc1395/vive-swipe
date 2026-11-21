import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { DEALS, SAN_PHAM } from "../../lib/data";

/**
 * W044 module quet: các trang ở ?lang=en không còn chữ tiếng Việt (trừ dữ liệu thiếu bản en:
 * tên sản phẩm, tên/nội dung deal), ở mặc định vẫn tiếng Việt.
 */
const CHU_VIET =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function gomChuoi(v: unknown, ra: Set<string>) {
  if (typeof v === "string") {
    if (v.length >= 2 && CHU_VIET.test(v)) ra.add(v);
  } else if (Array.isArray(v)) v.forEach((x) => gomChuoi(x, ra));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => gomChuoi(x, ra));
}

// Chữ trong dữ liệu (tên sản phẩm, deal...) được phép còn tiếng Việt khi chưa có bản en
const DU_LIEU = (() => {
  const s = new Set<string>();
  gomChuoi(SAN_PHAM, s);
  gomChuoi(DEALS, s);
  return [...s].sort((a, b) => b.length - a.length);
})();

async function chuVietConLai(page: Page): Promise<string[]> {
  const mau = await page.evaluate(() => {
    // Thanh trên, chân trang, điều hướng là của WEB (chung.json): bỏ khỏi phạm vi kiểm
    const AN = 'header, footer, nav, [data-testid="menu-phai"]';
    const kieu = document.createElement("style");
    kieu.textContent = `${AN} { display: none !important; }`;
    document.head.appendChild(kieu);
    const thuocTinh: string[] = [];
    document.querySelectorAll("[aria-label],[placeholder],[title],[alt]").forEach((e) => {
      if (e.closest(AN)) return;
      for (const t of ["aria-label", "placeholder", "title", "alt"]) {
        const v = e.getAttribute(t);
        if (v) thuocTinh.push(v);
      }
    });
    const chu = document.body.innerText;
    kieu.remove();
    return { chu, thuocTinh };
  });
  let van = [mau.chu, ...mau.thuocTinh].join("\n");
  for (const d of DU_LIEU) van = van.split(d).join(" ");
  return van.split("\n").filter((d) => CHU_VIET.test(d)).map((d) => d.trim());
}

test.describe("W044 · module quet song ngữ", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+07:00"));
  });

  test("/chao: en là tiếng Anh, mặc định vẫn tiếng Việt", async ({ page }) => {
    await page.goto("/chao?lang=en");
    await expect(page.getByRole("link", { name: "Start swiping" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse by category" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    expect(await page.title()).toContain("Welcome to VIVE");
  });

  test("/chao mặc định tiếng Việt", async ({ page }) => {
    await page.goto("/chao");
    await expect(page.getByRole("link", { name: "Bắt đầu quẹt" })).toBeVisible();
  });

  test("/bat-dau: 3 câu hỏi bằng tiếng Anh", async ({ page }) => {
    await page.goto("/bat-dau?lang=en");
    await expect(page.getByText("QUESTION 1/3")).toBeVisible();
    await expect(page.locator("h1")).toContainText("skin type");
    expect(await chuVietConLai(page)).toEqual([]);
    await page.getByRole("button", { name: "Oily skin" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("QUESTION 2/3")).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await page.getByRole("button", { name: "Acne" }).click();
    await page.getByRole("button", { name: "Pores" }).click();
    await page.getByRole("button", { name: "Hydration" }).click();
    await expect(page.getByText("3/3 selected")).toBeVisible();
    await page.getByRole("button", { name: "Soothing" }).click();
    await expect(page.getByText("You have picked 3. Remove one to change.")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("QUESTION 3/3")).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await page.getByRole("button", { name: "200K–500K" }).click();
    await page.getByRole("link", { name: "Start swiping" }).click();
    await expect(page).toHaveURL(/\/quet/);

    // Mã trả lời vẫn là mã, không phụ thuộc ngôn ngữ
    const traLoi = await page.evaluate(() => localStorage.getItem("vive_tra_loi_cau_hoi"));
    expect(JSON.parse(traLoi as string)).toMatchObject({
      loai_da: "da-dau",
      van_de: ["mun", "lo-chan-long", "cap-am"],
      ngan_sach: "200k-500k",
    });
  });

  test("/quet: deck, chi tiết, toast và hết thẻ bằng tiếng Anh", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
      localStorage.setItem(
        "vive_tra_loi_cau_hoi",
        JSON.stringify({ loai_da: "da-dau", van_de: ["mun", "cap-am"], ngan_sach: "200k-500k" }),
      );
    });
    await page.goto("/quet?lang=en");
    const nutThich = page.getByRole("button", { name: "Like", exact: true });
    await expect(nutThich).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart", exact: true })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);

    // Chi tiết sản phẩm
    await page.getByRole("button", { name: /^View details for / }).first().click();
    const hop = page.getByRole("dialog");
    await expect(hop).toBeVisible();
    await expect(hop.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(hop.getByRole("heading", { name: "Suitable for" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await hop.getByRole("button", { name: "Close details" }).click();

    // Toast
    await nutThich.click();
    await expect(page.getByRole("status").filter({ hasText: /Love it!|Good match!/ })).toBeVisible();
  });

  test("/quet: máy tính có cột Gu của bạn, Phím tắt, Deal và giỏ bằng tiếng Anh", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
      localStorage.setItem(
        "vive_tra_loi_cau_hoi",
        JSON.stringify({ loai_da: "da-dau", van_de: ["mun", "cap-am"], ngan_sach: "200k-500k" }),
      );
    });
    await page.goto("/quet?lang=en");
    await expect(page.getByRole("heading", { name: "Your taste" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shortcuts" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Deals for you" })).toBeVisible();
    await expect(page.getByText("Oily skin", { exact: true })).toBeVisible();
    await expect(page.getByText("Subtotal")).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
  });

  test("/da-thich: danh sách, trạng thái trống và giá bằng tiếng Anh", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
    });
    await page.goto("/da-thich?lang=en");
    await expect(page.locator("h1")).toHaveText("Liked");
    await expect(page.getByText("0 items")).toBeVisible();
    await expect(page.getByText("Swipe right to save what you like.")).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
  });

  test("/da-thich: có món đã thích, lọc, thêm giỏ", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_thich", JSON.stringify(["LOPOE-CF", "8809198846184"]));
    });
    await page.goto("/da-thich?lang=en");
    await expect(page.getByText("2 items")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
    await expect(page.getByText(/VND/).first()).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await expect(page.getByRole("status").filter({ hasText: "to your cart" })).toBeVisible();
  });

  test("/danh-muc: lọc, xếp, tìm kiếm bằng tiếng Anh", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/danh-muc?lang=en");
    await expect(page.locator("h1")).toHaveText("Products");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByPlaceholder("Search name, brand, ingredient")).toBeVisible();
    await expect(page.getByText(/\d+ products?/).first()).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);

    // Xếp
    await page.getByRole("button", { name: /Sort:/ }).click();
    await expect(page.getByRole("option", { name: "Price: low to high" })).toBeVisible();
    await expect(page.getByRole("listbox", { name: "Sort products" })).toBeVisible();
    await page.getByRole("option", { name: "Price: low to high" }).click();

    // Bộ lọc (điện thoại)
    await page.getByRole("button", { name: /^Filter/ }).click();
    const khung = page.getByRole("dialog");
    await expect(khung.getByRole("heading", { name: "Skin concerns" })).toBeVisible();
    await expect(khung.getByRole("heading", { name: "Offers" })).toBeVisible();
    expect(await chuVietConLai(page)).toEqual([]);
  });

  test("/danh-muc: tiêu đề theo bộ lọc bằng tiếng Anh", async ({ page }) => {
    await page.goto("/danh-muc?lang=en&loai=kem-duong");
    await expect(page.locator("h1")).toHaveText("Moisturizer");
    await page.goto("/danh-muc?van-de=mun");
    await expect(page.locator("h1")).toHaveText("Skin: Acne");
  });

  test("/new-arrival: mở được ở ?lang=en", async ({ page }) => {
    const res = await page.goto("/new-arrival?lang=en");
    expect(res?.status()).toBe(200);
  });
});
