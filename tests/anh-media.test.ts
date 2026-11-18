import { describe, expect, it } from "vitest";
import { duongDanAnh, SAN_PHAM, laySanPhamHienThi } from "@/lib/data";

const BASE_MEDIA_URL =
  "https://dsrejhghgbvnwgxpdhee.supabase.co/storage/v1/object/public/media/san-pham/LOPOE-CF";

describe("duongDanAnh", () => {
  it("giữ nguyên đường dẫn local cũ /products/... ở mọi cỡ", () => {
    const legacy = "/products/LOPOE-CF.png";
    expect(duongDanAnh(legacy)).toBe(legacy);
    expect(duongDanAnh(legacy, "the")).toBe(legacy);
    expect(duongDanAnh(legacy, "nho")).toBe(legacy);
    expect(duongDanAnh(legacy, "the-nho")).toBe(legacy);
  });

  it("chuyển đổi qua lại giữa /the.webp và /the-nho.webp cho URL kho media Supabase", () => {
    const urlThe = `${BASE_MEDIA_URL}/the.webp`;
    const urlNho = `${BASE_MEDIA_URL}/the-nho.webp`;

    expect(duongDanAnh(urlThe, "the")).toBe(urlThe);
    expect(duongDanAnh(urlThe, "nho")).toBe(urlNho);
    expect(duongDanAnh(urlThe, "the-nho")).toBe(urlNho);
    expect(duongDanAnh(urlNho, "the")).toBe(urlThe);
  });

  it("giữ nguyên query string (?v=...) và hash khi đổi kích thước ảnh", () => {
    const urlTheV2 = `${BASE_MEDIA_URL}/the.webp?v=2#main`;
    expect(duongDanAnh(urlTheV2, "the")).toBe(urlTheV2);
    expect(duongDanAnh(urlTheV2, "nho")).toBe(
      `${BASE_MEDIA_URL}/the-nho.webp?v=2#main`
    );
    expect(duongDanAnh(urlTheV2, "the-nho")).toBe(
      `${BASE_MEDIA_URL}/the-nho.webp?v=2#main`
    );
  });

  it("giữ nguyên các URL đầy đủ khác không kết thúc bằng /the.webp", () => {
    const customUrl = "https://cdn.example.com/assets/serum.png?size=lg";
    expect(duongDanAnh(customUrl, "the")).toBe(customUrl);
    expect(duongDanAnh(customUrl, "nho")).toBe(customUrl);
  });

  it("trả về null với giá trị rỗng hoặc khoảng trắng", () => {
    expect(duongDanAnh(undefined)).toBeNull();
    expect(duongDanAnh(null)).toBeNull();
    expect(duongDanAnh("")).toBeNull();
    expect(duongDanAnh("   ")).toBeNull();
  });

  it("giữ nguyên quy tắc ẩn sản phẩm không có ảnh trong laySanPhamHienThi", () => {
    const khongAnh = { ...SAN_PHAM[0], hien_thi: true, con_hang: "true" as const, anh: "" };
    const coUrlKhoMedia = {
      ...SAN_PHAM[0],
      id: "TEST-MEDIA-URL",
      hien_thi: true,
      con_hang: "true" as const,
      anh: `${BASE_MEDIA_URL}/the.webp`,
    };
    const ketQua = laySanPhamHienThi([khongAnh, coUrlKhoMedia]);
    expect(ketQua.map((sp) => sp.id)).toEqual(["TEST-MEDIA-URL"]);
  });
});
