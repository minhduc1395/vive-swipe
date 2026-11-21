import { GIAY_HAN_MA } from "./kiem-tra";

export const LOI = {
  emailSai: "Email chưa đúng. Kiểm tra lại giúp VIVE nhé.",
  maSai: "Mã chưa đúng. Kiểm tra lại 6 số trong email.",
  maHetHan: "Mã đã hết hạn. Bấm “Gửi lại mã” để nhận mã mới.",
  quaNhieu: "Bạn gửi mã quá nhiều lần. Đợi vài phút rồi thử lại.",
  matMang: "Mất kết nối mạng. Kiểm tra mạng rồi thử lại.",
  chuaCoTaiKhoan: "Email này chưa có tài khoản. Thử lại để tạo mới.",
  chung: "Có lỗi xảy ra. Thử lại sau ít phút.",
} as const;

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
 * Đổi lỗi Supabase Auth sang câu tiếng Việt.
 * Supabase trả `otp_expired` cho cả mã sai và mã hết hạn, nên dựa thêm vào thời gian từ lúc gửi.
 */
export function dichLoi(
  loi: LoiAuth | null | undefined,
  tuyChon: { giayTuLucGui?: number } = {}
): string {
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
