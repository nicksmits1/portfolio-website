---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Home page

Scope: `/`, the site's front door. Mode: Experience (the work leads from the first viewport; the interface recedes).
Audience: research community first (advisors, collaborators, fellowship reviewers arriving from a poster QR code, a talk or an email signature), then ML / OR hiring managers.
Job: in seconds, who Nicolas is, what he works on, that the work is real, and how to reach him or get the CV.
Proof: each project's own visual on its page; real numbers; first-author JOSS paper; TA role; CV PDF.
Constraints: one fact, one place (home teases, project pages explain); every animation has a reduced-motion still that shows the converged result; nothing depends on an animation having played.
Reference mock: `drafts/options/layout-options.html`, round 2, version 3 (published as "Descent Layout Options"). Source of the world: `drafts/e-descent.html`.

## Direction contract

THESIS: The home page is an objective function. Every project is a local minimum on a banded contour landscape, and a click starts a gradient-descent solver that converges on one of them. It refuses the category default of a hero headline over a card grid: the index of the work is a surface you probe, with the plain list underneath for scanning.

OWN-WORLD: Night violet ground (#120A2A) under a 13-band contour ramp from ink through indigo and violet to coral and peach (#FF7C6B, #FFD9C2), the SiNDAE logo's colours. Unbounded 300 for display, Onest for text, STIX Two italic for mathematics (x*, f, equations). Pill labels on translucent ink, hairline rules, coral marks the solver's end and every selected state. The full-width peach contact block closes every page.

STORY: The visitor sees the name, face and focus line on a landscape already mid-descent, reads "Converged in 57 iterations on FIFA pipeline", clicks to run their own solver, then scans Latest, the project rows (each opens /projects/<id>), publications, experience, teaching and education, reshapes the skills landscape by picking a skill, and leaves with the email copied or the CV downloaded.

FIRST VIEWPORT: Full-bleed landscape, about 640 px tall on desktop, six labelled project minima spread across it and a broad basin under the name that converges on Contact. Bottom left: square headshot (face centred) beside "Nicolas Smits" at about 76 px, the focus line under it, then the link row (email, LinkedIn, GitHub, ORCID as icons; CV as the labelled peach button, the primary action), then the live iteration readout. Top right: nav on an ink tab (Research, Publications, Experience, Skills, CV, Contact). A solver path is already drawn on load.

FORM: User-pinned direction, draft E "descent" (fifth of six drafts a to f), chosen by Nicolas; no seed key, because a user-pinned direction beats the roll. Page order: hero; Latest (four dated items in a row); Research and projects (rows: own-visual thumbnail, title, where, one line, year); Publications | Experience, Teaching, Education in two columns; Skills (grouped chips left, framed grid landscape right, same objective re-weighted by the chosen skill); peach Contact. Signature interaction: click-to-descend with the live iteration readout; skill chips flatten the minima of projects that do not use the skill. Motion grammar: the solver advances two iterations per frame; landscape weights ease over about nine frames; reduced motion draws the converged path and the final weights at once.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Link style: icons alone with names on hover (L1, shown in the mock) or icons with names (L2). Nicolas to pick.
- Project page layout (`/projects/<id>`): its own options round before it is built (Nicolas wants options for every page change).
- Latest needs an owner and a cadence, or it goes stale; its entries come from one content collection.
- Phone: skills chips scroll in one row per group; Latest scrolls sideways.
