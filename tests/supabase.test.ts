import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  layHangDoiLuotQuet,
  ghiLuotQuet,
  dayHangDoiLuotQuet,
} from "@/lib/supabase/luot-quet";
import {
  layHangDoiSuKien,
  ghiSuKien,
  luuNguonVaoTuUrl,
  layNguonVao,
  dayHangDoiSuKien,
} from "@/lib/supabase/su-kien";
import {
  taiSanPhamTuSupabase,
  taiDealsTuSupabase,
  xoaCacheDuLieu,
} from "@/lib/supabase/du-lieu";
import { datSupabaseMock } from "@/lib/supabase/client";
import { SAN_PHAM, DEALS } from "@/lib/data";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Mock localStorage cho môi trường node/vitest
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("W013 · Kết nối Supabase: Hàng đợi lượt quẹt & Ngoại tuyến (Unit Test)", () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("window", {
      localStorage: mockStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      location: { search: "?src=qr-ban" },
    });
    vi.stubGlobal("navigator", { onLine: true });
    xoaCacheDuLieu();
    datSupabaseMock(null);
  });

  afterEach(() => {
    datSupabaseMock(null);
    vi.restoreAllMocks();
  });

  it("ghiLuotQuet lưu vào localStorage ngay lập tức với tao_luc là chuỗi ISO", () => {
    ghiLuotQuet({
      san_pham_id: "8809369850354",
      hanh_dong: "thich",
      nguon: "goi_y",
      vi_tri: 1,
    });

    const hangDoi = layHangDoiLuotQuet();
    expect(hangDoi.length).toBe(1);
    expect(hangDoi[0].san_pham_id).toBe("8809369850354");
    expect(hangDoi[0].hanh_dong).toBe("thich");
    expect(hangDoi[0].nguon).toBe("goi_y");
    expect(hangDoi[0].vi_tri).toBe(1);
    expect(typeof hangDoi[0].tao_luc).toBe("string");
    // Kiểm tra định dạng ISO 8601
    expect(hangDoi[0].tao_luc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("Tiêu chí xong: Tắt mạng (ngoại tuyến) rồi bật lại không mất lượt quẹt", async () => {
    // 1. Tắt mạng (navigator.onLine = false)
    vi.stubGlobal("navigator", { onLine: false });

    // Quẹt 3 sản phẩm trong lúc mất mạng
    ghiLuotQuet({ san_pham_id: "SP-01", hanh_dong: "thich", vi_tri: 1 });
    ghiLuotQuet({ san_pham_id: "SP-02", hanh_dong: "bo_qua", vi_tri: 2 });
    ghiLuotQuet({ san_pham_id: "SP-03", hanh_dong: "gio", vi_tri: 3 });

    // Kiểm tra hàng đợi có đủ 3 lượt quẹt
    const hangDoiTrongKhiMatMang = layHangDoiLuotQuet();
    expect(hangDoiTrongKhiMatMang.length).toBe(3);

    // Cố gắng đẩy hàng đợi khi đang mất mạng -> không mất dữ liệu, trả về false
    const ketQuaDayKhiMatMang = await dayHangDoiLuotQuet();
    expect(ketQuaDayKhiMatMang.thanhCong).toBe(false);
    expect(layHangDoiLuotQuet().length).toBe(3);

    // 2. Bật mạng lại (navigator.onLine = true)
    vi.stubGlobal("navigator", { onLine: true });

    // Cung cấp mock Supabase thành công
    const insertedRows: unknown[] = [];
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "mock-user-123" } } },
          error: null,
        }),
        signInAnonymously: vi.fn(),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "luot_quet") {
          return {
            insert: vi.fn().mockImplementation((rows: unknown[]) => {
              insertedRows.push(...rows);
              return Promise.resolve({ error: null });
            }),
          };
        }
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    // Đẩy hàng đợi sau khi có mạng
    const ketQua = await dayHangDoiLuotQuet();
    expect(ketQua.thanhCong).toBe(true);
    expect(ketQua.soLuongGui).toBe(3);

    // Hàng đợi trong localStorage được làm sạch sau khi gửi thành công
    expect(layHangDoiLuotQuet().length).toBe(0);
    expect(insertedRows.length).toBe(3);
  });

  it("ghiSuKien tự động gắn nguồn vào ?src= và lưu hàng đợi", () => {
    luuNguonVaoTuUrl();
    expect(layNguonVao()).toBe("qr-ban");

    ghiSuKien("xong_cau_hoi", { so_luong: 3 });

    const hangDoi = layHangDoiSuKien();
    expect(hangDoi.length).toBe(1);
    expect(hangDoi[0].ten).toBe("xong_cau_hoi");
    expect(hangDoi[0].du_lieu).toEqual({
      so_luong: 3,
      nguon_vao: "qr-ban",
    });
    expect(typeof hangDoi[0].tao_luc).toBe("string");
    expect(hangDoi[0].tao_luc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("dayHangDoiSuKien đẩy sự kiện thành công và dọn hàng đợi", async () => {
    luuNguonVaoTuUrl();
    ghiSuKien("mo_web");

    const suKienRows: unknown[] = [];
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "mock-user-123" } } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "su_kien") {
          return {
            insert: vi.fn().mockImplementation((rows: unknown[]) => {
              suKienRows.push(...rows);
              return Promise.resolve({ error: null });
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    const ketQua = await dayHangDoiSuKien();
    expect(ketQua.thanhCong).toBe(true);
    expect(suKienRows.length).toBe(1);
    expect(layHangDoiSuKien().length).toBe(0);
  });
});

describe("W013 · Tải sản phẩm & Deals từ Supabase có kiểm tra Zod", () => {
  beforeEach(() => {
    xoaCacheDuLieu();
    datSupabaseMock(null);
  });

  afterEach(() => {
    datSupabaseMock(null);
  });

  it("Tải sản phẩm hợp lệ từ Supabase và kiểm tra qua SanPhamSchema", async () => {
    const mockDbRow = {
      id: "TEST-01",
      barcode: "8801234567890",
      thuong_hieu: "Test Brand",
      ten_goc: "Test Original",
      ten_hien_thi: "Test Display",
      quy_cach: "50ml",
      gia_goc: 300000,
      gia_ban: 250000,
      giam_tren_tag: "-16%",
      danh_muc: "tinh-chat",
      van_de: ["mun"],
      thanh_phan: ["B5"],
      loai_da: ["da-dau"],
      mo_ta: "Mô tả sản phẩm test",
      con_hang: "true",
      ton: 10,
      hien_thi: true,
      anh: "/products/test.png",
      pho_bien: 0.8,
      ghi_chu: null,
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockDbRow],
            error: null,
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    const sp = await taiSanPhamTuSupabase();
    expect(sp.length).toBe(1);
    expect(sp[0].id).toBe("TEST-01");
    expect(sp[0].thuong_hieu).toBe("Test Brand");
  });

  it("Lọc bỏ sản phẩm sai cấu trúc và fallback dữ liệu tĩnh nếu không còn sản phẩm nào hợp lệ", async () => {
    const invalidDbRow = {
      id: "INVALID-01",
      // thiếu thuong_hieu, ten_goc, gia_ban...
      gia_ban: -100, // sai quy tắc số nguyên dương
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [invalidDbRow],
            error: null,
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    // Khi hàng trả về không hợp lệ, hàm fallback về SAN_PHAM tĩnh
    const sp = await taiSanPhamTuSupabase();
    expect(sp.length).toBe(SAN_PHAM.length);
  });

  it("Tải deals từ Supabase, hợp nhất du_lieu và kiểm tra qua DealSchema", async () => {
    const mockDealGoc = {
      ten: "Combo Test Mùa Hè",
      loai: "combo",
      nhan_deal: "VIVE",
      bat_dau: "2026-11-14",
      ket_thuc: "2026-11-29",
      trang_thai: "DANG_CHAY",
      may_rui: false,
      hien_thi: true,
      thanh_phan: [{ id: "SP-01", so_luong: 1 }],
      gia_combo: 450000,
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "DEAL-TEST-01",
                het_qua: false,
                du_lieu: mockDealGoc,
              },
            ],
            error: null,
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    const deals = await taiDealsTuSupabase();
    expect(deals.length).toBe(1);
    expect(deals[0].id).toBe("DEAL-TEST-01");
    expect(deals[0].ten).toBe("Combo Test Mùa Hè");
  });

  it("Khi Supabase lỗi mạng, tự động fallback sang DEALS và SAN_PHAM tĩnh", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Network connection refused" },
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    datSupabaseMock(mockSupabase);

    const sp = await taiSanPhamTuSupabase();
    expect(sp).toEqual(SAN_PHAM);

    const deals = await taiDealsTuSupabase();
    expect(deals).toEqual(DEALS);
  });
});

// Chỉ chạy kiểm tra RLS thật khi có cờ RUN_SUPABASE_IT=1 (theo Claude QA-fail point 1)
const chayIntegrationTest = Boolean(process.env.RUN_SUPABASE_IT === "1");

describe.runIf(chayIntegrationTest)(
  "W013 · RLS trên Supabase thật: Khách chỉ thấy dữ liệu của mình (Integration Test)",
  () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    it("Tiêu chí xong: RLS - khách ẩn danh A thấy dòng của mình, B không thấy dòng của A", async () => {
      if (!supabaseUrl || !supabaseKey) {
        console.warn("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc PUBLISHABLE_KEY, bỏ qua test RLS");
        return;
      }

      // Khách A
      const clientA = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: authA, error: errA } = await clientA.auth.signInAnonymously();
      if (errA && (errA.status === 429 || errA.message.includes("rate limit"))) {
        console.warn("Supabase Auth rate limit 429, bỏ qua test RLS trực tiếp");
        return;
      }
      expect(errA).toBeNull();
      const userA = authA.user!.id;

      // Khách B
      const clientB = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: authB, error: errB } = await clientB.auth.signInAnonymously();
      if (errB && (errB.status === 429 || errB.message.includes("rate limit"))) {
        console.warn("Supabase Auth rate limit 429, bỏ qua test RLS trực tiếp");
        return;
      }
      expect(errB).toBeNull();
      expect(authB.user!.id).toBeDefined();

      // Khách A tạo hồ sơ và 1 lượt quẹt
      const { error: upsertErrA } = await clientA.from("khach").upsert({
        id: userA,
        tra_loi: { loai_da: "da-dau" },
        ho_so: { "mat-na": 2.5 },
      });
      expect(upsertErrA).toBeNull();

      const { error: insertErrA } = await clientA.from("luot_quet").insert({
        khach_id: userA,
        san_pham_id: "8809369850354",
        hanh_dong: "thich",
        nguon: "goi_y",
        vi_tri: 1,
        tao_luc: new Date().toISOString(),
      });
      expect(insertErrA).toBeNull();

      // Kiểm tra chiều 1: A thấy dữ liệu của chính mình
      const { data: khachRowsA, error: qErrA } = await clientA
        .from("khach")
        .select("*")
        .eq("id", userA);
      expect(qErrA).toBeNull();
      expect(khachRowsA?.length).toBe(1);
      expect(khachRowsA?.[0].id).toBe(userA);

      const { data: luotQuetA } = await clientA
        .from("luot_quet")
        .select("*")
        .eq("khach_id", userA);
      expect(luotQuetA?.length).toBeGreaterThanOrEqual(1);

      // Kiểm tra chiều 2: B KHÔNG thấy dữ liệu của A
      const { data: khachRowsB } = await clientB.from("khach").select("*");
      const coThayA = khachRowsB?.some((r) => r.id === userA);
      expect(coThayA).toBe(false);

      const { data: luotQuetB } = await clientB.from("luot_quet").select("*");
      const coLuotQuetA = luotQuetB?.some((r) => r.khach_id === userA);
      expect(coLuotQuetA).toBe(false);
    });
  }
);
