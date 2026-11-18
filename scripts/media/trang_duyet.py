#!/usr/bin/env python3
"""Sinh trang duyệt HTML media/tmp/duyet.html cho các dòng cho_duyet (và thống kê toàn bộ bảng media)."""

from __future__ import annotations

import argparse
import html
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402


def tao_html_trang_duyet(media_rows: list[dict], sp_map: dict[str, dict]) -> str:
    """Render nội dung HTML cho trang duyệt media."""
    cho = [r for r in media_rows if r.get("trang_thai") == "cho_duyet"]
    duyet = [r for r in media_rows if r.get("trang_thai") == "duyet"]
    loai = [r for r in media_rows if r.get("trang_thai") == "loai"]

    def render_card(r: dict) -> str:
        pid = r.get("san_pham_id") or ""
        cd = r.get("chien_dich") or ""
        sp = sp_map.get(pid, {})
        ten = sp.get("ten_hien_thi") or cd or pid
        brand = sp.get("thuong_hieu") or (cd if cd else "Chiến dịch")
        loai_m = r.get("loai") or ""
        nguon = r.get("nguon") or ""
        url = r.get("url") or ""
        kt = f"{r.get('rong') or '?'}×{r.get('cao') or '?'}"
        kb = f"{round((r.get('dung_luong') or 0) / 1024, 1)} KB"
        ghi_chu = r.get("ghi_chu") or ""
        nguon_ct = r.get("nguon_chi_tiet") or ""
        tt = r.get("trang_thai") or ""

        if loai_m.startswith("video_"):
            media_tag = f'<video controls muted loop playsinline preload="metadata" src="{html.escape(url)}"></video>'
        else:
            media_tag = f'<img loading="lazy" src="{html.escape(url)}" alt="{html.escape(ten)}">'

        badge_class = "badge-ok" if tt == "duyet" else ("badge-no" if tt == "loai" else "badge-wait")
        link_html = (
            f'<div class="meta-row"><strong>Nguồn:</strong> {html.escape(nguon_ct[:90])}</div>'
            if nguon_ct
            else ""
        )
        note_html = (
            f'<div class="meta-row"><strong>Ghi chú:</strong> {html.escape(ghi_chu)}</div>'
            if ghi_chu
            else ""
        )

        return f"""
        <article class="card">
          <div class="thumb">{media_tag}</div>
          <div class="body">
            <div class="top-row">
              <span class="brand">{html.escape(brand)}</span>
              <span class="badge {badge_class}">{html.escape(tt)}</span>
            </div>
            <h3>{html.escape(ten)}</h3>
            <div class="code">{html.escape(pid or cd)} · {html.escape(loai_m)} · {html.escape(nguon)}</div>
            <div class="specs">{kt} · {kb}</div>
            {link_html}
            {note_html}
          </div>
        </article>
        """

    cho_cards = "".join(render_card(r) for r in cho) or "<p class='empty'>Không có mục nào đang chờ duyệt.</p>"
    duyet_cards = "".join(render_card(r) for r in duyet) or "<p class='empty'>Chưa có mục nào được duyệt.</p>"
    loai_cards = "".join(render_card(r) for r in loai)

    loai_section = (
        f"<section><h2>Đã loại ({len(loai)})</h2><div class='grid'>{loai_cards}</div></section>"
        if loai
        else ""
    )

    return f"""<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VIVE Quẹt · Trang duyệt Media</title>
  <style>
    :root {{
      --hong: #E8D2CC;
      --hong-nhat: #F7EEEB;
      --bac-ha: #CFE3D5;
      --bac-ha-nhat: #EAF3ED;
      --den: #2B2B2A;
      --xam: #737373;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 24px;
      font-family: "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif;
      background: var(--hong-nhat);
      color: var(--den);
    }}
    header {{
      max-width: 1320px;
      margin: 0 auto 24px;
      background: #fff;
      border-radius: 18px;
      padding: 20px 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      border: 1px solid var(--hong);
    }}
    h1 {{ margin: 0; font-size: 22px; }}
    .stats {{ display: flex; gap: 10px; flex-wrap: wrap; }}
    .pill {{
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      background: var(--hong-nhat);
    }}
    .pill-wait {{ background: var(--hong); }}
    .pill-ok {{ background: var(--bac-ha); }}
    section {{ max-width: 1320px; margin: 0 auto 36px; }}
    h2 {{ font-size: 18px; margin: 0 0 14px; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }}
    .card {{
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #ece3e0;
      display: flex;
      flex-direction: column;
    }}
    .thumb {{
      aspect-ratio: 1 / 1;
      background-image: linear-gradient(45deg, #f3f3f3 25%, transparent 25%),
        linear-gradient(-45deg, #f3f3f3 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f3f3f3 75%),
        linear-gradient(-45deg, transparent 75%, #f3f3f3 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }}
    .thumb img, .thumb video {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }}
    .body {{ padding: 14px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }}
    .top-row {{ display: flex; justify-content: space-between; align-items: center; gap: 8px; }}
    .brand {{ font-weight: 700; font-size: 12px; color: var(--xam); text-transform: uppercase; }}
    .badge {{
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }}
    .badge-wait {{ background: var(--hong); color: var(--den); }}
    .badge-ok {{ background: var(--bac-ha); color: var(--den); }}
    .badge-no {{ background: var(--den); color: #fff; }}
    h3 {{ margin: 0; font-size: 15px; line-height: 1.35; }}
    .code, .specs, .meta-row {{ color: var(--xam); font-size: 12px; word-break: break-word; }}
    .empty {{ color: var(--xam); font-style: italic; }}
  </style>
</head>
<body>
  <header>
    <h1>VIVE Quẹt · Trang duyệt Media</h1>
    <div class="stats">
      <span class="pill pill-wait">Chờ duyệt: {len(cho)}</span>
      <span class="pill pill-ok">Đã duyệt: {len(duyet)}</span>
      <span class="pill">Đã loại: {len(loai)}</span>
    </div>
  </header>
  <section>
    <h2>Chờ duyệt ({len(cho)})</h2>
    <div class="grid">{cho_cards}</div>
  </section>
  <section>
    <h2>Đã duyệt ({len(duyet)})</h2>
    <div class="grid">{duyet_cards}</div>
  </section>
  {loai_section}
</body>
</html>
"""


def chay_trang_duyet(out_path: Path | None = None) -> tuple[Path, dict[str, int]]:
    """Lấy dữ liệu từ Supabase và sinh file duyet.html."""
    common.dam_bao_thu_muc_tam()
    sb, _ = common.tao_supabase_client()
    media_rows = (
        sb.table("media")
        .select("*")
        .order("cap_nhat_luc", desc=True)
        .execute()
        .data
        or []
    )
    sp_rows = (
        sb.table("san_pham")
        .select("id,thuong_hieu,ten_hien_thi,quy_cach")
        .execute()
        .data
        or []
    )
    sp_map = {r["id"]: r for r in sp_rows}

    dich = out_path or common.DUYET_HTML
    dich.parent.mkdir(parents=True, exist_ok=True)
    dich.write_text(tao_html_trang_duyet(media_rows, sp_map), encoding="utf-8")

    dem = {
        "cho_duyet": sum(1 for r in media_rows if r.get("trang_thai") == "cho_duyet"),
        "duyet": sum(1 for r in media_rows if r.get("trang_thai") == "duyet"),
        "loai": sum(1 for r in media_rows if r.get("trang_thai") == "loai"),
    }
    return dich, dem


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Sinh trang duyệt HTML cho media.")
    parser.add_argument("--out", type=Path, default=None, help="Đường dẫn file HTML đầu ra")
    args = parser.parse_args()

    dich, dem = chay_trang_duyet(out_path=args.out)
    print(
        f"Đã tạo {dich} | chờ duyệt: {dem['cho_duyet']} | đã duyệt: {dem['duyet']} | đã loại: {dem['loai']}"
    )


if __name__ == "__main__":
    main()
