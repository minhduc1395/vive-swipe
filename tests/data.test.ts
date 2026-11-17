import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEALS,
  SAN_PHAM,
  hienThi,
  layDealHienThi,
  laySanPhamHienThi,
  parseDealsYaml,
  parseProductsCsv,
  type Deal,
  type SanPham,
} from "@/lib/data";

describe("lớp dữ liệu tĩnh (W007)", () => {
  it("nạp đủ 149 sản phẩm và 20 deal có kiểu từ data/", () => {
    expect(SAN_PHAM).toHaveLength(149);
    expect(DEALS).toHaveLength(20);

    const lopoeCf = SAN_PHAM.find((sp) => sp.id === "LOPOE-CF");
    expect(lopoeCf).toBeDefined();
    expect(lopoeCf?.gia_ban).toBe(249000);
    expect(lopoeCf?.anh).toBe("/products/LOPOE-CF.webp");

    const lopoe25 = DEALS.find((d) => d.id === "LOPOE-25");
    expect(lopoe25?.bat_dau).toBe("2026-11-14");
    expect(lopoe25?.ket_thuc).toBe("2026-11-29");
  });

  it("lọc đúng 129 sản phẩm hiển thị và loại bỏ món hết hàng, ẩn hoặc thiếu ảnh", () => {
    expect(laySanPhamHienThi()).toHaveLength(129);

    const mau: SanPham[] = [
      {
        ...SAN_PHAM[0],
        id: "OK",
        hien_thi: true,
        con_hang: "true",
        anh: "/products/OK.webp",
      },
      {
        ...SAN_PHAM[0],
        id: "CHUA_RO_CON_HANG",
        hien_thi: true,
        con_hang: "chua-ro",
        anh: "/products/OK2.webp",
      },
      {
        ...SAN_PHAM[0],
        id: "AN",
        hien_thi: false,
        con_hang: "true",
        anh: "/products/AN.webp",
      },
      {
        ...SAN_PHAM[0],
        id: "HET_HANG",
        hien_thi: true,
        con_hang: "false",
        anh: "/products/HET.webp",
      },
      {
        ...SAN_PHAM[0],
        id: "THIEU_ANH",
        hien_thi: true,
        con_hang: "true",
        anh: null,
      },
      {
        ...SAN_PHAM[0],
        id: "ANH_RONG",
        hien_thi: true,
        con_hang: "true",
        anh: "   ",
      },
    ];

    expect(laySanPhamHienThi(mau).map((s) => s.id)).toEqual([
      "OK",
      "CHUA_RO_CON_HANG",
    ]);
  });

  it("deal may rủi chưa đăng ký không bao giờ hiện, kể cả khi hien_thi bị bật nhầm", () => {
    const dealMayRui = DEALS.filter((d) => d.may_rui);
    expect(dealMayRui.length).toBeGreaterThanOrEqual(4);

    for (const d of dealMayRui) {
      const biBatNham: Deal = {
        ...d,
        hien_thi: true,
        da_dang_ky: false,
        bat_dau: "2026-11-14",
        ket_thuc: "2026-11-29",
      };
      expect(hienThi(biBatNham, "2026-11-17")).toBe(false);
    }

    const mayRuiDaDangKy: Deal = {
      ...dealMayRui[0],
      hien_thi: true,
      da_dang_ky: true,
      bat_dau: "2026-11-14",
      ket_thuc: "2026-11-29",
    };
    expect(hienThi(mayRuiDaDangKy, "2026-11-17")).toBe(true);
  });

  it("ngày 30/11/2026 không deal pop-up nào hiện", () => {
    expect(layDealHienThi(DEALS, "2026-11-30")).toEqual([]);
    expect(layDealHienThi(DEALS, "2026-11-13")).toEqual([]);
    expect(layDealHienThi(DEALS, "2026-11-17").length).toBeGreaterThan(0);
  });

  it("báo lỗi rõ ràng khi CSV hoặc YAML sai định dạng", () => {
    expect(() => parseProductsCsv("id,ten\n1,abc")).toThrow(/thiếu cột bắt buộc/);

    const csvSaiGia = [
      "id,barcode,thuong_hieu,ten_goc,ten_hien_thi,quy_cach,gia_goc,gia_ban,giam_tren_tag,danh_muc,van_de,thanh_phan,loai_da,con_hang,ton,hien_thi,anh,ghi_chu",
      "SP1,SP1,Test,Ten,Ten,50ml,,khong-phai-so,,tinh-chat,,,,true,,true,SP1.webp,",
    ].join("\n");
    expect(() => parseProductsCsv(csvSaiGia)).toThrow(/gia_ban.*số nguyên/);

    expect(() => parseDealsYaml("deals:\n  - id: [broken")).toThrow(
      /YAML deal sai cú pháp/
    );
    expect(() =>
      parseDealsYaml(
        "deals:\n  - id: D1\n    ten: Test\n    loai: khong_hop_le\n    trang_thai: DA_DUYET\n    may_rui: false\n    hien_thi: true"
      )
    ).toThrow(/YAML deal \(D1\)/);
  });

  it("script build-data thoát lỗi rõ ràng khi file CSV/YAML sai định dạng", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vive-w007-"));
    try {
      const badCsv = path.join(tmpDir, "bad.csv");
      const okYaml = path.join(tmpDir, "ok.yaml");
      fs.writeFileSync(badCsv, "id,barcode\n1,2\n", "utf8");
      fs.writeFileSync(okYaml, "deals: []\n", "utf8");

      let loi: unknown = null;
      try {
        execFileSync(
          process.execPath,
          [
            "-e",
            `import { buildStaticData } from "./scripts/build-data.mjs"; buildStaticData({ csvPath: ${JSON.stringify(badCsv)}, yamlPath: ${JSON.stringify(okYaml)}, outDir: ${JSON.stringify(tmpDir)} });`,
          ],
          { cwd: process.cwd(), stdio: "pipe" }
        );
      } catch (e) {
        loi = e;
      }
      expect(loi).toBeTruthy();
      const stderr = String((loi as { stderr?: Buffer }).stderr ?? "");
      expect(stderr).toMatch(/thiếu cột bắt buộc/);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
