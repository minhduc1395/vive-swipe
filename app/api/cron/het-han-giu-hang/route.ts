import { NextRequest, NextResponse } from "next/server";

function xacThucCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!xacThucCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    route: "het-han-giu-hang",
    trang_thai: "cho_trien_khai",
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
