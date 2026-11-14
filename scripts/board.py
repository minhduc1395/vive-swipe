#!/usr/bin/env python3
"""In Task Board từ các file tasks/Wxxx.md.

Dùng: python3 scripts/board.py [--owner Claude|Antigravity|Người] [--status Todo|Doing|Review|Done|Blocked]
"""
import argparse
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIELDS = ["Ưu tiên", "Chủ trì", "Trạng thái", "Phụ thuộc", "Đầu ra", "QA", "Cập nhật", "Ghi chú"]


def parse(path):
    text = open(path, encoding="utf-8").read().splitlines()
    m = re.match(r"#\s*(W\d+)\s*·\s*(.*)", text[0]) if text else None
    if not m:
        return None
    task = {"ID": m.group(1), "Việc": m.group(2).strip()}
    for line in text[1:]:
        fm = re.match(r"-\s*([^:]+):\s*(.*)", line)
        if fm and fm.group(1).strip() in FIELDS:
            task[fm.group(1).strip()] = fm.group(2).strip()
    return task


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--owner")
    ap.add_argument("--status")
    args = ap.parse_args()
    order = {"Cao": 0, "Trung bình": 1, "Thấp": 2}
    tasks = [t for t in (parse(p) for p in sorted(glob.glob(os.path.join(ROOT, "tasks", "W*.md")))) if t]
    if args.owner:
        tasks = [t for t in tasks if t.get("Chủ trì", "").lower() == args.owner.lower()]
    if args.status:
        tasks = [t for t in tasks if t.get("Trạng thái", "").lower() == args.status.lower()]
    tasks.sort(key=lambda t: (order.get(t.get("Ưu tiên", ""), 9), t["ID"]))
    print(f"{'ID':5} {'Ưu tiên':11} {'Chủ trì':12} {'Trạng thái':10} {'QA':8} Việc")
    for t in tasks:
        print(f"{t['ID']:5} {t.get('Ưu tiên',''):11} {t.get('Chủ trì',''):12} {t.get('Trạng thái',''):10} {t.get('QA',''):8} {t['Việc']}")
    print(f"\n{len(tasks)} việc")


if __name__ == "__main__":
    main()
