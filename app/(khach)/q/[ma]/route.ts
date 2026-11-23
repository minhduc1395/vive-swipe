import type { NextRequest } from "next/server";
import cauHinh from "@/data/qr-ban.json";
import { chonDichQr, taoUrlDich, type CauHinhQrBan } from "@/lib/goi-y/qr-ban";

/** QD-BOD-027: QR để bàn trỏ `/q/<ma>`, đích đọc từ `data/qr-ban.json` (đổi đích không cần in lại QR). */
export const dynamic = "force-dynamic";

/** Sau proxy (Cloud Run) origin của request có thể là địa chỉ nội bộ: ưu tiên header chuyển tiếp. */
function layGoc(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host && (proto === "https" || proto === "http")) {
    try {
      return new URL(`${proto}://${host}`).origin;
    } catch {
      /* dùng origin của request */
    }
  }
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ ma: string }> }) {
  const { ma } = await ctx.params;
  const dich = chonDichQr(ma, cauHinh as CauHinhQrBan);
  return new Response(null, {
    status: 307,
    headers: { Location: taoUrlDich(dich, layGoc(req)), "Cache-Control": "no-store" },
  });
}
