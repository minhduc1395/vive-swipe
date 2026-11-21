import { test, expect, datDaKhaoSat, MOCK_DEALS_SUPABASE } from "./fixtures";
import { KHOA_GIO_HANG } from "@/lib/kho-luu-tru";

test.describe("W014 · Giữ hàng tại booth, màn mã giữ hàng, email xác nhận, tự hết hạn", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await datDaKhaoSat(page);
  });

  test("1. Màn /giu-hang: xem trước giỏ hàng, validation họ tên & SĐT, toggle ngày đến", async ({
    page,
  }) => {
    await page.goto("/quet");

    // Đặt 1 món SRM LOPOE vào giỏ hàng
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
      );
    }, KHOA_GIO_HANG);

    // Vào trang /giu-hang
    await page.goto("/giu-hang");

    // Kiểm tra tóm tắt giỏ hàng
    await expect(page.getByText("1 món · tổng ước tính")).toBeVisible();
    await expect(page.getByText("249.000đ")).toBeVisible();

    // Bấm xác nhận ngay khi chưa nhập tên -> Báo lỗi
    const btnXacNhan = page.getByRole("button", { name: "Xác nhận giữ hàng" });
    await btnXacNhan.click();

    // Nhập họ tên
    const inputTen = page.locator('input#ten');
    await inputTen.fill("Nguyễn Thu Trang");

    // Nhập SĐT sai định dạng
    const inputSdt = page.locator('input#sdt');
    await inputSdt.fill("012345");
    await btnXacNhan.click();

    await expect(
      page.getByText(/Số điện thoại không đúng định dạng/i)
    ).toBeVisible();

    // Toggle ngày đến lấy: Hôm nay / Ngày mai
    const btnHomNay = page.getByRole("button", { name: "Hôm nay" });
    const btnNgayMai = page.getByRole("button", { name: "Ngày mai" });

    await btnHomNay.click();
    await expect(btnHomNay).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/Giữ đến 21:00 hôm nay/i)).toBeVisible();

    await btnNgayMai.click();
    await expect(btnNgayMai).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/Giữ đến 21:00 ngày mai/i)).toBeVisible();
  });

  test("2. Luồng hoàn chỉnh: Tạo mã giữ hàng thành công -> Chuyển sang /giu-hang/[ma] có QR & chi tiết món", async ({
    page,
  }) => {
    await page.goto("/quet");

    // Nạp giỏ hàng có 1 sản phẩm
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
      );
    }, KHOA_GIO_HANG);

    await page.goto("/giu-hang");

    // Điền form hợp lệ kèm email
    await page.locator('input#ten').fill("Phan Minh Đức");
    await page.locator('input#sdt').fill("0988776655");
    await page.locator('input#email').fill("duc.test@vive.vn");

    // Bấm Xác nhận giữ hàng
    const btnXacNhan = page.getByRole("button", { name: "Xác nhận giữ hàng" });
    await btnXacNhan.click();

    // Phải chuyển hướng sang URL dạng /giu-hang/VIVE-xxxx
    await expect(page).toHaveURL(/\/giu-hang\/VIVE-\d{4}/, { timeout: 10000 });

    // Kiểm tra nội dung màn xác nhận
    await expect(page.getByRole("heading", { name: "Đã giữ hàng" })).toBeVisible();
    await expect(page.getByText(/VIVE-\d{4}/)).toBeVisible();

    // Có thẻ SVG mã QR
    const qrSvg = page.locator('svg[aria-label*="Mã QR cho /nhan-vien?ma=VIVE-"]');
    await expect(qrSvg).toBeVisible();

    // Danh sách món và tổng ước tính
    await expect(page.getByText(/Sữa rửa mặt.*× 1/)).toBeVisible();
    await expect(page.getByText("249.000đ")).toBeVisible();
    await expect(page.locator("main").getByText(/LL2 Union Square/i)).toBeVisible();
    // Trang mã ai cũng mở được nên email được che bớt
    await expect(page.getByText("d•••@vive.vn")).toBeVisible();

    // Hai nút Lưu ảnh và Thêm vào lịch
    await expect(page.getByRole("button", { name: "Lưu ảnh màn hình" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Thêm vào lịch" })).toBeVisible();

    // Giỏ hàng sau khi giữ phải được làm rỗng
    const gioHangConLai = await page.evaluate((key) => {
      return window.localStorage.getItem(key);
    }, KHOA_GIO_HANG);
    expect(gioHangConLai).toBe("[]");
  });

  test("3. Xem trước email tại /dev/email ghi nhận email xác nhận giữ hàng", async ({
    page,
  }) => {
    // Đặt 1 đơn giữ hàng kèm email để test độc lập
    await page.goto("/quet");
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
      );
    }, KHOA_GIO_HANG);

    await page.goto("/giu-hang");
    await page.locator("input#ten").fill("Phan Minh Đức");
    await page.locator("input#sdt").fill("0977665544");
    await page.locator("input#email").fill("duc.test@vive.vn");
    await page.getByRole("button", { name: "Xác nhận giữ hàng" }).click();
    await expect(page).toHaveURL(/\/giu-hang\/VIVE-\d{4}/);

    // Mở trang /dev/email
    await page.goto("/dev/email");

    await expect(
      page.getByRole("heading", {
        name: "Hộp thư xem trước local (`/dev/email`)",
      })
    ).toBeVisible();

    // Kiểm tra email xuất hiện và hiển thị đúng thông tin
    await expect(page.getByText("duc.test@vive.vn").first()).toBeVisible();
    await expect(
      page.getByText(/Xác nhận giữ hàng VIVE-/i).first()
    ).toBeVisible();
  });

  test("4. Cron route /api/cron/het-han-giu-hang trả về 200 OK và JSON hợp lệ", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/het-han-giu-hang");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.route).toBe("het-han-giu-hang");
    expect(typeof data.da_cap_nhat).toBe("number");
  });
  test("5. Dòng thưởng giữ hàng (DC-02) hiện ở form và trang mã; tắt DC-02 thì mất", async ({
    page,
  }) => {
    const QUA = "Thêm 1 lượt quay vòng quay may mắn";
    const datGio = async () => {
      await page.goto("/quet");
      await page.evaluate((key) => {
        window.localStorage.setItem(
          key,
          JSON.stringify([{ loai: "san_pham", sanPhamId: "LOPOE-CF", soLuong: 1 }])
        );
      }, KHOA_GIO_HANG);
    };

    // DC-02 đang chạy: form và trang mã đều có dòng thưởng
    await datGio();
    await page.goto("/giu-hang");
    await expect(page.getByTestId("thuong-giu-hang")).toContainText(QUA);
    await page.locator("input#ten").fill("Phan Minh Đức");
    await page.locator("input#sdt").fill("0966554433");
    await page.getByRole("button", { name: "Xác nhận giữ hàng" }).click();
    await expect(page).toHaveURL(/\/giu-hang\/VIVE-\d{4}/, { timeout: 10000 });
    await expect(page.getByTestId("thuong-giu-hang")).toContainText(QUA);
    const urlMa = page.url();

    // Tắt DC-02 (hien_thi=false): cả hai nơi không còn dòng thưởng
    await page.route(
      (url) => url.pathname.includes("/rest/v1/deal"),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            MOCK_DEALS_SUPABASE.map((d) =>
              d.id === "DC-02" ? { ...d, du_lieu: { ...d.du_lieu, hien_thi: false } } : d
            )
          ),
        });
      }
    );
    await page.goto(urlMa);
    await expect(page.getByRole("heading", { name: "Đã giữ hàng" })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId("thuong-giu-hang")).toHaveCount(0);

    await datGio();
    await page.goto("/giu-hang");
    await expect(page.getByText("1 món · tổng ước tính")).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId("thuong-giu-hang")).toHaveCount(0);
  });
});
