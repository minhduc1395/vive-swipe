import { GIAY_HAN_MA } from "./kiem-tra";

/** Mã lỗi: UI dịch bằng khóa `tai-khoan.loi.<mã>` (vi/en). */
export const LOI = {
  emailSai: "emailSai",
  maSai: "maSai",
  maHetHan: "maHetHan",
  quaNhieu: "quaNhieu",
  matMang: "matMang",
  chuaCoTaiKhoan: "chuaCoTaiKhoan",
  chung: "chung",
} as const;

export type MaLoi = (typeof LOI)[keyof typeof LOI];

export interface LoiAuth {
  name?: string;
  message?: string;
  status?: number;
  code?: string;
}

export function laLoiMang(loi: LoiAuth | null | undefined): boolean {
  if (!loi) return false;
  if (loi.name === "AuthRetryableFetchError" && (loi.status ?? 0) === 0) return true;
  if (loi.name === "TypeError") return true;
  return /failed to fetch|network|load failed|fetch failed/i.test(loi.message ?? "");
}

export function laLoiEmailDaCo(loi: LoiAuth | null | undefined): boolean {
  if (!loi) return false;
  if (loi.code === "email_exists" || loi.code === "user_already_exists") return true;
  return /already (been )?registered|already exists/i.test(loi.message ?? "");
}

/**
 * Đổi lỗi Supabase Auth sang mã lỗi (UI dịch theo ngôn ngữ).
 * Supabase trả `otp_expired` cho cả mã sai và mã hết hạn, nên dựa thêm vào thời gian từ lúc gửi.
 */
export function dichLoi(
  loi: LoiAuth | null | undefined,
  tuyChon: { giayTuLucGui?: number } = {}
): MaLoi {
  if (!loi) return LOI.chung;
  if (laLoiMang(loi)) return LOI.matMang;
  const code = loi.code ?? "";
  if (
    loi.status === 429 ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  ) {
    return LOI.quaNhieu;
  }
  const laLoiMa =
    code === "otp_expired" ||
    (loi.status === 403 && /token has expired|invalid/i.test(loi.message ?? ""));
  if (laLoiMa) {
    const giay = tuyChon.giayTuLucGui ?? 0;
    return giay >= GIAY_HAN_MA ? LOI.maHetHan : LOI.maSai;
  }
  if (code === "email_address_invalid" || code === "validation_failed") return LOI.emailSai;
  if (code === "otp_disabled" || code === "signup_disabled" || /signups not allowed/i.test(loi.message ?? "")) {
    return LOI.chuaCoTaiKhoan;
  }
  return LOI.chung;
}
