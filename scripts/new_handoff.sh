#!/usr/bin/env bash
# Giữ để tương thích. Bản chính: scripts/new_handoff.py (chạy được cả Windows).
exec python3 "$(dirname "$0")/new_handoff.py" "$@"
