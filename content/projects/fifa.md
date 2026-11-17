---
id: fifa
name: FIFA player analytics pipeline
where: CMU
with: Amogh Balaji
period: 2025-09 to 2025-12
methods: [Data engineering, Supervised learning]
tools: [Spark, PostgreSQL, Kafka, PyTorch, GCP, Docker]
source: https://github.com/nicksmits1/FIFA-player-analytics-ml-pipeline (not on disk)
disclosure: public
---
Spark to Postgres ETL, a live Kafka comment stream, and rating models trained locally and on GCP.

## Facts
- Seasons 2015 to 2022. Test RMSE: gradient-boosted trees 1.292 (R² 0.964), random forest 1.656, deep MLP 2.372, shallow MLP 2.487.

## Visual
Lead: the four models on one RMSE scale. TODO: predicted-vs-true plots live inside the notebooks; export them if a richer figure is wanted.
