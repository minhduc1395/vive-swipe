"use client";

import type { HoSoKhach } from "@/lib/goi-y/ho-so";

export const KHOA_DA_THICH = "vive_da_thich";
export const KHOA_GIO_HANG = "vive_gio_hang";
export const KHOA_DA_BO_QUA = "vive_da_bo_qua";
export const KHOA_HO_SO = "vive_ho_so";

export interface ItemGioHang {
  sanPhamId: string;
  soLuong: number;
}

export interface MucBoQua {
  id: string;
  bo_qua_luc: number;
}

function docJson<T>(khoa: string, macDinh: T): T {
  if (typeof window === "undefined") return macDinh;
  try {
    const raw = window.localStorage.getItem(khoa);
    return raw ? (JSON.parse(raw) as T) : macDinh;
  } catch {
    return macDinh;
  }
}

function ghiJson<T>(khoa: string, duLieu: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(khoa, JSON.stringify(duLieu));
  } catch {
    // bỏ qua lỗi storage
  }
}

// --- ĐÃ THÍCH ---
export function layDanhSachDaThich(): string[] {
  return docJson<string[]>(KHOA_DA_THICH, []);
}

export function themDaThich(id: string): void {
  const hienTai = layDanhSachDaThich();
  if (!hienTai.includes(id)) {
    ghiJson(KHOA_DA_THICH, [id, ...hienTai]);
  }
}

export function xoaDaThich(id: string): void {
  const hienTai = layDanhSachDaThich();
  ghiJson(
    KHOA_DA_THICH,
    hienTai.filter((item) => item !== id)
  );
}

// --- GIỎ HÀNG ---
export function layGioHang(): ItemGioHang[] {
  return docJson<ItemGioHang[]>(KHOA_GIO_HANG, []);
}

export function themVaoGio(sanPhamId: string, soLuong = 1): void {
  const hienTai = layGioHang();
  const viTri = hienTai.findIndex((item) => item.sanPhamId === sanPhamId);
  if (viTri >= 0) {
    const banSao = [...hienTai];
    banSao[viTri] = {
      ...banSao[viTri],
      soLuong: banSao[viTri].soLuong + soLuong,
    };
    ghiJson(KHOA_GIO_HANG, banSao);
  } else {
    ghiJson(KHOA_GIO_HANG, [{ sanPhamId, soLuong }, ...hienTai]);
  }
}

export function xoaKhoiGio(sanPhamId: string): void {
  const hienTai = layGioHang();
  ghiJson(
    KHOA_GIO_HANG,
    hienTai.filter((item) => item.sanPhamId !== sanPhamId)
  );
}

// --- BỎ QUA ---
export function layDanhSachDaBoQua(): MucBoQua[] {
  return docJson<MucBoQua[]>(KHOA_DA_BO_QUA, []);
}

export function themDaBoQua(id: string): void {
  const hienTai = layDanhSachDaBoQua();
  const conLai = hienTai.filter((item) => item.id !== id);
  ghiJson(KHOA_DA_BO_QUA, [{ id, bo_qua_luc: Date.now() }, ...conLai]);
}

export function xoaDaBoQua(id: string): void {
  const hienTai = layDanhSachDaBoQua();
  ghiJson(
    KHOA_DA_BO_QUA,
    hienTai.filter((item) => item.id !== id)
  );
}

// --- HỒ SƠ ---
export function layHoSoLocal(): HoSoKhach {
  return docJson<HoSoKhach>(KHOA_HO_SO, {});
}

export function luuHoSoLocal(hoSo: HoSoKhach): void {
  ghiJson(KHOA_HO_SO, hoSo);
}
