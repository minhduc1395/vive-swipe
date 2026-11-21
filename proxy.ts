import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NGON_NGU, laNgonNgu } from "@/i18n/ngon-ngu";

/** W044: `?lang=en` hoặc `?lang=vi` đặt cookie ngôn ngữ rồi đi tiếp (giữ nguyên URL). */
export function proxy(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang");
  if (!laNgonNgu(lang) || req.cookies.get(COOKIE_NGON_NGU)?.value === lang) return NextResponse.next();
  // Đặt cookie cho chính request này để trang render đúng ngôn ngữ ngay lượt đầu
  req.cookies.set(COOKIE_NGON_NGU, lang);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set(COOKIE_NGON_NGU, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
