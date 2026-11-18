#!/usr/bin/env python3
"""Quét Drive 09 Nhập liệu sản phẩm/00 Inbox (Excel, CSV, ảnh, ghi chú) và cập nhật sản phẩm theo docs/07."""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str((ROOT / "scripts" / "du_lieu").resolve()))
import common  # noqa: E402


def tim_thu_muc_inbox(duong_dan_chi_dinh: str | None = None) -> tuple[Path, Path, Path]:
    """Xác định bộ 3 thư mục: 00 Inbox, 01 Đã xử lý, 02 Lỗi."""
    if duong_dan_chi_dinh:
        base = Path(duong_dan_chi_dinh).resolve()
    else:
        env = common.tai_env()
        d09 = env.get("DRIVE_09_DIR")
        if d09 and Path(d09).exists():
            base = Path(d09).resolve()
        else:
            base = ROOT / "media" / "tmp" / "drive_09"

    inbox = base / "00 Inbox" if (base / "00 Inbox").exists() or not (base.name == "00 Inbox") else base
    parent = inbox.parent if inbox.name == "00 Inbox" else base
    da_xu_ly = parent / "01 Đã xử lý"
    loi = parent / "02 Lỗi"

    inbox.mkdir(parents=True, exist_ok=True)
    da_xu_ly.mkdir(parents=True, exist_ok=True)
    loi.mkdir(parents=True, exist_ok=True)
    return inbox, da_xu_ly, loi


def xu_ly_file_csv_hoac_excel(
    sb: Any, file_path: Path
) -> tuple[int, int, int, list[str]]:
    """Đọc dữ liệu từ file CSV hoặc Excel và cập nhật vào Supabase theo luật AI."""
    so_sua = 0
    so_loi = 0
    chi_tiet_loi: list[str] = []

    rows: list[dict[str, Any]] = []
    if file_path.suffix.lower() == ".csv":
        with open(file_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    elif file_path.suffix.lower() in (".xlsx", ".xls"):
        try:
            import openpyxl  # type: ignore

            wb = openpyxl.load_workbook(file_path, data_only=True)
            sheet = wb.active
            headers = [str(c.value or "").strip() for c in next(sheet.iter_rows())]
            for row in sheet.iter_rows(min_row=2, values_only=True):
                item = {headers[i]: (row[i] if i < len(row) else None) for i in range(len(headers))}
                if any(item.values()):
                    rows.append(item)
        except ImportError:
            raise RuntimeError("Cần cài đặt openpyxl để đọc file .xlsx")

    so_dong = len(rows)
    for idx, r in enumerate(rows, start=1):
        pid = str(r.get("id") or r.get("barcode") or r.get("mã") or "").strip()
        if not pid:
            so_loi += 1
            chi_tiet_loi.append(f"Dòng {idx}: thiếu mã sản phẩm (id/barcode)")
            continue

        # Lọc các trường có thể cập nhật
        cac_truong: dict[str, Any] = {}
        truong_map = {
            "ten_hien_thi": ["ten_hien_thi", "tên hiển thị", "tên"],
            "ten_en": ["ten_en", "tên tiếng anh", "name_en", "english_name"],
            "mo_ta": ["mo_ta", "mô tả", "description"],
            "mo_ta_en": ["mo_ta_en", "mô tả tiếng anh", "description_en"],
            "thanh_phan": ["thanh_phan", "thành phần", "ingredients"],
            "loai_da": ["loai_da", "loại da", "skin_type"],
            "van_de": ["van_de", "vấn đề", "skin_concerns"],
            "quy_cach": ["quy_cach", "quy cách"],
        }
        for k_db, aliases in truong_map.items():
            for alias in aliases:
                val = r.get(alias)
                if val is not None and str(val).strip():
                    cac_truong[k_db] = str(val).strip()
                    break

        if not cac_truong:
            continue

        try:
            kq = common.ghi_san_pham_ai(
                sb,
                pid,
                cac_truong,
                url_nguon=f"Drive 09: {file_path.name}",
                boi="media_inbox",
            )
            if kq.get("da_cap_nhat"):
                so_sua += 1
        except Exception as e:
            so_loi += 1
            chi_tiet_loi.append(f"Dòng {idx} ({pid}): lỗi cập nhật - {e}")

    return so_dong, so_sua, so_loi, chi_tiet_loi


def quet_va_xu_ly_inbox(duong_dan_chi_dinh: str | None = None) -> list[dict[str, Any]]:
    """Quét toàn bộ file trong 00 Inbox, xử lý và di chuyển file."""
    inbox, da_xu_ly, loi_dir = tim_thu_muc_inbox(duong_dan_chi_dinh)
    sb, _ = common.tao_supabase_client()

    files = [p for p in inbox.iterdir() if p.is_file() and not p.name.startswith(".")]
    if not files:
        print(f"Hộp thư Inbox trống ({inbox}).")
        return []

    ket_qua_lo: list[dict[str, Any]] = []
    print(f"Tìm thấy {len(files)} file trong Inbox: {inbox}")

    for f in sorted(files):
        print(f"Đang xử lý: {f.name}...")
        lo_id = common.tao_lo_nhap_lieu(sb, f.name, kenh="drive_ai", boi="media")
        ext = f.suffix.lower()

        try:
            if ext in (".csv", ".xlsx", ".xls"):
                so_dong, so_sua, so_loi, chi_tiet = xu_ly_file_csv_hoac_excel(sb, f)
                tt = "da_ap_dung" if so_loi == 0 else "da_ap_dung" if so_sua > 0 else "loi"
                common.cap_nhat_lo_nhap_lieu(
                    sb,
                    lo_id,
                    trang_thai=tt,
                    so_dong=so_dong,
                    so_moi=0,
                    so_sua=so_sua,
                    so_loi=so_loi,
                    ket_qua={"chi_tiet_loi": chi_tiet[:50]},
                )

                if tt == "da_ap_dung":
                    dich = da_xu_ly / f.name
                    if dich.exists():
                        dich.unlink()
                    shutil.move(str(f), str(dich))
                    print(f"  -> Xong: sửa {so_sua}/{so_dong} dòng (chuyển sang 01 Đã xử lý)")
                else:
                    dich = loi_dir / f.name
                    if dich.exists():
                        dich.unlink()
                    shutil.move(str(f), str(dich))
                    (loi_dir / f"{f.stem}_loi.txt").write_text("\n".join(chi_tiet), encoding="utf-8")
                    print(f"  -> Lỗi: {so_loi}/{so_dong} dòng lỗi (chuyển sang 02 Lỗi)")

                ket_qua_lo.append({"file": f.name, "lo_id": lo_id, "trang_thai": tt, "so_sua": so_sua, "so_loi": so_loi})

            else:
                # Định dạng khác (.txt, .pdf, ảnh): ghi nhận vào lô, chờ quy trình chuyên biệt
                common.cap_nhat_lo_nhap_lieu(
                    sb, lo_id, trang_thai="xem_truoc", so_dong=1, so_moi=0, so_sua=0, so_loi=0,
                    ket_qua={"ghi_chu": f"Định dạng {ext} cần phân tích riêng"}
                )
                print(f"  -> Đã ghi nhận lô xem trước cho file {f.name}")
                ket_qua_lo.append({"file": f.name, "lo_id": lo_id, "trang_thai": "xem_truoc"})

        except Exception as e:
            common.cap_nhat_lo_nhap_lieu(
                sb, lo_id, trang_thai="loi", so_dong=0, so_moi=0, so_sua=0, so_loi=1,
                ket_qua={"loi": str(e)}
            )
            dich = loi_dir / f.name
            if dich.exists():
                dich.unlink()
            shutil.move(str(f), str(dich))
            (loi_dir / f"{f.stem}_loi.txt").write_text(f"Lỗi: {e}", encoding="utf-8")
            print(f"  -> Lỗi ngoại lệ: {e}")
            ket_qua_lo.append({"file": f.name, "lo_id": lo_id, "trang_thai": "loi", "loi": str(e)})

    return ket_qua_lo


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Quét Drive 09 00 Inbox và nhập liệu vào Supabase.")
    parser.add_argument("--inbox-dir", help="Đường dẫn thư mục 00 Inbox hoặc thư mục cha chứa 00 Inbox")
    args = parser.parse_args()

    quet_va_xu_ly_inbox(args.inbox_dir)


if __name__ == "__main__":
    main()
