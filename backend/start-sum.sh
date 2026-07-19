#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
printf 'SUM is available at http://localhost:8080\n'
python3 -m http.server 8080
