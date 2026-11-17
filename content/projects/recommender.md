---
id: recsys
name: Movie recommender with LLM cold start
where: Team project, CMU
period: 2026-09 to present
methods: [Ranking & recommenders, LLM pipelines, MLOps]
tools: [LightGBM, Kafka, Flask, Docker, PostgreSQL, AWS]
source: "../CMU/ML in Production/f26-project-32-no-country-for-cold-users" (private course repo, read-only)
disclosure: describe the team's own system broadly (architecture, cold start with Jev, measured results). Never publish course-managed specifics (the course's code, stream, user simulation, endpoints, hostnames, topic names, ports) or the repo itself.
---
A live recommendation service. An LLM turns a new user's free-text tastes into a profile before their first request.

## Facts
- 500k+ live requests served inside a 600 ms latency requirement.
- Cold-start ranker answers in 1.4 ms from a stored taste profile; LLM cost about $1/day.
- LightGBM LambdaMART: 2.2x NDCG@20 over SVD at 139 ms P95.

## Visual
Lead: the system diagram with a request travelling through it.
Model: `content/diagrams/recommender.proschi` (passes `proschi check` and `proschi test`). Rendered SVGs and the interactive player are in `content/diagrams/rendered/`. Marked guesses in the file need the team's confirmation.
