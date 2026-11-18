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

# Danh mục thông tin đã được thẩm định từ website chính hãng (docs/06 §3, media/nguon-duoc-phep.yaml)
THONG_TIN_CHINH_HANG: dict[str, dict[str, Any]] = {
    # LOPOE (Chiến dịch New Arrival · docs/00, docs/06)
    "LOPOE-CF": {
        "url": "https://lopoe.kr/products/better-balance-cleansing-foam",
        "mo_ta": "Sữa rửa mặt tạo bọt mịn làm sạch sâu bụi bẩn, cân bằng độ pH tự nhiên cho da thông thoáng và ẩm mượt.",
        "mo_ta_en": "Gentle foaming cleanser that deeply removes impurities while preserving natural pH balance for soft, clear skin.",
        "thanh_phan": ["Glycerin", "Centella Asiatica Extract", "Madecassoside", "Allantoin"],
        "van_de": ["cap-am", "lam-diu"],
    },
    "LOPOE-AMP": {
        "url": "https://lopoe.kr/products/better-balance-ampoule",
        "mo_ta": "Tinh chất phục hồi màng bảo vệ da với Ceramide và Madecassoside, cấp ẩm sâu và làm dịu vùng da nhạy cảm.",
        "mo_ta_en": "Barrier-repairing ampoule powered by Ceramide and Madecassoside to deliver deep hydration and instant soothing.",
        "thanh_phan": ["Ceramide NP", "Madecassoside", "Panthenol", "Sodium Hyaluronate"],
        "van_de": ["cap-am", "lam-diu"],
    },
    "LOPOE-CR": {
        "url": "https://lopoe.kr/products/better-balance-barrier-cream",
        "mo_ta": "Kem dưỡng khóa ẩm chuyên sâu, củng cố hàng rào bảo vệ da, giúp da căng khỏe mịn màng suốt 24 giờ.",
        "mo_ta_en": "Intensive barrier cream that locks in long-lasting moisture and strengthens skin resilience against dryness.",
        "thanh_phan": ["Ceramide NP", "Shea Butter", "Madecassoside", "Squalane"],
        "van_de": ["cap-am", "lam-diu"],
    },
    # Medicube (medicube.us & themedicube.co.kr)
    "8809517414315": {
        "url": "https://medicube.us/products/zero-pore-pads-mild",
        "mo_ta": "Toner pad tẩy da chết và se khít lỗ chân lông dịu nhẹ chứa PHA và Madecassoside dành riêng cho da nhạy cảm.",
        "mo_ta_en": "Gentle daily toner pad formulated with PHA and Madecassoside to refine enlarged pores and soothe delicate skin.",
        "thanh_phan": ["Gluconolactone (PHA)", "Madecassoside", "Centella Asiatica Extract", "Panthenol"],
        "van_de": ["lo-chan-long", "lam-diu", "tay-te-bao-chet"],
    },
    "8800256109661": {
        "url": "https://medicube.us/products/deep-vita-c-pad",
        "mo_ta": "Toner pad dưỡng sáng và làm đều màu da chứa 500.000ppm nước hắc mai biển giàu Vitamin C tự nhiên.",
        "mo_ta_en": "Brightening toner pad soaked in 500,000ppm sea buckthorn water to visibly fade dark spots and revitalize dull skin.",
        "thanh_phan": ["Hippophae Rhamnoides Water", "Niacinamide", "3-O-Ethyl Ascorbic Acid", "Tranexamic Acid"],
        "van_de": ["sang-da", "tay-te-bao-chet"],
    },
    "8800256108053": {
        "url": "https://medicube.us/products/rose-pdrn-pink-peptide-serum",
        "mo_ta": "Tinh chất phục hồi độ đàn hồi và cải thiện nếp nhăn với phức hợp Rose PDRN và 5 loại peptide chuyên sâu.",
        "mo_ta_en": "Intensive revitalizing serum infused with Rose PDRN and 5 peptides to restore firmness and youthful bounce.",
        "thanh_phan": ["Rose PDRN", "Copper Tripeptide-1", "Palmitoyl Pentapeptide-4", "Adenosine"],
        "van_de": ["chong-lao-hoa", "cap-am"],
    },
    "8800256114351": {
        "url": "https://medicube.us/products/triple-collagen-serum",
        "mo_ta": "Tinh chất cấp ẩm sâu và cải thiện độ căng bóng với phức hợp 3 loại collagen thủy phân.",
        "mo_ta_en": "Ultra-nourishing serum formulated with a triple collagen complex to deeply hydrate and impart glass-skin radiance.",
        "thanh_phan": ["Hydrolyzed Collagen", "Atelocollagen", "Soluble Collagen", "Hyaluronic Acid"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    "8800256114320": {
        "url": "https://themedicube.co.kr/product/detail.html?product_no=504",
        "mo_ta": "Nước cân bằng dạng essence cô đặc cấp ẩm tức thì, giúp da mềm mịn và tăng cường hấp thu dưỡng chất.",
        "mo_ta_en": "Essence-in-toner formula enriched with triple collagen that softens skin texture and provides instant nourishment.",
        "thanh_phan": ["Hydrolyzed Collagen", "Niacinamide", "Sodium Hyaluronate", "Adenosine"],
        "van_de": ["cap-am", "chong-lao-hoa"],
    },
    # Celimax (celimax.com)
    "8809463992615": {
        "url": "https://celimax.com/products/heartleaf-bha-peeling-pad",
        "mo_ta": "Toner pad tẩy tế bào chết dịu nhẹ chứa BHA và chiết xuất diếp cá giúp làm sạch sâu và thông thoáng lỗ chân lông.",
        "mo_ta_en": "Exfoliating toner pad with BHA and Heartleaf extract that gently clears pores and soothes irritated skin.",
        "thanh_phan": ["Houttuynia Cordata Extract", "Salicylic Acid (BHA)", "Tea Tree Leaf Extract", "Madecassoside"],
        "van_de": ["lo-chan-long", "mun", "tay-te-bao-chet"],
    },
    "8809875907412": {
        "url": "https://celimax.com/products/pore-dark-spot-brightening-serum",
        "mo_ta": "Tinh chất hỗ trợ mờ thâm nám và thu nhỏ lỗ chân lông với 5% Niacinamide và Tranexamic Acid.",
        "mo_ta_en": "Targeted serum with 5% Niacinamide and Tranexamic Acid to visibly reduce dark spots and tighten pores.",
        "thanh_phan": ["Niacinamide", "Tranexamic Acid", "Arbutin", "Zinc PCA"],
        "van_de": ["sang-da", "lo-chan-long"],
    },
    "8809700320805": {
        "url": "https://celimax.com/products/vita-a-retinol-shot-tightening-serum",
        "mo_ta": "Tinh chất Retinol cải thiện độ đàn hồi và kết cấu bề mặt da, giúp da săn chắc và mịn màng.",
        "mo_ta_en": "Advanced Retinol serum designed to improve skin elasticity, smooth texture, and refine fine lines.",
        "thanh_phan": ["Retinol", "Adenosine", "Peptide Complex", "Panthenol"],
        "van_de": ["chong-lao-hoa", "lo-chan-long"],
    },
    # SKINFOOD (theskinfood.us)
    "8809153102201": {
        "url": "https://theskinfood.us/products/carrot-carotene-calming-water-pad",
        "mo_ta": "Toner pad thuần chay chiết xuất cà rốt đảo Jeju giàu Beta-Carotene giúp cấp ẩm dồi dào và làm dịu da ửng đỏ.",
        "mo_ta_en": "Vegan calming water pad infused with Jeju carrot seed oil rich in Beta-Carotene to soothe redness and replenish moisture.",
        "thanh_phan": ["Daucus Carota Sativa (Carrot) Root Extract", "Beta-Carotene", "Glycerin", "Allantoin"],
        "van_de": ["lam-diu", "cap-am"],
    },
    # Tiela (tielacosmetics.com)
    "8800282110174": {
        "url": "https://tielacosmetics.com/products/perfume-body-scrub-shine",
        "mo_ta": "Tẩy tế bào chết toàn thân hạt mịn hương nước hoa sang trọng, loại bỏ lớp da sừng nhẹ nhàng và lưu hương tinh tế.",
        "mo_ta_en": "Fine-particle perfumed body scrub that gently exfoliates dead skin cells, leaving body skin velvety smooth and delicately scented.",
        "thanh_phan": ["Sea Salt", "Sweet Almond Oil", "Shea Butter", "Fragrance"],
        "van_de": ["cham-soc-co-the", "tay-te-bao-chet"],
    },
    "8800282110181": {
        "url": "https://tielacosmetics.com/products/ritual-low-ph-gel-cleanser",
        "mo_ta": "Sữa rửa mặt dạng gel độ pH chuẩn cân bằng, làm sạch dịu nhẹ không gây cảm giác khô căng sau khi rửa.",
        "mo_ta_en": "Gentle low-pH gel cleanser that effectively washes away impurities without stripping essential skin moisture.",
        "thanh_phan": ["Glycerin", "Centella Asiatica Extract", "Panthenol", "Citric Acid"],
        "van_de": ["cap-am", "lam-diu"],
    },
    # salTherapy (saltherapy.us)
    "8801990000320": {
        "url": "https://saltherapy.us/products/honey-salt-oil-citrus-blossom",
        "mo_ta": "Tẩy tế bào chết muối biển tự nhiên kết hợp mật ong và tinh dầu thực vật hương cam hoa thanh mát.",
        "mo_ta_en": "Natural sea salt body scrub infused with honey and botanical oils with an invigorating citrus blossom aroma.",
        "thanh_phan": ["Sea Salt", "Honey Extract", "Jojoba Seed Oil", "Citrus Fragrance"],
        "van_de": ["cham-soc-co-the", "tay-te-bao-chet"],
    },
    "8801990000337": {
        "url": "https://saltherapy.us/products/rice-salt-oil-dewy-jasmine",
        "mo_ta": "Tẩy tế bào chết muối biển chiết xuất cám gạo dưỡng sáng da, hương hoa nhài tinh khiết thư giãn.",
        "mo_ta_en": "Gentle salt body scrub enriched with rice bran extract to brighten skin with a calming dewy jasmine fragrance.",
        "thanh_phan": ["Sea Salt", "Oryza Sativa (Rice) Bran Extract", "Camellia Seed Oil", "Jasmine Fragrance"],
        "van_de": ["cham-soc-co-the", "tay-te-bao-chet"],
    },
    "8801990000351": {
        "url": "https://saltherapy.us/products/eucalyptus-salt-oil-woody-breeze",
        "mo_ta": "Tẩy tế bào chết muối biển tinh dầu khuynh diệp giúp thanh lọc da, giảm căng thẳng với hương gỗ rừng tươi mát.",
        "mo_ta_en": "Purifying salt scrub with refreshing eucalyptus essential oil and woody breeze scent for an at-home spa experience.",
        "thanh_phan": ["Sea Salt", "Eucalyptus Globulus Leaf Oil", "Macadamia Seed Oil", "Woody Fragrance"],
        "van_de": ["cham-soc-co-the", "tay-te-bao-chet"],
    },
    # Edit.B (en.editb.co.kr)
    "8809213800122": {
        "url": "https://en.editb.co.kr/product/cica-heartleaf-trouble-pad",
        "mo_ta": "Toner pad làm dịu da mụn và da nhạy cảm với phức hợp rau má và diếp cá nồng độ cao.",
        "mo_ta_en": "Trouble care toner pad with concentrated Cica and Heartleaf to rapidly calm breakouts and soothe irritation.",
        "thanh_phan": ["Centella Asiatica Extract", "Houttuynia Cordata Extract", "Tea Tree Leaf Extract", "Allantoin"],
        "van_de": ["mun", "lam-diu"],
    },
    "8809871388420": {
        "url": "https://en.editb.co.kr/product/joyfull-carrot-gel-cleanser",
        "mo_ta": "Sữa rửa mặt dạng gel chiết xuất cà rốt giàu vitamin giúp thanh lọc làn da mệt mỏi và duy trì độ ẩm mịn.",
        "mo_ta_en": "Vitamin-rich carrot gel cleanser that cleanses away daily grime while keeping the complexion hydrated and fresh.",
        "thanh_phan": ["Daucus Carota Sativa (Carrot) Extract", "Niacinamide", "Betaine", "Panthenol"],
        "van_de": ["cap-am", "sang-da"],
    },
    "8809871388499": {
        "url": "https://en.editb.co.kr/product/waterfull-jelly-lip-essence",
        "mo_ta": "Dưỡng môi dạng thạch cấp ẩm chuyên sâu, bảo vệ môi khô nứt nẻ và giữ cho môi luôn căng mọng tự nhiên.",
        "mo_ta_en": "Hydrating jelly lip essence that locks in moisture to soothe chapped lips and maintain long-lasting softness.",
        "thanh_phan": ["Shea Butter", "Ceramide NP", "Peptide", "Tocopherol"],
        "van_de": ["cap-am"],
    },
    # Dermal (Drive 08 · derma.co.kr)
    "8809369850248": {
        "url": "http://www.dermal.co.kr/product/pearl-collagen-essence-mask",
        "mo_ta": "Mặt nạ giấy chiết xuất ngọc trai và collagen thủy phân giúp làm sáng đều màu da và tăng độ đàn hồi.",
        "mo_ta_en": "Sheet mask enriched with pearl extract and hydrolyzed collagen to enhance skin glow and boost elasticity.",
        "thanh_phan": ["Pearl Extract", "Hydrolyzed Collagen", "Sodium Hyaluronate", "Allantoin"],
        "van_de": ["sang-da", "cap-am"],
    },
    "8809369850262": {
        "url": "http://www.dermal.co.kr/product/red-ginseng-collagen-essence-mask",
        "mo_ta": "Mặt nạ giấy chiết xuất hồng sâm Hàn Quốc và collagen nuôi dưỡng sâu, tiếp thêm sinh lực cho làn da mệt mỏi.",
        "mo_ta_en": "Revitalizing sheet mask featuring Korean red ginseng extract and collagen to nourish fatigued, stressed skin.",
        "thanh_phan": ["Panax Ginseng Root Extract", "Hydrolyzed Collagen", "Portulaca Oleracea Extract", "Beta-Glucan"],
        "van_de": ["chong-lao-hoa", "cap-am"],
    },
    "8809369850354": {
        "url": "http://www.dermal.co.kr/product/aloe-collagen-essence-mask",
        "mo_ta": "Mặt nạ giấy chiết xuất lô hội tự nhiên và collagen giúp làm dịu da kích ứng tức thì và bù đắp lượng ẩm hao hụt.",
        "mo_ta_en": "Soothing sheet mask formulated with natural aloe vera extract and collagen to calm irritated skin and replenish moisture.",
        "thanh_phan": ["Aloe Barbadensis Leaf Juice", "Hydrolyzed Collagen", "Panthenol", "Allantoin"],
        "van_de": ["lam-diu", "cap-am"],
    },
    "8809369850521": {
        "url": "http://www.dermal.co.kr/product/hyaluronate-collagen-essence-mask",
        "mo_ta": "Mặt nạ giấy Hyaluronate và collagen cấp nước đa tầng, mang lại làn da mọng nước và căng bóng khỏe mạnh.",
        "mo_ta_en": "Deeply hydrating sheet mask with Sodium Hyaluronate and collagen that plumps the skin with multi-layer moisture.",
        "thanh_phan": ["Sodium Hyaluronate", "Hydrolyzed Collagen", "Glycerin", "Trehalose"],
        "van_de": ["cap-am"],
    },
}


def chay_dien_thieu(kho_chi_dinh: list[str] | None = None) -> dict[str, Any]:
    """Điền thông tin mô tả, thành phần, vấn đề da cho các sản phẩm đã có nguồn chính hãng."""
    sb, _ = common.tao_supabase_client()

    ds_ma = kho_chi_dinh if kho_chi_dinh else list(THONG_TIN_CHINH_HANG.keys())
    print(f"Bắt đầu điền thiếu cho {len(ds_ma)} sản phẩm có nguồn chính hãng...")

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

        # 4. Bổ sung van_de nếu còn thiếu
        if not sp.get("van_de") or not sp.get("van_de"):
            if common.co_the_ghi_de_truong(nguon_truong, "van_de") and info.get("van_de"):
                updates["van_de"] = info["van_de"]

        if updates:
            try:
                kq = common.ghi_san_pham_ai(sb, pid, updates, url_nguon=info["url"], boi="media_dien_thieu")
                da_dien += 1
                chi_tiet.append({"id": pid, "da_cap_nhat": kq.get("da_cap_nhat"), "url": info["url"]})
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
    parser = argparse.ArgumentParser(description="Điền thông tin còn thiếu từ website chính hãng.")
    parser.add_argument("ids", nargs="*", help="Danh sách mã cần điền (bỏ trống để điền toàn bộ mã có sẵn)")
    args = parser.parse_args()

    chay_dien_thieu(args.ids if args.ids else None)


if __name__ == "__main__":
    main()
