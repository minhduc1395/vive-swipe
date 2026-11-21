import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { describe, expect, it, vi } from "vitest";
import { SAN_PHAM } from "@/lib/data";
import type { SanPhamKho } from "@/lib/admin/san-pham-kho";
import {
  COT_EXCEL_SAN_PHAM,
  GIOI_HAN_DONG_EXCEL,
  phanTichFileExcelSanPham,
  taoFileExcelMau,
  xuatFileExcelSanPham,
} from "@/lib/admin/excel-san-pham";
import {
  actionApDungLoExcel,
  actionLayDanhSachLoNhapLieu,
  actionTaiFileExcelMau,
  actionTaiLenXemTruocExcel,
  actionXuatFileExcelHienTai,
} from "@/app/quan-tri/san-pham/nhap/actions";
import {
  actionLayLichSuSanPham,
  actionTaiSanPhamKho,
} from "@/app/quan-tri/san-pham/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function taoDanhSachThu(): SanPhamKho[] {
  const lopoeCf = SAN_PHAM.find((sp) => sp.id === "LOPOE-CF");
  const mau = [...SAN_PHAM.slice(0, 6), ...(lopoeCf ? [lopoeCf] : [])];
  return mau.map((sp, i) => ({
    ...sp,
    ten_en: i === 0 ? "Existing English Name" : null,
    mo_ta: sp.mo_ta || "Mô tả tiếng Việt có sẵn",
    mo_ta_en: i === 0 ? "Existing English Description" : null,
    nguon_truong: {
      ten_hien_thi: { nguon: "dong_bo", luc: "2026-11-18T00:00:00.000Z" },
    },
  }));
}

async function taoBufferXlsxTuMang(
  headers: string[],
  rows: Array<Array<string | number | boolean>>,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sản phẩm");
  ws.addRow(headers);
  for (const r of rows) {
    ws.addRow(r);
  }
  const ab = await wb.xlsx.writeBuffer();
  return Buffer.from(ab);
}

describe("W046 · Nhập & xuất Excel thông tin sản phẩm", () => {
  it("1. TIÊU CHÍ XONG: Tạo file mẫu .xlsx hợp lệ và xuất danh sách hiện tại", async () => {
    const bufferMau = await taoFileExcelMau();
    expect(bufferMau.byteLength).toBeGreaterThan(2000);

    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(bufferMau as any);
    const sheetSanPham = wb.getWorksheet("Sản phẩm");
    const sheetHuongDan = wb.getWorksheet("Hướng dẫn");
    expect(sheetSanPham).toBeDefined();
    expect(sheetHuongDan).toBeDefined();

    const headerValues: string[] = [];
    sheetSanPham!.getRow(1).eachCell((cell) => {
      headerValues.push(String(cell.value ?? "").trim());
    });
    expect(headerValues).toEqual([...COT_EXCEL_SAN_PHAM]);

    // Phân tích lại chính file mẫu đối với dữ liệu hiện tại
    const danhSach = taoDanhSachThu();
    const kqMau = await phanTichFileExcelSanPham({
      buffer: bufferMau,
      tenFile: "vive-san-pham-mau.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });
    expect(kqMau.loiChung).toBeNull();
    expect(kqMau.soDongLoi).toBe(0);
    expect(kqMau.dongHopLe.length).toBeGreaterThanOrEqual(2);

    // Xuất danh sách hiện tại rồi đọc lại: không có dòng thay đổi nào nếu chưa sửa ô nào
    const bufferXuat = await xuatFileExcelSanPham(danhSach);
    const kqXuatLai = await phanTichFileExcelSanPham({
      buffer: bufferXuat,
      tenFile: "xuat-hien-tai.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });
    expect(kqXuatLai.loiChung).toBeNull();
    expect(kqXuatLai.soDongLoi).toBe(0);
    expect(kqXuatLai.soDongKhongDoi).toBe(danhSach.length);
  });

  it("2. TIÊU CHÍ XONG: File thiếu cột bắt buộc bị từ chối rõ ràng", async () => {
    const danhSach = taoDanhSachThu();

    const thieuIdVaBarcode = await taoBufferXlsxTuMang(
      ["ten_hien_thi", "ten_en", "danh_muc"],
      [["Sữa rửa mặt", "Cleansing Foam", "sua-rua-mat"]],
    );
    const kq1 = await phanTichFileExcelSanPham({
      buffer: thieuIdVaBarcode,
      tenFile: "thieu-id.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });
    expect(kq1.hopLe).toBe(false);
    expect(kq1.loiChung).toMatch(/thiếu cột bắt buộc/i);
    expect(kq1.loiChung).toMatch(/id hoặc barcode/i);

    const chiCoId = await taoBufferXlsxTuMang(["id"], [[danhSach[0].id]]);
    const kq2 = await phanTichFileExcelSanPham({
      buffer: chiCoId,
      tenFile: "chi-co-id.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });
    expect(kq2.hopLe).toBe(false);
    expect(kq2.loiChung).toMatch(/thiếu cột bắt buộc/i);
  });

  it("3. TIÊU CHÍ XONG: Mã phân loại sai (danh_muc, van_de, loai_da) báo dòng lỗi có lý do", async () => {
    const danhSach = taoDanhSachThu();
    const sp = danhSach[0];

    const buf = await taoBufferXlsxTuMang(
      ["id", "danh_muc", "van_de", "loai_da"],
      [
        [sp.id, "danh-muc-khong-ton-tai", "cap-am", "moi-loai-da"],
        [danhSach[1].id, "tinh-chat", "tri-tham-la-sai", "da-nhay-cam"],
        [danhSach[2].id, "tinh-chat", "cap-am", "da-khong-co"],
      ],
    );

    const kq = await phanTichFileExcelSanPham({
      buffer: buf,
      tenFile: "sai-phan-loai.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });

    expect(kq.hopLe).toBe(false);
    expect(kq.soDongLoi).toBe(3);
    expect(kq.dongLoi[0].lyDo).toMatch(/danh_muc/i);
    expect(kq.dongLoi[1].lyDo).toMatch(/van_de/i);
    expect(kq.dongLoi[2].lyDo).toMatch(/loai_da/i);
  });

  it("4. TIÊU CHÍ XONG: Trùng mã vạch (trong file và với sản phẩm khác trong kho) báo lỗi đúng dòng", async () => {
    const danhSach = taoDanhSachThu();
    const sp0 = danhSach[0];
    const sp1 = danhSach[1];
    expect(sp0.barcode).toBeTruthy();
    expect(sp1.barcode).toBeTruthy();

    const buf = await taoBufferXlsxTuMang(
      ["id", "barcode", "ten_en"],
      [
        // Đổi barcode của sp0 trùng với sp1 trong kho -> lỗi
        [sp0.id, sp1.barcode!, "Duplicate existing barcode"],
        // Mã mới A dùng barcode mới
        ["NEW-A", "8809999000111", "New A"],
        // Mã mới B trùng barcode ngay trong file với NEW-A -> lỗi
        ["NEW-B", "8809999000111", "New B"],
      ],
    );

    // Cho thêm cột bắt buộc cho mã mới để tách riêng lỗi trùng mã vạch
    const bufDayDu = await taoBufferXlsxTuMang(
      ["id", "barcode", "thuong_hieu", "ten_hien_thi", "danh_muc", "ten_en", "gia_ban"],
      [
        [sp0.id, sp1.barcode!, "", "", "", "Duplicate existing barcode", ""],
        ["NEW-A", "8809999000111", "LOPOE", "Sản phẩm mới A", "tinh-chat", "New A", "250000"],
        ["NEW-B", "8809999000111", "LOPOE", "Sản phẩm mới B", "tinh-chat", "New B", "250000"],
      ],
    );
    void buf;

    const kq = await phanTichFileExcelSanPham({
      buffer: bufDayDu,
      tenFile: "trung-barcode.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });

    expect(kq.hopLe).toBe(false);
    expect(kq.soMaMoi).toBe(1); // NEW-A hợp lệ
    expect(kq.soDongLoi).toBe(2);
    expect(kq.dongLoi[0].lyDo).toMatch(/mã vạch/i);
    expect(kq.dongLoi[1].lyDo).toMatch(/mã vạch/i);
  });

  it("5. TIÊU CHÍ XONG: Ô trống không xóa dữ liệu cũ; gõ [xoa] xóa trường tùy chọn; kho không sửa giá", async () => {
    const danhSach = taoDanhSachThu();
    const sp0 = danhSach[0]; // đã có ten_en = "Existing English Name", mo_ta, mo_ta_en

    const buf = await taoBufferXlsxTuMang(
      ["id", "ten_hien_thi", "ten_en", "mo_ta_en", "gia_ban", "hien_thi"],
      [
        // Để trống ten_hien_thi và ten_en -> phải giữ nguyên; gõ [xoa] vào mo_ta_en -> xóa về null;
        // Vai trò kho cố đổi giá và hien_thi -> bị bỏ qua
        [sp0.id, "", "", "[xoa]", 999000, "FALSE"],
      ],
    );

    const kq = await phanTichFileExcelSanPham({
      buffer: buf,
      tenFile: "o-trong-va-xoa.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });

    expect(kq.hopLe).toBe(true);
    expect(kq.dongHopLe).toHaveLength(1);
    const dong = kq.dongHopLe[0];

    // Ô trống không xuất hiện trong thayDoi
    expect(dong.thayDoi.ten_hien_thi).toBeUndefined();
    expect(dong.thayDoi.ten_en).toBeUndefined();
    // [xoa] xóa mo_ta_en thành null
    expect(dong.thayDoi.mo_ta_en).toBeNull();
    // Vai trò kho không sửa giá/hiển thị
    expect(dong.thayDoi.gia_ban).toBeUndefined();
    expect(dong.thayDoi.hien_thi).toBeUndefined();
    expect(dong.canhBao?.join(" ")).toMatch(/không sửa được giá/i);

    // Kiểm tra giới hạn dòng > 2.000
    const quaNhieuDong = Array.from({ length: GIOI_HAN_DONG_EXCEL + 1 }, (_, i) => [
      `ID-${i}`,
      "Ten",
    ]);
    const bufQuaLon = await taoBufferXlsxTuMang(["id", "ten_en"], quaNhieuDong);
    const kqQuaLon = await phanTichFileExcelSanPham({
      buffer: bufQuaLon,
      tenFile: "qua-2000-dong.xlsx",
      danhSachHienTai: danhSach,
      vaiTro: "kho",
    });
    expect(kqQuaLon.hopLe).toBe(false);
    expect(kqQuaLon.loiChung).toMatch(/2\.000/);
  });

  it("6. Server Action: tải mẫu, xem trước lo_nhap_lieu, áp dụng một giao dịch nguồn excel & chặn nhan_vien", async () => {
    await expect(actionTaiFileExcelMau("thu:nhan_vien")).rejects.toThrow(
      /kho hoặc quản trị/i,
    );

    const noiDungUi = fs.readFileSync(
      path.resolve(process.cwd(), "app/quan-tri/san-pham/nhap/NhapExcelClient.tsx"),
      "utf8",
    );
    expect(noiDungUi.match(/#[0-9A-Fa-f]{3,8}\b/g) || []).toEqual([]);

    const mau = await actionTaiFileExcelMau("thu:kho");
    expect(mau.tenFile).toBe("vive-san-pham-mau.xlsx");
    expect(Buffer.from(mau.base64, "base64").byteLength).toBeGreaterThan(2000);

    const xuat = await actionXuatFileExcelHienTai("thu:kho");
    expect(xuat.soSanPham).toBeGreaterThanOrEqual(SAN_PHAM.length);

    const targetId = SAN_PHAM[5].id;
    const csvUpload = [
      "id,thuong_hieu,ten_hien_thi,ten_en,danh_muc,mo_ta_en,gia_ban",
      `${targetId},,,Updated English Name By CSV,,Updated English Description By CSV,`,
      `W046-UNIT-NEW,LOPOE,Sản phẩm nhập CSV,CSV Imported New Serum,tinh-chat,Imported new serum.,250000`,
    ].join("\n");

    const loXemTruoc = await actionTaiLenXemTruocExcel("thu:kho", {
      tenFile: "nhap-thu-w046.csv",
      base64: Buffer.from(csvUpload, "utf8").toString("base64"),
    });

    expect(loXemTruoc.trang_thai).toBe("xem_truoc");
    expect(loXemTruoc.so_moi).toBe(1);
    expect(loXemTruoc.so_sua).toBe(1);
    expect(loXemTruoc.duong_dan_bucket).toMatch(/^excel\//);

    const kqApDung = await actionApDungLoExcel("thu:kho", loXemTruoc.id);
    expect(kqApDung.lo.trang_thai).toBe("da_ap_dung");
    expect(kqApDung.soMaDaGhi).toBe(2);

    const danhSachSau = await actionTaiSanPhamKho("thu:kho");
    const spUpdated = danhSachSau.sanPham.find((s) => s.id === targetId);
    const spNew = danhSachSau.sanPham.find((s) => s.id === "W046-UNIT-NEW");
    expect(spUpdated?.ten_en).toBe("Updated English Name By CSV");
    expect(spUpdated?.nguon_truong.ten_en?.nguon).toBe("excel");
    expect(spNew).toBeDefined();
    expect(spNew?.hien_thi).toBe(false); // mã mới do kho thêm mặc định ẩn

    const lichSuTarget = await actionLayLichSuSanPham("thu:kho", targetId);
    expect(
      lichSuTarget.some(
        (ls) =>
          ls.truong === "ten_en" &&
          ls.nguon === "excel" &&
          ls.gia_tri_moi === "Updated English Name By CSV",
      ),
    ).toBe(true);

    const danhSachLo = await actionLayDanhSachLoNhapLieu("thu:kho");
    expect(danhSachLo.some((l) => l.id === loXemTruoc.id && l.trang_thai === "da_ap_dung")).toBe(true);
  });
});
