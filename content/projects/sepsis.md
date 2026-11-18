---
id: sepsis
name: 'DQN variants for ICU sepsis treatment'
where: 'McGill, COMP 579'
with: 'James Randolph, Abdullah Paracha'
period: '2025-01 to 2025-04'
methods: [Reinforcement learning]
tools: [PyTorch, Gymnasium]
source: 'https://github.com/nicksmits1/COMP-579-Reinforcement-Learning (final project); report "A Survey of Reinforcement Models Applied to a Model of ICU Sepsis Treatment" (local, OneDrive McGill/COMP 579/Final Project)'
disclosure: 'public. The report PDF may be hosted (Nicolas, 2026-11-17).'
short: Sepsis DQN
when: Jan – Apr 2025
year: 2025
links:
  - { label: "Report (PDF)", href: report.pdf, icon: file }
  - { label: GitHub, href: "https://github.com/nicksmits1/COMP-579-Reinforcement-Learning", icon: gh }
rail:
  - ["8", "variants, 10 seeds each"]
  - ["300k", "episodes per run"]
  - ["MIMIC-III", "real ICU records behind the MDP"]
figures:
  scale: { kind: scale, data: sepsis, caption: "Mean return over the last 10,000 episodes. The three dim variants stayed near a random policy." }
  returns: { kind: img, src: returns-over-training.webp, alt: "Return over training for the eight DQN variants", caption: "Survival rate over training for the best settings of each variant.", source: "Figure 1a of the team’s report." }
order: [scale, Formulation, Deep Q-learning, Extensions, Comparison, Results, returns]
reading:
  - { title: "A survey of reinforcement models applied to a model of ICU sepsis treatment", what: "Final report, Smits, Randolph and Paracha, McGill COMP 579", href: report.pdf, preview: report-p1.webp }
---
Which DQN extensions help on a clinical benchmark with 716 health states and 25 treatments?

## Facts
- ICU-Sepsis-v2, built from MIMIC-III: 716 states, 25 fluid and vasopressor doses, reward 1 for survival.
- Eight variants, 10 seeds, 300k episodes each. Final return (last 10,000 episodes): Dueling 0.8238, Prioritized 0.8135, DQN 0.8089, Double 0.8056, Noisy 0.8005, Multi-step 0.7868, Distributional 0.7813, Rainbow 0.7782.
- Rainbow, multi-step and distributional DQN stayed near a random policy (about 0.78) on small hyperparameter grids.

## Sections
### Formulation
ICU-Sepsis-v2 models a patient's stay in intensive care as a Markov decision process built from MIMIC-III records: 716 discrete health states and 25 treatments, each a combination of intravenous-fluid and vasopressor doses. The reward is 1 if the patient survives and 0 otherwise, with no discounting, so a policy's expected return is its survival rate.

### Deep Q-learning
DQN learns $Q(s,a)$, the expected return of giving treatment $a$ in state $s$ and acting well afterwards, with a neural network. Transitions go into a replay buffer $\mathcal{D}$, and the network regresses on targets computed by a slowly updated copy of itself, $\bar\theta$:
$$\mathcal{L}(\theta) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}}\Big[\big(r + \gamma \max_{a'} Q_{\bar\theta}(s', a') - Q_\theta(s, a)\big)^2\Big]$$
Each extension below changes one part of this loop.

### Extensions
- **Double**: the online network picks the next action and the target network scores it, $r + \gamma\, Q_{\bar\theta}\big(s', \arg\max_{a'} Q_\theta(s', a')\big)$, which curbs overestimation.
- **Prioritized replay**: transitions with large TD error $\delta$ are replayed more often, $P(i) \propto |\delta_i|^\alpha$, with importance weights $w_i = (N P(i))^{-\beta}$ removing the bias.
- **Dueling**: $Q(s,a) = V(s) + A(s,a) - \tfrac{1}{|\mathcal{A}|}\sum_{a'} A(s,a')$ separates how good a state is from how much the treatment matters.
- **n-step**: the target sums $n$ rewards before bootstrapping, $\sum_{k<n} \gamma^k r_{t+k} + \gamma^n \max_{a'} Q(s_{t+n}, a')$, so the terminal reward travels back faster.
- **Noisy layers**: weights $\mu + \sigma \odot \varepsilon$ with learned $\sigma$ replace ε-greedy with exploration that depends on the state.
- **Distributional**: the network predicts the whole return distribution $Z(s,a)$ on fixed atoms, with $Q = \mathbb{E}[Z]$, trained against the projected Bellman target.

Rainbow combines all six.

### Comparison
Starting from a two-layer DQN with 128 hidden units, the team added one extension at a time and then all six together as Rainbow. Each variant was tuned on a grid of about four settings and run for 10 seeds of 300,000 episodes.

### Results
The dueling head reached the best return, at the cost of noisier learning; prioritized replay came second and converged about 100,000 episodes sooner. The combined methods failed to learn on grids of about four settings each, which says more about tuning budgets than about the methods.

## Visual
Lead: the eight variants on one return scale, the three that failed to learn shown dim near the random-policy level.
Order on the page: return scale; "Formulation"; "Deep Q-learning" with the loss; DQN loop diagram; "Extensions"; "Comparison"; "Results"; `returns-over-training.webp`; further reading (report, previewable, first page `report-p1.webp`).
DQN loop diagram (animated, own drawer): environment, replay buffer, online network and target network in a loop, with one transition (s, a, r, s′) travelling env → buffer → sampled batch → loss, the target network feeding the loss, the gradient returning to the online network and its greedy action going back to the environment. The six extensions sit as tags where they act: prioritized replay and n-step on the buffer, double on the target, dueling, distributional and noisy layers on the online network's head. Hovering or tapping a tag lights the part it changes. Reduced motion: the whole loop drawn with every tag in place.
Supporting: `returns-over-training.webp` (report Figure 1a, survival rate over training). Low resolution (585 px) with heavy confidence shading; redraw from the run logs if they turn up.
