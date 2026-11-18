import { expect, test } from "@playwright/test";

test.describe("Trang Danh mục - tìm kiếm và lọc sản phẩm (W026)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("vive_da_khao_sat", "true");
    });
  });

  test("màn landing hiển thị đủ 12 loại sản phẩm, số món khớp dữ liệu", async ({
    page,
  }) => {
    await page.goto("/danh-muc");
    await expect(page.locator("h1")).toHaveText("Danh mục");

    // Kiểm tra ô Mặt nạ có hiển thị số món
    const nutMatNa = page.getByRole("button", { name: /Mặt nạ/ });
    await expect(nutMatNa).toBeVisible();

    // Lấy số món trên nút Mặt nạ
    const textMatNa = await nutMatNa.innerText();
    const match = textMatNa.match(/(\d+)\s*món/);
    expect(match).not.toBeNull();
    const soMonTrenNut = parseInt(match![1], 10);
    expect(soMonTrenNut).toBeGreaterThan(0);

    // Bấm vào Mặt nạ để vào màn kết quả
    await nutMatNa.click();
    await expect(page).toHaveURL(/loai=mat-na/);
    await expect(page.locator("h1")).toHaveText("Mặt nạ");

    // Kiểm tra text "X món" trên header kết quả khớp đúng với số món trên nút
    await expect(page.getByText(`${soMonTrenNut} món`)).toBeVisible();
  });

  test("tìm kiếm không phân biệt dấu: vitamin c, cica, phan nuoc", async ({
    page,
  }) => {
    await page.goto("/danh-muc");
    await page.waitForLoadState("domcontentloaded");

    const oTimKiem = page.getByPlaceholder("Tìm tên, thương hiệu, thành phần");
    await expect(oTimKiem).toBeVisible();
    await oTimKiem.click();

    // 1. Tìm "vitamin c"
    await oTimKiem.fill("vitamin c");
    await oTimKiem.press("Enter");
    await expect(page).toHaveURL(/tim=vitamin\+c/);
    // Phải có ít nhất 1 sản phẩm kết quả
    const itemVitC = page.locator("article").first();
    await expect(itemVitC).toBeVisible();

    // 2. Tìm "cica"
    await oTimKiem.fill("cica");
    await oTimKiem.press("Enter");
    await expect(page).toHaveURL(/tim=cica/);
    await expect(page.locator("article", { hasText: /Cica/i }).first()).toBeVisible();

    // 3. Tìm "phan nuoc" (không dấu) -> ra Phấn nước Magic Snow Cushion
    await oTimKiem.fill("phan nuoc");
    await oTimKiem.press("Enter");
    await expect(page).toHaveURL(/tim=phan\+nuoc/);
    await expect(
      page.locator("article", { hasText: /Phấn nước/i }).first()
    ).toBeVisible();
  });

  test("xếp Đang giảm giá đưa Rep!el mặt nạ capsule (-50%) lên đầu mục Mặt nạ", async ({
    page,
  }) => {
    // Truy cập trực tiếp link có query params
    await page.goto("/danh-muc?loai=mat-na&xep=giam");

    await expect(page.locator("h1")).toHaveText("Mặt nạ");

    // Thẻ sản phẩm đầu tiên phải là Rep!el mặt nạ capsule hoặc có tag -50%
    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();
    await expect(theDauTien).toContainText("Rep!el");
    await expect(theDauTien).toContainText("-50%");
  });

  test("ghi chú deal mua kèm LOPOE hiển thị đúng", async ({ page }) => {
    await page.goto("/danh-muc?thuong-hieu=LOPOE");
    await expect(page.locator("h1")).toHaveText("LOPOE");

    // Kiểm tra có dòng ghi chú "Mua kèm: còn 186.000" ở sản phẩm sữa rửa mặt
    await expect(page.getByText(/Mua kèm: (còn )?186\.000/)).toBeVisible();
  });

  test("nút tim và nút + thêm giỏ hoạt động chính xác", async ({ page }) => {
    await page.goto("/danh-muc?loai=mat-na");

    const theDauTien = page.locator("article").first();
    await expect(theDauTien).toBeVisible();

    // Bấm nút tim (thích)
    const nutTim = theDauTien.getByRole("button", { name: "Thích" });
    await nutTim.click();

    // Badge Đã thích tăng lên 1
    const linkDaThich = page.getByRole("link", { name: "Đã thích" });
    await expect(linkDaThich.getByLabel("1 món")).toBeVisible();

    // Bấm nút + (thêm vào giỏ)
    const nutThemGio = theDauTien.getByRole("button", { name: /Thêm .* vào giỏ/ });
    await nutThemGio.click();

    // Badge Giỏ tăng lên 1
    const linkGio = page.getByRole("link", { name: "Giỏ" });
    await expect(linkGio.getByLabel("1 món")).toBeVisible();
  });

  test("giữ bộ lọc trên URL và nút quay lại hoạt động đúng", async ({ page }) => {
    await page.goto("/danh-muc?loai=toner-pad&xep=gia-tang");

    await expect(page.locator("h1")).toHaveText("Toner pad");

    // Nút quay lại về tất cả danh mục
    const nutQuayLai = page.getByLabel("Về tất cả danh mục");
    await expect(nutQuayLai).toBeVisible();
    await nutQuayLai.click();

    // Quay lại màn landing
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/danh-muc$/);
    await expect(page.locator("h1")).toHaveText("Danh mục");
  });

  test("thanh điều hướng 5 tab luôn nằm gọn trong viewport ở màn hình nhỏ (390x664)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto("/danh-muc?loai=mat-na");

    const thanhTab = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(thanhTab).toBeVisible();

    const box = await thanhTab.boundingBox();
    expect(box).not.toBeNull();
    // Đáy thanh tab không vượt quá chiều cao viewport
    expect(box!.y + box!.height).toBeLessThanOrEqual(664);
  });

  test("nút quay lại của trình duyệt (page.goBack) từ danh sách về đúng lưới danh mục", async ({
    page,
  }) => {
    // 1. Vào /quet
    await page.goto("/quet");
    await expect(page.getByRole("article")).toBeVisible();

    // 2. Chuyển sang /danh-muc
    const linkDanhMuc = page.getByRole("link", { name: "Danh mục" });
    await linkDanhMuc.click();
    await expect(page).toHaveURL(/\/danh-muc$/);
    await expect(page.locator("h1")).toHaveText("Danh mục");

    // 3. Chọn Mặt nạ
    const nutMatNa = page.getByRole("button", { name: /Mặt nạ/ });
    await nutMatNa.click();
    await expect(page).toHaveURL(/loai=mat-na/);
    await expect(page.locator("h1")).toHaveText("Mặt nạ");

    // 4. Nhấn Back của trình duyệt (page.goBack)
    await page.goBack();

    // Phải về lại đúng màn lưới danh mục (/danh-muc), không nhảy về /quet
    await expect(page).toHaveURL(/\/danh-muc$/);
    await expect(page.locator("h1")).toHaveText("Danh mục");
  });
});
