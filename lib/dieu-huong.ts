export interface MucDieuHuong {
  key: string;
  nhan: {
    vi: string;
    en: string;
  };
  href: string;
  sap_co?: boolean;
}

/**
 * Danh sách mục điều hướng dùng chung toàn hệ thống (W051 §2).
 * Máy tính, tablet, điện thoại, chân trang đều tham chiếu từ đây.
 */
export const CAC_MUC_DIEU_HUONG: readonly MucDieuHuong[] = [
  {
    key: "new-arrival",
    nhan: { vi: "New Arrival", en: "New Arrival" },
    href: "/new-arrival",
  },
  {
    key: "quet",
    nhan: { vi: "Quẹt", en: "Swipe" },
    href: "/quet",
  },
  {
    key: "danh-muc",
    nhan: { vi: "Sản phẩm", en: "Products" },
    href: "/danh-muc",
  },
  {
    key: "deal",
    nhan: { vi: "Deal", en: "Deals" },
    href: "/deal",
  },
  {
    key: "da-thich",
    nhan: { vi: "Đã thích", en: "Liked" },
    href: "/da-thich",
  },
  {
    key: "gio",
    nhan: { vi: "Giỏ", en: "Cart" },
    href: "/gio",
  },
  {
    key: "dang-nhap",
    nhan: { vi: "Đăng nhập", en: "Sign In" },
    href: "/dang-nhap",
    sap_co: true,
  },
] as const;

/** Các mục nằm ở giữa thanh menu máy tính (Desktop ≥ 1024px) */
export const CAC_MUC_MENU_DESKTOP = CAC_MUC_DIEU_HUONG.filter((m) =>
  ["new-arrival", "quet", "danh-muc", "deal", "da-thich"].includes(m.key)
);

/** Các mục nằm trên thanh dọc máy tính bảng (Tablet 768–1023px) */
export const CAC_MUC_TABLET = CAC_MUC_DIEU_HUONG;

/** 5 tab dưới chân màn hình điện thoại (Mobile < 768px): Quẹt · Sản phẩm · Đã thích · Deal · Giỏ */
export const CAC_MUC_TAB_MOBILE = [
  CAC_MUC_DIEU_HUONG.find((m) => m.key === "quet")!,
  CAC_MUC_DIEU_HUONG.find((m) => m.key === "danh-muc")!,
  CAC_MUC_DIEU_HUONG.find((m) => m.key === "da-thich")!,
  CAC_MUC_DIEU_HUONG.find((m) => m.key === "deal")!,
  CAC_MUC_DIEU_HUONG.find((m) => m.key === "gio")!,
];

/**
 * Kiểm tra xem mục menu tương ứng có đang được chọn (active) trên route hiện tại không.
 * Quy tắc W051:
 * - Khi ở `/`: KHÔNG mục nào sáng (trang chủ mới W050).
 * - Ở `/new-arrival`: mục "new-arrival" sáng.
 * - Các trang không có menu khách (/chinh-sach, /personal-color, /chao, /bat-dau): không mục nào sáng.
 */
export function kiemTraMucDangChon(key: string, pathname: string): boolean {
  // Khi ở trang chủ `/`: không mục nào sáng
  if (pathname === "/") {
    return false;
  }

  // Các trang không sáng mục nào theo W038 §5:
  if (
    pathname === "/chinh-sach" ||
    pathname.startsWith("/chinh-sach/") ||
    pathname === "/personal-color" ||
    pathname.startsWith("/personal-color/") ||
    pathname === "/chao" ||
    pathname.startsWith("/chao/") ||
    pathname === "/bat-dau" ||
    pathname.startsWith("/bat-dau/")
  ) {
    return false;
  }

  if (key === "new-arrival") {
    return pathname === "/new-arrival" || pathname.startsWith("/new-arrival/");
  }
  if (key === "quet") {
    return pathname === "/quet" || pathname.startsWith("/quet/");
  }
  if (key === "danh-muc") {
    return pathname === "/danh-muc" || pathname.startsWith("/danh-muc/");
  }
  if (key === "deal") {
    return pathname === "/deal" || pathname.startsWith("/deal/");
  }
  if (key === "da-thich") {
    return pathname === "/da-thich" || pathname.startsWith("/da-thich/");
  }
  if (key === "gio") {
    return (
      pathname === "/gio" ||
      pathname.startsWith("/gio/") ||
      pathname === "/giu-hang" ||
      pathname.startsWith("/giu-hang/")
    );
  }
  if (key === "dang-nhap") {
    return pathname === "/dang-nhap" || pathname.startsWith("/dang-nhap/");
  }
  return false;
}
