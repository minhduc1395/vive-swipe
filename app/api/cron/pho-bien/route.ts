import { NextRequest, NextResponse } from "next/server";

function xacThucCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!xacThucCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[CRON] pho-bien chạy thành công lúc:", new Date().toISOString());
  return NextResponse.json({
    ok: true,
    route: "pho-bien",
    trang_thai: "cho_trien_khai",
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
