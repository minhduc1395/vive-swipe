#!/usr/bin/env python3
"""Tạo file handoff đúng mẫu (chạy được trên macOS, Linux, Windows).

Dùng: python3 scripts/new_handoff.py <tu> <den> <TaskID|meta> <loai> "<nội dung>" [link]
(Windows: python scripts/new_handoff.py ...)
loai: giao-viec nhan-viec bao-xong hoi tra-loi canh-bao thay-doi-luat trang-thai-phien qa-pass qa-fail
"""
import os
import sys
from datetime import datetime, timedelta, timezone

LOAI = {"giao-viec", "nhan-viec", "bao-xong", "hoi", "tra-loi", "canh-bao",
        "thay-doi-luat", "trang-thai-phien", "qa-pass", "qa-fail"}
VN = timezone(timedelta(hours=7))  # Việt Nam không đổi giờ mùa hè


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 6:
        print(__doc__)
        sys.exit(1)
    tu, den, task, loai, noi_dung = sys.argv[1:6]
    link = sys.argv[6] if len(sys.argv) > 6 else ""
    if loai not in LOAI:
        print(f"Loại không hợp lệ: {loai}. Chọn: {', '.join(sorted(LOAI))}")
        sys.exit(1)
    now = datetime.now(VN)
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    folder = os.path.join(root, "handoff")
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{now:%Y%m%d-%H%M}_{tu}_{den}_{task}_{loai}.md")
    lines = [f"# {loai} · {task}",
             f"- Thời gian: {now:%d/%m/%Y %H:%M} (GMT+7)",
             f"- Từ: {tu}", f"- Đến: {den}", f"- Task: {task}"]
    if link:
        lines.append(f"- Link: {link}")
    lines += ["", noi_dung]
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(path)


if __name__ == "__main__":
    main()
