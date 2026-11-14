#!/usr/bin/env python3
"""Tạo data/products.csv từ bảng giá VIVE (docs/02-bang-gia.md của repo vive_poup).

Cách chạy:
    python3 scripts/build_products.py ../vive_poup/docs/02-bang-gia.md

Nguồn và quy tắc:
- Giá: mục 3 của bảng giá (bản 10/11/2026). Giá LOPOE lấy theo chương trình đã chốt 13/11
  (claude/VIVE-LOPOE-chuong-trinh-da-chot.md), vì bảng giá còn ghi giá LOPOE cũ.
- Tồn và hết hàng: POS KiotViet 12/11/2026 14:29 (claude/VIVE-ton-kho-va-tai-chinh.md).
- Danh mục, vấn đề da, thành phần, loại da: Claude gắn tự động theo tên sản phẩm
  (bản nháp, cần người rà). Sửa tay thì sửa trong OVERRIDES bên dưới rồi chạy lại.
Khi giá đổi: cập nhật bảng giá trong vive_poup trước, rồi chạy lại script này.
"""
import csv
import re
import sys
from pathlib import Path

BRAND_DISPLAY = {
    "Repiel": "Rep!el",          # bài công khai ghi Rep!el
    "Isol": "ISOI",              # hướng dẫn chung ghi ISOI; POS/bảng giá ghi Isol -> cần xác nhận
    "Lopoe": "LOPOE",
    "Skinfood": "SKINFOOD",
    "Jungsaemmool": "JUNGSAEMMOOL",
}

# Hết hàng theo POS 12/11 (tồn 0 hoặc chưa có mã)
OUT_OF_STOCK = {
    "8800256108046",  # Medicube PDRN Pink Collagen Gel Mask
    "8809875907795", "8809971482318", "8809700320812", "8809971484510", "8809743546323",  # Celimax
    "8809032673846", "8809032675512",  # Skinfood Mint Choco, Acorn Daily Mask
    "8809647118800", "8809647118299", "8809647118787", "8809647118794",  # Dermal toner pad
    "8809213800160", "8809213800146", "8809213800139", "8809871388536",  # Edit.B
    "8809264739037", "8809264741108", "8809264736524",  # ISOI
}

# Tồn từng mã đã biết (POS 12/11). Mã không có ở đây: còn hàng nhưng chưa rõ số.
STOCK = {
    "8800256114320": 10, "8800256114351": 10, "8800256112227": 10, "8800256115174": 10,
    "8800256109661": 10, "8809982769866": 9, "8800256108053": 10, "8800289467714": 7,
    "8800256114665": 8, "8809517414315": 9, "8800289468759": 3, "8800289468674": 1,
    "8809875907412": 10, "8809463992615": 9, "8809700320805": 2,
    "8809153102201": 7, "8809153108425": 8, "8809032673228": 9,
    "8809153107732": 5, "8809511276728": 5, "8809511276704": 5,
    "8801990000412": 11, "8801990000351": 1, "8801990000337": 3,
    "8800274071278": 27, "8800274071292": 22, "8800274071247": 26, "8800274071285": 35,
    "8809750462739": 78,
    "8809371973607": 60, "8809371973263": 30, "8809371973935": 10,
    "8809467634177": 1,
}

# Tồn chưa rõ (số cũ 16/10 bằng 0 hoặc không có trong POS 12/11)
STOCK_UNKNOWN = {"8809826710719"}  # JSM Pro-lasting Powder: 0 ngày 16/10

LOPOE_ROWS = [
    # id, tên, quy cách, giá niêm yết, tồn bán
    ("LOPOE-CF", "Better Balance Cleansing Foam", "160ml", 249000, 139),
    ("LOPOE-AMP", "Better Balance Ampoule", "50ml", 419000, 117),
    ("LOPOE-CR", "Better Balance Moisture Cream", "80ml", 549000, 104),
]

# (danh_muc, nhãn tiếng Việt đặt trước tên)
CATEGORY_LABEL = {
    "sua-rua-mat": "Sữa rửa mặt",
    "nuoc-can-bang": "Nước cân bằng",
    "toner-pad": "Toner pad",
    "tinh-chat": "Tinh chất",
    "kem-duong": "Kem dưỡng",
    "mat-na": "Mặt nạ",
    "chong-nang": "Kem chống nắng",
    "trang-diem": "",
    "duong-the": "",
    "mieng-dan": "",
    "thiet-bi": "",
    "duong-moi": "Dưỡng môi",
    "dich-vu": "",
}

# Ghi đè tay: barcode -> dict cột
OVERRIDES = {
    "8809953160067": {"ten_hien_thi": "Máy nâng cơ D-Therma"},
    "8809953160258": {"ten_hien_thi": "Máy massage mắt Eye Rejuv"},
    "8809953160043": {"ten_hien_thi": "Máy tỉa lông mày Eyebrow Trimmer"},
    "9880201379621": {"ten_hien_thi": "Máy rửa mặt Foincle"},
    "8809953160012": {"ten_hien_thi": "Máy uốn mi Lashcurl"},
    "8809953160081": {"ten_hien_thi": "Máy nâng cơ N Mode Pro"},
    "8800289468759": {"ten_hien_thi": "Máy chăm sóc da Age-R Booster Pro X2 · Hồng"},
    "8800289468674": {"ten_hien_thi": "Máy chăm sóc da Age-R Booster Pro X2 · Trắng"},
    "8809467634177": {"danh_muc": "trang-diem", "ten_hien_thi": "Xịt khóa nền Essential Mool Micro Fitting Mist"},
    "8809153107732": {"danh_muc": "nuoc-can-bang", "ten_hien_thi": "Xịt dưỡng Royal Honey Cream Mist 120ml"},
    "8809213800061": {"danh_muc": "chong-nang", "ten_hien_thi": "Serum chống nắng Sunday Cica Sun Serum"},
    "8809213800078": {"danh_muc": "chong-nang", "ten_hien_thi": "Serum chống nắng Sunday Tone-Up Sun Serum"},
    "8809871388536": {"danh_muc": "chong-nang", "ten_hien_thi": "Serum chống nắng Sunday Tone-Up Sun Serum Pink"},
    "8809467635419": {"danh_muc": "trang-diem", "ten_hien_thi": "Kem lót chống nắng Skin Setting Tone-up Sun Base"},
    "8809213800160": {"danh_muc": "tinh-chat"},
    "8800282110181": {"ghi_chu": "Cần xác nhận rửa mặt hay rửa body"},
    "8809264741849": {"danh_muc": "mat-na", "ten_hien_thi": "Miếng dán mắt Blemish Care Eye & Wrinkle Patch"},
    "8809213800139": {"danh_muc": "sua-rua-mat", "ten_hien_thi": "Bông tẩy trang Joyfull Heart Cleansing Pad"},
    "8809264740279": {"ghi_chu": "Thương hiệu ghi Isol trên POS, hướng dẫn chung ghi ISOI: cần xác nhận tên hiển thị"},
    "SP000001": {"danh_muc": "dich-vu", "hien_thi": "false", "ghi_chu": "Dịch vụ, không đưa vào deck quẹt"},
    "8809647113171": {"ghi_chu": "Chưa có ảnh sản phẩm (cần chụp tại booth)"},
    "8809875907412": {"ghi_chu": "Còn 10 chai, dùng chung 3 combo KM-08 (G-03, G-09, G-13)"},
}

CATEGORY_RULES = [
    ("sua-rua-mat", r"Enzyme Powder Cleanser"),
    ("thiet-bi", r"^(D-Therma|Eye Rejuv|Eyebrow Trimmer|Foincle|Lashcurl|N Mode Pro)$|Age-R Booster"),
    ("dich-vu", r"Personal Color"),
    ("mieng-dan", r"Patches"),
    ("duong-the", r"Bath Salt|Body Wash|Body Cream|Body Scrub|Salt & Oil"),
    ("duong-moi", r"Lip"),
    ("trang-diem", r"Cushion|Powder|Illuminator|Base"),
    ("chong-nang", r"Sun|SPF"),
    ("mat-na", r"Mask|Patch"),
    ("toner-pad", r"Pad"),
    ("sua-rua-mat", r"Cleans|Foam|3in1|Peel|Enzyme Powder"),
    ("nuoc-can-bang", r"Toner|Tonic|Mist|First Essence"),
    ("kem-duong", r"Cream|Balm"),
    ("tinh-chat", r"Serum|Ampoule|Essence|Booster|Shot"),
]

CONCERN_RULES = {
    "mun": r"Acni|Blemish Control|Trouble|Tea ?[Tt]ree|Heartleaf|BHA|Spot Patches|S\.O\.S|Madecassoside Blemish",
    "lo-chan-long": r"Pore|Egg White|Acorn|Peeling|Black Sugar|Parsley|Black Deep",
    "sang-da": r"Blemish Care|Vita[ -]?C|Gluta|Dark Spot|Brightening|Arbutin|Tone[- ]?[Uu]p|Glow|Yuja|Yuzu|Pearl|Niacin|Vita[- ]Toning|Illuminator",
    "cap-am": r"Hyaluron|Hydro|Moist|Aqua|Waterfull|Honey|Jelly|Peach Gel|Barrier|Better Balance|Aloe|Melting|Lip",
    "lam-diu": r"Cica|CICA|Calming|Soothing|Carotene|Madecassoside|Heartleaf|Tea ?[Tt]ree|Mugwort|Ice Cooling|Aloe|Mild|S\.O\.S|Hemp",
    "chong-lao-hoa": r"PDRN|Collagen|Peptide|Retin|Bakuchinol|Ginseng|Wrinkle|Age-R|Noni|D-Therma|N Mode|Eye Rejuv|Booster Pro",
    "chong-nang": r"Sun|SPF",
    "tay-te-bao-chet": r"Peel|Enzyme|Scrub|Salt & Oil|BHA|Sugar",
}

INGREDIENT_RULES = {
    "PDRN": r"PDRN",
    "Cica": r"Cica|CICA|Madecassoside",
    "Vitamin C": r"Vita[ -]?C|Yuja C|Vita C",
    "BHA": r"BHA",
    "Retinol": r"Retin|Vita-A",
    "Collagen": r"Collagen",
    "Hyaluronic": r"Hyaluron",
    "Niacinamide": r"Niacin",
    "Glutathione": r"Gluta",
    "Peptide": r"Peptide",
    "Diếp cá": r"Heartleaf",
    "Tràm trà": r"Tea ?[Tt]ree",
    "Noni": r"Noni",
    "Bakuchiol": r"Bakuchinol",
    "Hạt gai dầu": r"Hemp",
    "Mật ong": r"Honey",
    "Arbutin": r"Arbutin",
    "Hồng sâm": r"Ginseng",
    "Cà rốt": r"Carrot",
    "Lô hội": r"Aloe",
    "Ngải cứu": r"Mugwort",
    "Bạch đàn": r"Eucalyptus",
    "Gạo": r"Rice",
    "Lòng trắng trứng": r"Egg White",
    "Quả sồi": r"Acorn",
    "Khoai tây": r"Potato",
    "Mùi tây": r"Parsley",
    "Đường đen": r"Black Sugar",
    "Thanh yên": r"Yuzu|Yuja",
    "Enzyme": r"Enzyme",
    "Vitamin B5": r"B5",
}

FACE_CATEGORIES = {"sua-rua-mat", "nuoc-can-bang", "toner-pad", "tinh-chat", "kem-duong", "mat-na", "chong-nang"}

VI_PREFIX = re.compile(r"^(Muối|Sữa|Tẩy|Miếng|Phấn|Kem|Mặt nạ|Toner|Tinh chất|Máy|Xịt|Serum)")


def parse_price(s):
    s = s.strip()
    return int(s.replace(".", "")) if s else None


def tags(rules, text):
    return [k for k, pat in rules.items() if re.search(pat, text)]


def classify(name):
    for cat, pat in CATEGORY_RULES:
        if re.search(pat, name):
            return cat
    return "khac"


def skin_types(cat, concerns):
    if cat not in FACE_CATEGORIES:
        return ["moi-loai-da"]
    out = []
    if {"mun", "lo-chan-long"} & set(concerns):
        out += ["da-dau", "da-hon-hop"]
    if "cap-am" in concerns:
        out.append("da-kho")
    if "lam-diu" in concerns:
        out.append("da-nhay-cam")
    return out or ["moi-loai-da"]


def read_price_table(md_path):
    text = Path(md_path).read_text(encoding="utf-8")
    sec = text.split("## 3. Bảng giá hiện hành")[1].split("## 4.")[0]
    rows = []
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("| Thương hiệu") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 7:
            continue
        rows.append(cells)
    return rows


def build(md_path, out_path):
    out = []
    for brand, barcode, name, spec, gia_goc, gia_ban, giam in read_price_table(md_path):
        if brand == "Lopoe":
            continue  # thay bằng LOPOE_ROWS (giá chốt 13/11)
        out.append(make_row(brand, barcode, name, spec, parse_price(gia_goc), parse_price(gia_ban), giam))
    for pid, name, spec, price, ton in LOPOE_ROWS:
        r = make_row("Lopoe", pid, name, spec, None, price, "")
        r["barcode"] = ""
        r["ton"] = ton
        r["ghi_chu"] = "Giá niêm yết chốt 13/11. Giảm 25% khi hóa đơn có sản phẩm khác (deals.yaml: LOPOE-25)"
        out.append(r)
    seen = {}
    for r in out:
        seen.setdefault((r["thuong_hieu"], r["ten_goc"]), []).append(r)
    for group in seen.values():
        if len(group) > 1:
            for r in group:
                if r["quy_cach"] and r["quy_cach"] not in r["ten_hien_thi"]:
                    r["ten_hien_thi"] += f" {r['quy_cach']}"
    cols = ["id", "barcode", "thuong_hieu", "ten_goc", "ten_hien_thi", "quy_cach", "gia_goc", "gia_ban",
            "giam_tren_tag", "danh_muc", "van_de", "thanh_phan", "loai_da", "con_hang", "ton", "hien_thi",
            "anh", "ghi_chu"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in out:
            w.writerow(r)
    return out


def make_row(brand, barcode, name, spec, gia_goc, gia_ban, giam):
    pid = barcode if barcode and barcode != "chưa có" else ""
    full = f"{name} {spec}"
    cat = OVERRIDES.get(pid, {}).get("danh_muc") or classify(name)
    concerns = tags(CONCERN_RULES, full)
    if cat == "trang-diem":
        concerns = [c for c in concerns if c in ("sang-da", "chong-nang", "cap-am")] + ["trang-diem"]
    if cat == "duong-the":
        concerns = [c for c in concerns if c in ("tay-te-bao-chet", "cap-am")] + ["cham-soc-co-the"]
    if cat == "thiet-bi":
        concerns = [c for c in concerns if c == "chong-lao-hoa"] + ["thiet-bi"]
    if re.search(r"\bEye\b", name):
        concerns.append("vung-mat")
    ingredients = tags(INGREDIENT_RULES, full)
    label = CATEGORY_LABEL.get(cat, "")
    if VI_PREFIX.match(name) or not label:
        display = name
    else:
        display = f"{label} {name}"
    con_hang = "false" if pid in OUT_OF_STOCK else ("chua-ro" if pid in STOCK_UNKNOWN else "true")
    row = {
        "id": pid,
        "barcode": pid,
        "thuong_hieu": BRAND_DISPLAY.get(brand, brand),
        "ten_goc": name,
        "ten_hien_thi": display,
        "quy_cach": spec,
        "gia_goc": gia_goc or "",
        "gia_ban": gia_ban,
        "giam_tren_tag": giam,
        "danh_muc": cat,
        "van_de": ";".join(dict.fromkeys(concerns)),
        "thanh_phan": ";".join(ingredients),
        "loai_da": "",
        "con_hang": con_hang,
        "ton": STOCK.get(pid, 0 if pid in OUT_OF_STOCK else ""),
        "hien_thi": "false" if con_hang == "false" else "true",
        "anh": f"{pid}.webp" if pid else "",
        "ghi_chu": "",
    }
    row.update(OVERRIDES.get(pid, {}))
    row["loai_da"] = ";".join(skin_types(row["danh_muc"], row["van_de"].split(";")))
    return row


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "../vive_poup/docs/02-bang-gia.md"
    dst = Path(__file__).resolve().parent.parent / "data" / "products.csv"
    rows = build(src, dst)
    print(f"Đã ghi {len(rows)} sản phẩm vào {dst}")
