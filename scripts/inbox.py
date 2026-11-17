#!/usr/bin/env python3
"""Hộp thư cho từng agent: việc phải xử lý trước khi làm việc mới.

Dùng: python3 scripts/inbox.py antigravity   (hoặc claude)

In ra:
1. Task của mình đang QA = Fail: sửa trước mọi việc khác (kèm handoff qa-fail mới nhất).
2. Handoff gửi cho mình, mới hơn handoff gần nhất mình đã gửi đi.
3. (claude) Task đang Review chờ QA.
Không có gì thì in "Hộp thư trống".
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from board import parse  # noqa: E402

TEN = {"antigravity": "Antigravity", "claude": "Claude"}


def main():
    if len(sys.argv) < 2 or sys.argv[1].lower() not in TEN:
        print("Dùng: python3 scripts/inbox.py antigravity|claude")
        sys.exit(1)
    me = sys.argv[1].lower()
    files = sorted(os.path.basename(f) for f in glob.glob(os.path.join(ROOT, "handoff", "2*.md")))
    pat = re.compile(r"(\d{8}-\d{4})_([a-z]+)_([a-z]+)_([A-Za-z0-9]+)_([a-z-]+)\.md")
    msgs = [m.groups() + (f,) for f in files if (m := pat.match(f))]
    last_sent = max((m[0] for m in msgs if m[1] == me), default="")
    tasks = [t for t in (parse(p) for p in sorted(glob.glob(os.path.join(ROOT, "tasks", "W*.md")))) if t]
    co_viec = False

    fail = [t for t in tasks if t.get("Chủ trì") == TEN[me] and t.get("QA") == "Fail"]
    if fail:
        co_viec = True
        print("== 1. SỬA TRƯỚC (QA Fail)")
        for t in fail:
            qa = [m for m in msgs if m[3] == t["ID"] and m[4] == "qa-fail" and m[2] == me]
            print(f"- {t['ID']} {t['Việc']}" + (f"  → đọc handoff/{qa[-1][5]}" if qa else ""))

    moi = [m for m in msgs if m[2] == me and m[0] >= last_sent and m[1] != me]
    if moi:
        co_viec = True
        print("== 2. TIN MỚI GỬI CHO BẠN (sau tin gần nhất bạn gửi)")
        for m in moi:
            print(f"- [{m[4]}] {m[3]} từ {m[1]}: handoff/{m[5]}")

    if me == "claude":
        review = [t for t in tasks if t.get("Trạng thái") == "Review" and t.get("Chủ trì") != "Claude"]
        if review:
            co_viec = True
            print("== 3. CHỜ QA")
            for t in review:
                print(f"- {t['ID']} {t['Việc']} | {t.get('Đầu ra', '')}")

    if not co_viec:
        print("Hộp thư trống.")


if __name__ == "__main__":
    main()
