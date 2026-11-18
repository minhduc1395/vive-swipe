import { describe, expect, it } from "vitest";
import { dangNhapNhanVien } from "@/lib/nhan-vien/auth";
import {
  capNhatTrangThaiDon,
  layDanhSachDonGiuHangHomNay,
  layDonGiuHangTheoMa,
} from "@/lib/giu-hang/kho-giu-hang";

describe("W015 · Trang nhân viên (Nghiệp vụ quầy booth)", () => {
  it("TIÊU CHÍ XONG: Khách không vào được trang nếu không có tài khoản nhân viên", async () => {
    // Đăng nhập với mật khẩu sai hoặc thông tin không hợp lệ
    const res = await dangNhapNhanVien("khach@gmail.com", "sai-mat-khau");
    expect(res.ok).toBe(false);
    expect(res.loi).toContain("không chính xác");

    // Đăng nhập hợp lệ với tài khoản booth
    const hopLe = await dangNhapNhanVien("booth@vive.vn", "booth123");
    expect(hopLe.ok).toBe(true);
    expect(hopLe.phien?.ten).toBe("Quầy VIVE");
    expect(hopLe.phien?.vaiTro).toBe("nhan_vien");
  });

  it("danh sách giữ hàng hôm nay có đủ các đơn mẫu theo trạng thái", async () => {
    const ds = await layDanhSachDonGiuHangHomNay();
    expect(ds.length).toBeGreaterThanOrEqual(4);

    const coMoi = ds.some((d) => d.trangThai === "moi");
    const coDaSoan = ds.some((d) => d.trangThai === "da_soan");
    expect(coMoi).toBe(true);
    expect(coDaSoan).toBe(true);
  });

  it("TIÊU CHÍ XONG: Nhân viên làm trọn: tìm mã -> Đã soạn -> Đã lấy có ghi log người và giờ", async () => {
    const ma = "VIVE-4821";
    // 1. Tìm thấy mã
    const donTruoc = await layDonGiuHangTheoMa(ma);
    expect(donTruoc).not.toBeNull();
    expect(donTruoc?.ma).toBe(ma);

    // 2. Chuyển sang Đã soạn
    const daSoanThanhCong = await capNhatTrangThaiDon(ma, "da_soan", "Thu Trang");
    expect(daSoanThanhCong).toBe(true);

    const donSauSoan = await layDonGiuHangTheoMa(ma);
    expect(donSauSoan?.trangThai).toBe("da_soan");
    expect(donSauSoan?.ghiChu).toContain("Đã soạn bởi Thu Trang lúc");

    // 3. Chuyển sang Đã lấy
    const daLayThanhCong = await capNhatTrangThaiDon(ma, "da_lay", "Thu Trang");
    expect(daLayThanhCong).toBe(true);

    const donSauLay = await layDonGiuHangTheoMa(ma);
    expect(donSauLay?.trangThai).toBe("da_lay");
    expect(donSauLay?.ghiChu).toContain("Đã lấy bởi Thu Trang lúc");
  });
});
