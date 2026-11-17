export const CAU_HINH_BOOTH = {
  tenThuongHieu: "VIVE | K-Beauty Experience",
  diaChiDayDu: "VIVE | K-Beauty Experience · LL2 Union Square, 171 Đồng Khởi",
  diaChiNgan: "LL2 Union Square",
  gioMoCua: process.env.GIO_MO_CUA ?? "10:00-21:00",
  giuHangDenGio: process.env.GIU_HANG_DEN_GIO ?? "21:00",
  giuHangSoNgay: Number(process.env.GIU_HANG_SO_NGAY ?? "1") || 1,
} as const;
