import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEALS,
  DOANH_NGHIEP,
  SAN_PHAM,
  laySanPhamHienThi,
  timDealTheoId,
  timSanPhamTheoId,
} from "@/lib/data";
import { docDanhSachChienDichTuDisk } from "@/lib/chien-dich";
import { parseTrangChuYaml, TRANG_CHU_CONFIG, type NutTrangChu } from "@/lib/trang-chu";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

const LOPOE_3D = docCauHinhLopoe3D();
/** Neo cùng trang hợp lệ: id khối có thật trên trang chủ */
const NEO_HOP_LE = new Set(["#ghe-vive", ...TRANG_CHU_CONFIG.luoi_doi.map((o) => `#${o.id}`)]);

const ROOT = process.cwd();

const ROUTE_HOP_LE = new Set([
  "/",
  "/new-arrival",
  "/quet",
  "/danh-muc",
  "/deal",
  "/da-thich",
  "/gio",
  "/giu-hang",
  "/personal-color",
  "/chinh-sach",
  "/chao",
  "/bat-dau",
  "/dang-nhap",
]);

const THAM_SO_HOP_LE = new Set([
  "loai",
  "van-de",
  "thuong-hieu",
  "tim",
  "xep",
  "sp",
  "id",
]);

const THUONG_HIEU_HIEN_THI = new Set(
  laySanPhamHienThi(SAN_PHAM).map((sp) => sp.thuong_hieu)
);

function kiemTraDichHopLe(den: string, nhanNguCanh: string) {
  if (den.startsWith("#")) {
    expect(NEO_HOP_LE.has(den), `${nhanNguCanh}: neo "${den}" không có khối tương ứng trên trang chủ`).toBe(true);
    return;
  }

  const parsed = new URL(den, "https://vive.local");
  expect(
    ROUTE_HOP_LE.has(parsed.pathname),
    `${nhanNguCanh}: route không hợp lệ "${parsed.pathname}" (từ "${den}")`
  ).toBe(true);

  for (const key of parsed.searchParams.keys()) {
    expect(
      THAM_SO_HOP_LE.has(key),
      `${nhanNguCanh}: query param không hợp lệ "${key}" (từ "${den}")`
    ).toBe(true);
  }

  const thuongHieu = parsed.searchParams.get("thuong-hieu");
  if (thuongHieu !== null) {
    expect(
      THUONG_HIEU_HIEN_THI.has(thuongHieu),
      `${nhanNguCanh}: thương hiệu "${thuongHieu}" không có trong sản phẩm hiển thị`
    ).toBe(true);
  }

  const spId = parsed.searchParams.get("sp");
  if (spId !== null) {
    expect(
      timSanPhamTheoId(spId),
      `${nhanNguCanh}: sản phẩm sp="${spId}" không tồn tại trong SAN_PHAM`
    ).toBeDefined();
  }

  const dealId = parsed.searchParams.get("id");
  if (dealId !== null && parsed.pathname === "/deal") {
    const deal = timDealTheoId(dealId);
    expect(
      deal,
      `${nhanNguCanh}: deal id="${dealId}" không tồn tại trong DEALS`
    ).toBeDefined();
    expect(deal?.hien_thi, `${nhanNguCanh}: deal "${dealId}" đang bị ẩn`).toBe(
      true
    );
    expect(
      deal?.may_rui,
      `${nhanNguCanh}: deal "${dealId}" là may rủi, không được phép trỏ tới`
    ).toBe(false);
  }
}

function thuThapChuoi(giaTri: unknown): string[] {
  if (typeof giaTri === "string") return [giaTri];
  if (Array.isArray(giaTri)) return giaTri.flatMap(thuThapChuoi);
  if (giaTri && typeof giaTri === "object") {
    return Object.values(giaTri).flatMap(thuThapChuoi);
  }
  return [];
}

describe("W050 + W041 · Cấu hình trang chủ YAML & kiểm đích", () => {
  it("đọc và validate trực tiếp data/chien-dich/trang-chu.yaml từ đĩa", () => {
    const yamlText = fs.readFileSync(
      path.join(ROOT, "data", "chien-dich", "trang-chu.yaml"),
      "utf8"
    );
    const parsed = parseTrangChuYaml(yamlText);
    expect(parsed.cua_hang.cot).toBe(6);
    expect(parsed.cua_hang.hang).toBe(4);
    expect(parsed.cua_hang.anh_mat_tien).toHaveLength(6);
    expect(parsed.luoi_doi.length).toBeGreaterThanOrEqual(8);
    expect(parsed.truot_combo.the.length).toBeGreaterThanOrEqual(5);
  });

  it("mọi nút trong trang-chu.yaml đều có chữ và đích hợp lệ (bỏ qua sap_co)", () => {
    const yamlText = fs.readFileSync(
      path.join(ROOT, "data", "chien-dich", "trang-chu.yaml"),
      "utf8"
    );
    const cfg = parseTrangChuYaml(yamlText);

    const cacNut: { nhom: string; nut: NutTrangChu }[] = [
      { nhom: "dai_thong_bao", nut: cfg.dai_thong_bao.nut },
      ...cfg.cua_hang.nut.map((n) => ({ nhom: "cua_hang", nut: n })),
      ...LOPOE_3D.mo_dau.nut.map((n) => ({ nhom: "lopoe_3d.mo_dau", nut: { ...n, kieu: "chinh" as const } })),
      ...LOPOE_3D.khoi.flatMap((k) => k.nut.map((n) => ({ nhom: `lopoe_3d.${k.id}`, nut: { ...n, kieu: "chinh" as const } }))),
      { nhom: "truot_combo", nut: cfg.truot_combo.nut },
      ...cfg.luoi_doi.flatMap((o) =>
        o.nut.map((n) => ({ nhom: `luoi_doi.${o.id}`, nut: n }))
      ),
      ...cfg.qua_lopoe.nut.map((n) => ({ nhom: "qua_lopoe", nut: n })),
      ...cfg.ghe_vive.nut.map((n) => ({ nhom: "ghe_vive", nut: n })),
    ];

    let soNutSapCo = 0;
    for (const { nhom, nut } of cacNut) {
      expect(nut.chu.trim().length, `${nhom}: thiếu chữ nút`).toBeGreaterThan(0);

      if (nut.sap_co) {
        soNutSapCo += 1;
        expect(nut.den ?? null, `${nhom} (${nut.chu}): sap_co thì den phải null`).toBeNull();
        continue;
      }

      if (nut.nguon_den === "doanh_nghiep.ban_do") {
        expect(DOANH_NGHIEP.ban_do).toMatch(/^https:\/\//);
        continue;
      }

      expect(nut.den, `${nhom} (${nut.chu}): thiếu den`).toBeTruthy();
      kiemTraDichHopLe(nut.den!, `${nhom} -> "${nut.chu}"`);
    }

    // Check-in "Xem quà" mặc định đánh dấu sap_co ngay bây giờ
    expect(soNutSapCo).toBeGreaterThanOrEqual(1);
    const checkIn = cfg.luoi_doi.find((o) => o.id === "check-in");
    expect(checkIn?.nut[0]?.sap_co).toBe(true);
    expect(checkIn?.nut[0]?.chu).toBe("Xem quà");
  });

  it("16 thương hiệu đúng thứ tự chuẩn, mọi đích hợp lệ và tự chọn 4 ảnh logo có sẵn", () => {
    const thuTuChuan = [
      "Medicube",
      "SKINFOOD",
      "Rep!el",
      "Celimax",
      "LOPOE",
      "JUNGSAEMMOOL",
      "ISOI",
      "Edit.B",
      "Lalarecipe",
      "Dermal",
      "salTherapy",
      "Tiela",
      "Beaund",
      "Uniura",
      "Aprilskin",
      "Dermagarden",
    ];

    expect(TRANG_CHU_CONFIG.thuong_hieu.danh_sach.map((t) => t.ten)).toEqual(
      thuTuChuan
    );

    for (const th of TRANG_CHU_CONFIG.thuong_hieu.danh_sach) {
      kiemTraDichHopLe(th.den, `thuong_hieu.${th.ten}`);
    }

    const coLogo = TRANG_CHU_CONFIG.thuong_hieu.danh_sach
      .filter((t) => Boolean(t.logo))
      .map((t) => t.ten);
    expect(coLogo).toEqual(["Medicube", "Celimax", "LOPOE", "JUNGSAEMMOOL"]);

    for (const th of TRANG_CHU_CONFIG.thuong_hieu.danh_sach) {
      if (th.logo) {
        const assetPath = path.join(ROOT, "public", th.logo.replace(/^\//, ""));
        expect(fs.existsSync(assetPath), `Thiếu file logo ${assetPath}`).toBe(
          true
        );
      }
    }
  });

  it("W055 · ô combo và thẻ trượt trỏ deal có thật, đang hiện, không may rủi, có giá", () => {
    const ids = [
      ...TRANG_CHU_CONFIG.luoi_doi.flatMap((o) => (o.deal_id ? [o.deal_id] : [])),
      ...TRANG_CHU_CONFIG.truot_combo.the.map((t) => t.deal_id),
    ];
    for (const id of ids) {
      const d = timDealTheoId(id);
      expect(d, `deal ${id}`).toBeDefined();
      expect(d?.hien_thi, `deal ${id} đang ẩn`).toBe(true);
      expect(d?.may_rui, `deal ${id} may rủi`).toBe(false);
      expect(d?.gia_combo, `deal ${id} thiếu gia_combo`).toBeGreaterThan(0);
    }
  });

  it("ảnh trang chủ và mặt tiền đều tồn tại trong public/", () => {
    const danhSachAnh = [
      ...TRANG_CHU_CONFIG.cua_hang.anh_mat_tien,
      ...Object.values(LOPOE_3D.tai_san),
      ...LOPOE_3D.khoi.flatMap((k) => (k.huy_hieu ? [k.huy_hieu.anh] : [])),
      ...TRANG_CHU_CONFIG.luoi_doi.flatMap((o) => [...(o.anh ? [o.anh] : []), ...(o.anh_bo ?? [])]),
      ...TRANG_CHU_CONFIG.truot_combo.the.flatMap((t) => t.anh_bo ?? []),
      TRANG_CHU_CONFIG.qua_lopoe.anh,
    ];

    for (const url of danhSachAnh) {
      const full = path.join(ROOT, "public", url.replace(/^\//, ""));
      expect(fs.existsSync(full), `Thiếu ảnh trang chủ ${full}`).toBe(true);
    }
  });

  it("kiểm mọi đích trong các YAML chiến dịch (lopoe-better-balance, mac-dinh) hợp lệ theo W041", () => {
    const list = docDanhSachChienDichTuDisk();
    expect(list.length).toBeGreaterThanOrEqual(2);

    for (const cd of list) {
      for (const khoi of cd.khoi) {
        if (khoi.loai === "hero" && khoi.nut) {
          for (const n of khoi.nut) {
            kiemTraDichHopLe(n.den, `${cd.ma}.hero -> "${n.chu}"`);
          }
        }
        if (khoi.loai === "tieu-diem" && khoi.cta_chinh) {
          kiemTraDichHopLe(
            khoi.cta_chinh.den,
            `${cd.ma}.tieu-diem -> "${khoi.cta_chinh.chu}"`
          );
        }
        if (khoi.loai === "doi-tac" && khoi.link) {
          kiemTraDichHopLe(khoi.link, `${cd.ma}.doi-tac`);
        }
      }
    }
  });

  it("DOANH_NGHIEP có đầy đủ ban_do, dia_chi_booth, mang_xa_hoi từ doanh-nghiep.yaml", () => {
    expect(DOANH_NGHIEP.ban_do).toContain("maps.google.com");
    expect(DOANH_NGHIEP.dia_chi_booth).toContain("Phường Sài Gòn");
    expect(DOANH_NGHIEP.mang_xa_hoi?.length).toBe(3);

    // Đảm bảo không trỏ tới deal may rủi hoặc deal ẩn
    const idsDungTrenTrangChu = [
      TRANG_CHU_CONFIG.dai_thong_bao.deal_id,
      TRANG_CHU_CONFIG.qua_lopoe.deal_id,
      ...TRANG_CHU_CONFIG.luoi_doi.flatMap((o) =>
        o.deal_id ? [o.deal_id] : []
      ),
    ];
    for (const id of idsDungTrenTrangChu) {
      const d = DEALS.find((item) => item.id === id);
      expect(d, `Thiếu deal ${id}`).toBeDefined();
      expect(d?.hien_thi).toBe(true);
      expect(d?.may_rui).toBe(false);
    }
  });

  it("chữ trên trang chủ tuân thủ pháp lý & từ ngữ chuẩn (không 'nhất', 'duy nhất', 'số một', 'nghệ sĩ Hàn', 'local', 'Ghé LL2')", () => {
    const tatCaChu = thuThapChuoi(TRANG_CHU_CONFIG);
    for (const text of tatCaChu) {
      // Bỏ qua đường dẫn URL
      if (text.startsWith("/")) continue;
      expect(text).not.toMatch(/(?:^|\s)(nhất|duy nhất|số một|local)(?:$|[.,!?\s])/iu);
      expect(text).not.toMatch(/nghệ sĩ Hàn/iu);
      expect(text).not.toContain("Ghé LL2");
    }
  });
});
