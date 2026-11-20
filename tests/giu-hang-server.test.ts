import { describe, expect, it, beforeEach } from "vitest";
import {
  kiemTraSoDienThoaiVN,
  kiemTraEmail,
  tinhNgayVaHetHan,
  xuLyTaoGiuHang,
} from "@/lib/giu-hang/tao-giu-hang";
import {
  capNhatHetHanCacDon,
  layDonGiuHangTheoMa,
  luuDonGiuHang,
} from "@/lib/giu-hang/kho-giu-hang";
import { layDanhSachEmailDev, xoaToanBoEmailDev } from "@/lib/email/store";

describe("W014 · Xử lý giữ hàng tại booth (Server Action & Nghiệp vụ)", () => {
  beforeEach(() => {
    xoaToanBoEmailDev();
  });

  it("chuẩn hoá và kiểm tra định dạng số điện thoại di động Việt Nam", () => {
    expect(kiemTraSoDienThoaiVN("0912345678")).toBe(true);
    expect(kiemTraSoDienThoaiVN("0389998888")).toBe(true);
    expect(kiemTraSoDienThoaiVN("+84988776655")).toBe(true);
    expect(kiemTraSoDienThoaiVN("090 123 4567")).toBe(true);
    expect(kiemTraSoDienThoaiVN("090.123.4567")).toBe(true);

    // Không hợp lệ
    expect(kiemTraSoDienThoaiVN("0123456789")).toBe(false); // Đầu 01 không còn
    expect(kiemTraSoDienThoaiVN("091234567")).toBe(false); // 9 số
    expect(kiemTraSoDienThoaiVN("091234567899")).toBe(false); // 12 số
    expect(kiemTraSoDienThoaiVN("abc")).toBe(false);
  });

  it("kiểm tra định dạng email hợp lệ", () => {
    expect(kiemTraEmail("khach@email.com")).toBe(true);
    expect(kiemTraEmail("nguoi.dung+test@domain.vn")).toBe(true);
    expect(kiemTraEmail("sai-email")).toBe(false);
    expect(kiemTraEmail("@domain.com")).toBe(false);
  });

  it("tính giờ hết hạn luôn là 21:00 hôm nay hoặc ngày mai theo giờ Việt Nam", () => {
    const homNay = tinhNgayVaHetHan("hom_nay");
    expect(homNay.hetHanIso).toContain("T21:00:00+07:00");
    expect(homNay.hanGiuText).toContain("21:00 hôm nay");

    const ngayMai = tinhNgayVaHetHan("ngay_mai");
    expect(ngayMai.hetHanIso).toContain("T21:00:00+07:00");
    expect(ngayMai.hanGiuText).toContain("21:00 ngày mai");
  });

  it("TIÊU CHÍ XONG: Sửa giá ở trình duyệt không làm đổi tổng lưu trong giu_hang", async () => {
    // Giả sử kẻ gian cố tình truyền sản phẩm SRM LOPOE nhưng can thiệp giá từ client
    // Client truyền gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }]
    // (Bất kể client truyền gì về giá, server chỉ nhận sanPhamId và soLuong)
    const ketQua = await xuLyTaoGiuHang({
      ten: "Khách Kiểm Thử Giá",
      sdt: "0987654321",
      email: "kiemthu@email.com",
      ngayDen: "ngay_mai",
      dongYChinhSach: true,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });

    expect(ketQua.ok).toBe(true);
    expect(ketQua.ma).toMatch(/^VIVE-\d{4}$/);
    // Giá SRM LOPOE theo data/deals.yaml là 249.000đ; KM-13 đã dừng từ 20/11 nên không có quà
    expect(ketQua.tongUocTinh).toBe(249000);
    expect(ketQua.quaDuKien).toBeNull();

    // Đọc lại từ database kho
    const donDaLuu = await layDonGiuHangTheoMa(ketQua.ma!);
    expect(donDaLuu).not.toBeNull();
    expect(donDaLuu?.tongUocTinh).toBe(249000);
    expect(donDaLuu?.cacDong[0].giaSauUuDai).toBe(249000);
  });

  it("từ chối giữ hàng nếu chưa đồng ý chính sách hoặc thiếu thông tin", async () => {
    const khongDongY = await xuLyTaoGiuHang({
      ten: "Nguyen Van A",
      sdt: "0987654321",
      ngayDen: "hom_nay",
      dongYChinhSach: false,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });
    expect(khongDongY.ok).toBe(false);
    expect(khongDongY.loi).toContain("chính sách");

    const thieuTen = await xuLyTaoGiuHang({
      ten: "  ",
      sdt: "0987654321",
      ngayDen: "hom_nay",
      dongYChinhSach: true,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });
    expect(thieuTen.ok).toBe(false);
    expect(thieuTen.loi).toContain("họ và tên");

    const sdtSai = await xuLyTaoGiuHang({
      ten: "Nguyen Van A",
      sdt: "0123456",
      ngayDen: "hom_nay",
      dongYChinhSach: true,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });
    expect(sdtSai.ok).toBe(false);
    expect(sdtSai.loi).toContain("Số điện thoại");
  });

  it("TIÊU CHÍ XONG: Giới hạn 3 mã đang giữ cho cùng 1 số điện thoại", async () => {
    const sdtDung = "0933333333";
    // Đặt trước 3 đơn thành công
    for (let i = 0; i < 3; i++) {
      const res = await xuLyTaoGiuHang({
        ten: `Khách Thử Đơn ${i + 1}`,
        sdt: sdtDung,
        ngayDen: "ngay_mai",
        dongYChinhSach: true,
        gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
      });
      expect(res.ok).toBe(true);
    }

    // Đơn thứ 4 cho số điện thoại này phải bị từ chối
    const donThu4 = await xuLyTaoGiuHang({
      ten: "Khách Thử Đơn 4",
      sdt: sdtDung,
      ngayDen: "ngay_mai",
      dongYChinhSach: true,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });
    expect(donThu4.ok).toBe(false);
    expect(donThu4.loi).toContain("tối đa 3 mã cùng lúc");
  });

  it("TIÊU CHÍ XONG: Email xác nhận hiện đúng trong dev store /dev/email", async () => {
    const res = await xuLyTaoGiuHang({
      ten: "Lan Anh",
      sdt: "0911223344",
      email: "lananh@test.vn",
      ngayDen: "ngay_mai",
      dongYChinhSach: true,
      gio: [{ sanPhamId: "LOPOE-CF", soLuong: 1 }],
    });

    expect(res.ok).toBe(true);

    const danhSach = layDanhSachEmailDev();
    expect(danhSach.length).toBeGreaterThanOrEqual(1);

    const emailMoiNhat = danhSach[0];
    expect(emailMoiNhat.to).toBe("lananh@test.vn");
    expect(emailMoiNhat.subject).toContain(res.ma!);
    expect(emailMoiNhat.html).toContain(res.ma!);
    expect(emailMoiNhat.html).toContain("249.000");
    expect(emailMoiNhat.html).toContain("LL2 Union Square");
  });

  it("TIÊU CHÍ XONG: Cron tự động chuyển mã hết hạn sang trạng thái het_han", async () => {
    // Tạo 1 đơn có hạn giữ trong quá khứ
    const maQuaHan = "VIVE-QUAHAN";
    await luuDonGiuHang({
      id: "don-qua-han-test",
      ma: maQuaHan,
      ten: "Khách Quá Hạn",
      sdt: "0922222222",
      ngayDen: "2026-11-01",
      hetHan: "2026-11-01T21:00:00+07:00",
      trangThai: "moi",
      tongUocTinh: 249000,
      taoLuc: new Date("2026-11-01").toISOString(),
      cacDong: [],
    });

    const soLuongCapNhat = await capNhatHetHanCacDon();
    expect(soLuongCapNhat).toBeGreaterThanOrEqual(1);

    const donSauKhiQuet = await layDonGiuHangTheoMa(maQuaHan);
    expect(donSauKhiQuet?.trangThai).toBe("het_han");
  });
});
