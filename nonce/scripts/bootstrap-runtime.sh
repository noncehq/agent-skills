#!/usr/bin/env bash
set -euo pipefail

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This bootstrap script supports macOS. Use bootstrap-runtime.ps1 on Windows." >&2
  exit 1
fi

if ! command -v vp >/dev/null 2>&1; then
  curl -fsSL https://vite.plus | bash
  export PATH="$HOME/.vite-plus/bin:$PATH"
fi

vp env setup
vp env install
vp env doctor
vp install

