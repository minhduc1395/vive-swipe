import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SAN_PHAM, DEALS } from "@/lib/data";
import { kiemTraBatDeal, capNhatTrangThaiDeal } from "@/lib/admin/deal-rules";
import { parseKiotVietCsv, apDungCapNhatTon } from "@/lib/admin/kiotviet";
import { xacThucQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import {
  actionCapNhatDeal,
  actionCapNhatSanPham,
  actionGuiEmailThuQuanTri,
  actionLayDuLieuKhachDev,
  actionTaiDuLieuQuanTri,
  actionXacNhanNhapTonKiotViet,
} from "@/app/quan-tri/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("W017 · Trang quản trị và xác thực quyền server", () => {
  it("xacThucQuanTri chặn khách chưa đăng nhập và chặn nhân viên thường", async () => {
    await expect(xacThucQuanTri(null)).rejects.toThrow(/Chưa đăng nhập quản trị/i);
    await expect(xacThucQuanTri("thu:nhan_vien")).rejects.toThrow(
      /Chỉ tài khoản quản trị/i,
    );
    await expect(xacThucQuanTri("token-khong-hop-le")).rejects.toThrow();

    const admin = await xacThucQuanTri("thu:quan_tri");
    expect(admin.vaiTro).toBe("quan_tri");
  });

  it("TIÊU CHÍ XONG: Không bật được deal may rủi khi da_dang_ky = false", () => {
    const dealMayRui = {
      ...DEALS[0],
      id: "MR-TEST",
      loai: "may_rui" as const,
      may_rui: true,
      da_dang_ky: false,
      hien_thi: false,
    };

    const kt = kiemTraBatDeal(dealMayRui, true);
    expect(kt.hopLe).toBe(false);
    expect(kt.loi).toContain("Sở Công Thương");

    expect(() => capNhatTrangThaiDeal(dealMayRui, true)).toThrow();
    expect(capNhatTrangThaiDeal(dealMayRui, false).hien_thi).toBe(false);

    const dealDaDangKy = { ...dealMayRui, da_dang_ky: true };
    expect(kiemTraBatDeal(dealDaDangKy, true).hopLe).toBe(true);
  });

  it("TIÊU CHÍ XONG: Đọc file CSV KiotViet mẫu cập nhật đúng tồn kho", () => {
    const csvPath = path.resolve(
      process.cwd(),
      "tests/fixtures/mau-kiotviet-ton.csv",
    );
    const csv = fs.readFileSync(csvPath, "utf-8");

    const kq = parseKiotVietCsv(csv, SAN_PHAM);
    expect(kq.thanhCong).toBe(true);
    expect(kq.soLuongKhop).toBe(5);
    expect(kq.soLuongVeKhong).toBe(1);

    const sau = apDungCapNhatTon(SAN_PHAM, kq.thayDoi);
    const lopoecf = sau.find((s) => s.id === "LOPOE-CF");
    expect(lopoecf?.ton).toBe(0);
    expect(lopoecf?.con_hang).toBe("false");

    const repel = sau.find((s) => s.barcode === "8809198846184");
    expect(repel?.ton).toBe(20);
    expect(repel?.con_hang).toBe("true");
  });

  it("Server Actions chặn nhân viên thường và ghi thay đổi deal/sản phẩm/CSV vào kho server", async () => {
    await expect(actionTaiDuLieuQuanTri(null)).rejects.toThrow();
    await expect(actionTaiDuLieuQuanTri("thu:nhan_vien")).rejects.toThrow();

    const csvPath = path.resolve(
      process.cwd(),
      "tests/fixtures/mau-kiotviet-ton.csv",
    );
    const csv = fs.readFileSync(csvPath, "utf-8");
    await expect(
      actionXacNhanNhapTonKiotViet("thu:nhan_vien", csv),
    ).rejects.toThrow();

    // Admin nhập tồn CSV mẫu
    const resCsv = await actionXacNhanNhapTonKiotViet("thu:quan_tri", csv);
    expect(resCsv.ketQua.soLuongKhop).toBe(5);
    const cfSauCsv = resCsv.sanPham.find((s) => s.id === "LOPOE-CF");
    expect(cfSauCsv?.ton).toBe(0);
    expect(cfSauCsv?.con_hang).toBe("false");

    // Web khách đọc được thay đổi từ kho server (không cần localStorage)
    const duLieuKhach = await actionLayDuLieuKhachDev();
    expect(duLieuKhach).not.toBeNull();
    expect(duLieuKhach?.sanPham.find((s) => s.id === "LOPOE-CF")?.ton).toBe(0);

    // Chặn bật deal may rủi trên Server Action
    const dealMayRuiKho = DEALS.find((d) => d.may_rui && !d.da_dang_ky);
    if (dealMayRuiKho) {
      await expect(
        actionCapNhatDeal("thu:quan_tri", {
          id: dealMayRuiKho.id,
          hienThi: true,
        }),
      ).rejects.toThrow(/Sở Công Thương/i);
    }

    // Sửa tồn lại về 10 và kiểm tra lịch sử su_kien
    const spUpdated = await actionCapNhatSanPham("thu:quan_tri", {
      id: "LOPOE-CF",
      ton: 10,
    });
    expect(spUpdated.ton).toBe(10);
    expect(spUpdated.con_hang).toBe("true");

    const dealThuong = DEALS.find((d) => !d.may_rui);
    if (dealThuong) {
      const updatedDeal = await actionCapNhatDeal("thu:quan_tri", {
        id: dealThuong.id,
        hetQua: true,
      });
      expect(updatedDeal.het_qua).toBe(true);
      await actionCapNhatDeal("thu:quan_tri", {
        id: dealThuong.id,
        hetQua: dealThuong.het_qua,
      });
    }

    const qtData = await actionTaiDuLieuQuanTri("thu:quan_tri");
    expect(qtData.lichSu.some((l) => l.ten === "quan_tri_nhap_ton_kiotviet")).toBe(
      true,
    );

    // Chặn gửi email khi chưa cấu hình VIVE_BAT_GUI_EMAIL=1 (chờ W018)
    await expect(
      actionGuiEmailThuQuanTri("thu:quan_tri", {
        tieuDe: "Test",
        noiDung: "Test",
        emailNhan: "test@example.com",
        guiThat: false,
      }),
    ).rejects.toThrow(/Chưa gửi được email: cần tên miền và task W018/i);
  });
});
