#!/bin/sh
# Builds the public CV: content/cv/cv.tex -> content/cv/Nicolas_Smits_CV.pdf (needs pdflatex with fontawesome5).
# cv.tex is Nicolas's own LaTeX CV with the phone number removed; keep his formatting exactly.
set -e
cd "$(dirname "$0")/../.."
if grep -q 'faPhone' content/cv/cv.tex; then echo "cv.tex holds a phone number; the repo is public" >&2; exit 1; fi
TMP=$(mktemp -d)
cp content/cv/cv.tex "$TMP/"
(cd "$TMP" && pdflatex -interaction=nonstopmode -halt-on-error cv.tex >/dev/null && pdflatex -interaction=nonstopmode -halt-on-error cv.tex >/dev/null)
cp "$TMP/cv.pdf" content/cv/Nicolas_Smits_CV.pdf
rm -rf "$TMP"
ls -la content/cv/Nicolas_Smits_CV.pdf
