Recommender assets.

- `grafana-*.webp`: single panels of the team's Grafana Cloud dashboards, rendered with `tools/grafana/shoot.sh` (Grafana render API, dark theme, UTC) on 2026-11-17, title row and "Powered by Grafana" badge cropped off, WebP q86. Panels were chosen so every label is the team's own (status code, percentile, model name, profile state); nothing course-managed appears.
  - `grafana-model-versions.webp`: Model Quality, "Serving model versions", 2026-11-11 to 2026-11-17.
  - `grafana-latency.webp`: Service Availability, "HTTP latency percentiles", same week.
  - `grafana-requests.webp`: Service Availability, "Requests/s by HTTP status", same week.
  - `grafana-cold-start.webp`: Platform Health, "Profiles by state", 2026-11-10 18:00 to 2026-11-11 12:00 UTC.
- `typesafe-mark.svg`: TypeSafe's glider mark, redrawn as a static currentColor SVG from the mark on typesafe.ai (2026-11-17). Used to credit Jev, the model the cold start runs on.
- `thumb.webp`: the home row and previous / next thumbnail, cropped from `grafana-requests.webp` (scaled to cover, centre crop), 336 by 192 px, WebP q72.
