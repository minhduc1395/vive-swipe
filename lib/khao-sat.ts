export interface TraLoiCauHoi {
  loai_da?: string | null;
  van_de?: string[];
  ngan_sach?: string | null;
}

export const KHOA_TRA_LOI = "vive_tra_loi_cau_hoi";
export const KHOA_DA_KHAO_SAT = "vive_da_khao_sat";

export function layTraLoiLocal(): TraLoiCauHoi | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KHOA_TRA_LOI);
    return raw ? (JSON.parse(raw) as TraLoiCauHoi) : null;
  } catch {
    return null;
  }
}

export function luuTraLoiLocal(traLoi: TraLoiCauHoi): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KHOA_TRA_LOI, JSON.stringify(traLoi));
    window.localStorage.setItem(KHOA_DA_KHAO_SAT, "true");
  } catch {
    // bỏ qua lỗi quota / bảo mật của storage
  }
}

export function daTungKhaoSat(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(KHOA_DA_KHAO_SAT) === "true" ||
      window.localStorage.getItem(KHOA_TRA_LOI) !== null
    );
  } catch {
    return false;
  }
}

export function danhDauBoQuaKhaoSat(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KHOA_DA_KHAO_SAT, "true");
  } catch {
    // bỏ qua lỗi
  }
}

export function xoaDuLieuKhaoSat(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KHOA_TRA_LOI);
    window.localStorage.removeItem(KHOA_DA_KHAO_SAT);
  } catch {
    // bỏ qua lỗi
  }
}
