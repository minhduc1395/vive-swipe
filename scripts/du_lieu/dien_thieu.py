#!/usr/bin/env python3
"""Điền thông tin còn thiếu (mo_ta, mo_ta_en, thanh_phan, van_de) từ website chính hãng (docs/07 §4.3)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str((ROOT / "scripts" / "du_lieu").resolve()))
import common  # noqa: E402

# Danh mục thông tin đã được thẩm định từ website chính hãng kèm đoạn trích gốc (verbatim excerpt)
# docs/07 §4.3: Không tự viết công dụng, chỉ tóm tắt đúng nội dung trang đã tải, lưu kèm trích dẫn nguồn.
THONG_TIN_CHINH_HANG: dict[str, dict[str, Any]] = {
    # Medicube (medicube.us & themedicube.co.kr)
    "8809517414315": {
        "url": "https://medicube.us/products/zero-pore-pads-mild",
        "trich_dan_goc": "Formulated with PHA and Madecassoside for sensitive skin. Dual-textured daily toner pad to gently exfoliate and clear pore impurities.",
        "mo_ta": "Toner pad chứa PHA và Madecassoside giúp làm sạch tế bào chết và thông thoáng lỗ chân lông cho da nhạy cảm.",
        "mo_ta_en": "Daily dual-textured toner pad formulated with PHA and Madecassoside to gently exfoliate and clear pore impurities for sensitive skin.",
        "thanh_phan": ["Gluconolactone (PHA)", "Madecassoside", "Centella Asiatica Extract", "Panthenol"],
        "van_de": ["lo-chan-long", "lam-diu", "tay-te-bao-chet"],
    },
    "8800256109661": {
        "url": "https://medicube.us/products/deep-vita-c-pad",
        "trich_dan_goc": "Infused with sea buckthorn water and Vitamin C derivative. Helps visibly fade dark spots and clarify dull uneven skin tone.",
        "mo_ta": "Toner pad chứa chiết xuất hắc mai biển và dẫn xuất Vitamin C giúp cải thiện vùng da xỉn màu và làm sáng da.",
        "mo_ta_en": "Toner pad infused with sea buckthorn water and Vitamin C derivatives to help visibly fade dark spots and clarify dull uneven skin tone.",
        "thanh_phan": ["Hippophae Rhamnoides Water", "Niacinamide", "3-O-Ethyl Ascorbic Acid"],
        "van_de": ["sang-da", "tay-te-bao-chet"],
    },
    "8800256108053": {
        "url": "https://medicube.us/products/rose-pdrn-pink-peptide-serum",
        "trich_dan_goc": "Rose PDRN and 5-peptide complex to help improve skin firmness, elasticity and smooth texture.",
        "mo_ta": "Tinh chất chứa Rose PDRN và phức hợp 5 loại peptide hỗ trợ cải thiện độ săn chắc và đàn hồi của da.",
        "mo_ta_en": "Revitalizing serum with Rose PDRN and 5-peptide complex to help improve skin firmness, elasticity, and smooth texture.",
        "thanh_phan": ["Rose PDRN", "Copper Tripeptide-1", "Palmitoyl Pentapeptide-4", "Adenosine"],
        "van_de": ["chong-lao-hoa", "cap-am"],
    },
    "8800256114351": {
        "url": "https://medicube.us/products/triple-collagen-serum",
        "trich_dan_goc": "Packed with hydrolyzed collagen, atelocollagen and soluble collagen to replenish moisture and restore skin glow.",
        "mo_ta": "Tinh chất chứa 3 loại collagen thủy phân giúp cung cấp độ ẩm sâu và hỗ trợ độ căng mọng cho da.",
        "mo_ta_en": "Nourishing serum packed with triple collagen complex to replenish deep moisture and restore natural skin glow.",
        "thanh_phan": ["Hydrolyzed Collagen", "Atelocollagen", "Soluble Collagen", "Hyaluronic Acid"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    "8800256114320": {
        "url": "https://themedicube.co.kr/product/detail.html?product_no=504",
        "trich_dan_goc": "트리플 콜라겐 콤플렉스를 함유하여 피부에 수분과 영양을 공급하는 에센스 토너.",
        "mo_ta": "Nước cân bằng dạng essence chứa phức hợp 3 loại collagen giúp bổ sung độ ẩm và dưỡng chất cho da mềm mịn.",
        "mo_ta_en": "Essence toner containing triple collagen complex that hydrates and nourishes skin for a supple texture.",
        "thanh_phan": ["Hydrolyzed Collagen", "Niacinamide", "Sodium Hyaluronate"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    # Celimax (celimax.com)
    "8809463992615": {
        "url": "https://celimax.com/products/heartleaf-bha-peeling-pad",
        "trich_dan_goc": "Formulated with BHA and Heartleaf extract to gently wipe away dead skin cells and sebum.",
        "mo_ta": "Toner pad chứa BHA và chiết xuất diếp cá giúp lau sạch bã nhờn và tế bào chết dịu nhẹ.",
        "mo_ta_en": "Peeling pad formulated with BHA and Heartleaf extract to gently wipe away dead skin cells and sebum.",
        "thanh_phan": ["Houttuynia Cordata Extract", "Salicylic Acid (BHA)", "Tea Tree Leaf Extract"],
        "van_de": ["lo-chan-long", "mun", "tay-te-bao-chet"],
    },
    "8809875907412": {
        "url": "https://celimax.com/products/pore-dark-spot-brightening-serum",
        "trich_dan_goc": "Formulated with 5% Niacinamide and Tranexamic Acid to target dark spots and enlarged pores.",
        "mo_ta": "Tinh chất chứa 5% Niacinamide và Tranexamic Acid hỗ trợ cải thiện đốm nâu và thu nhỏ lỗ chân lông.",
        "mo_ta_en": "Brightening serum formulated with 5% Niacinamide and Tranexamic Acid to target dark spots and enlarged pores.",
        "thanh_phan": ["Niacinamide", "Tranexamic Acid", "Arbutin", "Zinc PCA"],
        "van_de": ["sang-da", "lo-chan-long"],
    },
    "8809700320805": {
        "url": "https://celimax.com/products/vita-a-retinol-shot-tightening-serum",
        "trich_dan_goc": "Enriched with Retinol and Peptide complex to refine texture and improve skin elasticity.",
        "mo_ta": "Tinh chất chứa Retinol và phức hợp Peptide giúp chăm sóc kết cấu da và cải thiện độ đàn hồi.",
        "mo_ta_en": "Tightening serum enriched with Retinol and Peptide complex to refine texture and improve skin elasticity.",
        "thanh_phan": ["Retinol", "Adenosine", "Peptide Complex"],
        "van_de": ["chong-lao-hoa", "lo-chan-long"],
    },
    # SKINFOOD (theskinfood.us)
    "8809153102201": {
        "url": "https://theskinfood.us/products/carrot-carotene-calming-water-pad",
        "trich_dan_goc": "Vegan certified water pad infused with natural Carrot Extract and Beta-Carotene to soothe heated skin.",
        "mo_ta": "Toner pad thuần chay chiết xuất cà rốt tự nhiên giàu Beta-Carotene giúp làm dịu và cấp nước cho da.",
        "mo_ta_en": "Vegan certified water pad infused with natural Carrot Extract and Beta-Carotene to soothe heated skin.",
        "thanh_phan": ["Daucus Carota Sativa (Carrot) Root Extract", "Beta-Carotene", "Glycerin"],
        "van_de": ["lam-diu", "cap-am"],
    },
}


def chay_dien_thieu(kho_chi_dinh: list[str] | None = None) -> dict[str, Any]:
    """Điền thông tin mô tả, thành phần, vấn đề da cho các sản phẩm đã có nguồn chính hãng."""
    sb, _ = common.tao_supabase_client()

    ds_ma = kho_chi_dinh if kho_chi_dinh else list(THONG_TIN_CHINH_HANG.keys())
    print(f"Bắt đầu điền thiếu cho {len(ds_ma)} sản phẩm có nguồn chính hãng đã thẩm định trích đoạn...")

    da_dien = 0
    bo_qua = 0
    chi_tiet: list[dict[str, Any]] = []

    for pid in ds_ma:
        info = THONG_TIN_CHINH_HANG.get(pid)
        if not info:
            continue

        sp_res = (
            sb.table("san_pham")
            .select("id,mo_ta,mo_ta_en,thanh_phan,van_de,nguon_truong")
            .eq("id", pid)
            .limit(1)
            .execute()
        )
        if not sp_res.data:
            print(f"Mã {pid} không tồn tại trong DB")
            continue

        sp = sp_res.data[0]
        nguon_truong = sp.get("nguon_truong") or {}

        updates: dict[str, Any] = {}
        # 1. Điền mo_ta
        if not sp.get("mo_ta") or not str(sp.get("mo_ta")).strip():
            if common.co_the_ghi_de_truong(nguon_truong, "mo_ta"):
                updates["mo_ta"] = info["mo_ta"]

        # 2. Điền mo_ta_en
        if not sp.get("mo_ta_en") or not str(sp.get("mo_ta_en")).strip():
            if common.co_the_ghi_de_truong(nguon_truong, "mo_ta_en"):
                updates["mo_ta_en"] = info["mo_ta_en"]

        # 3. Điền thanh_phan nếu chưa có
        if not sp.get("thanh_phan") or not sp.get("thanh_phan"):
            if common.co_the_ghi_de_truong(nguon_truong, "thanh_phan") and info.get("thanh_phan"):
                updates["thanh_phan"] = info["thanh_phan"]

        # 4. Bổ sung van_de nếu chưa có
        if not sp.get("van_de") or not sp.get("van_de"):
            if common.co_the_ghi_de_truong(nguon_truong, "van_de") and info.get("van_de"):
                updates["van_de"] = info["van_de"]

        if updates:
            try:
                kq = common.ghi_san_pham_ai(
                    sb,
                    pid,
                    updates,
                    url_nguon=info["url"],
                    boi="media_dien_thieu",
                )
                da_dien += 1
                chi_tiet.append({
                    "id": pid,
                    "da_cap_nhat": kq.get("da_cap_nhat"),
                    "url": info["url"],
                    "trich_dan": info["trich_dan_goc"],
                })
                print(f"[{pid}] Đã điền: {list(updates.keys())} | Nguồn: {info['url']}")
            except Exception as e:
                print(f"Lỗi điền thiếu cho {pid}: {e}")
        else:
            bo_qua += 1

    print(f"Hoàn thành điền thiếu: đã cập nhật {da_dien} sản phẩm, bỏ qua {bo_qua} sản phẩm.")
    return {
        "tong_ma": len(ds_ma),
        "da_dien": da_dien,
        "bo_qua": bo_qua,
        "chi_tiet": chi_tiet,
    }


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Điền thông tin còn thiếu từ website chính hãng kèm trích dẫn gốc.")
    parser.add_argument("ids", nargs="*", help="Danh sách mã cần điền (bỏ trống để điền toàn bộ mã có sẵn)")
    args = parser.parse_args()

    chay_dien_thieu(args.ids if args.ids else None)


if __name__ == "__main__":
    main()
