import { chuanHoaTimKiem } from "@/lib/dinh-dang";

/**
 * Bảng quy đổi giá trị quà nội bộ (VNĐ) theo docs/02 mục 4.2 bước 5.
 * Chỉ dùng trong code để so sánh chọn 1 quà có lợi nhất cho khách, không hiển thị công khai.
 */
const BANG_GIA_TRI_QUA: Array<{ tuKhoa: string[]; giaTri: number }> = [
  { tuKhoa: ["kem duong lopoe", "kem lopoe"], giaTri: 549_000 },
  { tuKhoa: ["ampoule lopoe", "ampoule"], giaTri: 419_000 },
  { tuKhoa: ["sua rua mat lopoe"], giaTri: 249_000 },
  { tuKhoa: ["sua tam saltherapy"], giaTri: 150_000 },
  { tuKhoa: ["tay te bao chet saltherapy"], giaTri: 130_000 },
  { tuKhoa: ["mat na uniura"], giaTri: 99_000 },
  { tuKhoa: ["muoi tam saltherapy"], giaTri: 49_000 },
];

/**
 * Trả về giá trị quy đổi nội bộ của mô tả quà để so sánh chọn quà lợi nhất.
 */
export function layGiaTriQua(moTaQua: string | null | undefined): number {
  if (!moTaQua) return 0;
  const chuanHoa = chuanHoaTimKiem(moTaQua);
  if (!chuanHoa) return 0;

  for (const muc of BANG_GIA_TRI_QUA) {
    if (muc.tuKhoa.some((kw) => chuanHoa.includes(kw))) {
      return muc.giaTri;
    }
  }
  return 0;
}
