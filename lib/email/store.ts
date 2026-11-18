/**
 * Bộ lưu trữ email trong môi trường development (docs/02 mục 9).
 * Cho phép xem trước danh sách và nội dung email đã gửi tại /dev/email.
 */

export interface EmailDaGui {
  id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  taoLuc: string; // ISO string
  maGiuHang?: string;
  loai: "xac_nhan_giu_hang" | "xac_nhan_deal" | "khac";
}

declare global {
  var __VIVE_DEV_EMAILS__: EmailDaGui[] | undefined;
}

function layKhoEmail(): EmailDaGui[] {
  if (!globalThis.__VIVE_DEV_EMAILS__) {
    globalThis.__VIVE_DEV_EMAILS__ = [];
  }
  return globalThis.__VIVE_DEV_EMAILS__;
}

export function themEmailDev(email: Omit<EmailDaGui, "id" | "taoLuc">): EmailDaGui {
  const kho = layKhoEmail();
  const banGhi: EmailDaGui = {
    ...email,
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taoLuc: new Date().toISOString(),
  };
  kho.unshift(banGhi);
  return banGhi;
}

export function layDanhSachEmailDev(): EmailDaGui[] {
  return [...layKhoEmail()];
}

export function xoaToanBoEmailDev(): void {
  globalThis.__VIVE_DEV_EMAILS__ = [];
}
