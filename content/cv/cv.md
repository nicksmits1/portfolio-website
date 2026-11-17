---
title: Nicolas Smits
subtitle: Optimisation, machine learning and reinforcement learning for process systems
contact:
  - nsmits@andrew.cmu.edu
  - linkedin.com/in/nicolas-smits
  - github.com/nicksmits1
  - Pittsburgh, PA
updated: November 2026
---

<!-- Public long-form CV. No phone number, no home address: this file and its PDF are published.
     Facts come from content/projects/*.md and the private CV; recommender wording follows its disclosure line. -->

## Education

::: entry
| **Carnegie Mellon University** [Pittsburgh, PA]{.r}
| *MS, Artificial Intelligence Engineering, Chemical Engineering* [*December 2026*]{.r}
:::

- GPA 3.99/4.00. Master's thesis on graph reinforcement learning for resilient supply chain network design, with Arsh Bhatia and Carl D. Laird.

::: entry
| **McGill University** [Montreal, Canada]{.r}
| *BEng, Chemical Engineering, Minor in Applied Artificial Intelligence* [*May 2025*]{.r}
:::

- GPA 3.73/4.00.

## Research

::: entry
| **Graph reinforcement learning for resilient supply chain network design** [Carnegie Mellon]{.r}
| *Master's thesis, with Arsh Bhatia and Carl D. Laird* [*January 2026 to present*]{.r}
:::

- Designed a graph RL agent (GATv2 encoder, Double DQN, PyTorch Geometric) that learns which transport links to add to a supply chain network so that customer demand is still met when plants, warehouses or routes fail.
- Built a size-independent Q-network that scores each candidate link from its endpoint embeddings: 28,481 parameters at every network size, so a policy trained on networks of at most 19 nodes designs networks of up to 70 nodes without retraining.
- Preliminary results: the policy keeps 64 to 80% of greedy search's design value at training sizes and 43% at four times the training size, in about one CPU-second against six CPU-hours for greedy search, roughly 21,000 times faster.
- Built the multi-echelon inventory simulator, the failure-scenario evaluation and a parallel, resumable experiment pipeline on a 32-core server, with held-out test networks and acceptance criteria fixed before any results were examined.

::: entry
| **SiNDAE, Center for Advanced Process Decision-making (CAPD)** [Carnegie Mellon]{.r}
| *Graduate Research Assistant* [*June to August 2026*]{.r}
:::

- Developed and released SiNDAE, an open-source Python package that embeds neural network surrogates in differential-algebraic process models and trains them with nonlinear programming solvers, implementing the simultaneous training method of Lueg et al. (arXiv:2504.04665).
- Supports ODEs and high-index DAEs discretised by Pyomo collocation, with simultaneous and decomposition training backends; added and tested further NLP solvers test-first.
- Wrote the documentation and worked examples in process control, bioprocess kinetics and dynamical systems, published automatically with Jupyter Book and GitHub Actions.

::: entry
| **HydrateTech Laboratory** [McGill University]{.r}
| *Computational Research Assistant* [*May to July 2024*]{.r}
:::

- Adapted the GRADE hydrate cage identification algorithm with a custom depth-first search so that partially formed molecular cages are recognised, enabling entropy analysis for CO2 sequestration studies.
- Optimised the geometric validation routines across hydrate-host systems, reaching 97% detection accuracy.

## Publications and presentations

- **N. Smits**, L. Lueg, V. Alves, C. D. Laird, J. R. Kitchin, L. T. Biegler. SiNDAE: the simultaneous neural differential-algebraic systems of equations training Python package. *Journal of Open Source Software*, pending.
- **N. Smits** et al. Graph reinforcement learning for resilient supply chain network design. First-author abstract prepared for ESCAPE 37, Trondheim, 2027.

## Teaching

::: entry
| **Systems and Toolchains for AI in Engineering (06-763)** [Carnegie Mellon]{.r}
| *Teaching Assistant* [*Fall 2026*]{.r}
:::

- Wrote reference solutions and grading guides for assignments on reproducible Python projects, PostgreSQL and DuckDB, streaming plant data over MQTT, time-series forecasting, neural ODE and physics-informed models, and fault detection on the Tennessee Eastman process.
- Built a Canvas grading tool that reads quiz scores from students' completion reports and writes them to the gradebook only after a TA has reviewed them.
- Grade assignments and final projects.

## Industry experience

::: entry
| **Lhoist Group** [Nivelles, Belgium]{.r}
| *R&D Engineer Intern, Flue Gas Treatment* [*June to July 2022, June to August 2023*]{.r}
:::

- Developed a kinetic process model in Python (SciPy) of Lhoist's Sorbacal sorbents in a pilot scrubbing reactor, capturing second-order reaction dynamics and the relationship between stoichiometric ratio and conversion that the legacy model left out.
- Extended the model with HCl, SO2 and CO2 secondary reactions and temperature dependence, halving mean squared error against pilot reactor data.
- Tuned stiff ODE solvers and built an Excel front end on the Python model, so engineers and experimentalists could run simulations and estimate rate constants themselves.

## Selected projects

::: entry
| **Movie recommendation service with LLM cold start** [Carnegie Mellon]{.r}
| *Team project, Machine Learning in Production* [*September 2026 to present*]{.r}
:::

- Built and deployed a containerised recommendation service (Flask, Gunicorn, Docker Compose) on AWS that served more than 500,000 live requests within a 600 ms latency requirement.
- Designed an asynchronous LLM cold start: TypeSafe's Jev model turns a new user's free-text preferences into a structured taste profile, and a vectorised NumPy ranker turns the profile into recommendations in 1.4 ms, personalising results before the median user's first request for about $1 a day in LLM cost.
- Benchmarked content-based filtering, SVD collaborative filtering and LightGBM LambdaMART on a chronological split; the deployed LightGBM ranker improves NDCG@20 2.2 times over SVD at 139 ms P95 latency.

::: entry
| **DQN variants for ICU sepsis treatment** [McGill University]{.r}
| *Course project, COMP 579 Reinforcement Learning, with James Randolph and Abdullah Paraha* [*January to April 2025*]{.r}
:::

- Compared DQN, Double DQN, Prioritized DQN and Dueling DQN on the ICU-Sepsis-v2 benchmark (716 health states, 25 treatments); Dueling DQN reached the highest final return, about 0.824.

::: entry
| **FIFA player analytics pipeline** [Carnegie Mellon]{.r}
| *Course project, with Amogh Balaji* [*September to December 2025*]{.r}
:::

- Built a Spark to PostgreSQL ETL over player data from 2015 to 2022 and a Kafka stream of YouTube comments, then trained Spark MLlib and PyTorch rating models on GCP Dataproc; gradient-boosted trees reached a test RMSE of 1.292 (R² 0.964).

::: entry
| **wayfinder-sidebar** [Open source]{.r}
| *Claude Code plugin, TypeScript* [*November 2026*]{.r}
:::

- Shows a project's ticket map beside the Claude Code chat; one click starts a new agent session with a handoff for the selected ticket.

## Skills

- **Machine learning:** PyTorch, PyTorch Geometric, JAX, scikit-learn, TensorFlow and Keras, Hugging Face, Ray and RLlib, Gymnasium
- **Optimisation and modelling:** Pyomo, nonlinear programming, hybrid and neural DAEs, SciPy, MATLAB
- **Data and systems:** PostgreSQL, Apache Spark, Kafka, Flask, Gunicorn, Neo4j, REST APIs, pytest
- **MLOps and cloud:** Docker and Compose, Git, GitHub Actions, MLflow, Weights & Biases, Prometheus, Grafana, AWS, GCP
- **Agentic engineering:** agent harness design, tool calling, MCP, agent skills, CLI automation
- **Programming:** Python, Java, TypeScript, MATLAB
- **Languages:** English (native), French (fluent), Dutch (fluent), German (intermediate)
