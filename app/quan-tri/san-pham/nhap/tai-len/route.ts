import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { xacThucKhoHoacQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import { taoLoXemTruocExcelServer } from "@/lib/admin/kho-quan-tri";
import { GIOI_HAN_BYTE_EXCEL } from "@/lib/admin/excel-san-pham";

export const runtime = "nodejs";

function tachBearerToken(header: string | null): string | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim() || null;
  }
  return trimmed || null;
}

export async function POST(request: Request) {
  try {
    const tokenHeader = tachBearerToken(request.headers.get("authorization"));
    const formData = await request.formData();
    const tokenForm =
      typeof formData.get("token") === "string"
        ? String(formData.get("token"))
        : null;
    const token = tokenHeader ?? tokenForm;

    let nv;
    try {
      nv = await xacThucKhoHoacQuanTri(token);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Không có quyền nhập file Excel.",
        },
        { status: 403 },
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn một file .xlsx hoặc .csv để tải lên." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File tải lên bị rỗng." },
        { status: 400 },
      );
    }

    if (file.size > GIOI_HAN_BYTE_EXCEL) {
      return NextResponse.json(
        {
          error: `Dung lượng file vượt quá giới hạn 5 MB (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB).`,
        },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const vaiTro: "kho" | "quan_tri" =
      nv.vaiTro === "quan_tri" ? "quan_tri" : "kho";

    const lo = await taoLoXemTruocExcelServer({
      tenFile: file.name,
      buffer,
      boi: nv.ten,
      vaiTro,
    });

    revalidatePath("/quan-tri/san-pham/nhap");
    return NextResponse.json({ lo });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Lỗi xử lý file Excel tải lên.",
      },
      { status: 400 },
    );
  }
}
