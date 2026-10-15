#!/usr/bin/env bash
# Serves index.html at http://localhost:8791 (browser notifications need localhost)
cd "$(dirname "$0")"
port="${PORT:-8791}"
echo "Coin plan server: http://localhost:$port  (Ctrl+C to stop)"
(sleep 1; xdg-open "http://localhost:$port/" >/dev/null 2>&1 || open "http://localhost:$port/" >/dev/null 2>&1) &
exec python3 -m http.server "$port" --bind 127.0.0.1
