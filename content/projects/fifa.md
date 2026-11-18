---
id: fifa
name: FIFA player analytics pipeline
where: CMU
with: Amogh Balaji
period: 2025-09 to 2025-12
methods: [Data engineering, Supervised learning]
tools: [Spark, PostgreSQL, Kafka, PyTorch, GCP, Docker]
source: https://github.com/nicksmits1/FIFA-player-analytics-ml-pipeline (read from a clone in the scratchpad)
links: [GitHub -> https://github.com/nicksmits1/FIFA-player-analytics-ml-pipeline]
disclosure: public. Do not reproduce the repo's bucket names, cluster names or example credentials on the site.
---
Spark to Postgres ETL, a live Kafka comment stream, and rating models trained locally and on GCP.

## Facts
- Seasons 2015 to 2022. Test RMSE: gradient-boosted trees 1.292 (R² 0.964), random forest 1.656, deep MLP 2.372, shallow MLP 2.487.

## Visual
Lead: the pipeline, `content/diagrams/fifa.proschi` (passes `proschi check` and `proschi test`), drawn by the site's own engine in the Proschi look (see the project page contract, "Architecture diagrams") with a record travelling through it: player CSVs to the Spark loader to Postgres; YouTube comments through Kafka to a live mention leaderboard; Postgres to the Spark ML feature pipeline, then MLlib trees and MosaicML shards streamed into PyTorch MLPs.
Supporting: the four models on one RMSE scale; parity plots of predicted against true overall rating (`parity-gbt.webp`, `parity-rf.webp`, `parity-deep-ml.webp`, `parity-shallow-mlp.webp`, notebook outputs from the repo's `imgs/`).
