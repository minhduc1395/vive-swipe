import type { ItemGioHang } from "@/lib/kho-luu-tru";

export type NgayDen = "hom_nay" | "ngay_mai";

export type TrangThaiGiuHang =
  | "moi"
  | "da_soan"
  | "da_lay"
  | "huy"
  | "het_han";

export interface ThongTinDatGiuHangInput {
  ten: string;
  sdt: string;
  email?: string;
  ngayDen: NgayDen;
  dongYEmail?: boolean;
  dongYChinhSach: boolean;
  gio: ItemGioHang[];
  khachId?: string;
}

export interface DongGiuHangXacNhan {
  id: string;
  ten: string;
  thuongHieu: string;
  soLuong: number;
  giaSauUuDai: number;
  loai: "san_pham" | "combo";
}

export interface KetQuaTaoGiuHang {
  ok: boolean;
  loi?: string;
  ma?: string;
  ngayDenStr?: string;
  hetHanIso?: string;
  hanGiuText?: string;
  tongUocTinh?: number;
  quaDuKien?: string | null;
  cacDong?: DongGiuHangXacNhan[];
  diaChi?: string;
  ten?: string;
  sdt?: string;
  email?: string;
}

export interface DonGiuHangChiTiet {
  id: string;
  ma: string;
  khachId?: string | null;
  ten: string;
  sdt: string;
  email?: string | null;
  ngayDen: string;
  hetHan: string;
  trangThai: TrangThaiGiuHang;
  tongUocTinh: number;
  quaDuKien?: string | null;
  ghiChu?: string | null;
  taoLuc: string;
  cacDong: DongGiuHangXacNhan[];
}
