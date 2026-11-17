---
id: sindae
name: SiNDAE
where: CAPD, CMU (Graduate Research Assistant)
with: Laurens Lueg, Victor Alves
period: 2026-06 to 2026-08
methods: [Nonlinear optimisation, Hybrid modelling]
tools: [JAX, Pyomo]
source: ../CMU/SiNDAE (read-only); https://github.com/Alves-research-group/SiNDAE; docs https://alves-research-group.github.io/SiNDAE/
links: [GitHub -> https://github.com/Alves-research-group/SiNDAE, Docs -> https://alves-research-group.github.io/SiNDAE/, JOSS draft (PDF) -> https://github.com/Alves-research-group/SiNDAE/blob/main/paper/SiNDAE_JOSS_Draft_03.pdf]
method_paper: https://arxiv.org/abs/2504.04665 (Lueg, Alves, Schicksnus, Kitchin, Laird, Biegler; Nicolas is not an author, cite it as the method the package implements)
publication: "SiNDAE: The Simultaneous Neural Differential-Algebraic systems of equations training Python package", Smits, Lueg, Alves, Laird, Kitchin, Biegler, Journal of Open Source Software, pending. Latest draft: paper/SiNDAE_JOSS_Draft_03.pdf (2026-09-28).
talk: SiNDAE featured in Victor Alves's talk at the 2026 AIChE Annual Meeting, Minneapolis, 8 to 12 November 2026. Session title not on file.
disclosure: public, open source
---
Neural networks embedded in differential-algebraic process models and trained as one nonlinear program.

## Facts
- ODEs and high-index DAEs (index-2 four-tank example), discretised with Pyomo collocation.
- Two training backends: simultaneous and decomposition.
- First-author JOSS software paper pending.
- Featured in Victor Alves's talk at AIChE 2026.

## Sections

### The missing term
Mechanistic models of process systems are often incomplete: a reaction rate, a growth term or a transfer coefficient depends on the states in a way nobody has written down. A hybrid model keeps the known balances and learns the missing term from data, so it stays physically consistent where the data run out. Open-source tools for this mostly target ODEs and train by integrating and backpropagating; few handle differential-algebraic systems, where algebraic constraints must hold exactly alongside the dynamics.

### One nonlinear program
The network enters the model as one more algebraic equation, and the whole system is discretised by Lagrange–Radau collocation:

$$\dot{\mathbf{x}} = \mathbf{f}(\mathbf{x},\mathbf{y},\mathbf{z},\mathbf{p}), \qquad 0 = \mathbf{h}(\mathbf{x},\mathbf{y},\mathbf{z},\mathbf{p}), \qquad 0 = \mathbf{z} - f_{NN}(\mathbf{v},\boldsymbol{\theta})$$

The weights and the trajectories are then solved for together, so the constraints hold at every collocation point by construction, index-2 systems included. The decomposition backend instead updates the weights in an outer Adam loop around per-trajectory solves, with gradients from the KKT system, and spreads across trajectories with MPI.

### The two-tank example
Two tanks in series under a constant feed. The outlet valve law of the second tank is known; the discharge between the tanks is not, and is learned from noisy level measurements alone. The network is given no structure, yet its response falls onto the true law, and predictions from unseen initial levels track the reference.

$$A_1 \dot{h}_1 = F_{in} - q_1, \qquad A_2 \dot{h}_2 = q_1 - q_2, \qquad q_2 = c_2\sqrt{h_2}$$

### A package people can install
A scikit-learn-style `HybridDAE` runs smoothing, pre-training, training and prediction behind `fit` and `predict`. The default install is pure pip wheels, with the POUNCE and FERAL solvers replacing licensed HSL binaries, and trained networks export to ONNX, Equinox, OMLT and JSON. A `sindae-skills` bundle lets Claude Code draft and check a hybrid model with the user before any code runs.

## Visual
Lead: phase portrait of the Leslie-Gower example drawn as evenly spaced streamlines, from the package's own equations and default parameters (`sindae/example_problems.py`).
Required: the SiNDAE logo, which Nicolas designed (`content/assets/sindae/`). Both PNGs are opaque (white and black grounds), so they sit on a plate.
Order on the page: phase portrait with logo; "The missing term"; "One nonlinear program"; "The two-tank example" with `two-tank-diagram.webp` (the system), then `learned-law.webp` (learned discharge against c1√h1) and `fit.webp` (hybrid fit on three trajectories); "A package people can install".
Figures are from the JOSS paper (`../CMU/SiNDAE/paper/images/`).
