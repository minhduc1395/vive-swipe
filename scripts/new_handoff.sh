#!/usr/bin/env bash
# Tạo file handoff đúng mẫu.
# Dùng: scripts/new_handoff.sh <tu> <den> <TaskID|meta> <loai> "<nội dung>" [link]
# loai: giao-viec nhan-viec bao-xong hoi tra-loi canh-bao thay-doi-luat trang-thai-phien qa-pass qa-fail
set -euo pipefail
if [ "$#" -lt 5 ]; then
  echo "Dùng: $0 <tu> <den> <TaskID|meta> <loai> \"<nội dung>\" [link]" >&2
  exit 1
fi
from="$1"; to="$2"; task="$3"; kind="$4"; body="$5"; link="${6:-}"
root="$(cd "$(dirname "$0")/.." && pwd)"
stamp="$(TZ=Asia/Ho_Chi_Minh date +%Y%m%d-%H%M)"
file="$root/handoff/${stamp}_${from}_${to}_${task}_${kind}.md"
mkdir -p "$root/handoff"
{
  echo "# ${kind} · ${task}"
  echo "- Thời gian: $(TZ=Asia/Ho_Chi_Minh date '+%d/%m/%Y %H:%M') (GMT+7)"
  echo "- Từ: ${from}"
  echo "- Đến: ${to}"
  echo "- Task: ${task}"
  [ -n "$link" ] && echo "- Link: ${link}"
  echo
  echo "$body"
} > "$file"
echo "$file"
