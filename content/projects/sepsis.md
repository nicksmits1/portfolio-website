---
id: sepsis
name: DQN variants for ICU sepsis treatment
where: McGill, COMP 579
with: James Randolph, Abdullah Paraha
period: 2025-01 to 2025-04
methods: [Reinforcement learning]
tools: [PyTorch, Gymnasium]
source: https://github.com/nicksmits1/COMP-579-Reinforcement-Learning (final project; local folder holds only cloned libraries)
disclosure: public
---
Which DQN extensions help on a clinical benchmark with 716 health states and 25 treatments?

## Facts
- ICU-Sepsis-v2. Final return: Dueling DQN 0.8238, Prioritized DQN 0.8135, DQN and Double DQN 0.8089 and 0.8056 (the README does not say which is which; confirm before the real build).

## Visual
Lead: the four variants on one return scale. TODO: survival-rate and episode-length curves exist only as README screenshots.
