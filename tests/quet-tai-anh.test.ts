import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// #128: cách tải ảnh thẻ đầu của /quet. Kiểm nguồn (không chạy trình duyệt); e2e: tests/e2e/quet-lcp.spec.ts.
const doc = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

const THE = doc("components/deck/TheSanPham.tsx");
const TRANG = doc("app/(khach)/quet/page.tsx");
const LAYOUT = doc("app/(khach)/quet/layout.tsx");
const TAI_SOM = doc("app/(khach)/quet/tai-som.ts");

const dem = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("#128 · tải ảnh thẻ đầu của /quet", () => {
  it("thẻ sản phẩm: chỉ thẻ trên cùng có fetchPriority=high và loading=eager, thẻ sau lazy", () => {
    expect(dem(THE, /fetchPriority=/g)).toBe(1);
    expect(THE).toMatch(/fetchPriority=\{isTopCard \? "high" : "auto"\}/);
    expect(THE).toMatch(/loading=\{isTopCard \? "eager" : "lazy"\}/);
    expect(THE).toMatch(/decoding="async"/);
  });

  it("ảnh thẻ có width/height để không giật bố cục", () => {
    expect(THE).toMatch(/width=\{236\}\s+height=\{236\}/);
  });

  it("layout /quet preconnect tới gốc Supabase, cả có và không crossorigin", () => {
    expect(LAYOUT).toMatch(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(LAYOUT).toMatch(/preconnect\(goc, \{ crossOrigin: "anonymous" \}\)/);
    expect(LAYOUT).toMatch(/preconnect\(goc\);/);
  });

  it("trang /quet gọi tải sớm ở cấp mô-đun, không đổi luật xếp deck", () => {
    expect(TRANG).toMatch(/import \{ taiSomChoQuet \} from "\.\/tai-som"/);
    expect(TRANG).toMatch(/^taiSomChoQuet\(\);$/m);
    expect(TRANG).toMatch(/xepDeck\(\{/);
    // tải sớm dùng đúng hàm xếp deck có sẵn, không có luật xếp riêng
    expect(TAI_SOM).toMatch(/import \{ xepDeck \} from "@\/lib\/goi-y\/deck"/);
  });

  it("tải sớm preload ảnh thẻ đầu ưu tiên cao, chỉ với URL tuyệt đối", () => {
    expect(TAI_SOM).toMatch(/preload\(anh, \{ as: "image", fetchPriority: "high" \}\)/);
    expect(TAI_SOM).toMatch(/\^https\?:/);
  });

  it("3 ảnh thẻ kế tiếp chỉ preload sau khi ảnh thẻ trên cùng tải xong (hoặc 3 giây)", () => {
    expect(TRANG).toMatch(/addEventListener\("load", chay/);
    expect(TRANG).toMatch(/setTimeout\(chay, 3000\)/);
  });
});
