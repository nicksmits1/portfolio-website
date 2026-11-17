---
id: thesis
name: Graph RL for resilient supply chains
where: Master's thesis, CMU
with: Arsh Bhatia, Carl D. Laird
period: 2026-01 to present
methods: [Reinforcement learning, Graph neural networks, Simulation]
tools: [PyTorch, PyG, Gymnasium]
source: ../rl-sc-design (private repo, read-only)
disclosure: everything may be shown; label numbers "Preliminary results"
---
A policy learns which transport arcs to add so demand still arrives when plants, warehouses or routes fail.

## Facts
- Trained on networks of at most 19 nodes, designs networks up to 70 nodes without retraining.
- Keeps 64 to 80% of greedy search's design value at training sizes, 43% at 4x.
- About 21,000x faster: one CPU-second against six CPU-hours for greedy search on a 70-node network.
- 28,481 parameters at every network size. GATv2 encoder, Double DQN.
- First-author abstract prepared for ESCAPE 37 (Trondheim, 2027).

## Visual
Lead: the policy designing one network, arc by arc. The drafts use an illustrative 9-node episode.
TODO: export a real `EpisodeTrace` (`src/environment/trace.py`) from a trained policy on a held-out network and replace the illustration.
Supporting: held-out design value by size, CPU time by size (poster, `content/assets/thesis/poster.pdf`).
