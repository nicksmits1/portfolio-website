#!/bin/sh
# Wraps an artifact fragment in the publish skeleton so it can be opened locally. Usage: wrap.sh a-slide-rule
cd "$(dirname "$0")/.." || exit 1
{ printf '%s' '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><base href="../"><style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'; cat "$1.html"; printf '%s' '</body></html>'; } > "_preview/$1.html"
