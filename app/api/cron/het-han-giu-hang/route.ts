import { NextRequest, NextResponse } from "next/server";
import { capNhatHetHanCacDon } from "@/lib/giu-hang/kho-giu-hang";

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

  try {
    const daCapNhat = await capNhatHetHanCacDon();
    console.log(
      `[CRON] het-han-giu-hang chạy thành công lúc ${new Date().toISOString()}: đã chuyển ${daCapNhat} đơn sang het_han`
    );
    return NextResponse.json({
      ok: true,
      route: "het-han-giu-hang",
      da_cap_nhat: daCapNhat,
      thoi_gian: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Lỗi het-han-giu-hang:", error);
    return NextResponse.json(
      { error: "Internal Server Error", chi_tiet: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
