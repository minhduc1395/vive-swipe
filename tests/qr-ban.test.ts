import { describe, expect, it } from "vitest";
import cauHinhThat from "@/data/qr-ban.json";
import { chonDichQr, laDichHopLe, taoUrlDich, type CauHinhQrBan } from "@/lib/goi-y/qr-ban";

const cauHinh: CauHinhQrBan = {
  mac_dinh: "/bat-dau",
  ma: {
    "thu-ngan": "/bat-dau?nguon=qr-thu-ngan",
    ngoai: "https://vive.example.vn/bat-dau?nguon=qr-ngoai",
    xau1: "//evil.com",
    xau2: "javascript:alert(1)",
    xau3: "http://khong-https.com",
    xau4: "/\\evil.com",
    xau5: "https://u:p@evil.com",
    xau6: "",
  },
};

describe("QR để bàn · chọn đích (QD-BOD-027)", () => {
  it("mã đúng trả đích trong web", () => {
    expect(chonDichQr("thu-ngan", cauHinh)).toBe("/bat-dau?nguon=qr-thu-ngan");
  });
  it("mã lạ rơi về mặc định", () => {
    expect(chonDichQr("xyz", cauHinh)).toBe("/bat-dau");
    expect(chonDichQr("constructor", cauHinh)).toBe("/bat-dau");
    expect(chonDichQr("__proto__", cauHinh)).toBe("/bat-dau");
  });
  it("đích https:// đầy đủ được giữ nguyên", () => {
    expect(chonDichQr("ngoai", cauHinh)).toBe("https://vive.example.vn/bat-dau?nguon=qr-ngoai");
  });
  it("đích xấu rơi về mặc định", () => {
    for (const ma of ["xau1", "xau2", "xau3", "xau4", "xau5", "xau6"]) {
      expect(chonDichQr(ma, cauHinh)).toBe("/bat-dau");
    }
  });
  it("mặc định hỏng thì dùng /bat-dau", () => {
    expect(chonDichQr("xyz", { mac_dinh: "//evil.com", ma: {} })).toBe("/bat-dau");
  });
  it("laDichHopLe không nhận kiểu lạ", () => {
    expect(laDichHopLe(undefined)).toBe(false);
    expect(laDichHopLe(5)).toBe(false);
    expect(laDichHopLe(" /bat-dau")).toBe(false);
  });
  it("ghép đường dẫn với origin, giữ link đầy đủ", () => {
    expect(taoUrlDich("/bat-dau?nguon=qr-lopoe", "https://vive-swipe.a.run.app")).toBe(
      "https://vive-swipe.a.run.app/bat-dau?nguon=qr-lopoe",
    );
    expect(taoUrlDich("https://x.vn/a", "https://vive-swipe.a.run.app")).toBe("https://x.vn/a");
  });
  it("data/qr-ban.json thật: hai mã in đều có đích hợp lệ", () => {
    const ch = cauHinhThat as CauHinhQrBan;
    expect(chonDichQr("thu-ngan", ch)).toBe("/bat-dau?nguon=qr-thu-ngan");
    expect(chonDichQr("lopoe", ch)).toBe("/bat-dau?nguon=qr-lopoe");
    expect(chonDichQr("xyz", ch)).toBe("/bat-dau");
  });
});
