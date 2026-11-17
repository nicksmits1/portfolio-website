#!/bin/sh
# Usage: shoot.sh <name> <outdir>   captures desktop (1440) and mobile (390) full-length screenshots
cd "$(dirname "$0")/.." || exit 1
./_preview/wrap.sh "$1"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=1440,${3:-5400} --virtual-time-budget=7000 --screenshot="$2/$1-desktop.png" "file://$PWD/_preview/$1.html" >/dev/null 2>&1
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=390,${4:-7400} --virtual-time-budget=7000 --screenshot="$2/$1-mobile.png" "file://$PWD/_preview/$1.html" >/dev/null 2>&1
ls -la "$2" | grep "$1"
