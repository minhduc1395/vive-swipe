#!/usr/bin/env python3
"""Kiểm kê sản phẩm hiển thị từ Supabase, đối chiếu bảng media, xuất media/tmp/kiem-ke.csv."""

from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402


def tai_du_lieu_tu_supabase() -> tuple[list[dict], list[dict]]:
    """Tải bảng san_pham (hien_thi=true) và public.media từ Supabase."""
    sb, _ = common.tao_supabase_client()
    sp_res = (
        sb.table("san_pham")
        .select("id,barcode,thuong_hieu,ten_goc,ten_hien_thi,quy_cach,hien_thi,con_hang,ton,anh,ghi_chu")
        .eq("hien_thi", True)
        .execute()
    )
    media_res = (
        sb.table("media")
        .select("san_pham_id,chien_dich,loai,trang_thai,duong_dan,url,nguon,ghi_chu")
        .execute()
    )
    return sp_res.data or [], media_res.data or []


def tai_du_lieu_local() -> tuple[list[dict], list[dict]]:
    """Đọc fallback từ data/products.csv khi chỉ kiểm kê offline."""
    rows = [r for r in common.doc_products_csv() if r.get("hien_thi") == "true"]
    return rows, []


def phan_loai_trang_thai_anh(dong_media: list[dict]) -> tuple[str, str, str]:
    """Xác định trạng thái ảnh thẻ của 1 sản phẩm: duyet | cho_duyet | loai | thieu."""
    the_rows = [m for m in dong_media if m.get("loai") == "the"]
    for st in ("duyet", "cho_duyet", "loai"):
        for m in the_rows:
            if m.get("trang_thai") == st:
                return st, m.get("duong_dan") or "", m.get("nguon") or ""
    return "thieu", "", ""


def chay_kiem_ke(local_only: bool = False) -> tuple[list[dict], dict[str, dict[str, int]]]:
    """Chạy kiểm kê, ghi media/tmp/kiem-ke.csv và trả về danh sách + thống kê theo thương hiệu."""
    common.dam_bao_thu_muc_tam()
    if local_only:
        san_pham, media_rows = tai_du_lieu_local()
    else:
        san_pham, media_rows = tai_du_lieu_tu_supabase()

    media_theo_sp: dict[str, list[dict]] = defaultdict(list)
    for m in media_rows:
        sid = m.get("san_pham_id")
        if sid:
            media_theo_sp[sid].append(m)

    san_pham_sap_xep = sorted(
        san_pham,
        key=lambda r: (common.thu_tu_thuong_hieu(r.get("thuong_hieu", "")), r.get("id", "")),
    )

    thong_ke: dict[str, dict[str, int]] = {}
    ket_qua: list[dict] = []

    for sp in san_pham_sap_xep:
        pid = sp["id"]
        brand = sp.get("thuong_hieu") or ""
        if brand not in thong_ke:
            thong_ke[brand] = {"tong": 0, "duyet": 0, "cho_duyet": 0, "thieu": 0}
        thong_ke[brand]["tong"] += 1

        trang_thai, duong_dan, nguon = phan_loai_trang_thai_anh(media_theo_sp.get(pid, []))
        if trang_thai == "duyet":
            thong_ke[brand]["duyet"] += 1
        elif trang_thai == "cho_duyet":
            thong_ke[brand]["cho_duyet"] += 1
        else:
            thong_ke[brand]["thieu"] += 1

        ket_qua.append(
            {
                "id": pid,
                "barcode": sp.get("barcode") or "",
                "thuong_hieu": brand,
                "ten_hien_thi": sp.get("ten_hien_thi") or sp.get("ten_goc") or "",
                "quy_cach": sp.get("quy_cach") or "",
                "ton": sp.get("ton") if sp.get("ton") is not None else "",
                "con_hang": sp.get("con_hang") or "",
                "trang_thai_media": trang_thai,
                "anh_san_pham": sp.get("anh") or "",
                "duong_dan_the": duong_dan,
                "nguon": nguon,
            }
        )

    cols = [
        "id",
        "barcode",
        "thuong_hieu",
        "ten_hien_thi",
        "quy_cach",
        "ton",
        "con_hang",
        "trang_thai_media",
        "anh_san_pham",
        "duong_dan_the",
        "nguon",
    ]
    with open(common.KIEM_KE_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(ket_qua)

    return ket_qua, thong_ke


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Kiểm kê ảnh thẻ sản phẩm hiển thị.")
    parser.add_argument("--local", action="store_true", help="Chỉ đọc data/products.csv offline")
    args = parser.parse_args()

    ket_qua, thong_ke = chay_kiem_ke(local_only=args.local)
    tong = len(ket_qua)
    duyet = sum(1 for r in ket_qua if r["trang_thai_media"] == "duyet")
    cho = sum(1 for r in ket_qua if r["trang_thai_media"] == "cho_duyet")
    thieu = sum(1 for r in ket_qua if r["trang_thai_media"] in ("thieu", "loai"))

    print(f"Tổng sản phẩm hien_thi=true: {tong} | Đã duyệt: {duyet} | Chờ duyệt: {cho} | Còn thiếu: {thieu}")
    print("\nTheo thứ tự ưu tiên thương hiệu:")
    for brand, tk in thong_ke.items():
        print(
            f"  - {brand:14s}: tổng {tk['tong']:2d} | duyệt {tk['duyet']:2d} | chờ {tk['cho_duyet']:2d} | thiếu {tk['thieu']:2d}"
        )

    thieu_rows = [r for r in ket_qua if r["trang_thai_media"] in ("thieu", "loai")]
    if thieu_rows:
        print(f"\nDanh sách mã còn thiếu ({len(thieu_rows)} mã, 30 mã đầu):")
        for r in thieu_rows[:30]:
            qc = f" ({r['quy_cach']})" if r["quy_cach"] else ""
            print(f"  {r['id']:15s} | {r['thuong_hieu']:12s} | {r['ten_hien_thi']}{qc}")
        if len(thieu_rows) > 30:
            print(f"  ... và {len(thieu_rows) - 30} mã khác trong {common.KIEM_KE_CSV}")

    print(f"\nĐã ghi: {common.KIEM_KE_CSV}")


if __name__ == "__main__":
    main()
