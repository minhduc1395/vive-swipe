#!/usr/bin/env python3
"""Quét ảnh đầu vào (Inbox/Drive 08/website hãng), đối chiếu mã và chép vào media/tmp/nguon/<id>/."""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

DUOI_ANH_HOP_LE = {".jpg", ".jpeg", ".png", ".webp"}


def doc_bang_tracker(tracker_path: Path | None) -> dict[str, str]:
    """Đọc file CSV/TSV đối chiếu tên file -> mã sản phẩm (id/barcode)."""
    if not tracker_path or not tracker_path.exists():
        return {}
    mapping: dict[str, str] = {}
    sep = "\t" if tracker_path.suffix.lower() == ".tsv" else ","
    with open(tracker_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=sep)
        for row in reader:
            pid = (row.get("id") or row.get("barcode") or row.get("ma_vach") or "").strip()
            ten_file = (row.get("ten_file") or row.get("file") or row.get("anh") or "").strip()
            if pid and ten_file:
                mapping[Path(ten_file).name.lower()] = pid
                mapping[Path(ten_file).stem.lower()] = pid
    return mapping


def doc_ma_vach_trong_anh(img_path: Path) -> list[str]:
    """Đọc mã vạch từ ảnh bằng pyzbar (nếu thư viện hệ thống sẵn sàng)."""
    try:
        from pyzbar.pyzbar import decode as zbar_decode  # type: ignore
    except Exception:
        return []

    try:
        with Image.open(img_path) as im:
            rgb = im.convert("RGB")
            ket_qua = zbar_decode(rgb)
            if not ket_qua:
                ket_qua = zbar_decode(rgb.convert("L"))
            return [
                item.data.decode("utf-8", errors="ignore").strip()
                for item in ket_qua
                if item.data
            ]
    except Exception:
        return []


def xay_dung_chi_muc_san_pham(rows: list[dict[str, str]]) -> dict[str, str]:
    """Tạo bảng ánh xạ barcode/id (chữ thường) -> san_pham.id chuẩn."""
    idx: dict[str, str] = {}
    for r in rows:
        pid = (r.get("id") or "").strip()
        bc = (r.get("barcode") or "").strip()
        if pid:
            idx[pid.lower()] = pid
        if bc:
            idx[bc.lower()] = pid
    return idx


def nhan_dien_ma(
    img_path: Path,
    chi_muc_sp: dict[str, str],
    tracker_map: dict[str, str] | None = None,
    quet_barcode: bool = True,
) -> tuple[str | None, str]:
    """Xác định mã sản phẩm cho 1 file ảnh. Trả về (id hoặc None, cách khớp)."""
    stem = img_path.stem.strip()
    stem_low = stem.lower()
    name_low = img_path.name.lower()

    # 1. Khớp trực tiếp tên file: <id> hoặc <id>_<n> hoặc chứa token mã vạch
    if stem_low in chi_muc_sp:
        return chi_muc_sp[stem_low], "ten_file_truc_tiep"

    # Tách theo dấu _ hoặc khoảng trắng, hoặc tìm chuỗi 13 chữ số / LOPOE-*
    m_prefix = re.match(r"^([A-Za-z0-9-]+?)(?:_\d+.*)?$", stem)
    if m_prefix:
        cand = m_prefix.group(1).lower()
        if cand in chi_muc_sp:
            return chi_muc_sp[cand], "ten_file_tien_to"

    for token in re.findall(r"[A-Za-z0-9-]+", stem_low):
        if token in chi_muc_sp:
            return chi_muc_sp[token], "ten_file_token"

    # 2. Đối chiếu bảng tracker
    if tracker_map:
        for khoa in (name_low, stem_low):
            if khoa in tracker_map and tracker_map[khoa].lower() in chi_muc_sp:
                return chi_muc_sp[tracker_map[khoa].lower()], "tracker"

    # 3. Đọc mã vạch trong ảnh (pyzbar)
    if quet_barcode:
        for code in doc_ma_vach_trong_anh(img_path):
            if code.lower() in chi_muc_sp:
                return chi_muc_sp[code.lower()], "barcode_pyzbar"

    return None, "khong_ro"


def nhap_thu_muc(
    thu_muc: Path,
    nguon: str = "drive",
    tracker_path: Path | None = None,
    nguon_chi_tiet: str = "",
    khop_chac_chan: bool = False,
    ghep_anh_sau: bool = False,
    quet_barcode: bool = True,
) -> dict[str, Any]:
    """Quét thư mục nguồn, phân loại theo mã sản phẩm và chép vào media/tmp/nguon/<id>/."""
    if nguon not in common.NGUON_HOP_LE:
        raise ValueError(f"Nguồn không hợp lệ: {nguon}")
    if not thu_muc.exists():
        raise FileNotFoundError(f"Không tồn tại thư mục: {thu_muc}")

    common.dam_bao_thu_muc_tam()
    chi_muc_sp = xay_dung_chi_muc_san_pham(common.doc_products_csv())
    tracker_map = doc_bang_tracker(tracker_path)

    files = sorted(
        p
        for p in thu_muc.rglob("*")
        if p.is_file() and p.suffix.lower() in DUOI_ANH_HOP_LE
    )

    ket_qua_tam: list[tuple[Path, str | None, str]] = [
        (p, *nhan_dien_ma(p, chi_muc_sp, tracker_map, quet_barcode=quet_barcode))
        for p in files
    ]

    # Hỗ trợ quy tắc chụp booth (docs/06 mục 6): ảnh k là sản phẩm, ảnh k+1 là mã vạch
    if ghep_anh_sau:
        for i in range(len(ket_qua_tam) - 1):
            p_cur, pid_cur, cach_cur = ket_qua_tam[i]
            _, pid_next, cach_next = ket_qua_tam[i + 1]
            if pid_cur is None and pid_next is not None and cach_next == "barcode_pyzbar":
                ket_qua_tam[i] = (p_cur, pid_next, "ghep_anh_barcode_ke_tiep")

    da_nhap: dict[str, list[str]] = {}
    chua_ro: list[str] = []

    for p, pid, cach in ket_qua_tam:
        chu_la = common.phat_hien_chu_la(p.name)
        if pid is None:
            dich_chua_ro = common.NGUON_DIR / "_chua-ro-ma"
            dich_chua_ro.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dich_chua_ro / p.name)
            chua_ro.append(str(p))
            continue

        thu_muc_sp = common.NGUON_DIR / pid
        thu_muc_sp.mkdir(parents=True, exist_ok=True)
        dich = thu_muc_sp / p.name
        shutil.copy2(p, dich)
        da_nhap.setdefault(pid, []).append(p.name)

        meta_path = thu_muc_sp / "meta.json"
        meta: dict[str, Any] = {}
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        files_meta = list(meta.get("files") or [])
        if p.name not in files_meta:
            files_meta.append(p.name)

        meta.update(
            {
                "id": pid,
                "nguon": nguon,
                "nguon_chi_tiet": nguon_chi_tiet or str(p),
                "khop_ma": True,
                "khop_ma_chac_chan": bool(khop_chac_chan or nguon in ("drive", "booth")),
                "cach_khop": cach,
                "chu_la_ten_file": chu_la,
                "files": files_meta,
            }
        )
        meta_path.write_text(
            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    return {"da_nhap": da_nhap, "chua_ro": chua_ro, "tong_file": len(files)}


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Nhập ảnh nguồn và nhận diện mã sản phẩm.")
    parser.add_argument("thu_muc", type=Path, help="Thư mục ảnh nguồn cần quét")
    parser.add_argument(
        "--nguon",
        default="drive",
        choices=sorted(common.NGUON_HOP_LE),
        help="Loại nguồn ảnh (mặc định: drive)",
    )
    parser.add_argument("--tracker", type=Path, default=None, help="File CSV đối chiếu tên file -> mã")
    parser.add_argument("--url", default="", help="URL trang gốc hoặc ID thư mục Drive")
    parser.add_argument(
        "--khop-chac-chan",
        action="store_true",
        help="Xác nhận nguồn thuong_hieu khớp đúng tên + quy cách + biến thể",
    )
    parser.add_argument(
        "--ghep-anh-sau",
        action="store_true",
        help="Ảnh booth chưa có barcode tự ghép theo ảnh mã vạch chụp ngay sau nó",
    )
    args = parser.parse_args()

    kq = nhap_thu_muc(
        args.thu_muc,
        nguon=args.nguon,
        tracker_path=args.tracker,
        nguon_chi_tiet=args.url,
        khop_chac_chan=args.khop_chac_chan,
        ghep_anh_sau=args.ghep_anh_sau,
    )
    print(f"Đã quét {kq['tong_file']} file.")
    print(f"Khớp mã: {len(kq['da_nhap'])} sản phẩm -> {common.NGUON_DIR}")
    for pid, ds in sorted(kq["da_nhap"].items()):
        print(f"  + {pid}: {', '.join(ds)}")
    if kq["chua_ro"]:
        print(f"Chưa rõ mã ({len(kq['chua_ro'])} file, không đăng tự động):")
        for f in kq["chua_ro"]:
            print(f"  ? {f}")


if __name__ == "__main__":
    main()
