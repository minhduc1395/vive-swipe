/**
 * Cờ bật đăng nhập email (#65, BOD 21/11: chờ SMTP).
 * Chỉ bật khi `NEXT_PUBLIC_DANG_NHAP_EMAIL === "1"`. Next inline biến này lúc build,
 * nên đổi cờ trên web thật phải build lại. Tham số để test truyền giá trị khác.
 */
export function dangNhapEmailBat(giaTri: string | undefined = process.env.NEXT_PUBLIC_DANG_NHAP_EMAIL): boolean {
  return giaTri === "1";
}
