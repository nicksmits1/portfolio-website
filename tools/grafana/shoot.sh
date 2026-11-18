#!/usr/bin/env bash
# Render single Grafana panels (no browser chrome, no queries) into the upload inbox.
#
#   GRAFANA_HOST=https://<stack>.grafana.net tools/grafana/shoot.sh <token-file> [from] [to] [only-name]
#   from/to: Grafana times (now-7d) or epoch milliseconds
#
# <token-file> holds a Grafana service-account token (Viewer role, short expiry) on one line.
# Keep it in /assets/ (gitignored). The token is read here and sent only to the Grafana host;
# it is never printed. Output: assets/grafana/<name>.png, then process into content/assets/recsys/.
#
# Panels are chosen so that legends carry only our own labels (status, percentile, model,
# variant). Kafka lag, partition and topic panels are excluded: they describe the course's stream.
set -euo pipefail

HOST="${GRAFANA_HOST:?set GRAFANA_HOST to the team stack URL, e.g. https://<stack>.grafana.net}"
TOKEN_FILE="${1:?usage: shoot.sh <token-file> [from] [to]}"
FROM="${2:-now-7d}"
TO="${3:-now}"
ONLY="${4:-}"
OUT="$(cd "$(dirname "$0")/../.." && pwd)/assets/grafana"
mkdir -p "$OUT"

# Accepts a bare token or a GRAFANA_TOKEN=<token> line.
TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
TOKEN="${TOKEN#GRAFANA_TOKEN=}"

# name            dashboard uid                 panel  width height
PANELS=(
  "latency        team32-service-availability   15     1200  500"
  "requests       team32-service-availability   10     1200  500"
  "outcomes       team32-service-availability   14     1200  500"
  "fallback       team32-service-availability   13     1200  500"
  "model-versions team32-model-quality          7      1600  500"
  "ab-difference  team32-model-quality          18     1600  500"
  "ab-rates       team32-model-quality          16     1200  500"
  "gate-ndcg      team32-model-quality          21     1200  500"
  "drift          team32-model-quality          22     1200  500"
  "cold-start     team32-platform-health        37     1200  500"
)

for row in "${PANELS[@]}"; do
  read -r name uid panel w h <<<"$row"
  [[ -n "$ONLY" && "$name" != "$ONLY" ]] && continue
  url="$HOST/render/d-solo/$uid/_?orgId=1&panelId=$panel&from=$FROM&to=$TO&width=$w&height=$h&theme=dark&tz=UTC"
  code=$(curl -sS -o "$OUT/$name.png" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$url")
  type=$(file -b --mime-type "$OUT/$name.png")
  if [[ "$code" == 200 && "$type" == image/png ]]; then
    echo "ok   $name"
  else
    echo "FAIL $name (http $code, $type)"; rm -f "$OUT/$name.png"
  fi
done
