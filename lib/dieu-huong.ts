export function kiemTraMucDangChon(key: string, pathname: string): boolean {
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
    return (
      pathname === "/" ||
      pathname === "/new-arrival" ||
      pathname.startsWith("/new-arrival/")
    );
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
