$ErrorActionPreference = "Stop"

if (-not (Get-Command vp -ErrorAction SilentlyContinue)) {
  irm https://vite.plus/ps1 | iex
  $env:Path = "$env:USERPROFILE\.vite-plus\bin;$env:Path"
}

vp env setup
vp env install
vp env doctor
vp install

