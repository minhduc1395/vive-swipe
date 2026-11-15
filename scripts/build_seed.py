#!/usr/bin/env python3
"""Tạo supabase/seed.sql từ data/products.csv và data/deals.yaml.

Chạy: python3 scripts/build_seed.py
Seed dùng INSERT ... ON CONFLICT DO UPDATE nên chạy lại nhiều lần không sao.
Cột `anh` chỉ được điền khi file ảnh có thật trong public/products/ (để view san_pham_hien_thi không hiện sản phẩm thiếu ảnh).
"""
import csv
import datetime as dt
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def q(v):
    if v is None or v == "":
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def arr(s):
    items = [x for x in (s or "").split(";") if x]
    return "array[" + ",".join(q(x) for x in items) + "]::text[]" if items else "'{}'::text[]"


def num(v):
    return str(int(v)) if str(v).strip() else "null"


def json_default(o):
    if isinstance(o, (dt.date, dt.datetime)):
        return o.isoformat()
    raise TypeError(o)


def products_sql():
    out = []
    for r in csv.DictReader(open(ROOT / "data" / "products.csv", encoding="utf-8")):
        img = ROOT / "public" / "products" / f"{r['id']}.webp"
        anh = f"/products/{r['id']}.webp" if img.exists() else ""
        out.append(
            "insert into public.san_pham (id, barcode, thuong_hieu, ten_goc, ten_hien_thi, quy_cach, gia_goc, gia_ban, "
            "giam_tren_tag, danh_muc, van_de, thanh_phan, loai_da, con_hang, ton, hien_thi, anh, ghi_chu) values ("
            + ", ".join([
                q(r["id"]), q(r["barcode"]), q(r["thuong_hieu"]), q(r["ten_goc"]), q(r["ten_hien_thi"]), q(r["quy_cach"]),
                num(r["gia_goc"]), num(r["gia_ban"]), q(r["giam_tren_tag"]), q(r["danh_muc"]),
                arr(r["van_de"]), arr(r["thanh_phan"]), arr(r["loai_da"]), q(r["con_hang"]), num(r["ton"]),
                "true" if r["hien_thi"] == "true" else "false", q(anh), q(r["ghi_chu"]),
            ])
            + ") on conflict (id) do update set barcode = excluded.barcode, thuong_hieu = excluded.thuong_hieu, "
            "ten_goc = excluded.ten_goc, ten_hien_thi = excluded.ten_hien_thi, quy_cach = excluded.quy_cach, "
            "gia_goc = excluded.gia_goc, gia_ban = excluded.gia_ban, giam_tren_tag = excluded.giam_tren_tag, "
            "danh_muc = excluded.danh_muc, van_de = excluded.van_de, thanh_phan = excluded.thanh_phan, "
            "loai_da = excluded.loai_da, con_hang = excluded.con_hang, ton = excluded.ton, hien_thi = excluded.hien_thi, "
            "anh = excluded.anh, ghi_chu = excluded.ghi_chu;"
        )
    return out


def deals_sql():
    data = yaml.safe_load(open(ROOT / "data" / "deals.yaml", encoding="utf-8"))
    out = []
    for d in data["deals"]:
        body = json.dumps(d, ensure_ascii=False, default=json_default)
        bat_dau = d.get("bat_dau")
        ket_thuc = d.get("ket_thuc")
        out.append(
            "insert into public.deal (id, du_lieu, trang_thai, may_rui, da_dang_ky, hien_thi, bat_dau, ket_thuc) values ("
            + ", ".join([
                q(d["id"]), q(body) + "::jsonb", q(d["trang_thai"]),
                "true" if d.get("may_rui") else "false",
                "true" if d.get("da_dang_ky") else "false",
                "true" if d.get("hien_thi") else "false",
                q(bat_dau.isoformat() if bat_dau else ""), q(ket_thuc.isoformat() if ket_thuc else ""),
            ])
            + ") on conflict (id) do update set du_lieu = excluded.du_lieu, trang_thai = excluded.trang_thai, "
            "may_rui = excluded.may_rui, bat_dau = excluded.bat_dau, ket_thuc = excluded.ket_thuc;"
        )
    return out


if __name__ == "__main__":
    lines = ["-- Tạo tự động bởi scripts/build_seed.py. Không sửa tay.", "begin;"]
    lines += products_sql()
    lines += deals_sql()
    lines.append("commit;")
    dst = ROOT / "supabase" / "seed.sql"
    dst.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Đã ghi {dst} ({len(lines) - 3} câu lệnh)")
