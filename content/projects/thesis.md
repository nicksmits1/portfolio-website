---
id: thesis
name: 'Graph RL for resilient supply chains'
where: 'Master’s thesis, CMU'
with: 'Arsh Bhatia, Carl D. Laird'
period: '2026-01 to present'
methods: [Reinforcement learning, Graph neural networks, Simulation]
tools: [PyTorch, PyG, Gymnasium]
source: '../rl-sc-design (private repo, read-only); problem statement ../rl-sc-design/paper/optimisation-problem/problem.tex (draft, November 2026)'
publication_note: '"Graph RL for resilient supply chain network design", first-author abstract, accepted at ESCAPE 37 (Trondheim, Norway, 7 to 10 June 2027)'
disclosure: 'everything may be shown; label numbers "Preliminary results". From the problem statement use sections 1 to 5 only, and nothing about the mixed-integer encoding (section 6 onward, and the stochastic MIP named at the end of section 5).'
short: Supply chain RL
when: 2026 – present
year: 2026
links:
  - { label: "Poster (PDF)", href: poster.pdf, icon: file }
note: Preliminary results
badge: { logo: escape37-logo-light.webp, alt: "ESCAPE 37, Trondheim, Norway", title: "Abstract accepted at ESCAPE 37", text: "First author. Trondheim, 7–10 June 2027." }
rail:
  - ["21,000×", "faster than greedy search"]
  - ["19 → 70", "nodes, trained on → designed"]
  - ["64–80%", "of greedy search’s value at training sizes"]
  - ["28,481", "parameters at every network size"]
figures:
  episode: { kind: net, fine: "Illustrative 9-node episode. A trace exported from the trained policy replaces it." }
  value: { kind: img, src: design-value-by-size.webp, alt: "Held-out design value by network size for the learned policy, greedy search and random baselines", caption: "Held-out design value by network size, mean and 95% interval: the policy in red, greedy search in black. Shaded sizes are larger than any training network.", source: "Crop of the thesis poster; to be redrawn in the site palette." }
  cpu: { kind: img, src: cpu-time-by-size.webp, alt: "Median CPU time to design one network, greedy search against the learned policy, log scale", caption: "Median CPU time to design one network, on a log scale.", source: "Crop of the thesis poster; to be redrawn in the site palette." }
order: [episode, Motivation, Formulation, value, Upper bound, cpu, Learned policy, Architecture]
reading:
  - { title: "Graph RL for resilient supply chain network design", what: "Poster, preliminary results", href: poster.pdf, preview: poster-p1.webp, wide: true }
---
A policy learns which transport arcs to add so demand still arrives when plants, warehouses or routes fail.

## Facts
- Trained on networks of at most 19 nodes, designs networks up to 70 nodes without retraining.
- Keeps 64 to 80% of greedy search's design value at training sizes, 43% at 4x.
- About 21,000x faster: one CPU-second against six CPU-hours for greedy search on a 70-node network.
- 28,481 parameters at every network size. GATv2 encoder, Double DQN.
- First-author abstract accepted at ESCAPE 37 (Trondheim, 2027).

## Sections

### Motivation
Supply chains survive the loss of a plant, a warehouse or a lane mostly through redundant transport links, and what a link is worth depends on what the network does after the failure. Design models usually assume a planner who re-optimises every flow once the failure is known. Real networks follow fixed rules for reordering and allocating stock, so a link that looks redundant under perfect re-planning can matter a great deal under those rules, and the reverse.

### Formulation
A network of plants, warehouses and customers may gain at most K candidate arcs. Plants, warehouses and arcs fail independently for the whole horizon; warehouses reorder by an (s, S) policy and stock is allocated by lane priority. The backlog B(x, ω) of design x in failure scenario ω is the demand still unmet at the end. A design is scored by the share of baseline backlog it removes, net of a weighted arc cost:

$$V(x) = \frac{B_0 - \mathbb{E}_\omega[B(x,\omega)]}{B_0} - \lambda \frac{C_{\mathrm{ref}}}{|\mathcal{C}|} \sum_{a \in \bar{\mathcal{A}}} c_a x_a, \qquad \max_{x \in \mathcal{X}} V(x)$$

Every value is a sample average over a fixed set of failure scenarios, so the designs of one network are compared on common random numbers.

### Upper bound
Re-planning every flow optimally turns each scenario into a linear programme whose backlog is never higher than the rule's, so it bounds every design's value from above. On small generated networks it clears all backlog in more than 90% of scenarios, while the rule leaves backlog even when nothing fails. The bound is valid but it is not a stand-in for the real problem.

### Learned policy
Each design needs a simulation over many scenarios, and the number of designs grows combinatorially, so even greedy search takes hours at 70 nodes. The policy builds a design one arc at a time, with an explicit stop, and is rewarded by each arc's change in value, so an episode's return is the design's value. Trained once on small networks, it is applied without retraining to networks four times larger.

### Architecture
The policy reads the network as a graph: seven features per node (tier, safety stock, storage and production capacity, throughput) and three per arc (lead time, priority, cost). Two GATv2 rounds give every node an embedding. For each candidate arc, one shared network reads both endpoint embeddings, the remaining budget and the arc's own features, and returns that arc's Q-value. The best arc is added only if its value is positive; otherwise the design stops:
$$h = f_\theta(X, E), \qquad Q(s_k, a_{ij}) = g_\psi\big(h_i \,\|\, h_j \,\|\, \rho_k \,\|\, e_{ij}\big), \qquad a_k = \begin{cases} \arg\max_{a} Q(s_k, a) & \text{if } \max_a Q(s_k, a) > 0 \\ \text{stop} & \text{otherwise} \end{cases}$$
No weight depends on the number of nodes or arcs, so the same 28,481 parameters design networks of 19 and 70 nodes. Training is Double DQN with experience replay.

## Visual
Lead: the policy designing one network, arc by arc. The drafts use an illustrative 9-node episode.
TODO: export a real `EpisodeTrace` (`src/environment/trace.py`) from a trained policy on a held-out network and replace the illustration.
Order on the page: episode; "Motivation"; "Formulation" with the equation; design value by size (`design-value-by-size.webp`, poster crop); "Upper bound"; CPU time by size (`cpu-time-by-size.webp`, poster crop); "Learned policy"; architecture diagram; "Architecture" with its equation; further reading (poster, previewable).
Architecture diagram (animated, own drawer): a small candidate network on the left; two message-passing rounds run as pulses along its arcs (GATv2 ×2, θ shared by all nodes) and leave one embedding bar per node; each candidate arc then gathers [h_i ‖ h_j ‖ ρ_k ‖ e_ij] into the shared MLP g_ψ, and its Q-value grows as a bar beside it; the largest positive bar turns coral, that arc is drawn into the network, ρ_k steps down, and the loop repeats until every Q is at or below zero and "stop" lights. Labels follow the poster's "Design Policy" panel. Reduced motion: the last step, with all Q bars, the chosen arc and the stop rule visible.
Further reading: `poster.pdf` with first-page preview `poster-p1.webp` (landscape, 1400 px).
TODO: redraw both poster figures in the site palette from the thesis repo's result files.
