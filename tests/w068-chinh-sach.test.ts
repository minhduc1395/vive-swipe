import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import viChinhSach from "@/messages/vi/chinh-sach.json";
import enChinhSach from "@/messages/en/chinh-sach.json";

const CO_DAU_VI =
  /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơờớởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

type Cay = { [k: string]: string | Cay };

function lietKeKhoa(cay: Cay, tienTo = ""): string[] {
  return Object.entries(cay).flatMap(([k, v]) =>
    typeof v === "string" ? [tienTo + k] : lietKeKhoa(v, `${tienTo}${k}.`),
  );
}

describe("W068 · /chinh-sach theo rà pháp lý LEG-002", () => {
  it("khóa vi và en khớp nhau 100%, bản en không có ký tự tiếng Việt", () => {
    expect(lietKeKhoa(enChinhSach as Cay).sort()).toEqual(
      lietKeKhoa(viChinhSach as Cay).sort(),
    );
    expect(JSON.stringify(enChinhSach).match(CO_DAU_VI)).toBeNull();
  });

  it("không còn 'Sở Công Thương' hay 'nội địa Hàn' trong /chinh-sach (VI, EN, TSX)", () => {
    const pageSrc = readFileSync(
      join(process.cwd(), "app/(khach)/chinh-sach/page.tsx"),
      "utf8",
    );
    const nguon = [
      JSON.stringify(viChinhSach),
      JSON.stringify(enChinhSach),
      pageSrc,
    ].join("\n");

    expect(nguon).not.toMatch(/Sở Công Thương/i);
    expect(nguon).not.toMatch(/nội địa Hàn/i);
  });

  it("job #137: có câu khách dưới 16 tuổi ở mục 1 (VI & EN)", () => {
    expect(viChinhSach.baoMat.treEm.noiDung).toBe(
      "Khách dưới 16 tuổi cần cha mẹ hoặc người giám hộ đồng ý trước khi giữ hàng.",
    );
    expect(enChinhSach.baoMat.treEm.noiDung).toBe(
      "Customers under 16 need consent from a parent or guardian before reserving products.",
    );
  });

  it("đủ nội dung P2 bảo mật dữ liệu cá nhân (VI & EN)", () => {
    const viBaoMat = JSON.stringify(viChinhSach.baoMat);
    const enBaoMat = JSON.stringify(enChinhSach.baoMat);

    expect(viBaoMat).toContain("Công ty CP Giải pháp Quốc tế Việt Hàn");
    expect(viBaoMat).toContain("12 tháng");
    expect(viBaoMat).toContain("Supabase");
    expect(viBaoMat).toContain("Google Cloud");
    expect(viBaoMat).toContain("Nhật Bản");
    expect(viBaoMat).toContain("72 giờ làm việc");
    expect(viBaoMat).toContain("không dùng cho mục đích quảng cáo");

    expect(enBaoMat).toContain("Viet Han International Solutions JSC");
    expect(enBaoMat).toContain("12 months");
    expect(enBaoMat).toContain("Supabase");
    expect(enBaoMat).toContain("Google Cloud");
    expect(enBaoMat).toContain("Japan");
    expect(enBaoMat).toContain("72 working hours");
    expect(enBaoMat).toContain("not used for advertising");
  });

  it("đúng câu P3 khuyến mại và P4 nhãn phụ tiếng Việt (VI & EN)", () => {
    expect(viChinhSach.doiTra.khuyenMai.noiDung).toBe(
      "Chương trình khuyến mại áp dụng theo thời gian và điều kiện công bố tại quầy và trên web; nhân viên xác nhận khi thanh toán.",
    );
    expect(viChinhSach.doiTra.nhanPhu.noiDung).toBe(
      "Sản phẩm bán tại quầy có nhãn phụ tiếng Việt theo quy định.",
    );
    expect(enChinhSach.doiTra.khuyenMai.noiDung).toContain(
      "published at the counter and on the website",
    );
    expect(enChinhSach.doiTra.nhanPhu.noiDung).toContain(
      "Vietnamese supplementary labels",
    );
  });

  it("đủ 5 ý Điều khoản sử dụng (VI & EN)", () => {
    const viDk = JSON.stringify(viChinhSach.dieuKhoan);
    const enDk = JSON.stringify(enChinhSach.dieuKhoan);

    expect(viDk).toContain("giá tại quầy khi thanh toán là giá cuối");
    expect(viDk).toContain("minh họa");
    expect(viDk).toContain("3 đơn");
    expect(viDk).toContain("lạm dụng");
    expect(viDk).toContain("luật Việt Nam");

    expect(enDk).toContain("counter price at checkout is final");
    expect(enDk).toContain("illustration");
    expect(enDk).toContain("3 open reservations");
    expect(enDk).toContain("abuse");
    expect(enDk).toContain("laws of Vietnam");
  });

  it("giữ điều kiện ẩn số điện thoại khi DOANH_NGHIEP.so_dien_thoai là null ở /chinh-sach và ChanTrang", () => {
    const pageSrc = readFileSync(
      join(process.cwd(), "app/(khach)/chinh-sach/page.tsx"),
      "utf8",
    );
    const chanTrangSrc = readFileSync(
      join(process.cwd(), "components/ChanTrang.tsx"),
      "utf8",
    );

    expect(pageSrc).toContain("DOANH_NGHIEP.so_dien_thoai &&");
    expect(chanTrangSrc).toContain("DOANH_NGHIEP.so_dien_thoai &&");
  });
});
