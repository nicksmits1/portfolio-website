#!/bin/sh
# Usage: tools/shoot/phone.sh <url> <out.png> [height]
# Renders a page at a true 390 px width inside an iframe (headless Chrome cannot go below 500 px), reduced motion on,
# then crops the capture to the iframe. Start the site first: npm run build && npx astro preview --port 4321
URL="$1"; OUT="$2"; H="${3:-6000}"
TMP="$(mktemp -d)/phone.html"
printf '%s' "<!doctype html><body style='margin:0;background:#888'><iframe src='$URL' style='width:390px;height:${H}px;border:0;display:block;margin-left:55px'></iframe></body>" > "$TMP"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-prefers-reduced-motion --window-size=500,"$H" --virtual-time-budget=7000 --screenshot="$OUT" "file://$TMP" >/dev/null 2>&1
sips -c "$H" 390 "$OUT" >/dev/null 2>&1
