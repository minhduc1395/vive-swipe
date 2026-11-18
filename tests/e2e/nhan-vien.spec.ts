import { test, expect, datDaKhaoSat } from "./fixtures";
import { KHOA_NHAN_VIEN_SESSION } from "@/lib/nhan-vien/auth";

test.describe("W015 · Trang nhân viên /nhan-vien", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
  });

  test("1. Khách chưa đăng nhập: hiển thị form xác thực nhân viên, chặn truy cập danh sách", async ({
    page,
  }) => {
    // Đảm bảo không có session nhân viên
    await page.goto("/quet");
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, KHOA_NHAN_VIEN_SESSION);

    await page.goto("/nhan-vien");

    // Phải thấy form đăng nhập nhân viên
    await expect(
      page.getByRole("heading", { name: "Quầy nhân viên VIVE" })
    ).toBeVisible();

    // Thử đăng nhập sai
    await page.locator("input#staff-email").fill("khach@gmail.com");
    await page.locator("input#staff-password").fill("sai123");
    await page.getByRole("button", { name: "Đăng nhập quầy" }).click();

    await expect(page.getByRole("alert").filter({ hasText: /không chính xác/i })).toBeVisible();
    await expect(page.getByText(/không chính xác/i)).toBeVisible();
  });

  test("2. Đăng nhập nhân viên thành công và giao diện bảng 2 cột đúng design", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/nhan-vien");

    // Đăng nhập nhanh bằng tài khoản ca trực
    await page
      .getByRole("button", { name: /Đăng nhập thử/i })
      .click();

    // Phải mở bảng nhân viên
    await expect(
      page.getByRole("heading", { name: "Giữ hàng hôm nay" })
    ).toBeVisible();
    await expect(page.getByText("Quầy VIVE", { exact: true })).toBeVisible();

    // Cột trái có đủ các tab trạng thái
    const groupLoc = page.getByRole("group", { name: "Lọc theo trạng thái" });
    await expect(groupLoc.getByRole("button", { name: /Mới/i })).toBeVisible();
    await expect(groupLoc.getByRole("button", { name: /Đã soạn/i })).toBeVisible();
    await expect(groupLoc.getByRole("button", { name: /Đã lấy/i })).toBeVisible();
    await expect(groupLoc.getByRole("button", { name: /Tất cả/i })).toBeVisible();

    // Cột phải có bảng chi tiết và 3 nút hành động
    await expect(
      page.getByRole("button", { name: "Đã soạn", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Đã lấy", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Hủy", exact: true })
    ).toBeVisible();
  });

  test("3. TIÊU CHÍ XONG: Mở bằng URL trong QR (?ma=VIVE-4821) và làm trọn quy trình: tìm mã -> Đã soạn -> Đã lấy", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    // Thiết lập sẵn session nhân viên
    await page.goto("/quet");
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          email: "booth@vive.vn",
          ten: "Quầy VIVE",
          vaiTro: "nhan_vien",
          dangNhapLuc: new Date().toISOString(),
        })
      );
    }, KHOA_NHAN_VIEN_SESSION);

    // Mở bằng URL quét từ QR
    await page.goto("/nhan-vien?ma=VIVE-4821");

    // Kiểm tra ô tìm kiếm tự động có mã VIVE-4821
    const inputTim = page.locator("input#tim");
    await expect(inputTim).toHaveValue("VIVE-4821");

    // Chi tiết hiển thị mã VIVE-4821
    const secChiTiet = page.getByRole("region", {
      name: "Chi tiết mã giữ hàng",
    });
    await expect(secChiTiet.getByText("VIVE-4821")).toBeVisible();
    await expect(secChiTiet.getByText(/1.235.000đ/)).toBeVisible();

    // Bấm nút "Đã soạn"
    const btnDaSoan = secChiTiet.getByRole("button", {
      name: "Đã soạn",
      exact: true,
    });
    await btnDaSoan.click();

    // Trạng thái trong chi tiết chuyển sang Đã soạn
    await expect(secChiTiet.getByText("Đã soạn").first()).toBeVisible();

    // Bấm nút "Đã lấy"
    const btnDaLay = secChiTiet.getByRole("button", {
      name: "Đã lấy",
      exact: true,
    });
    await btnDaLay.click();

    // Trạng thái chuyển sang Đã lấy
    await expect(secChiTiet.getByText("Đã lấy").first()).toBeVisible();

    // Kiểm tra log ghi nhận người đổi và giờ
    await expect(secChiTiet.getByText(/Đã lấy bởi Quầy VIVE lúc/)).toBeVisible();
  });

  test("4. Tìm kiếm theo 4 số cuối SĐT và đăng xuất", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    // Thiết lập session nhân viên
    await page.goto("/quet");
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          email: "booth@vive.vn",
          ten: "Quầy VIVE",
          vaiTro: "nhan_vien",
          dangNhapLuc: new Date().toISOString(),
        })
      );
    }, KHOA_NHAN_VIEN_SESSION);

    await page.goto("/nhan-vien");

    // Tìm kiếm theo 4 số cuối SĐT của đơn VIVE-3307 (0987112112 -> 2112)
    const inputTim = page.locator("input#tim");
    await inputTim.fill("2112");

    // Kết quả phải thấy đơn VIVE-3307
    await expect(page.getByText("VIVE-3307").first()).toBeVisible();

    // Bấm nút Đăng xuất
    await page.getByRole("button", { name: "Đăng xuất" }).click();

    // Trở về màn đăng nhập nhân viên
    await expect(
      page.getByRole("heading", { name: "Quầy nhân viên VIVE" })
    ).toBeVisible();
  });
});
