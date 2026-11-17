---
id: sepsis
name: DQN variants for ICU sepsis treatment
where: McGill, COMP 579
with: James Randolph, Abdullah Paracha
period: 2025-01 to 2025-04
methods: [Reinforcement learning]
tools: [PyTorch, Gymnasium]
source: https://github.com/nicksmits1/COMP-579-Reinforcement-Learning (final project); report "A Survey of Reinforcement Models Applied to a Model of ICU Sepsis Treatment" (local, OneDrive McGill/COMP 579/Final Project)
links: [GitHub -> https://github.com/nicksmits1/COMP-579-Reinforcement-Learning]
disclosure: public. Hosting the report PDF is not yet approved; until it is, the page links only the repo.
---
Which DQN extensions help on a clinical benchmark with 716 health states and 25 treatments?

## Facts
- ICU-Sepsis-v2, built from MIMIC-III: 716 states, 25 fluid and vasopressor doses, reward 1 for survival.
- Eight variants, 10 seeds, 300k episodes each. Final return (last 10,000 episodes): Dueling 0.8238, Prioritized 0.8135, DQN 0.8089, Double 0.8056, Noisy 0.8005, Multi-step 0.7868, Distributional 0.7813, Rainbow 0.7782.
- Rainbow, multi-step and distributional DQN stayed near a random policy (about 0.78) on small hyperparameter grids.

## Sections

### What was compared
Treatment is an episodic decision process with a sparse reward: survival scores 1, death 0, with no discounting. Starting from a two-layer DQN, the team added one extension at a time (prioritized replay, double Q-learning, a dueling head, n-step returns, noisy layers, a distributional head) and then all of them together as Rainbow.

### What helped
The dueling head reached the best return, at the cost of noisier learning; prioritized replay came second and converged about 100,000 episodes sooner. The combined methods failed to learn on grids of about four settings each, which says more about tuning budgets than about the methods.

## Visual
Lead: the eight variants on one return scale, the three that failed to learn shown dim near the random-policy level.
Supporting: `returns-over-training.webp` (report Figure 1a, survival rate over training). Low resolution (585 px) with heavy confidence shading; redraw from the run logs if they turn up.
