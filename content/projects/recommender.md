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

## Sections
### Context
A team project for CMU's Machine Learning in Production course: run a recommendation service for a movie-streaming platform with live users for a whole semester. Every request must get 20 films inside 600 ms, and the service has to stay up while it is monitored, retrained and A/B tested. My parts were the cold start and the deployment.

### Cold start
A ranking model only knows users who were in its training data, and new users arrive all the time. At signup each user writes a sentence or two about the films they like and dislike. A background worker sends that text to Jev once, stores the answers as a taste profile, and a ranker scores the catalogue from it in code. A new user's first request comes about five minutes after signup, so the profile is almost always ready, and no request ever waits on the model.

### Jev
Jev is TypeSafe's first System One model, released in September 2026. It doesn't write text. It answers typed questions with probabilities, such as whether this person wants or avoids horror films, with "not stated" as an explicit option so silence never counts as dislike. The answer always fits the schema, so the ranker never meets a malformed profile, and the probabilities go straight into a scoring formula. Twenty-four questions cost about 2,400 input tokens and return in a median 169 ms, which comes to about $1 a day for every new user. A usability question screens out descriptions like "idk".

### Operations
LightGBM LambdaMART ranks the users the model knows. A new model is retrained each day, served first as a canary candidate beside the champion, and promoted without downtime. Grafana dashboards track availability, latency, model versions, drift and the cold-start backlog.

## Visual
Lead: the system diagram with a request travelling through it, restyled after Proschi's own rendering (grouped nodes, labelled edges, request token, sequence player) in the site palette.
Model: `content/diagrams/recommender.proschi` (passes `proschi check` and `proschi test`). Rendered SVGs and the interactive player are in `content/diagrams/rendered/`. Marked guesses in the file need the team's confirmation.
Badge: TypeSafe mark (`content/assets/recsys/typesafe-mark.svg`, currentColor) beside the Jev section heading, with "Jev by TypeSafe" and a link to typesafe.ai.

Order on the page: system diagram; "Context"; "Cold start"; cold-start backlog (`grafana-cold-start.webp`); "Jev"; "Operations"; model versions (`grafana-model-versions.webp`); latency (`grafana-latency.webp`).
Captions:
- `grafana-cold-start.webp`: The cold-start worker clearing a backlog of about 80,000 profiles overnight, 10 to 11 November (UTC).
- `grafana-model-versions.webp`: One week of serving models. Each day's LightGBM model runs first as a candidate beside the champion, then takes over.
- `grafana-latency.webp`: HTTP latency percentiles over the same week. p99 stays under 500 ms apart from two brief spikes; percentiles are estimated from histogram buckets, so read them as bounds.
Spare: `grafana-requests.webp` (requests per second by status: a daily cycle, every response a 200).
Excluded: Kafka lag, partition and message-rate panels (course stream); A/B panels (experiment hashes as labels, mostly empty).
