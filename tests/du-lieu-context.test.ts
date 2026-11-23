import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { taiSanPhamTuSupabase, taiDealsTuSupabase, xoaCacheDuLieu } from "@/lib/supabase/du-lieu";
import { datSupabaseMock } from "@/lib/supabase/client";
import { SAN_PHAM, DEALS } from "@/lib/data";
import type { SupabaseClient } from "@supabase/supabase-js";

// #132: dùng chung request sản phẩm/deal; DuLieuProvider không chờ Server Action dev ở khách.
const doc = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function taoMock(demBang: Record<string, number>, rows: Record<string, unknown[]>) {
  return {
    from: (bang: string) => ({
      select: () => ({
        order: () => {
          demBang[bang] = (demBang[bang] ?? 0) + 1;
          return new Promise((xong) => setTimeout(() => xong({ data: rows[bang], error: null }), 10));
        },
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("#132 · dùng chung request dữ liệu", () => {
  const dem: Record<string, number> = {};
  beforeEach(() => {
    for (const k of Object.keys(dem)) delete dem[k];
    xoaCacheDuLieu();
    datSupabaseMock(taoMock(dem, { san_pham: SAN_PHAM, deal: DEALS.map((d) => ({ id: d.id, du_lieu: d })) }));
  });
  afterEach(() => {
    datSupabaseMock(null);
    xoaCacheDuLieu();
    vi.restoreAllMocks();
  });

  it("gọi đồng thời nhiều lần chỉ gửi 1 request mỗi loại, cùng một kết quả", async () => {
    const [a, b, c] = await Promise.all([
      taiSanPhamTuSupabase(),
      taiSanPhamTuSupabase(),
      taiSanPhamTuSupabase(),
    ]);
    const [d, e] = await Promise.all([taiDealsTuSupabase(), taiDealsTuSupabase()]);
    expect(dem.san_pham).toBe(1);
    expect(dem.deal).toBe(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(d).toBe(e);
    // lần sau (đã có cache) cũng không gửi thêm
    await taiSanPhamTuSupabase();
    await taiDealsTuSupabase();
    expect(dem.san_pham).toBe(1);
    expect(dem.deal).toBe(1);
  });

  it("xóa cache thì tải lại, và request cũ về muộn không ghi đè cache mới", async () => {
    const cu = taiSanPhamTuSupabase();
    xoaCacheDuLieu();
    const moi = taiSanPhamTuSupabase();
    await Promise.all([cu, moi]);
    expect(dem.san_pham).toBe(2);
    await taiSanPhamTuSupabase();
    expect(dem.san_pham).toBe(2);
  });
});

describe("#132 · DuLieuProvider và /bat-dau", () => {
  const CONTEXT = doc("lib/du-lieu-context.tsx");
  const BAT_DAU = doc("app/(khach)/bat-dau/page.tsx");

  it("Server Action dev chỉ gọi ở trang quản trị hoặc khi không phải production; vẫn có override", () => {
    expect(CONTEXT).toMatch(/pathname\.startsWith\("\/quan-tri"\) \|\| process\.env\.NODE_ENV !== "production"/);
    expect(CONTEXT).toMatch(/canDevOverride\s*\?\s*actionLayDuLieuKhachDev\(\)/);
    expect(CONTEXT).toMatch(/if \(ketQua\.devOverride\)/);
  });

  it("/bat-dau gọi tải sớm khi nộp khảo sát (sau khi lưu câu trả lời), không đổi chữ", () => {
    expect(BAT_DAU).toMatch(/import\("\.\.\/quet\/tai-som"\)/);
    expect(BAT_DAU).toMatch(/luuKetQuaHienTai\(\);\s+taiSomQuet\(\);\s+ghiSuKien\("xong_cau_hoi"/);
  });
});
