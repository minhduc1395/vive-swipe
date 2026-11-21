import fs from "node:fs";
import ExcelJS from "exceljs";
import { test, expect } from "./fixtures";

test.describe("W046 · Nhập & xuất Excel tại /quan-tri/san-pham/nhap", () => {
  test.beforeEach(async () => {
    test.setTimeout(90000);
  });

  test("1. Tài khoản nhan_vien (booth@vive.vn) bị chặn truy cập trang nhập Excel", async ({
    page,
  }) => {
    await page.goto("/quan-tri/san-pham/nhap");
    await page.locator("#nhap-email").fill("booth@vive.vn");
    await page.locator("#nhap-password").fill("booth123");
    await page.getByRole("button", { name: "Đăng nhập kho / quản trị" }).click();

    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: /Không có quyền nhập Excel/i }),
    ).toBeVisible();
    await expect(page.getByTestId("input-file-excel")).toHaveCount(0);
  });

  test("2. TIÊU CHÍ XONG: Tải mẫu -> điền 2 dòng -> xem trước đúng -> áp dụng -> web hiện đúng", async ({
    page,
  }, testInfo) => {
    const isIphone = testInfo.project.name === "iphone-13";
    const targetId = isIphone ? "8809557517892" : "8809557517908";
    const newId = isIphone ? "E2E-XLSX-IP13" : "E2E-XLSX-PX7";
    const tenEnCapNhat = isIphone
      ? "Magic Snow Cushion #21 Excel Updated"
      : "Magic Snow Cushion #22 Excel Updated";
    const tenEnMoi = isIphone
      ? "E2E Excel Added Serum iPhone"
      : "E2E Excel Added Serum Pixel";

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/quan-tri/san-pham/nhap");

    await page.locator("#nhap-email").fill("kho@vive.vn");
    await page.locator("#nhap-password").fill("kho123");
    await page.getByRole("button", { name: "Đăng nhập kho / quản trị" }).click();

    await expect(page.getByTestId("nut-tai-file-mau")).toBeVisible();

    // 1) Tải file mẫu .xlsx từ trình duyệt
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("nut-tai-file-mau").click(),
    ]);
    const fileMauPath = await download.path();
    expect(fileMauPath).toBeTruthy();

    // 2) Đọc file mẫu và điền lại 2 dòng riêng biệt cho project hiện tại
    const rawBuffer = fs.readFileSync(fileMauPath!);
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(rawBuffer as any);
    const ws = wb.getWorksheet("Sản phẩm")!;
    // Ánh xạ khóa cột từ dòng tiêu đề (ExcelJS không tự giữ `key` sau khi đọc .xlsx)
    const headers: string[] = [];
    ws.getRow(1).eachCell((cell, colNum) => {
      const h = String(cell.value ?? "").trim();
      headers[colNum - 1] = h;
    });
    // Ghi đè 2 dòng ví dụ trong file mẫu bằng 2 dòng dữ liệu thử nghiệm
    const dongTheoTen = (duLieu: Record<string, string>) =>
      headers.map((h) => duLieu[h] ?? "");

    ws.getRow(2).values = dongTheoTen({
      id: targetId,
      ten_en: tenEnCapNhat,
      mo_ta_en: "Updated smoothly from Excel import E2E.",
    });
    ws.getRow(3).values = dongTheoTen({
      id: newId,
      thuong_hieu: "LOPOE",
      ten_goc: `${newId} Serum`,
      ten_hien_thi: `Tinh chất E2E ${newId}`,
      ten_en: tenEnMoi,
      quy_cach: "30ml",
      danh_muc: "tinh-chat",
      van_de: "cap-am",
      loai_da: "moi-loai-da",
      gia_ban: "250000",
      hien_thi: "FALSE",
    });

    const outPath = testInfo.outputPath(`nhap-${testInfo.project.name}.xlsx`);
    await wb.xlsx.writeFile(outPath);

    // 3) Tải file lên và kiểm tra màn xem trước
    await page.getByTestId("input-file-excel").setInputFiles(outPath);

    await expect(page.getByTestId("khung-xem-truoc-excel")).toBeVisible();
    await expect(page.getByTestId("so-ma-moi")).toHaveText("1");
    await expect(page.getByTestId("so-ma-sua")).toHaveText("1");
    await expect(page.getByTestId("so-dong-loi")).toHaveText("0");
    await expect(page.getByTestId("bang-so-sanh-excel")).toContainText(
      tenEnCapNhat,
    );
    await expect(page.getByTestId("bang-so-sanh-excel")).toContainText(
      tenEnMoi,
    );

    // 4) Bấm Áp dụng thay đổi
    await page.getByTestId("nut-ap-dung-excel").click();
    await expect(page.getByRole("status")).toContainText("Đã áp dụng xong 2 mã");

    // 5) Mở sang /quan-tri/san-pham chuyển chế độ EN để kiểm tra web đã cập nhật
    await page.getByRole("link", { name: "← Về kho sản phẩm" }).click();
    await expect(page).toHaveURL(/\/quan-tri\/san-pham$/);
    await expect(page.getByTestId("che-do-ngon-ngu-xem")).toBeVisible();

    await page
      .getByTestId("che-do-ngon-ngu-xem")
      .getByRole("button", { name: "EN", exact: true })
      .click();

    await page.getByLabel("Tìm tên hoặc mã vạch").fill(tenEnCapNhat);
    await expect(page.getByTestId(`ten-sp-${targetId}`)).toHaveText(
      tenEnCapNhat,
    );

    await page.getByLabel("Tìm tên hoặc mã vạch").fill(newId);
    await expect(page.getByTestId(`ten-sp-${newId}`)).toHaveText(tenEnMoi);
  });

  test("3. Không cuộn ngang ở 3 cỡ màn hình 390, 820, 1440", async ({
    page,
  }) => {
    await page.goto("/quan-tri/san-pham/nhap");
    await page.locator("#nhap-email").fill("kho@vive.vn");
    await page.locator("#nhap-password").fill("kho123");
    await page.getByRole("button", { name: "Đăng nhập kho / quản trị" }).click();
    await expect(page.getByTestId("nut-tai-file-mau")).toBeVisible();

    for (const sz of [
      { name: "390", width: 390, height: 844 },
      { name: "820", width: 820, height: 1180 },
      { name: "1440", width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: sz.width, height: sz.height });
      await page.waitForTimeout(100);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, `/quan-tri/san-pham/nhap cuộn ngang ở ${sz.name}`).toBe(
        false,
      );
    }
  });
});
