#!/usr/bin/env bash
set -euo pipefail

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This bootstrap script supports macOS. Use bootstrap-runtime.ps1 on Windows." >&2
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

if ! command -v vp >/dev/null 2>&1; then
  curl -fsSL https://vite.plus | bash
  export PATH="$HOME/.vite-plus/bin:$PATH"
fi

cd "$SKILL_DIR"

vp env setup
vp env on
vp env install
vp env doctor
vp install
