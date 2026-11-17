#!/bin/sh
# Usage: phone.sh <name> <outdir> [height]   renders the draft in a 390px iframe (headless Chrome cannot go below 500px wide)
cd "$(dirname "$0")/.." || exit 1
./_preview/wrap.sh "$1"
H=${3:-8000}
printf '%s' "<!doctype html><body style='margin:0;background:#888'><iframe src='$1.html' style='width:390px;height:${H}px;border:0;display:block'></iframe></body>" > "_preview/$1-phone.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=500,$H --virtual-time-budget=7000 --screenshot="$2/$1-phone-raw.png" "file://$PWD/_preview/$1-phone.html" >/dev/null 2>&1
