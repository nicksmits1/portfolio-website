---
id: sindae
name: SiNDAE
where: CAPD, CMU (Graduate Research Assistant)
with: Laurens Lueg, Victor Alves
period: 2026-06 to 2026-08
methods: [Nonlinear optimisation, Hybrid modelling]
tools: [JAX, Pyomo]
source: ../CMU/SiNDAE (read-only); https://github.com/Alves-research-group/SiNDAE
links: [https://github.com/Alves-research-group/SiNDAE]
method_paper: https://arxiv.org/abs/2504.04665 (Lueg, Alves, Schicksnus, Kitchin, Laird, Biegler; Nicolas is not an author, cite it as the method the package implements)
publication: "SiNDAE: The Simultaneous Neural Differential-Algebraic systems of equations training Python package", Smits, Lueg, Alves, Laird, Kitchin, Biegler, Journal of Open Source Software, pending
disclosure: public, open source
---
Neural networks embedded in differential-algebraic process models and trained as one nonlinear program.

## Facts
- ODEs and high-index DAEs (index-2 four-tank example), discretised with Pyomo collocation.
- Two training backends: simultaneous and decomposition.
- First-author JOSS software paper pending.

## Visual
Lead: phase portrait of the Leslie-Gower example drawn as evenly spaced streamlines, from the package's own equations and default parameters (`sindae/example_problems.py`).
Required: the SiNDAE logo, which Nicolas designed (`content/assets/sindae/`). Both PNGs are opaque (white and black grounds), so they sit on a plate.
Supporting: `content/assets/sindae/vignette_fit.png` (ground truth, smoother, hybrid fit).
