#!/usr/bin/env bash
# Local test gate aligned with .github/workflows/ci.yml (check + unit tests).
# Usage:
#   ./scripts/run-tests.sh
#   ./scripts/run-tests.sh --with-ui    # also runs Vitest (ui/)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_ui=false
for arg in "$@"; do
  case "$arg" in
    --with-ui) run_ui=true ;;
    -h|--help)
      echo "Usage: $0 [--with-ui]"
      exit 0
      ;;
  esac
done

echo "==> Biome check (lint + format)"
npm run check

echo "==> Unit tests (c8 + node:test)"
npm test

if [[ "$run_ui" == true ]]; then
  echo "==> UI tests (vitest)"
  npm run test:ui
fi

echo "OK — all selected checks passed."
