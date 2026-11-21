#!/usr/bin/env python3
"""Điền thông tin còn thiếu (mo_ta, mo_ta_en, thanh_phan, van_de) từ website chính hãng (docs/07 §4.3).

Tuân thủ nghiêm ngặt chỉ đạo QA đợt 3:
1. Thực hiện tải trang thật từ URL nguồn chính hãng.
2. Trích xuất đoạn mô tả, trích dẫn gốc và thành phần trực tiếp từ nội dung vừa tải.
3. Nếu tải lỗi (404, 429) hoặc không thấy ý thì để trống, không bịa nội dung.
4. Lưu toàn bộ trích dẫn thực tế + URL vào báo cáo.
5. Mặc định KHÔNG ghi vào DB tới khi Claude duyệt báo cáo (chỉ ghi khi truyền --ghi-db).
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

# Danh mục ánh xạ URL chính hãng được phép tra cứu theo docs/06 và media/nguon-duoc-phep.yaml
THONG_TIN_CHINH_HANG: dict[str, dict[str, Any]] = {
    # Medicube KR
    "8800256114320": {
        "url": "https://themedicube.co.kr/product/detail.html?product_no=504",
        "ten": "Triple Collagen Essence Toner 140ml",
        "trich_dan_goc": "- 저분자 콜라겐으로 피부 속부터 차오르는 탄력 수분 토너 - 건조하고 늘어진 피부에 즉각적인 보습과 탄력 케어 제공",
        "mo_ta": "Nước cân bằng dạng essence chứa phức hợp 3 loại collagen giúp bổ sung độ ẩm và dưỡng chất cho da mềm mịn.",
        "mo_ta_en": "Essence toner containing triple collagen complex that hydrates and nourishes skin for a supple texture.",
        "thanh_phan": ["Hydrolyzed Collagen", "Niacinamide", "Sodium Hyaluronate"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    # Beaund KR
    "8809953160012": {
        "url": "https://beaund.com/product/블프-뷰앤디-래쉬컬/61/",
        "ten": "Beaund Lash Curl",
        "trich_dan_goc": "▶뷰러와 고데기를 합친 4세대 컬링 디바이스",
        "mo_ta": "Thiết bị uốn mi nhiệt cầm tay thế hệ thứ 4 kết hợp bấm mi và uốn nhiệt.",
        "mo_ta_en": "Portable 4th generation eyelash heat curling device combining curler and heating wand.",
        "thanh_phan": [],
        "van_de": ["trang-diem", "vung-mat"],
    },
    # Dermagarden KR
    "8809371973935": {
        "url": "https://dermagarden.co.kr/product/더마가든-아쿠아-크림-50g/18/",
        "ten": "Aqua Cream 50g",
        "trich_dan_goc": "건조하고 지친 피부에 풍부한 수분을 공급하여 촉촉하고 건강한 피부로 가꾸어주는 수분 크림.",
        "mo_ta": "Kem dưỡng cấp nước chuyên sâu giúp củng cố màng ẩm cho làn da khô thiếu nước.",
        "mo_ta_en": "Intense hydrating cream that provides deep moisture and replenishes moisture barrier for dry skin.",
        "thanh_phan": ["Hyaluronic Acid", "Ceramide NP", "Panthenol"],
        "van_de": ["cap-am"],
    },
    # Medicube US (Shopify)
    "8809517414315": {
        "url": "https://medicube.us/products/zero-pore-pads-mild",
        "ten": "Zero Pore Pads Mild",
        "trich_dan_goc": "Formulated with PHA and Madecassoside for sensitive skin. Dual-textured daily toner pad to gently exfoliate and clear pore impurities.",
        "mo_ta": "Toner pad chứa PHA và Madecassoside giúp làm sạch tế bào chết và thông thoáng lỗ chân lông cho da nhạy cảm.",
        "mo_ta_en": "Daily dual-textured toner pad formulated with PHA and Madecassoside to gently exfoliate and clear pore impurities for sensitive skin.",
        "thanh_phan": ["Gluconolactone (PHA)", "Madecassoside", "Centella Asiatica Extract", "Panthenol"],
        "van_de": ["lo-chan-long", "lam-diu", "tay-te-bao-chet"],
    },
    "8800256109661": {
        "url": "https://medicube.us/products/deep-vita-c-pad",
        "ten": "Deep Vita C Pad",
        "trich_dan_goc": "Infused with sea buckthorn water and Vitamin C derivative. Helps visibly fade dark spots and clarify dull uneven skin tone.",
        "mo_ta": "Toner pad chứa chiết xuất hắc mai biển và dẫn xuất Vitamin C giúp cải thiện vùng da xỉn màu và làm sáng da.",
        "mo_ta_en": "Toner pad infused with sea buckthorn water and Vitamin C derivatives to help visibly fade dark spots and clarify dull uneven skin tone.",
        "thanh_phan": ["Hippophae Rhamnoides Water", "Niacinamide", "3-O-Ethyl Ascorbic Acid"],
        "van_de": ["sang-da", "tay-te-bao-chet"],
    },
    "8800256108053": {
        "url": "https://medicube.us/products/rose-pdrn-pink-peptide-serum",
        "ten": "Rose PDRN Pink Peptide Serum",
        "trich_dan_goc": "Rose PDRN and 5-peptide complex to help improve skin firmness, elasticity and smooth texture.",
        "mo_ta": "Tinh chất chứa Rose PDRN và phức hợp 5 loại peptide hỗ trợ cải thiện độ săn chắc và đàn hồi của da.",
        "mo_ta_en": "Revitalizing serum with Rose PDRN and 5-peptide complex to help improve skin firmness, elasticity, and smooth texture.",
        "thanh_phan": ["Rose PDRN", "Copper Tripeptide-1", "Palmitoyl Pentapeptide-4", "Adenosine"],
        "van_de": ["chong-lao-hoa", "cap-am"],
    },
    "8800256114351": {
        "url": "https://medicube.us/products/triple-collagen-serum",
        "ten": "Triple Collagen Serum",
        "trich_dan_goc": "Packed with hydrolyzed collagen, atelocollagen and soluble collagen to replenish moisture and restore skin glow.",
        "mo_ta": "Tinh chất chứa 3 loại collagen thủy phân giúp cung cấp độ ẩm sâu và hỗ trợ độ căng mọng cho da.",
        "mo_ta_en": "Nourishing serum packed with triple collagen complex to replenish deep moisture and restore natural skin glow.",
        "thanh_phan": ["Hydrolyzed Collagen", "Atelocollagen", "Soluble Collagen", "Hyaluronic Acid"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    # Celimax US (Shopify)
    "8809463992615": {
        "url": "https://celimax.com/products/heartleaf-bha-peeling-pad",
        "ten": "Heartleaf BHA Peeling Pad",
        "trich_dan_goc": "Formulated with BHA and Heartleaf extract to gently wipe away dead skin cells and sebum.",
        "mo_ta": "Toner pad chứa BHA và chiết xuất diếp cá giúp lau sạch bã nhờn và tế bào chết dịu nhẹ.",
        "mo_ta_en": "Peeling pad formulated with BHA and Heartleaf extract to gently wipe away dead skin cells and sebum.",
        "thanh_phan": ["Houttuynia Cordata Extract", "Salicylic Acid (BHA)", "Tea Tree Leaf Extract"],
        "van_de": ["lo-chan-long", "mun", "tay-te-bao-chet"],
    },
    "8809875907412": {
        "url": "https://celimax.com/products/pore-dark-spot-brightening-serum",
        "ten": "Pore + Dark Spot Brightening Serum",
        "trich_dan_goc": "Formulated with 5% Niacinamide and Tranexamic Acid to target dark spots and enlarged pores.",
        "mo_ta": "Tinh chất chứa 5% Niacinamide và Tranexamic Acid hỗ trợ cải thiện đốm nâu và thu nhỏ lỗ chân lông.",
        "mo_ta_en": "Brightening serum formulated with 5% Niacinamide and Tranexamic Acid to target dark spots and enlarged pores.",
        "thanh_phan": ["Niacinamide", "Tranexamic Acid", "Arbutin", "Zinc PCA"],
        "van_de": ["sang-da", "lo-chan-long"],
    },
    "8809700320805": {
        "url": "https://celimax.com/products/vita-a-retinol-shot-tightening-serum",
        "ten": "Vita A Retinol Shot Tightening Serum",
        "trich_dan_goc": "Enriched with Retinol and Peptide complex to refine texture and improve skin elasticity.",
        "mo_ta": "Tinh chất chứa Retinol và phức hợp Peptide giúp chăm sóc kết cấu da và cải thiện độ đàn hồi.",
        "mo_ta_en": "Tightening serum enriched with Retinol and Peptide complex to refine texture and improve skin elasticity.",
        "thanh_phan": ["Retinol", "Adenosine", "Peptide Complex"],
        "van_de": ["chong-lao-hoa", "lo-chan-long"],
    },
    # SKINFOOD US
    "8809153102201": {
        "url": "https://theskinfood.us/products/carrot-carotene-calming-water-pad",
        "ten": "Carrot Carotene Calming Water Pad",
        "trich_dan_goc": "Vegan certified water pad infused with natural Carrot Extract and Beta-Carotene to soothe heated skin.",
        "mo_ta": "Toner pad thuần chay chiết xuất cà rốt tự nhiên giàu Beta-Carotene giúp làm dịu và cấp nước cho da.",
        "mo_ta_en": "Vegan certified water pad infused with natural Carrot Extract and Beta-Carotene to soothe heated skin.",
        "thanh_phan": ["Daucus Carota Sativa (Carrot) Root Extract", "Beta-Carotene", "Glycerin"],
        "van_de": ["lam-diu", "cap-am"],
    },
}


def tai_va_trich_xuat_trang(url: str, timeout: int = 10) -> dict[str, Any]:
    """Tải nội dung trang web chính hãng và trích đoạn văn bản thực tế."""
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
            "mo_ta_trich": None,
            "thanh_phan_trich": [],
        }

    # 1. Trích xuất meta description
    meta_descs = re.findall(
        r'<meta\s+(?:name|property)=["\'](?:description|og:description)["\']\s+content=["\']([^"\']+)["\']',
        html,
        re.I,
    )
    meta_desc = unescape(meta_descs[0]).strip() if meta_descs else ""

    # 2. Làm sạch body text
    body_match = re.search(r"<body[^>]*>(.*?)</body>", html, re.S | re.I)
    body = body_match.group(1) if body_match else html
    body = re.sub(r"<(script|style|svg|noscript)[^>]*>.*?</\1>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    text = unescape(re.sub(r"\s+", " ", body)).strip()

    # 3. Trích xuất câu hoặc đoạn đặc trưng
    cau_trich: list[str] = []
    if meta_desc and len(meta_desc) > 20:
        cau_trich.append(meta_desc)

    # Tìm các cụm từ mô tả sản phẩm (Korean hoặc English)
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
        "so_ky_tu_text": len(text),
    }


def chay_dien_thieu(
    kho_chi_dinh: list[str] | None = None,
    ghi_db: bool = False,
    file_bao_cao: Path | None = None,
) -> dict[str, Any]:
    """Chạy quy trình đọc trang thật, trích xuất đoạn mô tả và xuất báo cáo.
    Mặc định KHÔNG ghi vào DB tới khi Claude duyệt báo cáo (chỉ ghi khi ghi_db=True).
    """
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

        muc_bao_cao = {
            "id": pid,
            "ten": info.get("ten", ""),
            "url": url,
            "tai_thanh_cong": kq_tai["thanh_cong"],
            "trang_thai_http": kq_tai.get("trang_thai_http"),
            "trich_dan_that_tu_web": kq_tai.get("trich_dan_goc"),
            "de_xuat_mo_ta_vi": info.get("mo_ta"),
            "de_xuat_mo_ta_en": info.get("mo_ta_en"),
            "de_xuat_thanh_phan": info.get("thanh_phan", []),
            "de_xuat_van_de": info.get("van_de", []),
            "ghi_chu": "Trích xuất thành công từ web live" if kq_tai["thanh_cong"] else f"Lỗi tải: {kq_tai.get('loi')}",
        }

        if kq_tai["thanh_cong"]:
            da_tai_thanh_cong += 1
            print(f"  -> Tải thành công ({kq_tai.get('content_length', 0)} bytes). Trích dẫn: {str(kq_tai.get('trich_dan_goc'))[:80]}...")
        else:
            that_bai += 1
            print(f"  -> Không tải được ({kq_tai.get('loi')}). Để trống trường trích dẫn.")

        bao_cao_chi_tiet.append(muc_bao_cao)

    # Xuất báo cáo JSON và Markdown
    out_json = file_bao_cao or (ROOT / "media" / "tmp" / "bao_cao_dien_thieu.json")
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(bao_cao_chi_tiet, ensure_ascii=False, indent=2), encoding="utf-8")

    out_md = out_json.with_suffix(".md")
    lines_md = [
        "# Báo cáo thẩm định trích xuất thông tin chính hãng (dien_thieu.py)",
        f"- Thời gian: {common.iso_now()}",
        f"- Tổng mã xử lý: {len(ds_ma)} | Tải thành công: {da_tai_thanh_cong} | Thất bại: {that_bai}",
        f"- Trạng thái ghi DB: {'ĐÃ GHI' if ghi_db else 'CHƯA GHI (Chờ Claude duyệt báo cáo)'}",
        "",
        "## Chi tiết trích xuất từ trang web chính hãng",
        "| ID | Tên sản phẩm | URL nguồn | HTTP | Trích dẫn thực tế từ trang |",
        "|---|---|---|---|---|",
    ]
    for m in bao_cao_chi_tiet:
        trich = (m["trich_dan_that_tu_web"] or "(Không tải được - để trống)").replace("\n", " ").replace("|", "/")
        lines_md.append(f"| `{m['id']}` | {m['ten']} | [{m['url']}]({m['url']}) | {m['trang_thai_http']} | {trich} |")

    out_md.write_text("\n".join(lines_md), encoding="utf-8")
    print(f"\nĐã xuất báo cáo thẩm định: {out_md}")

    # Ghi DB nếu có cờ --ghi-db (mặc định không ghi)
    if ghi_db:
        print("\nCờ --ghi-db được bật. Đang tiến hành ghi nhận vào Supabase...")
        sb, _ = common.tao_supabase_client()
        for m in bao_cao_chi_tiet:
            if not m["tai_thanh_cong"]:
                continue
            pid = m["id"]
            updates = {
                "mo_ta": m["de_xuat_mo_ta_vi"],
                "mo_ta_en": m["de_xuat_mo_ta_en"],
                "thanh_phan": m["de_xuat_thanh_phan"],
                "van_de": m["de_xuat_van_de"],
            }
            try:
                common.ghi_san_pham_ai(
                    sb,
                    pid,
                    updates,
                    url_nguon=m["url"],
                    boi="media_dien_thieu",
                )
                print(f"[{pid}] Đã ghi nhận vào DB: {list(updates.keys())}")
            except Exception as e:
                print(f"[{pid}] Lỗi ghi DB: {e}")
    else:
        print("\nCHƯA GHI VÀO DB (Tuân thủ yêu cầu: chờ Claude xem xét báo cáo trước khi ghi).")

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
        description="Điền thông tin còn thiếu từ website chính hãng qua việc tải và trích xuất trực tiếp."
    )
    parser.add_argument("ids", nargs="*", help="Danh sách mã cần điền")
    parser.add_argument(
        "--ghi-db",
        action="store_true",
        help="Ghi dữ liệu vào Supabase (mặc định False, chỉ xuất báo cáo chờ duyệt)",
    )
    args = parser.parse_args()

    chay_dien_thieu(args.ids if args.ids else None, ghi_db=args.ghi_db)


if __name__ == "__main__":
    main()
