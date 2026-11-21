import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MAC_DINH = "https://vive-swipe-5byasgvzsa-an.a.run.app";

vi.mock("next/font/google", () => ({
  Be_Vietnam_Pro: () => ({ variable: "f1" }),
  Playfair_Display: () => ({ variable: "f2" }),
}));
vi.mock("@/components/KhoiTaoSupabase", () => ({ KhoiTaoSupabase: () => null }));
vi.mock("next-intl", () => ({ NextIntlClientProvider: () => null }));
vi.mock("next-intl/server", () => ({ getLocale: async () => "vi" }));
vi.mock("../app/globals.css", () => ({}));

async function layMetadataBase(): Promise<URL> {
  vi.resetModules();
  const mod = await import("../app/layout");
  return mod.metadata.metadataBase as URL;
}

describe("metadataBase của layout gốc", () => {
  const goc = process.env.NEXT_PUBLIC_SITE_URL;
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
  afterEach(() => {
    if (goc === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = goc;
  });

  it("dùng NEXT_PUBLIC_SITE_URL khi có", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://vive.example.vn";
    expect((await layMetadataBase()).origin).toBe("https://vive.example.vn");
  });

  it("không có biến thì dùng URL Cloud Run, không ra localhost", async () => {
    const url = await layMetadataBase();
    expect(url.origin).toBe(MAC_DINH);
    expect(url.href).not.toContain("localhost");
  });

  it("biến rỗng hoặc toàn khoảng trắng thì dùng URL Cloud Run", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    expect((await layMetadataBase()).origin).toBe(MAC_DINH);
  });

  it("bỏ dấu / thừa cuối", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://vive.example.vn//";
    const url = await layMetadataBase();
    expect(url.href).toBe("https://vive.example.vn/");
    expect(new URL("/brand/og-image.png", url).href).toBe(
      "https://vive.example.vn/brand/og-image.png",
    );
  });
});
