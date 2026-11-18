import { describe, expect, it } from "vitest";
import {
  parseChienDichYaml,
  layChienDichHienTai,
  docDanhSachChienDichTuDisk,
  ChienDich,
} from "@/lib/chien-dich";

describe("Chiến dịch - cấu hình và nạp dữ liệu", () => {
  it("nạp thành công file lopoe-better-balance và mac-dinh từ disk kèm vat_the và anh", () => {
    const list = docDanhSachChienDichTuDisk();
    expect(list.length).toBeGreaterThanOrEqual(2);
    const lopoe = list.find((c) => c.ma === "lopoe-better-balance");
    expect(lopoe).toBeDefined();
    expect(lopoe?.ten).toBe("LOPOE Better Balance");
    expect(lopoe?.khoi.length).toBeGreaterThanOrEqual(6);

    const hero = lopoe?.khoi.find((k) => k.loai === "hero");
    expect(hero?.loai).toBe("hero");
    if (hero?.loai === "hero") {
      expect(hero.anh?.length).toBeGreaterThanOrEqual(3);
      expect(hero.vat_the?.length).toBe(3);
    }

    const tieuDiem = lopoe?.khoi.find((k) => k.loai === "tieu-diem");
    expect(tieuDiem).toBeDefined();
    if (tieuDiem?.loai === "tieu-diem") {
      expect(tieuDiem.san_pham_id).toBe("LOPOE-AMP");
      expect(tieuDiem.deal_id).toBe("LOPOE-25");
      expect(tieuDiem.mo_ta || "").not.toContain("hàng rào bảo vệ da");
      const sideObjects = (tieuDiem.vat_the || []).filter(
        (v) => v.id !== "ampoule"
      );
      expect(sideObjects.length).toBe(2);
      for (const s of sideObjects) {
        expect(Math.abs(s.x)).toBeGreaterThan(1.15);
      }
    }

    const macDinh = list.find((c) => c.ma === "mac-dinh");
    expect(macDinh).toBeDefined();
  });

  it("kiểm tra parseChienDichYaml hợp lệ với đầy đủ các khối", () => {
    const sampleYaml = `
ma: dot-test-1
ten: Đợt Test 1
bat_dau: "2026-12-01"
ket_thuc: "2026-12-15"
uu_tien: 20
mau:
  nen: "#F7EEEB"
  nhan: "#E8D2CC"
  chu: "#2B2B2A"
khoi:
  - loai: hero
    kieu: san-pham-3d
    tieu_de: ["TEST", "~Outline", "Normal"]
    anh: ["/chien-dich/lopoe-better-balance/srm.webp"]
    vat_the:
      - id: srm
        anh: "/chien-dich/lopoe-better-balance/srm.webp"
        x: 0.4
        y: 0
        z: 10
        scale: 1
  - loai: tieu-diem
    id: focus-1
    tieu_de: ["Focus", "~Item"]
    san_pham_id: "LOPOE-AMP"
  - loai: bang-chu
    chu: "TEXT CHAY"
  - loai: ra-mat
    tieu_de: "Ra mat tieu de"
  - loai: chuong-trinh
    tieu_de: "Chuong trinh"
    deal: ["COMBO-PINK"]
  - loai: dem-nguoc
    thoi_gian_chot: "2026-12-15T23:59:59"
  - loai: doi-tac
    doi_tac: pawlette
  - loai: video
    tieu_de: "Video review"
    mp4: "/video/sample.mp4"
  - loai: booth
    dia_chi: "Union Square"
`;
    const cd = parseChienDichYaml(sampleYaml);
    expect(cd.ma).toBe("dot-test-1");
    expect(cd.khoi.length).toBe(9);
    expect(cd.khoi[0].loai).toBe("hero");
    expect(cd.khoi[1].loai).toBe("tieu-diem");
    expect(cd.khoi[2].loai).toBe("bang-chu");
    expect(cd.khoi[5].loai).toBe("dem-nguoc");
    expect(cd.khoi[7].loai).toBe("video");
  });

  it("chọn đúng đợt theo ngày (2 đợt khác ngày hiện đúng đợt)", () => {
    const dotA: ChienDich = {
      ma: "dot-thang-11",
      ten: "Đợt Tháng 11",
      bat_dau: "2026-11-01",
      ket_thuc: "2026-11-30",
      uu_tien: 10,
      mau: { nen: "#F7EEEB", nhan: "#E8D2CC", chu: "#2B2B2A" },
      khoi: [
        {
          loai: "hero",
          kieu: "san-pham-3d",
          tieu_de: ["THANG 11"],
        },
      ],
    };

    const dotB: ChienDich = {
      ma: "dot-black-friday",
      ten: "Đợt Black Friday",
      bat_dau: "2026-12-01",
      ket_thuc: "2026-12-05",
      uu_tien: 50,
      mau: { nen: "#2B2B2A", nhan: "#E8D2CC", chu: "#FFFFFF" },
      khoi: [
        {
          loai: "hero",
          kieu: "san-pham-3d",
          tieu_de: ["BLACK FRIDAY"],
        },
      ],
    };

    const danhSach = [dotA, dotB];

    // Ngày 18/11/2026 phải chọn dotA
    const cd1 = layChienDichHienTai("2026-11-18", danhSach);
    expect(cd1?.ma).toBe("dot-thang-11");

    // Ngày 03/12/2026 phải chọn dotB
    const cd2 = layChienDichHienTai("2026-12-03", danhSach);
    expect(cd2?.ma).toBe("dot-black-friday");
  });

  it("ưu tiên đợt có uu_tien cao hơn khi trùng ngày", () => {
    const dotThuong: ChienDich = {
      ma: "dot-thuong",
      ten: "Đợt Thường",
      bat_dau: "2026-11-01",
      ket_thuc: "2026-11-30",
      uu_tien: 5,
      mau: { nen: "#F7EEEB", nhan: "#E8D2CC", chu: "#2B2B2A" },
      khoi: [{ loai: "hero", kieu: "san-pham-3d", tieu_de: ["THUONG"] }],
    };

    const dotDacBiet: ChienDich = {
      ma: "dot-dac-biet",
      ten: "Đợt Đặc Biệt",
      bat_dau: "2026-11-15",
      ket_thuc: "2026-11-20",
      uu_tien: 20,
      mau: { nen: "#F7EEEB", nhan: "#E8D2CC", chu: "#2B2B2A" },
      khoi: [{ loai: "hero", kieu: "san-pham-3d", tieu_de: ["DAC BIET"] }],
    };

    const cd = layChienDichHienTai("2026-11-18", [dotThuong, dotDacBiet]);
    expect(cd?.ma).toBe("dot-dac-biet");
  });

  it("trả về đợt mặc định nếu ngày không thuộc đợt nào", () => {
    const macDinh: ChienDich = {
      ma: "mac-dinh",
      ten: "Mặc Định",
      bat_dau: "2026-01-01",
      ket_thuc: "2026-12-31",
      uu_tien: 1,
      mau: { nen: "#F7EEEB", nhan: "#E8D2CC", chu: "#2B2B2A" },
      khoi: [{ loai: "hero", kieu: "san-pham-3d", tieu_de: ["DEFAULT"] }],
    };

    const dotKhac: ChienDich = {
      ma: "dot-ngan",
      ten: "Đợt Ngắn",
      bat_dau: "2026-05-01",
      ket_thuc: "2026-05-10",
      uu_tien: 10,
      mau: { nen: "#F7EEEB", nhan: "#E8D2CC", chu: "#2B2B2A" },
      khoi: [{ loai: "hero", kieu: "san-pham-3d", tieu_de: ["NGAN"] }],
    };

    const cd = layChienDichHienTai("2027-01-01", [dotKhac, macDinh]);
    expect(cd?.ma).toBe("mac-dinh");
  });
});
