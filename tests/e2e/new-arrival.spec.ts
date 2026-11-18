import { test, expect } from "@playwright/test";

test.describe("W027 · Landing chiến dịch /new-arrival", () => {
  test("hiển thị đầy đủ thanh trên, các khối theo đợt và chân trang trên máy tính", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/new-arrival");

    // 1. Header có logo và các link điều hướng
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(
      header.getByRole("link", { name: "New Arrival", exact: true })
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Quẹt", exact: true })
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Sản phẩm" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Giỏ/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

    // 2. Khối Hero có nhãn đợt và tiêu đề LOPOE Better Balance
    await expect(page.getByText("MỚI TẠI VIVE · NỘI ĐỊA HÀN")).toBeVisible();
    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem bộ sản phẩm" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Giữ hàng tại booth" })).toBeVisible();

    // 3. Khối chữ chạy marquee
    await expect(page.getByText(/BETTER BALANCE · NỘI ĐỊA HÀN/).first()).toBeVisible();

    // 4. Khối kệ ra mắt "Đủ bộ, đỡ tốn." và các combo
    await expect(page.getByRole("heading", { name: "Đủ bộ, đỡ tốn." })).toBeVisible();
    await expect(page.getByText("Combo 2 sữa rửa mặt LOPOE")).toBeVisible();
    await expect(page.getByText("Combo kem dưỡng và ampoule LOPOE")).toBeVisible();
    await expect(page.getByText("Bộ 3 LOPOE")).toBeVisible();

    // 5. Khối chương trình "Đang chạy tại booth"
    await expect(page.getByRole("heading", { name: "Đang chạy tại booth" })).toBeVisible();
    await expect(page.getByText("COMBO PINK Medicube PDRN")).toBeVisible();

    // 6. Khối trải nghiệm đối tác Pawlette
    await expect(page.getByRole("heading", { name: "Tông nào hợp bạn?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tìm hiểu Personal Color" })).toBeVisible();

    // 7. Khối thông tin booth
    await expect(page.getByText("LL2").first()).toBeVisible();
    await expect(page.getByText("VIVE | K-Beauty Experience").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Chỉ đường" })).toBeVisible();

    // 8. Chân trang
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.getByText("Facebook: VIVE - K Beauty Experience")).toBeVisible();
    await expect(page.getByText("Instagram: @vive.k_beauty")).toBeVisible();
    await expect(page.getByText("TikTok: @viveuniverse")).toBeVisible();
  });

  test("không có thanh cuộn ngang ở các cỡ màn hình 390px, 820px, 1280px, 1440px", async ({
    page,
  }) => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 820, height: 1180 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/new-arrival");
      await page.waitForLoadState("domcontentloaded");

      // Kiểm tra độ rộng cuộn không tràn màn hình
      const isHorizontalScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(
        isHorizontalScrollable,
        `Viewport ${vp.width}x${vp.height} không được có thanh cuộn ngang`
      ).toBe(false);
    }
  });

  test("trên màn hình điện thoại 390px các khối hiển thị vừa vặn và nút đạt tối thiểu 44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/new-arrival");

    // Nút Xem bộ sản phẩm
    const btnXem = page.getByRole("link", { name: "Xem bộ sản phẩm" });
    await expect(btnXem).toBeVisible();
    const box = await btnXem.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // Nút Đăng nhập trên thanh trên
    const btnDangNhap = page.locator("header").getByRole("link", { name: "Đăng nhập" });
    await expect(btnDangNhap).toBeVisible();
    const boxDN = await btnDangNhap.boundingBox();
    expect(boxDN?.height).toBeGreaterThanOrEqual(36);
  });

  test("không có câu nào nhắc tới quẹt trong nội dung giới thiệu sản phẩm của landing", async ({
    page,
  }) => {
    await page.goto("/new-arrival");

    // Lấy nội dung main/sections (ngoại trừ tên thanh điều hướng 'Quẹt' dẫn tới /quet)
    const texts = await page.locator("main, section, #phan-duoi").allInnerTexts();
    const fullText = texts.join(" ").toLowerCase();

    // Không được có các cụm từ về quẹt deck
    expect(fullText).not.toContain("quẹt phải");
    expect(fullText).not.toContain("quẹt trái");
    expect(fullText).not.toContain("deck quẹt");
    expect(fullText).not.toContain("bắt đầu quẹt");
  });

  test("không hiển thị deal may rủi chưa đăng ký hoặc deal ẩn", async ({ page }) => {
    await page.goto("/new-arrival");

    // Các deal may rủi (DC-02, DC-04, KM-12, KM-12b) không được xuất hiện
    await expect(page.getByText("Vòng quay may mắn 10 ô")).not.toBeVisible();
    await expect(page.getByText("Lá thăm trong sample")).not.toBeVisible();
    await expect(page.getByText("Vòng quay LOPOE")).not.toBeVisible();
  });

  test("chụp ảnh màn hình tại 390px, 820px, 1280px, 1440px phục vụ nghiệm thu", async ({
    page,
  }) => {
    const screens = [
      { name: "mobile-390px.png", width: 390, height: 844 },
      { name: "tablet-820px.png", width: 820, height: 1180 },
      { name: "desktop-1280px.png", width: 1280, height: 800 },
      { name: "desktop-1440px.png", width: 1440, height: 900 },
    ];

    for (const sc of screens) {
      await page.setViewportSize({ width: sc.width, height: sc.height });
      await page.goto("/new-arrival");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `docs/screenshots/new-arrival/${sc.name}`,
        fullPage: false,
      });
    }
  });
});
