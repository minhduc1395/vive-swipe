#!/usr/bin/env python3
"""Điền thông tin còn thiếu (mo_ta, mo_ta_en, thanh_phan, van_de) từ website chính hãng (docs/07 §4.3).

Tuân thủ nghiêm ngặt chỉ đạo QA đợt 4:
1. THONG_TIN_CHINH_HANG chỉ lưu ánh xạ `url` và `ten`, không gõ sẵn mô tả/thành phần/vấn đề.
2. Khi chạy mặc định: tải trang thật từ URL chính hãng, trích trích dẫn và `thanh_phan`
   chỉ lấy chất xuất hiện nguyên văn (không phân biệt hoa thường) trong nội dung trang tải về.
3. Xuất báo cáo `media/tmp/bao_cao_dien_thieu.json` (kèm `da_duyet: false`) và `.md`, KHÔNG ghi DB.
4. Khi chạy `--ghi-db`: CHỈ đọc file báo cáo JSON đã có và chỉ ghi các mục có `da_duyet: true`
   do Claude duyệt, không tự sinh nội dung mới.
"""

from __future__ import annotations

import argparse
from html import unescape
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str((ROOT / "scripts" / "du_lieu").resolve()))
import common  # noqa: E402

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Danh mục ánh xạ URL chính hãng được phép tra cứu theo docs/06 và media/nguon-duoc-phep.yaml.
# Chỉ giữ `url` và `ten`; tuyệt đối không gõ sẵn mô tả, trích dẫn, thành phần hay vấn đề.
THONG_TIN_CHINH_HANG: dict[str, dict[str, str]] = {
    "8800256114320": {
        "url": "https://themedicube.co.kr/product/detail.html?product_no=504",
        "ten": "Triple Collagen Essence Toner 140ml",
    },
    "8809953160012": {
        "url": "https://beaund.com/product/블프-뷰앤디-래쉬컬/61/",
        "ten": "Beaund Lash Curl",
    },
    "8809371973935": {
        "url": "https://dermagarden.co.kr/product/더마가든-아쿠아-크림-50g/18/",
        "ten": "Aqua Cream 50g",
    },
    "8809517414315": {
        "url": "https://medicube.us/products/zero-pore-pads-mild",
        "ten": "Zero Pore Pads Mild",
    },
    "8800256109661": {
        "url": "https://medicube.us/products/deep-vita-c-pad",
        "ten": "Deep Vita C Pad",
    },
    "8800256108053": {
        "url": "https://medicube.us/products/rose-pdrn-pink-peptide-serum",
        "ten": "Rose PDRN Pink Peptide Serum",
    },
    "8800256114351": {
        "url": "https://medicube.us/products/triple-collagen-serum",
        "ten": "Triple Collagen Serum",
    },
    "8809463992615": {
        "url": "https://celimax.com/products/heartleaf-bha-peeling-pad",
        "ten": "Heartleaf BHA Peeling Pad",
    },
    "8809875907412": {
        "url": "https://celimax.com/products/pore-dark-spot-brightening-serum",
        "ten": "Pore + Dark Spot Brightening Serum",
    },
    "8809700320805": {
        "url": "https://celimax.com/products/vita-a-retinol-shot-tightening-serum",
        "ten": "Vita A Retinol Shot Tightening Serum",
    },
    "8809153102201": {
        "url": "https://theskinfood.us/products/carrot-carotene-calming-water-pad",
        "ten": "Carrot Carotene Calming Water Pad",
    },
}

# Danh sách hoạt chất phổ biến để đối chiếu nguyên văn (không phân biệt hoa thường) trong chữ trang tải về.
DANH_MUC_THANH_PHAN_DO: tuple[str, ...] = (
    "Hydrolyzed Collagen",
    "Atelocollagen",
    "Soluble Collagen",
    "Niacinamide",
    "Sodium Hyaluronate",
    "Hyaluronic Acid",
    "Ceramide NP",
    "Panthenol",
    "Gluconolactone",
    "Madecassoside",
    "Centella Asiatica Extract",
    "Hippophae Rhamnoides Water",
    "3-O-Ethyl Ascorbic Acid",
    "Rose PDRN",
    "Copper Tripeptide-1",
    "Palmitoyl Pentapeptide-4",
    "Adenosine",
    "Houttuynia Cordata Extract",
    "Salicylic Acid",
    "Tea Tree Leaf Extract",
    "Tranexamic Acid",
    "Arbutin",
    "Zinc PCA",
    "Retinol",
    "Retinal",
    "Beta-Carotene",
    "Daucus Carota Sativa",
    "Glycerin",
)


def trich_thanh_phan_tu_van_ban(
    van_ban: str,
    danh_muc: tuple[str, ...] = DANH_MUC_THANH_PHAN_DO,
) -> list[str]:
    """Chỉ trả về các chất xuất hiện nguyên văn (không phân biệt hoa thường) trong văn bản trang."""
    if not van_ban:
        return []
    ket_qua: list[str] = []
    for chat in danh_muc:
        pattern = r"(?<![A-Za-z0-9])" + re.escape(chat) + r"(?![A-Za-z0-9])"
        if re.search(pattern, van_ban, flags=re.IGNORECASE):
            ket_qua.append(chat)
    return ket_qua


def tai_va_trich_xuat_trang(url: str, timeout: int = 10) -> dict[str, Any]:
    """Tải nội dung trang web chính hãng và trích đoạn văn bản + thành phần thực tế."""
    try:
        parts = urllib.parse.urlsplit(url)
        encoded_url = urllib.parse.urlunsplit((
            parts.scheme,
            parts.netloc,
            urllib.parse.quote(parts.path),
            parts.query,
            parts.fragment,
        ))
        req = urllib.request.Request(encoded_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status_code = resp.status
            content_type = resp.headers.get("Content-Type", "")
            raw_data = resp.read()
            html = raw_data.decode("utf-8", errors="ignore")
    except Exception as e:
        return {
            "thanh_cong": False,
            "trang_thai_http": getattr(e, "code", None),
            "loi": str(e),
            "trich_dan_goc": None,
            "thanh_phan_trich": [],
        }

    meta_descs = re.findall(
        r'<meta\s+(?:name|property)=["\'](?:description|og:description)["\']\s+content=["\']([^"\']+)["\']',
        html,
        re.I,
    )
    meta_desc = unescape(meta_descs[0]).strip() if meta_descs else ""

    body_match = re.search(r"<body[^>]*>(.*?)</body>", html, re.S | re.I)
    body = body_match.group(1) if body_match else html
    body = re.sub(r"<(script|style|svg|noscript)[^>]*>.*?</\1>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    text = unescape(re.sub(r"\s+", " ", body)).strip()

    van_ban_day_du = f"{meta_desc}\n{text}".strip()
    thanh_phan_trich = trich_thanh_phan_tu_van_ban(van_ban_day_du)

    cau_trich: list[str] = []
    if meta_desc and len(meta_desc) > 20:
        cau_trich.append(meta_desc)

    cac_doan = re.findall(r"([A-Z0-9가-힣][^.\n]{25,200}\.)", text)
    for d in cac_doan[:3]:
        d_clean = d.strip()
        if d_clean and d_clean not in cau_trich:
            cau_trich.append(d_clean)

    trich_dan_goc = "\n".join(cau_trich[:2]) if cau_trich else (meta_desc or None)

    return {
        "thanh_cong": True,
        "trang_thai_http": status_code,
        "content_length": len(raw_data),
        "content_type": content_type,
        "trich_dan_goc": trich_dan_goc,
        "meta_description": meta_desc,
        "thanh_phan_trich": thanh_phan_trich,
        "so_ky_tu_text": len(text),
    }


def ghi_db_tu_bao_cao_da_duyet(
    file_bao_cao: Path | None = None,
    sb: Any = None,
) -> dict[str, Any]:
    """Chỉ đọc báo cáo JSON đã có và ghi vào DB các mục có `da_duyet: true`."""
    in_json = file_bao_cao or (ROOT / "media" / "tmp" / "bao_cao_dien_thieu.json")
    if not in_json.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file báo cáo đã duyệt: {in_json}. Chạy chế độ tạo báo cáo trước."
        )

    du_lieu = json.loads(in_json.read_text(encoding="utf-8"))
    if not isinstance(du_lieu, list):
        raise ValueError("File báo cáo JSON phải là danh sách các mục sản phẩm.")

    client = sb if sb is not None else common.tao_supabase_client()[0]
    da_ghi = 0
    bo_qua = 0
    loi = 0

    for muc in du_lieu:
        if muc.get("da_duyet") is not True:
            bo_qua += 1
            continue
        pid = muc.get("id")
        if not pid:
            bo_qua += 1
            continue

        updates: dict[str, Any] = {}
        if muc.get("mo_ta"):
            updates["mo_ta"] = muc["mo_ta"]
        if muc.get("mo_ta_en"):
            updates["mo_ta_en"] = muc["mo_ta_en"]
        if isinstance(muc.get("thanh_phan"), list) and muc["thanh_phan"]:
            updates["thanh_phan"] = muc["thanh_phan"]
        if isinstance(muc.get("van_de"), list) and muc["van_de"]:
            updates["van_de"] = muc["van_de"]

        if not updates:
            bo_qua += 1
            continue

        try:
            common.ghi_san_pham_ai(
                client,
                pid,
                updates,
                url_nguon=muc.get("url"),
                boi="media_dien_thieu",
            )
            da_ghi += 1
            print(f"[{pid}] Đã ghi vào DB từ báo cáo đã duyệt: {list(updates.keys())}")
        except Exception as e:
            loi += 1
            print(f"[{pid}] Lỗi ghi DB: {e}")

    return {"da_ghi": da_ghi, "bo_qua": bo_qua, "loi": loi, "file": str(in_json)}


def chay_dien_thieu(
    kho_chi_dinh: list[str] | None = None,
    ghi_db: bool = False,
    file_bao_cao: Path | None = None,
) -> dict[str, Any]:
    """Chạy tải trang thật + xuất báo cáo chờ duyệt (hoặc ghi DB từ báo cáo đã duyệt nếu ghi_db=True)."""
    out_json = file_bao_cao or (ROOT / "media" / "tmp" / "bao_cao_dien_thieu.json")

    if ghi_db:
        print(f"Đọc báo cáo đã duyệt để ghi DB: {out_json}")
        return ghi_db_tu_bao_cao_da_duyet(file_bao_cao=out_json)

    ds_ma = kho_chi_dinh if kho_chi_dinh else list(THONG_TIN_CHINH_HANG.keys())
    print(f"Bắt đầu tải và trích xuất thực tế cho {len(ds_ma)} sản phẩm có nguồn chính hãng...")

    da_tai_thanh_cong = 0
    that_bai = 0
    bao_cao_chi_tiet: list[dict[str, Any]] = []

    for pid in ds_ma:
        info = THONG_TIN_CHINH_HANG.get(pid)
        if not info:
            continue

        url = info["url"]
        print(f"[{pid}] Đang tải trang thật: {url}...")
        kq_tai = tai_va_trich_xuat_trang(url)

        thanh_phan_trich = list(kq_tai.get("thanh_phan_trich") or [])
        muc_bao_cao = {
            "id": pid,
            "ten": info.get("ten", ""),
            "url": url,
            "da_duyet": False,
            "tai_thanh_cong": kq_tai["thanh_cong"],
            "trang_thai_http": kq_tai.get("trang_thai_http"),
            "trich_dan_that_tu_web": kq_tai.get("trich_dan_goc"),
            "mo_ta": None,
            "mo_ta_en": None,
            "thanh_phan": thanh_phan_trich,
            "van_de": [],
            "ghi_chu": (
                "Trích xuất trực tiếp từ web live (chờ Claude duyệt)"
                if kq_tai["thanh_cong"]
                else f"Lỗi tải: {kq_tai.get('loi')}"
            ),
        }

        if kq_tai["thanh_cong"]:
            da_tai_thanh_cong += 1
            print(
                f"  -> Tải thành công ({kq_tai.get('content_length', 0)} bytes). "
                f"Thành phần tìm thấy: {thanh_phan_trich}"
            )
        else:
            that_bai += 1
            print(f"  -> Không tải được ({kq_tai.get('loi')}). Để trống.")

        bao_cao_chi_tiet.append(muc_bao_cao)

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(bao_cao_chi_tiet, ensure_ascii=False, indent=2), encoding="utf-8")

    out_md = out_json.with_suffix(".md")
    lines_md = [
        "# Báo cáo thẩm định trích xuất thông tin chính hãng (dien_thieu.py)",
        f"- Thời gian: {common.iso_now()}",
        f"- Tổng mã xử lý: {len(ds_ma)} | Tải thành công: {da_tai_thanh_cong} | Thất bại: {that_bai}",
        "- Trạng thái ghi DB: CHƯA GHI (Chờ Claude đặt `da_duyet: true` trong JSON rồi mới chạy `--ghi-db`)",
        "",
        "## Chi tiết trích xuất từ trang web chính hãng",
        "| ID | Tên sản phẩm | URL nguồn | HTTP | Thành phần nguyên văn | Trích dẫn thực tế từ trang |",
        "|---|---|---|---|---|---|",
    ]
    for m in bao_cao_chi_tiet:
        trich = (m["trich_dan_that_tu_web"] or "(Không tải được - để trống)").replace("\n", " ").replace("|", "/")
        tp_str = ", ".join(m["thanh_phan"]) if m["thanh_phan"] else "(trống)"
        lines_md.append(
            f"| `{m['id']}` | {m['ten']} | [{m['url']}]({m['url']}) | {m['trang_thai_http']} | {tp_str} | {trich} |"
        )

    out_md.write_text("\n".join(lines_md), encoding="utf-8")
    print(f"\nĐã xuất báo cáo thẩm định: {out_md} (CHƯA GHI DB).")

    return {
        "tong_ma": len(ds_ma),
        "thanh_cong": da_tai_thanh_cong,
        "that_bai": that_bai,
        "bao_cao_json": str(out_json),
        "bao_cao_md": str(out_md),
    }


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(
        description="Điền thông tin còn thiếu từ website chính hãng (tải trang thật, chỉ ghi DB từ báo cáo đã duyệt)."
    )
    parser.add_argument("ids", nargs="*", help="Danh sách mã cần trích xuất (bỏ qua khi dùng --ghi-db)")
    parser.add_argument(
        "--ghi-db",
        action="store_true",
        help="Chỉ đọc báo cáo JSON đã được Claude đặt da_duyet: true để ghi vào Supabase",
    )
    parser.add_argument(
        "--bao-cao",
        type=Path,
        default=None,
        help="Đường dẫn file báo cáo JSON (mặc định media/tmp/bao_cao_dien_thieu.json)",
    )
    args = parser.parse_args()

    chay_dien_thieu(args.ids if args.ids else None, ghi_db=args.ghi_db, file_bao_cao=args.bao_cao)


if __name__ == "__main__":
    main()
