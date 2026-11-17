#!/bin/sh
# Builds the public CV: content/cv/cv.md -> content/cv/Nicolas_Smits_CV.pdf (needs pandoc and Google Chrome).
# The private CV (Nicolas_Smits_Resume_*.md, holds a phone number) is never an input here.
set -e
cd "$(dirname "$0")/../.."
OUT=content/cv
TMP=$(mktemp -d)
pandoc "$OUT/cv.md" --from markdown --to html5 --template tools/cv/template.html -o "$TMP/cv.html"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 \
  --print-to-pdf="$PWD/$OUT/Nicolas_Smits_CV.pdf" "file://$TMP/cv.html" >/dev/null 2>&1
cp "$TMP/cv.html" "$OUT/cv.html"
rm -rf "$TMP"
ls -la "$OUT/Nicolas_Smits_CV.pdf"
