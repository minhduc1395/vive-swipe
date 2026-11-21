import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CO_DAU_VI =
  /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]/;

/**
 * Ngoại lệ có lý do (không thuộc phạm vi W044 · DIR-043 hoặc đang do job khác xử lý):
 * - Job #96 (phần dùng chung): thanh trên, tab, chân trang, toast, /chinh-sach
 * - Job #84 (module tai-khoan): chờ #67 gộp trước
 */
const NGOAI_LE: Record<string, string> = {
  "app/(khach)/chinh-sach/page.tsx": "Job #96 xử lý trang chính sách",
  "app/(khach)/dang-nhap/page.tsx": "Job #84 xử lý module tài khoản",
  "app/(khach)/tai-khoan/page.tsx": "Job #84 xử lý module tài khoản",
  "components/AppShell.tsx": "Job #96 xử lý thanh trên dùng chung",
  "components/ChanTrang.tsx": "Job #96 xử lý chân trang dùng chung",
  "components/KhoiTaoSupabase.tsx": "Job #96 xử lý khởi tạo dùng chung",
  "components/KhungDienThoai.tsx": "Job #96 xử lý khung dùng chung",
  "components/LogoVive.tsx": "Job #96 xử lý logo dùng chung",
  "components/NutQuayLai.tsx": "Job #96 xử lý nút quay lại dùng chung",
  "components/ThanhDocTablet.tsx": "Job #96 xử lý thanh dọc tablet dùng chung",
  "components/ThanhTab.tsx": "Job #96 xử lý thanh tab dùng chung",
  "components/ThanhTren.tsx": "Job #96 xử lý thanh trên dùng chung",
  "components/ThanhTrenDesktop.tsx": "Job #96 xử lý thanh trên desktop dùng chung",
  "components/ThanhTrenLanding.tsx": "Job #96 xử lý thanh trên dùng chung",
  "components/ThanhTrenLandingWrapper.tsx": "Job #96 xử lý thanh trên dùng chung",
  "components/ui/Toast.tsx": "Job #96 xử lý toast dùng chung",
  "components/tai-khoan/FormDangNhap.tsx": "Job #84 xử lý module tài khoản",
  "components/tai-khoan/LinkTaiKhoan.tsx": "Job #84 xử lý module tài khoản",
  "components/tai-khoan/ThongTinTaiKhoan.tsx": "Job #84 xử lý module tài khoản",
};

function duyetFileTs(dir: string): string[] {
  const kq: string[] = [];
  for (const ten of readdirSync(dir)) {
    const p = join(dir, ten);
    const st = statSync(p);
    if (st.isDirectory()) {
      kq.push(...duyetFileTs(p));
    } else if (ten.endsWith(".ts") || ten.endsWith(".tsx")) {
      kq.push(p.replace(/\\/g, "/"));
    }
  }
  return kq;
}

function boChuThich(noiDung: string): string {
  return noiDung
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(?<!:)\/\/.*/g, "");
}

describe("W044 · Quét chữ tiếng Việt gõ cứng trong JSX/TSX trang khách", () => {
  it("không còn ký tự có dấu trong code của app/(khach) và components (ngoài danh sách ngoại lệ có lý do)", () => {
    const tatCa = [...duyetFileTs("app/(khach)"), ...duyetFileTs("components")];
    const viPham: string[] = [];

    for (const file of tatCa) {
      if (NGOAI_LE[file]) continue;
      const sach = boChuThich(readFileSync(file, "utf8"));
      sach.split("\n").forEach((dong, idx) => {
        if (CO_DAU_VI.test(dong)) {
          viPham.push(`${file}:${idx + 1}: ${dong.trim()}`);
        }
      });
    }

    expect(viPham, `Còn chữ tiếng Việt gõ cứng:\n${viPham.join("\n")}`).toEqual([]);
  });
});
