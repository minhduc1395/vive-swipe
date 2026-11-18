import { expect, test } from "./fixtures";

test.describe("Màn chào và 3 câu hỏi khởi tạo (W010)", () => {
  test("trang chào /chao có nút Bắt đầu quẹt và dẫn tới /bat-dau khi chưa khảo sát", async ({
    page,
  }) => {
    await page.goto("/chao");
    const nutBatDau = page.getByRole("link", { name: "Bắt đầu quẹt" });
    await expect(nutBatDau).toBeVisible();
    await nutBatDau.click();
    await expect(page).toHaveURL(/\/bat-dau/);
  });

  test("hoàn thành đủ 3 câu hỏi và lưu vào localStorage", async ({ page }) => {
    await page.goto("/bat-dau");

    // Câu 1: Loại da
    await expect(page.locator("text=CÂU 1/3")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Da bạn thuộc");
    await page.getByRole("button", { name: "Da dầu" }).click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();

    // Câu 2: Mối quan tâm
    await expect(page.locator("text=CÂU 2/3")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Bạn quan tâm");
    await page.getByRole("button", { name: "Mụn" }).click();
    await page.getByRole("button", { name: "Lỗ chân lông" }).click();
    await page.getByRole("button", { name: "Cấp ẩm" }).click();
    await expect(page.locator("text=Đã chọn 3/3")).toBeVisible();

    // Thử chọn mục thứ 4 -> hiển thị cảnh báo
    await page.getByRole("button", { name: "Làm dịu" }).click();
    await expect(
      page.locator("text=Đã đủ 3 lựa chọn. Bỏ bớt một mục để đổi.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Tiếp tục" }).click();

    // Câu 3: Mức ngân sách
    await expect(page.locator("text=CÂU 3/3")).toBeVisible();
    await expect(page.locator("h1")).toContainText("chi khoảng");
    await page.getByRole("button", { name: "200K–500K" }).click();
    await page.getByRole("link", { name: "Bắt đầu quẹt" }).click();

    // Chuyển hướng tới /quet
    await expect(page).toHaveURL(/\/quet/);

    // Kiểm tra dữ liệu trong localStorage
    const traLoi = await page.evaluate(() => {
      return localStorage.getItem("vive_tra_loi_cau_hoi");
    });
    expect(traLoi).not.toBeNull();
    const data = JSON.parse(traLoi!);
    expect(data.loai_da).toBe("da-dau");
    expect(data.van_de).toContain("mun");
    expect(data.van_de).toContain("lo-chan-long");
    expect(data.van_de).toContain("cap-am");
    expect(data.ngan_sach).toBe("200k-500k");
  });

  test("bỏ qua được ở mọi câu và chuyển tới /quet", async ({ page }) => {
    await page.goto("/bat-dau");
    const nutBoQua = page.getByRole("link", { name: "Bỏ qua" });
    await expect(nutBoQua).toBeVisible();
    await nutBoQua.click();
    await expect(page).toHaveURL(/\/quet/);

    const daKhaoSat = await page.evaluate(() => {
      return localStorage.getItem("vive_da_khao_sat");
    });
    expect(daKhaoSat).toBe("true");
  });

  test("nút quay lại hoạt động đúng giữa các bước", async ({ page }) => {
    await page.goto("/bat-dau");
    // Bước 1: quay lại dẫn về /chao
    const nutQuayLai = page.getByLabel("Quay lại");
    await nutQuayLai.click();
    await expect(page).toHaveURL(/\/chao$/);

    // Vào lại và sang bước 2
    await page.goto("/bat-dau");
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.locator("text=CÂU 2/3")).toBeVisible();

    // Bước 2: quay lại bước 1
    await page.getByLabel("Quay lại").click();
    await expect(page.locator("text=CÂU 1/3")).toBeVisible();
  });

  test("vào / luôn thấy landing kể cả khách đã khảo sát; vào /quet khi chưa khảo sát chuyển sang /chao", async ({
    page,
  }) => {
    // 1. Chưa khảo sát vào /quet -> tự chuyển sang /chao
    await page.goto("/quet");
    await expect(page).toHaveURL(/\/chao/);
    await expect(page.locator("h1")).toContainText("Thích thì");

    // 2. Đã khảo sát vào / -> vẫn giữ nguyên landing /
    await page.evaluate(() => {
      localStorage.setItem("vive_da_khao_sat", "true");
    });
    await page.goto("/");
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
    await expect(page.getByRole("heading", { name: /LOPOE/i, level: 1 })).toBeVisible();

    // 3. Đã khảo sát vào /quet -> mở thẳng deck
    await page.goto("/quet");
    await expect(page).toHaveURL(/\/quet/);
    await expect(page.getByRole("article")).toBeVisible();
  });
});
