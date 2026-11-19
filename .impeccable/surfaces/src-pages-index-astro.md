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

THESIS: The home page is an objective function. Every research topic is a local minimum on a banded contour landscape, and a click starts a gradient-descent solver that converges on one of them; the topic it lands on filters the project list below. It refuses the category default of a hero headline over a card grid: the index of the work is a surface you probe, with the plain list underneath for scanning.

OWN-WORLD: Night violet ground (#120A2A) under a 13-band contour ramp from ink through indigo and violet to coral and peach (#FF7C6B, #FFD9C2), the SiNDAE logo's colours. Unbounded 300 for display, Onest for text, STIX Two italic for mathematics (x*, f, equations). Pill labels on translucent ink, hairline rules, coral marks the solver's end and every selected state. The full-width peach contact block closes every page.

STORY: The visitor sees the name, face and focus line on a landscape already mid-descent, reads "Converged in 38 iterations on GenAI, 3 projects", clicks to run their own solver or a topic label, which filters the project rows to that topic, then scans Latest, the project rows (each opens /projects/<id>), publications, experience, teaching and education, reshapes the skills landscape by picking a skill, and leaves with the email copied or the CV downloaded.

FIRST VIEWPORT: Full-bleed landscape, about 640 px tall on desktop, four labelled topic minima spread across it (Reinforcement learning, Scientific ML, GenAI, Software engineering, each with its project count; places in `content/data/topics.yaml`) and a broad basin under the name that converges on Contact. Bottom left: square headshot (face centred) beside "Nicolas Smits" at about 76 px, the focus line under it, then the link row (email, LinkedIn, GitHub, ORCID as icon-plus-name pills, icons alone on phones; CV as the labelled peach button, the primary action), then the live iteration readout. Across the hero's lower edge, on translucent ink, Latest runs as a slow reel (below). Top right: nav on an ink tab (Research, Publications, Experience, Skills, CV, Contact). A solver path is already drawn on load.

FORM: User-pinned direction, draft E "descent" (fifth of six drafts a to f), chosen by Nicolas; no seed key, because a user-pinned direction beats the roll. Page order: hero, with Latest as a reel across its lower edge (the four newest items as cards: date, kind, headline, detail; a contour minimum between cards; fixed coral label; 28 px/s leftward, paused under the pointer or focus; reduced motion stands still and scrolls by hand); Research and projects (topic chips with counts above the rows; rows: a crop of the project's own figure, title, where, topic tags, one line, year; `/#<topic>` opens the list filtered); Publications | Experience, Teaching, Education in two columns; Skills (grouped chips left, framed grid landscape right, same objective re-weighted by the chosen skill); peach Contact. Signature interaction: click-to-descend with the live iteration readout; a descent the visitor starts, a topic label or a topic chip filters the rows (the opening descent leaves them whole); skill chips flatten the minima of projects that do not use the skill. Motion grammar: the solver advances two iterations per frame; landscape weights ease over about nine frames; reduced motion draws the converged path and the final weights at once.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Latest: the ESCAPE 37 abstract is now accepted, and SiNDAE was shown in AIChE 2026 session 542, Software Tools and Implementations for Process Systems Engineering, chaired by Victor Alves (Minneapolis, 11 November).
- Latest needs an owner and a cadence, or it goes stale; its entries come from one content collection.
- Phone: skills chips scroll in one row per group; topic chips wrap; the Latest label turns vertical.
- Landscape hover cue: four options and a scroll-tilt study in `drafts/options/cursor-options.html` (artifact "Landscape Cursor Options", https://claude.ai/artifact/8aHAM4nHs3Fg6agwSoQkpG); Picked (2026-11-17): A + C combined. Over the landscape the pointer becomes the solver's start ring labelled x0 ("x0 click to descend", shortening to x0 after the first descent) with the −∇f needle from it, lengthening on slopes and shrinking to a dot in a basin. Touch: one pulse at the opening start and "Tap the map to start another descent". Tilt: deferred until the Astro build stands; ideate several tilt treatments then.
- Topics (2026-11-18, round "Topic Landscape Options", https://claude.ai/artifact/VraQxCaXVtE76o1ujzgxhC, `drafts/options/topic-options.html`): Picked 1C, topics on the map with the list filtering in place, no topic pages; and 3B, thumbnails cropped from each project's real figures (`content/assets/<id>/thumb.webp`). The skills landscape keeps its seven project minima. Personal projects dropped as a topic at Nicolas's request; wayfinder sits under GenAI and Software engineering.
- Latest reel: Picked 2D (2026-11-18), C's cards on B's translucent lower third of the hero; built. With four items it repeats about every 53 s; six to eight would suit it.
