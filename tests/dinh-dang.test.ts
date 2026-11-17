import { describe, expect, it } from "vitest";
import {
  chuanHoaTimKiem,
  dinhDangTien,
  dinhDangTienGio,
} from "@/lib/dinh-dang";

describe("dinh-dang", () => {
  it("định dạng số tiền theo dấu chấm hàng nghìn, không có đ", () => {
    expect(dinhDangTien(0)).toBe("0");
    expect(dinhDangTien(186000)).toBe("186.000");
    expect(dinhDangTien(1235000)).toBe("1.235.000");
    expect(dinhDangTien(-50000)).toBe("-50.000");
  });

  it("định dạng số tiền trong giỏ có hậu tố đ", () => {
    expect(dinhDangTienGio(186000)).toBe("186.000đ");
    expect(dinhDangTienGio(1235000)).toBe("1.235.000đ");
  });

  it("chuẩn hóa chuỗi tiếng Việt bỏ dấu để tìm kiếm", () => {
    expect(chuanHoaTimKiem("Phấn Nước Cica")).toBe("phan nuoc cica");
    expect(chuanHoaTimKiem("Độ ẩm Đậm")).toBe("do am dam");
  });
});
