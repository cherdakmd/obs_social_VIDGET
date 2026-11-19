#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js not found! Install Node.js 18+ or add index.html directly as a Local File in OBS."
  exit 1
fi
exec node server.mjs
