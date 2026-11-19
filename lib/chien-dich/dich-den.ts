/**
 * Quy tắc đích mặc định cho nút landing (W041). Khối không ghi `den` trong yaml thì suy ra:
 * - sản phẩm → /danh-muc?thuong-hieu=<thương hiệu>&sp=<id>
 * - deal, combo → /deal?id=<deal id>
 */
export function dichDeal(id: string): string {
  return `/deal?id=${encodeURIComponent(id)}`;
}

export function dichSanPham(sp: { id: string; thuong_hieu: string }): string {
  return `/danh-muc?thuong-hieu=${encodeURIComponent(sp.thuong_hieu)}&sp=${encodeURIComponent(sp.id)}`;
}
