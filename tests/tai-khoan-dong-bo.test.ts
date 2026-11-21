import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemGioHang } from "@/lib/kho-luu-tru";
import {
  KHOA_GOC_DONG_BO,
  chuanHoaGio,
  dongBoMotLan,
  gopDaThich,
  gopGioHang,
} from "@/lib/tai-khoan/dong-bo";

const sp = (sanPhamId: string, soLuong: number): ItemGioHang => ({ loai: "san_pham", sanPhamId, soLuong });
const combo = (dealId: string, soLuong: number): ItemGioHang => ({ loai: "combo", dealId, soLuong });

describe("#66 · gộp đã thích", () => {
  it("máy mới (không có gốc): hợp local ∪ server, local đứng trước, không trùng", () => {
    expect(gopDaThich(["A", "B"], ["B", "C"])).toEqual(["A", "B", "C"]);
    expect(gopDaThich([], ["C"])).toEqual(["C"]);
    expect(gopDaThich(["A"], [])).toEqual(["A"]);
  });

  it("có gốc: món bỏ thích trên máy này bị xóa, món máy khác bỏ thích không quay lại", () => {
    // Gốc A,B. Máy này bỏ B, thêm D. Máy khác (server) bỏ A, thêm C.
    expect(gopDaThich(["D", "A"], ["B", "C"], ["A", "B"])).toEqual(["D", "C"]);
  });

  it("có gốc và local không đổi: lấy đúng server", () => {
    expect(gopDaThich(["A", "B"], ["C", "A"], ["A", "B"])).toEqual(["A", "C"]);
  });

  it("bỏ giá trị hỏng", () => {
    expect(gopDaThich(["A", "", 3 as unknown as string], ["A"])).toEqual(["A"]);
  });
});

describe("#66 · gộp giỏ hàng", () => {
  it("máy mới: cộng số lượng theo món, combo giữ nguyên (không cộng dồn)", () => {
    const local = [sp("P1", 2), combo("D1", 1), sp("P2", 1)];
    const server = [sp("P1", 1), combo("D1", 1), sp("P3", 4)];
    expect(gopGioHang(local, server)).toEqual([sp("P1", 3), combo("D1", 1), sp("P2", 1), sp("P3", 4)]);
  });

  it("combo khác số lượng ở 2 nơi: giữ số lớn hơn", () => {
    expect(gopGioHang([combo("D1", 1)], [combo("D1", 2)])).toEqual([combo("D1", 2)]);
  });

  it("món có combo cùng sản phẩm vẫn tách riêng sản phẩm lẻ và combo", () => {
    expect(gopGioHang([sp("P1", 1)], [combo("P1", 1)])).toEqual([sp("P1", 1), combo("P1", 1)]);
  });

  it("có gốc: đăng nhập lại trên cùng máy không nhân đôi", () => {
    const goc = [sp("P1", 2), combo("D1", 1)];
    expect(gopGioHang(goc, goc, goc)).toEqual(goc);
  });

  it("có gốc: áp thay đổi của máy này lên server", () => {
    const goc = [sp("P1", 2), combo("D1", 1)];
    // Máy này: P1 lên 3, xóa combo, thêm P2. Server (máy khác): P1 lên 5, thêm P9.
    const local = [sp("P2", 1), sp("P1", 3)];
    const server = [sp("P1", 5), combo("D1", 1), sp("P9", 1)];
    expect(gopGioHang(local, server, goc)).toEqual([sp("P2", 1), sp("P1", 6), sp("P9", 1)]);
  });

  it("món đã xóa ở máy khác và local không đổi thì không quay lại", () => {
    expect(gopGioHang([sp("P1", 1)], [], [sp("P1", 1)])).toEqual([]);
  });

  it("chuẩn hóa: bỏ mục hỏng, gộp mục trùng, mục thiếu loai coi là sản phẩm", () => {
    expect(
      chuanHoaGio([
        { sanPhamId: "P1", soLuong: 1 },
        { loai: "san_pham", sanPhamId: "P1", soLuong: 2 },
        { loai: "san_pham", sanPhamId: "P2", soLuong: 0 },
        { loai: "combo", soLuong: 1 },
        null,
        "x",
      ])
    ).toEqual([sp("P1", 3)]);
    expect(chuanHoaGio(null)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// dongBoMotLan với Supabase giả (bộ nhớ)
// ---------------------------------------------------------------------------

interface DongThich {
  khach_id: string;
  san_pham_id: string;
  tao_luc: string;
}

function taoSupabaseGia(ban: { thich: DongThich[]; gio: Record<string, unknown> }, loiGhi = false) {
  const goi: string[] = [];
  const ketQua = (data: unknown, error: { message: string } | null = null) =>
    Promise.resolve({ data, error });

  function bang(ten: "yeu_thich" | "gio_hang_luu") {
    const loc: Record<string, unknown> = {};
    const builder = {
      select() {
        return builder;
      },
      eq(cot: string, gt: unknown) {
        loc[cot] = gt;
        return builder;
      },
      order() {
        return builder;
      },
      limit() {
        return builder;
      },
      then(res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) {
        goi.push(`get ${ten}`);
        const kh = loc.khach_id as string;
        const data =
          ten === "yeu_thich"
            ? ban.thich
                .filter((d) => d.khach_id === kh)
                .sort((a, b) => b.tao_luc.localeCompare(a.tao_luc))
            : kh in ban.gio
              ? [{ du_lieu: ban.gio[kh] }]
              : [];
        return ketQua(data).then(res, rej);
      },
      upsert(dong: unknown) {
        goi.push(`upsert ${ten}`);
        if (loiGhi) return ketQua(null, { message: "Failed to fetch" });
        if (ten === "yeu_thich") {
          for (const d of dong as DongThich[]) {
            if (!ban.thich.some((x) => x.khach_id === d.khach_id && x.san_pham_id === d.san_pham_id)) {
              ban.thich.push(d);
            }
          }
        } else {
          const d = dong as { khach_id: string; du_lieu: unknown };
          ban.gio[d.khach_id] = d.du_lieu;
        }
        return ketQua(null);
      },
      delete() {
        return {
          eq(_c: string, kh: string) {
            return {
              in(_c2: string, ids: string[]) {
                goi.push(`delete ${ten}`);
                if (loiGhi) return ketQua(null, { message: "Failed to fetch" });
                ban.thich = ban.thich.filter((d) => !(d.khach_id === kh && ids.includes(d.san_pham_id)));
                return ketQua(null);
              },
            };
          },
        };
      },
    };
    return builder;
  }

  return { client: { from: vi.fn(bang) } as unknown as SupabaseClient, goi };
}

const KH = "khach-1";
let store: Record<string, string>;

function datLocal(thich: string[], gio: ItemGioHang[]) {
  store.vive_da_thich = JSON.stringify(thich);
  store.vive_gio_hang = JSON.stringify(gio);
}
const docThich = () => JSON.parse(store.vive_da_thich ?? "[]") as string[];
const docGio = () => JSON.parse(store.vive_gio_hang ?? "[]") as ItemGioHang[];

beforeEach(() => {
  store = {};
  const localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
    removeItem: (k: string) => void delete store[k],
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
  vi.stubGlobal("CustomEvent", class {
    constructor(public type: string, public init?: unknown) {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("#66 · dongBoMotLan", () => {
  it("đăng nhập máy mới: gộp local vào tài khoản, ghi cả local và server, lưu gốc", async () => {
    const ban = {
      thich: [{ khach_id: KH, san_pham_id: "B", tao_luc: "2026-11-20T00:00:00.000Z" }],
      gio: { [KH]: [sp("P1", 1), combo("D1", 1)] } as Record<string, unknown>,
    };
    const { client } = taoSupabaseGia(ban);
    datLocal(["A"], [sp("P1", 2), combo("D1", 1)]);

    await dongBoMotLan(client, KH);

    expect(docThich()).toEqual(["A", "B"]);
    expect(docGio()).toEqual([sp("P1", 3), combo("D1", 1)]);
    expect(ban.thich.map((d) => d.san_pham_id).sort()).toEqual(["A", "B"]);
    expect(ban.gio[KH]).toEqual([sp("P1", 3), combo("D1", 1)]);
    expect(JSON.parse(store[KHOA_GOC_DONG_BO]).khachId).toBe(KH);
  });

  it("chạy lại lần hai không cộng dồn, không ghi gì thêm", async () => {
    const ban = { thich: [] as DongThich[], gio: {} as Record<string, unknown> };
    const { client, goi } = taoSupabaseGia(ban);
    datLocal(["A"], [sp("P1", 2)]);
    await dongBoMotLan(client, KH);
    goi.length = 0;
    await dongBoMotLan(client, KH);
    expect(docGio()).toEqual([sp("P1", 2)]);
    expect(ban.gio[KH]).toEqual([sp("P1", 2)]);
    expect(goi.filter((g) => !g.startsWith("get"))).toEqual([]);
  });

  it("bỏ thích khi đã đăng nhập: xóa dòng yeu_thich (đổi = xóa + thêm)", async () => {
    const ban = { thich: [] as DongThich[], gio: {} as Record<string, unknown> };
    const { client } = taoSupabaseGia(ban);
    datLocal(["A", "B"], []);
    await dongBoMotLan(client, KH);
    datLocal(["B"], []);
    await dongBoMotLan(client, KH);
    expect(ban.thich.map((d) => d.san_pham_id)).toEqual(["B"]);
    expect(docThich()).toEqual(["B"]);
  });

  it("mất mạng khi ghi: ném lỗi, không đụng local và gốc; thử lại sau không cộng 2 lần", async () => {
    const ban = { thich: [] as DongThich[], gio: { [KH]: [sp("P1", 1)] } as Record<string, unknown> };
    datLocal([], [sp("P1", 2)]);
    await expect(dongBoMotLan(taoSupabaseGia(ban, true).client, KH)).rejects.toThrow();
    expect(docGio()).toEqual([sp("P1", 2)]);
    expect(store[KHOA_GOC_DONG_BO]).toBeUndefined();

    await dongBoMotLan(taoSupabaseGia(ban).client, KH);
    expect(docGio()).toEqual([sp("P1", 3)]);
    expect(ban.gio[KH]).toEqual([sp("P1", 3)]);
  });

  it("gốc của tài khoản khác bị bỏ qua (gộp như máy mới)", async () => {
    store[KHOA_GOC_DONG_BO] = JSON.stringify({ khachId: "khach-khac", daThich: ["A"], gioHang: [sp("P1", 2)] });
    const ban = { thich: [] as DongThich[], gio: { [KH]: [sp("P1", 1)] } as Record<string, unknown> };
    datLocal(["A"], [sp("P1", 2)]);
    await dongBoMotLan(taoSupabaseGia(ban).client, KH);
    expect(docGio()).toEqual([sp("P1", 3)]);
    expect(docThich()).toEqual(["A"]);
  });
});
