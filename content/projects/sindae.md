---
id: sindae
name: 'SiNDAE'
where: 'CAPD, Carnegie Mellon'
with: 'Laurens Lueg, Victor Alves'
period: '2026-06 to 2026-08'
methods: [Nonlinear optimisation, Hybrid modelling]
tools: [JAX, Pyomo]
source: '../CMU/SiNDAE (read-only); https://github.com/Alves-research-group/SiNDAE; docs https://alves-research-group.github.io/SiNDAE/'
method_paper: 'https://arxiv.org/abs/2504.04665 (Lueg, Alves, Schicksnus, Kitchin, Laird, Biegler; Nicolas is not an author, cite it as the method the package implements)'
publication_note: '"SiNDAE: The Simultaneous Neural Differential-Algebraic systems of equations training Python package", Smits, Lueg, Alves, Laird, Kitchin, Biegler, Journal of Open Source Software, pending. Latest draft: paper/SiNDAE_JOSS_Draft_03.pdf (2026-09-28).'
talk: 'SiNDAE was shown in session 542, "Software Tools and Implementations for Process Systems Engineering" (CAST Division), 2026 AIChE Annual Meeting, Minneapolis, 11 November 2026, 12:30 to 15:00, Room M100E. Victor Alves chaired the session (co-chairs Joshua Pulsipher, Davood Pourkargar); he is not a listed speaker, so always say "shown in session 542", never "talk by" or "shown by". Program: https://studio.m-anage.com/aiche/2026/meetingapp.cgi/Program/3760'
disclosure: 'public, open source'
short: SiNDAE
when: Jun – Aug 2026
year: 2026
banner: { src: SiNDAE_logo_dark.png, alt: "SiNDAE" }
links:
  - { label: GitHub, href: "https://github.com/Alves-research-group/SiNDAE", icon: gh, lead: true }
  - { label: Docs, href: "https://alves-research-group.github.io/SiNDAE/", icon: paper, lead: true }
  - { label: "JOSS draft (PDF)", href: joss-draft.pdf, icon: file }
  - { label: "Method paper, Lueg et al.", href: "https://arxiv.org/abs/2504.04665", icon: paper }
rail:
  - ["index-2", "DAEs as well as ODEs"]
  - ["2", "training backends, simultaneous and decomposition"]
  - ["JOSS", "first-author software paper, pending"]
  - ["AIChE", "shown in session 542, Minneapolis 2026"]
figures:
  flow: { kind: flow }
  tanks: { kind: img, src: two-tank-diagram.webp, alt: "Two tanks in series: feed into tank 1, discharge q1 through a valve into tank 2, outflow q2", caption: "The two-tank cascade. The discharge <i>q</i>₁ between the tanks is the unknown term.", source: "Figure from the JOSS paper." }
  law: { kind: img, narrow: true, src: learned-law.webp, alt: "Learned discharge against tank 1 level, lying on the true square-root law", caption: "The learned network against the true law <i>c</i>₁√<i>h</i>₁, from noisy level data alone.", source: "Figure from the JOSS paper." }
  fit: { kind: img, src: fit.webp, alt: "Tank levels and discharge over time for three trajectories: ground truth, a smoother and the hybrid fit", caption: "The hybrid fit against ground truth and a smoother, on three trajectories.", source: "Figure from the JOSS paper." }
order: [flow, Motivation, Method, Two-tank example, tanks, law, fit, Package]
reading:
  - { title: "SiNDAE: the simultaneous neural DAE training Python package", what: "Journal of Open Source Software, first author, pending", href: joss-draft.pdf, preview: joss-draft-p1.webp, logo: joss-logo.webp }
  - { title: "A simultaneous approach for training neural differential-algebraic systems of equations", what: "Lueg, Alves, Schicksnus, Kitchin, Laird, Biegler. The method SiNDAE implements.", href: "https://arxiv.org/abs/2504.04665", logo: arxiv-logo.svg }
  - { title: "Software Tools and Implementations for Process Systems Engineering", what: "AIChE Annual Meeting 2026, session 542, Minneapolis. SiNDAE was shown here.", href: "https://studio.m-anage.com/aiche/2026/meetingapp.cgi/Program/3760", logo: aiche-logo.svg }
---
Neural networks embedded in differential-algebraic process models and trained as one nonlinear program.

## Facts
- ODEs and high-index DAEs (index-2 four-tank example), discretised with Pyomo collocation.
- Two training backends: simultaneous and decomposition.
- First-author JOSS software paper pending.
- Shown in AIChE 2026 session 542, Software Tools and Implementations for Process Systems Engineering (chaired by Victor Alves).

## Sections

### Motivation
Mechanistic models of process systems are often incomplete: a reaction rate, a growth term or a transfer coefficient depends on the states in a way nobody has written down. A hybrid model keeps the known balances and learns the missing term from data, so it stays physically consistent where the data run out. Open-source tools for this mostly target ODEs and train by integrating and backpropagating; few handle differential-algebraic systems, where algebraic constraints must hold exactly alongside the dynamics.

### Method
The network enters the model as one more algebraic equation, and the whole system is discretised by Lagrange–Radau collocation:

$$\dot{\mathbf{x}} = \mathbf{f}(\mathbf{x},\mathbf{y},\mathbf{z},\mathbf{p}), \qquad 0 = \mathbf{h}(\mathbf{x},\mathbf{y},\mathbf{z},\mathbf{p}), \qquad 0 = \mathbf{z} - f_{NN}(\mathbf{v},\boldsymbol{\theta})$$

The weights and the trajectories are then solved for together, so the constraints hold at every collocation point by construction, index-2 systems included. The decomposition backend instead updates the weights in an outer Adam loop around per-trajectory solves, with gradients from the KKT system, and spreads across trajectories with MPI.

### Two-tank example
Two tanks in series under a constant feed, the system in the figure at the top of the page. The outlet valve law of the second tank is known; the discharge between the tanks is not, and is learned from noisy level measurements alone. The network is given no structure, yet its response falls onto the true law, and predictions from unseen initial levels track the reference.

### Package
A scikit-learn-style `HybridDAE` runs smoothing, pre-training, training and prediction behind `fit` and `predict`. The default install is pure pip wheels, with the POUNCE and FERAL solvers replacing licensed HSL binaries, and trained networks export to ONNX, Equinox, OMLT and JSON. A `sindae-skills` bundle lets Claude Code draft and check a hybrid model with the user before any code runs.

## Visual
Lead: phase portrait of the two-tank cascade (h1 against h2) drawn as evenly spaced streamlines, with the paper's three training trajectories in peach and the steady state in coral, from the paper's example and its parameters (`paper/example.ipynb`: A1 1, A2 1.5, Fin 0.5, c1 0.5, c2 0.4). Caption carries the model: A1 h1' = Fin − q1, A2 h2' = q1 − c2√h2, q1 = NN(h1, h2). The Leslie-Gower portrait used in the drafts is retired, so the lead figure and the example section show the same system.
Required: the SiNDAE logo, which Nicolas designed (`content/assets/sindae/`). Both PNGs are opaque (white and black grounds), so they sit on a plate.
Top of the column: the SiNDAE logo as a banner across the full width of the main column (`SiNDAE_logo_dark.png`, own plate), the phase portrait directly below it, then a link row under the portrait: GitHub (Alves-research-group/SiNDAE) and Docs, as the two largest links on the page, since the package and its documentation hold most of the work.
Order on the page: logo banner; phase portrait; GitHub and Docs links; "Motivation"; "Method"; "Two-tank example" with `two-tank-diagram.webp` (the system), then `learned-law.webp` (learned discharge against c1√h1) and `fit.webp` (hybrid fit on three trajectories); "Package"; further reading.
Further reading, each a card with its venue's logo:
- JOSS software paper (pending), first author: `joss-draft.pdf`, previewable, first page `joss-draft-p1.webp`; logo `joss-logo.webp`.
- Method paper, Lueg et al. 2025 (arXiv:2504.04665), labelled as the method SiNDAE implements, not Nicolas's paper; links to arXiv, not rehosted; logo `arxiv-logo.svg`.
- AIChE 2026, session 542, Software Tools and Implementations for Process Systems Engineering: links to the program page; logo `aiche-logo.svg`.
Figures are from the JOSS paper (`../CMU/SiNDAE/paper/images/`).
