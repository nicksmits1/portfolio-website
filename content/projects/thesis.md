---
id: thesis
name: Graph RL for resilient supply chains
where: Master's thesis, CMU
with: Arsh Bhatia, Carl D. Laird
period: 2026-01 to present
methods: [Reinforcement learning, Graph neural networks, Simulation]
tools: [PyTorch, PyG, Gymnasium]
source: ../rl-sc-design (private repo, read-only); problem statement ../rl-sc-design/paper/optimisation-problem/problem.tex (draft, November 2026)
links: [Poster (PDF) -> content/assets/thesis/poster.pdf]
publication: "Graph RL for resilient supply chain network design", first-author abstract, accepted at ESCAPE 37 (Trondheim, Norway, 7 to 10 June 2027)
badge: ESCAPE 37 logo, content/assets/thesis/escape37-logo-light.webp, shown beside the publication line
disclosure: everything may be shown; label numbers "Preliminary results". From the problem statement use sections 1 to 5 only, and nothing about the mixed-integer encoding (section 6 onward, and the stochastic MIP named at the end of section 5).
---
A policy learns which transport arcs to add so demand still arrives when plants, warehouses or routes fail.

## Facts
- Trained on networks of at most 19 nodes, designs networks up to 70 nodes without retraining.
- Keeps 64 to 80% of greedy search's design value at training sizes, 43% at 4x.
- About 21,000x faster: one CPU-second against six CPU-hours for greedy search on a 70-node network.
- 28,481 parameters at every network size. GATv2 encoder, Double DQN.
- First-author abstract accepted at ESCAPE 37 (Trondheim, 2027).

## Sections

### Why the operating rule matters
Supply chains survive the loss of a plant, a warehouse or a lane mostly through redundant transport links, and what a link is worth depends on what the network does after the failure. Design models usually assume a planner who re-optimises every flow once the failure is known. Real networks follow fixed rules for reordering and allocating stock, so a link that looks redundant under perfect re-planning can matter a great deal under those rules, and the reverse.

### The design problem
A network of plants, warehouses and customers may gain at most K candidate arcs. Plants, warehouses and arcs fail independently for the whole horizon; warehouses reorder by an (s, S) policy and stock is allocated by lane priority. The backlog B(x, ω) of design x in failure scenario ω is the demand still unmet at the end. A design is scored by the share of baseline backlog it removes, net of a weighted arc cost:

$$V(x) = \frac{B_0 - \mathbb{E}_\omega[B(x,\omega)]}{B_0} - \lambda \frac{C_{\mathrm{ref}}}{|\mathcal{C}|} \sum_{a \in \bar{\mathcal{A}}} c_a x_a, \qquad \max_{x \in \mathcal{X}} V(x)$$

Every value is a sample average over a fixed set of failure scenarios, so the designs of one network are compared on common random numbers.

### An upper bound that values arcs differently
Re-planning every flow optimally turns each scenario into a linear programme whose backlog is never higher than the rule's, so it bounds every design's value from above. On small generated networks it clears all backlog in more than 90% of scenarios, while the rule leaves backlog even when nothing fails. The bound is valid but it is not a stand-in for the real problem.

### A policy instead of a search
Each design needs a simulation over many scenarios, and the number of designs grows combinatorially, so even greedy search takes hours at 70 nodes. The policy builds a design one arc at a time, with an explicit stop, and is rewarded by each arc's change in value, so an episode's return is the design's value. Trained once on small networks, it is applied without retraining to networks four times larger.

## Visual
Lead: the policy designing one network, arc by arc. The drafts use an illustrative 9-node episode.
TODO: export a real `EpisodeTrace` (`src/environment/trace.py`) from a trained policy on a held-out network and replace the illustration.
Order on the page: episode; "Why the operating rule matters"; "The design problem" with the equation; design value by size (`design-value-by-size.webp`, poster crop); "An upper bound"; CPU time by size (`cpu-time-by-size.webp`, poster crop); "A policy instead of a search".
TODO: redraw both poster figures in the site palette from the thesis repo's result files.
