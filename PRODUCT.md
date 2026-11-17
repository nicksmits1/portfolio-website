# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Astro (static output, one content file per project, small client-side islands for canvas/SVG animation), deployed to a static host behind a custom domain Nicolas will buy. Chosen because adding a project over a multi-year PhD should be one content file plus assets, not a markup edit. Nicolas answered "pick what you think is best between 2 or 3" and said he is willing to pay for a domain and proper hosting; the framework choice was offered and delegated. Host: Cloudflare Pages, deploying from the public GitHub repo with a preview URL per branch (decided 2026-11-17; Nicolas delegated the choice once it was clear the site is fully static).

## Users

Primary: the research community around optimisation, ML, RL and operations research in chemical/process systems engineering. Advisors, potential collaborators, conference contacts, fellowship reviewers. They arrive from a talk, a poster QR code, a paper or an email signature and want to see what Nicolas works on and whether the work is real.

Secondary: industry engineers and hiring managers for ML / OR roles and internships, who want evidence that he also ships production systems.

Confirmed priority: both audiences, research first.

## Product Purpose

A personal portfolio for Nicolas Smits that shows his programming and research projects, and that he can keep extending throughout a Chemical Engineering PhD (focus: optimisation, ML, RL, OR). Success: a visitor understands each project from its visual in seconds, and Nicolas (or an agent) can add a new project without redesigning anything.

## Positioning

Each project is shown through a visual made from the project's own mathematics, data or system: a policy designing a network, a vector field, an architecture carrying a request. The work demonstrates itself; prose is the smallest part of every page.

## Operating Context

- The site is maintained with coding agents over several years. Source projects live in sibling directories of this repo (`../rl-sc-design`, `../CMU/SiNDAE`, `../CMU/ML in Production/f26-project-32-no-country-for-cold-users`, `../wayfinder-sidebar`) and on GitHub (`nicksmits1`). Those source projects are read-only from here: never edit them.
- New projects will keep arriving (PhD research, courses, tools).
- Visitors reach it on laptops at desks and on phones from poster QR codes.

## Capabilities and Constraints

- Six launch projects: movie recommendation service (MLiP, team project), SiNDAE, master's thesis (graph RL for supply chain network design), FIFA player analytics pipeline, RL course final project (DQN variants for ICU sepsis treatment), wayfinder-sidebar.
- An animated, interactive skills page.
- Visual first: avoid text-heavy pages; cut repetition.
- Disclosure, thesis: everything may be shown, including preliminary numbers.
- Disclosure, recommender: describe the team's own implementation broadly (the system built, its architecture, the novel parts such as the Jev cold start). Do not publish anything specific to what the course hosts or manages: the course's code, its Kafka stream, its user simulation, endpoints, hostnames, topic names, credentials, or the private repo itself. Credit it as a team project.
- SiNDAE's page must include the SiNDAE logo, which Nicolas designed.
- Structure (Nicolas, 2026-11-17): the home page is an index; each project has its own page and none is shown in full on the home page.
- Beyond projects (Nicolas, 2026-11-17): the site covers the whole profile, with sections for publications and talks, experience and education, a CV link, and a first screen with his headshot and links (LinkedIn, GitHub, ORCID once he has it, email). His friend's site johnspeaks.com is the reference for which sections to include, not for styling. Section set and home layout are being chosen from `drafts/options/layout-options.html`.
- A public CV download needs a copy without the personal phone number.
- Undecided: domain name, whether a CV download and a writing/notes section are wanted.

## Brand Commitments

- Name: Nicolas Smits.
- Reference Nicolas supplied for generative pattern assets: Book of Shapes (bookofshapes.com), specifically flow lines, resonance field, flow poles, converging wavy lines. Its licence allows generated output on a website with no attribution, but forbids redistributing patterns as a pack and does not cover the site's source code or node graphs. Its MCP is a paid waitlist.
- Reference Nicolas supplied for process: the antialgorithm skill (name the average first pick, then move away from it for a reason taken from the project).
- Tone rule from Nicolas: focus on visuals wherever possible, avoid being text-heavy, cut redundant text and repetition.

## Evidence on Hand

- CV: `Nicolas_Smits_Resume_Oct_2026_ML.md`.
- Thesis: poster `../rl-sc-design/poster/poster_v3_1_preview.pdf`; figures under `../rl-sc-design/.scratch/c1-generalization/research/*/figures/`; episode traces come from `src/environment/trace.py` and plots from `viz.py`. Headline: a policy trained on networks of at most 19 nodes designs networks up to 70 nodes, keeps 64 to 80% of greedy search's value at training sizes (43% at 4x), about 21,000x faster (one CPU-second vs six CPU-hours). 28,481 parameters. ESCAPE 37 abstract prepared.
- SiNDAE: logos `../CMU/SiNDAE/docs/images/SiNDAE_logo.png` and `SiNDAE_logo_dark.png`; paper vignettes in `../CMU/SiNDAE/paper/images/`; JOSS software paper pending, Nicolas first author ("SiNDAE: The Simultaneous Neural Differential-Algebraic systems of equations training Python package", Smits, Lueg, Alves, Laird, Kitchin, Biegler; `../CMU/SiNDAE/paper/paper.md`). arXiv 2504.04665 is the method paper the package implements (Lueg, Alves, Schicksnus, Kitchin, Laird, Biegler); Nicolas is not an author on it, so never list it as his publication.
- Recommender: an out-of-date Proschi diagram at `temp/architecture/2026-11-03-recommendation-request/` in the project; ADRs in `docs/adr/`; CV numbers (500k+ live requests, 600 ms requirement, 1.4 ms ranker, LLM cost about $1/day, 2.2x NDCG@20 over SVD at 139 ms P95).
- wayfinder-sidebar: `../wayfinder-sidebar/assets/demo.gif`, `demo.mp4`, `sidebar.png`, `icon.svg`; public repo.
- FIFA: public repo `nicksmits1/FIFA-player-analytics-ml-pipeline` (with Amogh Balaji). Spark to Postgres ETL, Kafka + YouTube comment streaming, Spark MLlib and PyTorch regressors on GCP Dataproc. Best model GBT: RMSE 1.292, R² 0.964.
- RL course project: public repo `nicksmits1/COMP-579-Reinforcement-Learning` (final project with James Randolph and Abdullah Paraha). ICU-Sepsis-v2, 716 states, 25 actions; Dueling DQN best at about 0.824 return.
- Headshot: Nicolas will upload one (2026-11-17); until then the layout shows a labelled placeholder.
- Absent, do not fabricate: publication list beyond the above, testimonials, a real exported episode trace from a trained thesis policy (the animation needs one exported from the thesis repo), FIFA and sepsis figures as image files (they live inside notebooks and GitHub-hosted README images).

## Product Principles

1. The visual is the argument. Every project leads with something that moves or can be read at a glance, built from that project's real material.
2. One fact, one place. Nothing is said twice across the home page, a project page and the skills page.
3. Adding a project is adding a file. Structure and templates absorb new work without redesign.
4. Honest material. Real numbers, real figures, real traces; anything illustrative is labelled as such until the real asset replaces it.
5. Research first, shipping as proof.

## Accessibility & Inclusion

Motion is central to the site, so every animation needs a reduced-motion state that still shows the result as a still, and no content may depend on an animation having played.
