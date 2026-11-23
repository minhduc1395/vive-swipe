"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ảnh trong ô sản phẩm (lưới /danh-muc, /da-thich). Không có ảnh, hoặc ảnh lỗi (404)
 * thì hiện chữ thương hiệu thay vì ảnh vỡ. Trạng thái lỗi nằm trong component,
 * nên chỉ cần đặt `key={sp.id}` để lọc/đổi xếp không gọi lại ảnh đã lỗi.
 */
export function AnhSanPhamO({
  src,
  alt,
  thuongHieu,
  lopAnh,
  lopChu,
  loading,
  nhanChu,
}: {
  src: string | null;
  alt: string;
  thuongHieu: string;
  lopAnh: string;
  lopChu: string;
  loading?: "lazy" | "eager";
  /** aria-label cho ô chữ (có thì ô chữ có role="img"). */
  nhanChu?: string;
}) {
  const [loi, setLoi] = useState(false);
  const anhRef = useRef<HTMLImageElement>(null);

  // Ảnh có thể đã lỗi trước khi React gắn onError (trang dựng sẵn từ máy chủ): kiểm lại sau khi gắn.
  useEffect(() => {
    const el = anhRef.current;
    if (el && el.complete && el.naturalWidth === 0) setLoi(true);
  }, [src]);

  if (!src || loi) {
    return nhanChu ? (
      <span role="img" aria-label={nhanChu} data-anh-loi={loi ? "1" : undefined} className={lopChu}>
        {thuongHieu}
      </span>
    ) : (
      <span data-anh-loi={loi ? "1" : undefined} className={lopChu}>
        {thuongHieu}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={anhRef} src={src} alt={alt} loading={loading} onError={() => setLoi(true)} className={lopAnh} />
  );
}
