import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/quet") {
    const daKhaoSat = request.cookies.get("vive_da_khao_sat")?.value;
    if (daKhaoSat !== "true") {
      return NextResponse.redirect(new URL("/chao", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quet"],
};
