import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { SAN_PHAM } from "@/lib/data";
import {
  locDanhSachSanPhamKho,
  thucThiSuaSanPhamRpc,
  type LichSuSanPhamItem,
  type SanPhamKho,
} from "@/lib/admin/san-pham-kho";
import { xacThucKhoHoacQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import {
  actionDanhDauDaXemAi,
  actionLayLichSuSanPham,
  actionSuaSanPhamKho,
  actionTaiSanPhamKho,
} from "@/app/quan-tri/san-pham/actions";
import { actionLayDuLieuKhachDev } from "@/app/quan-tri/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function taoDanhSachMau(): SanPhamKho[] {
  return SAN_PHAM.slice(0, 5).map((sp, i) => ({
    ...sp,
    ten_en: i === 0 ? "AI Sample Name" : null,
    mo_ta_en: null,
    nguon_truong:
      i === 0
        ? { ten_en: { nguon: "ai", boi: "AI", luc: "2026-11-19T00:00:00.000Z" } }
        : {},
  }));
}

describe("W045 · RPC sua_san_pham, xác thực kho & lọc sản phẩm", () => {
  it("TIÊU CHÍ XONG: AI không bao giờ ghi đè trường có nguồn nguoi hoặc excel", () => {
    const danhSach0 = taoDanhSachMau();
    const lichSu0: LichSuSanPhamItem[] = [];
    const targetId = danhSach0[0].id;

    // 1) Người nhập ten_en và mo_ta_en
    const sauNguoi = thucThiSuaSanPhamRpc(danhSach0, lichSu0, {
      id: targetId,
      thayDoi: {
        ten_en: "LOPOE Foam Human Edited",
        mo_ta_en: "Human EN description",
      },
      nguon: "nguoi",
      boi: "Kho A",
      vaiTro: "kho",
    });
    expect(sauNguoi.sanPham.nguon_truong.ten_en?.nguon).toBe("nguoi");

    // 2) AI thử ghi đè ten_en (nguoi), đồng thời điền trường mo_ta đang trống
    const sauAi = thucThiSuaSanPhamRpc(
      sauNguoi.danhSachMoi,
      sauNguoi.lichSuMoi,
      {
        id: targetId,
        thayDoi: {
          ten_en: "AI Overwrite Attempt",
          mo_ta: "Mô tả AI điền vào ô trống",
        },
        nguon: "ai",
        boi: "AI Agent",
        vaiTro: "kho",
      },
    );

    expect(sauAi.sanPham.ten_en).toBe("LOPOE Foam Human Edited");
    expect(sauAi.sanPham.nguon_truong.ten_en?.nguon).toBe("nguoi");
    expect(sauAi.cacTruongBoQua).toContain("ten_en");
    expect(sauAi.sanPham.mo_ta).toBe("Mô tả AI điền vào ô trống");
    expect(sauAi.sanPham.nguon_truong.mo_ta?.nguon).toBe("ai");

    // 3) Nguồn excel vẫn được phép ghi đè nguoi theo docs/07 §3, nhưng AI không ghi đè excel
    const sauExcel = thucThiSuaSanPhamRpc(
      sauAi.danhSachMoi,
      sauAi.lichSuMoi,
      {
        id: targetId,
        thayDoi: { ten_en: "LOPOE Foam Excel" },
        nguon: "excel",
        boi: "Kho B",
        vaiTro: "kho",
      },
    );
    expect(sauExcel.sanPham.ten_en).toBe("LOPOE Foam Excel");

    const aiSauExcel = thucThiSuaSanPhamRpc(
      sauExcel.danhSachMoi,
      sauExcel.lichSuMoi,
      {
        id: targetId,
        thayDoi: { ten_en: "AI Second Attempt" },
        nguon: "ai",
        boi: "AI Agent",
      },
    );
    expect(aiSauExcel.sanPham.ten_en).toBe("LOPOE Foam Excel");
    expect(aiSauExcel.cacTruongBoQua).toContain("ten_en");
  });

  it("TIÊU CHÍ XONG: Vai trò kho không sửa được giá & hiển thị; tạo mã mới thì hien_thi = false", async () => {
    const danhSach0 = taoDanhSachMau();
    const targetId = danhSach0[0].id;

    expect(() =>
      thucThiSuaSanPhamRpc(danhSach0, [], {
        id: targetId,
        thayDoi: { gia_ban: 99000 },
        nguon: "nguoi",
        boi: "Kho A",
        vaiTro: "kho",
      }),
    ).toThrow(/không có quyền sửa giá/i);

    expect(() =>
      thucThiSuaSanPhamRpc(danhSach0, [], {
        id: targetId,
        thayDoi: { hien_thi: false },
        nguon: "nguoi",
        boi: "Kho A",
        vaiTro: "kho",
      }),
    ).toThrow(/không có quyền sửa giá/i);

    await expect(
      actionSuaSanPhamKho("thu:kho", {
        id: targetId,
        thayDoi: { gia_goc: 500000 },
      }),
    ).rejects.toThrow(/không có quyền sửa giá/i);

    // Kho tạo mã mới -> hien_thi bắt buộc false
    const taoMoi = await actionSuaSanPhamKho("thu:kho", {
      id: "KHO-TEST-NEW-01",
      thayDoi: {
        thuong_hieu: "LOPOE",
        ten_goc: "New Product Test",
        ten_hien_thi: "Sản phẩm kho mới",
        ten_en: "New Warehouse Product",
        danh_muc: "tinh-chat",
        gia_ban: 250000,
      },
    });
    expect(taoMoi.sanPham.hien_thi).toBe(false);
    expect(taoMoi.sanPham.gia_ban).toBe(250000);

    // Mã mới thiếu thương hiệu: báo lỗi, không tự điền "LOPOE" (Claude 21/11)
    await expect(
      actionSuaSanPhamKho("thu:kho", {
        id: "KHO-TEST-NEW-02",
        thayDoi: { ten_hien_thi: "Thiếu thương hiệu", danh_muc: "tinh-chat" },
      }),
    ).rejects.toThrow(/cần đủ thương hiệu/);
  });

  it("TIÊU CHÍ XONG: Mỗi trường đổi sinh một dòng lịch sử; Đã xem chuyển AI -> nguoi và đồng bộ web", async () => {
    const kq = await actionSuaSanPhamKho("thu:kho", {
      id: "LOPOE-AMP",
      thayDoi: {
        ten_en: "LOPOE Soothing Ampoule 50ml EN",
        mo_ta_en: "Balances and calms sensitive skin.",
        van_de: ["cap-am", "lam-diu"],
      },
    });

    expect(kq.sanPham.ten_en).toBe("LOPOE Soothing Ampoule 50ml EN");
    expect(kq.sanPham.nguon_truong.ten_en?.nguon).toBe("nguoi");

    const ls = await actionLayLichSuSanPham("thu:kho", "LOPOE-AMP");
    const cacTruongDaGhi = ls.map((x) => x.truong);
    expect(cacTruongDaGhi).toContain("ten_en");
    expect(cacTruongDaGhi).toContain("mo_ta_en");
    expect(cacTruongDaGhi).toContain("van_de");

    // Web khách dev đọc được ten_en / mo_ta_en mới từ server
    const khachDev = await actionLayDuLieuKhachDev();
    const spKhach = khachDev?.sanPham.find((s) => s.id === "LOPOE-AMP") as
      | (Record<string, unknown> & { id: string })
      | undefined;
    expect(spKhach?.ten_en).toBe("LOPOE Soothing Ampoule 50ml EN");

    // Đánh dấu "Đã xem" trên sản phẩm có nhãn AI (LOPOE-CR)
    const xemAi = await actionDanhDauDaXemAi("thu:kho", {
      id: "LOPOE-CR",
      cacTruong: ["ten_en"],
    });
    expect(xemAi.sanPham.nguon_truong.ten_en?.nguon).toBe("nguoi");
  });

  it("Xác thực quyền kho/quan_tri, lọc bảng & không có mã #hex trong BangNhanVien hoặc trang kho", async () => {
    await expect(xacThucKhoHoacQuanTri(null)).rejects.toThrow();
    await expect(xacThucKhoHoacQuanTri("thu:nhan_vien")).rejects.toThrow(
      /kho hoặc quản trị/i,
    );
    await expect(actionTaiSanPhamKho("thu:nhan_vien")).rejects.toThrow(
      /kho hoặc quản trị/i,
    );

    const khoAuth = await xacThucKhoHoacQuanTri("thu:kho");
    expect(khoAuth.vaiTro).toBe("kho");
    const adminAuth = await xacThucKhoHoacQuanTri("thu:quan_tri");
    expect(adminAuth.vaiTro).toBe("quan_tri");

    const mau = taoDanhSachMau();
    mau[1] = { ...mau[1], anh: null };

    expect(locDanhSachSanPhamKho(mau, { aiCanXem: true }).map((x) => x.id)).toEqual([
      mau[0].id,
    ]);
    expect(locDanhSachSanPhamKho(mau, { thieuAnh: true }).map((x) => x.id)).toEqual([
      mau[1].id,
    ]);
    expect(locDanhSachSanPhamKho(mau, { thieuEn: true })).toHaveLength(
      mau.length,
    );

    // Kiểm tra không còn mã #hex viết cứng trong BangNhanVien và /quan-tri/san-pham
    for (const filePath of [
      "app/nhan-vien/BangNhanVien.tsx",
      "app/quan-tri/san-pham/SanPhamKhoClient.tsx",
    ]) {
      const noiDung = fs.readFileSync(
        path.resolve(process.cwd(), filePath),
        "utf8",
      );
      expect(
        noiDung.match(/#[0-9A-Fa-f]{3,8}\b/g) || [],
        `${filePath} vẫn còn mã #hex`,
      ).toEqual([]);
    }
  });
});
