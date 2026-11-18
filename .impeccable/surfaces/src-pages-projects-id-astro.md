---
version: 1
slug: "src-pages-projects-id-astro"
primary_target: "src/pages/projects/[id].astro"
related_targets: []
---

# Project pages

Scope: `/projects/<id>`, one page per file in `content/projects/`. Mode: Experience (the project's own figures lead; the interface recedes).
Audience: research community first (arriving from a home row, a poster QR code or a paper link), then ML / OR hiring managers checking that the work is real.
Job: in seconds, what the project is and what it found; within a minute, why it matters and how it works, told through its own figures with short prose between them.
Proof: the project's own figure first; real numbers in at most four facts; papers, posters, repos and talks linked from the rail; every illustrative figure labelled as such.
Constraints: one fact, one place (skills live on home, the chips link there); copy comes only from the content file; each file's `disclosure` line binds; nothing depends on an animation having played.
Reference mock: `drafts/options/project-options.html`, option C "Arrival" (published as "Project Page Options"), chosen by Nicolas on 2026-11-17. Source of the world: `drafts/e-descent.html` and the home contract `.impeccable/surfaces/src-pages-index-astro.md`.

## Direction contract

THESIS: A project page is the minimum the home solver converged on. It opens on the home landscape close in on this project's basin, with the solver arriving and the readout under the title, and the neighbouring minima are the previous and next projects. It refuses the case-study template of a banner image over long sections of text: the project's figures run down the main column, short prose sections sit between them, and the line, facts and links stay in a rail beside them.

OWN-WORLD: Inherited from home without change: night violet ground (#120A2A), the 13-band contour ramp from ink through indigo and violet to coral and peach, Unbounded 300/400 for display, Onest for text, STIX Two for mathematics, translucent ink tabs and pill labels, hairline rules, coral for the solver's end and every selected state, the full-width peach contact block at the bottom.

STORY: The visitor lands on the strip, sees the title over a dark basin and the solver converging on this project ("Converged in 55 iterations on SiNDAE"), reads the line and the facts in the rail, steps through the lead figure, reads the short sections (motivation, formulation, method, results) with their figures and equations between them, opens the paper, poster, repo or talk from the rail, and either descends to a neighbouring minimum, opens a skill on home, or leaves through the peach footer.

FIRST VIEWPORT: A 300 px landscape strip, full bleed: an ink tab top left with "Nicolas Smits" (links home), the nav on an ink tab top right with Research marked, three labelled minima (this project in coral with x*, the previous and next projects in ink pills with a small "previous" / "next"), and the title (Unbounded 300, about 50 px, two lines at most) bottom left over a dark basin, with the where-line and the live readout under it. Below it a 12-column grid: the rail in columns 1 to 4 (line, at most four facts with peach figures, the note or publication badge, link pills, skills chips) and the lead figure starting at the top of columns 5 to 12. On a 1280 × 800 laptop the top of the lead figure is in view. On a phone the strip stays 300 px with the title on it, the rail stacks above the figures, and the chips scroll in one row.

FORM: User-picked option C from a three-option round (A Split, B Wall, C Arrival). Main column order comes from the content file: the lead figure first, then each `### ` section from `## Sections` (heading Unbounded 400 about 26 px; prose Onest 17 px, at most about 110 words, measure under 65ch), with supporting figures placed where the file's `## Visual` order puts them. Display equations are rendered at build time to MathML (Temml) set in self-hosted STIX Two Math, so mathematics matches the STIX italic used in figure labels; no client-side math script. Raster figures from papers and posters sit on a white plate (10 px radius, hairline outline) with a two-line caption, the second line naming the source. Logos that belong to the work (SiNDAE, ESCAPE 37) appear at their own scale: SiNDAE's on the lead figure's plate, ESCAPE 37's in the rail beside the publication line. The rail is sticky (top 24 px) from 900 px up. A previous / next row with home-row thumbnails closes the column, then the peach contact footer. Signature interaction: the arrival descent runs once on load from a fixed start into this project's minimum, two iterations per frame, with the live readout; clicking the strip starts another descent, and one that ends in a neighbour's basin turns that label coral and makes the readout a link to it. Motion grammar: as on home for the strip; each figure's own animation (episode steps, request flow, streamline drawing, pipeline record) starts at 35% visibility and pauses off screen; reduced motion draws the converged path, the episode's last step, the finished streamlines and the paused first frame of any video.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance


ADDITIONS (Nicolas, 2026-11-17, second round):
- Further reading: a closing block before the previous / next row on any page with documents. Each entry is a card: first-page preview on a white plate (from `content/assets/<id>/*-p1.webp`), the venue's logo where there is one, title, one line naming what it is. Clicking opens the PDF in an inline viewer on desktop (native PDF in a dialog) and in a new tab on phones. External papers (the SiNDAE method paper on arXiv) link out with their logo and are never rehosted. Pages: thesis (poster), SiNDAE (JOSS draft, method paper, AIChE session), mmrag (report), sepsis (report).
- SiNDAE page head: the SiNDAE logo as a full-width banner at the top of the main column, the phase portrait directly below it, and GitHub and Docs as large links directly under the portrait.
- Architecture diagrams (recommender, FIFA): drawn by the site's own engine in Proschi's visual grammar, recoloured to this world. Nodes are cards with a 2 px outline coloured by kind, a hard offset shadow (3 px, near-black #07031A, no blur), a square icon tile on the left, the name in Onest 600 and the kind beneath it in small mono-style uppercase; square port handles where edges attach; edges routed orthogonally with rounded corners, labels in small pills on the ground; groups as dashed rounded rectangles with an uppercase, letter-spaced label. Kind colours from the contour ramp: services indigo, stores violet, streams and queues coral, third-party services (Jev, YouTube) peach, actors lavender-grey. The travelling request keeps coral. Kind and edge labels are set in JetBrains Mono 400, self-hosted (Nicolas, 2026-11-18). Built as `src/scripts/system.ts`.
- Recommender: TypeSafe's mark beside the Jev section, crediting the model.
- Thesis: an animated design-policy diagram directly under the episode figure (environment and agent regions, embeddings flown into the shared MLP, Q as gain in design value, a variable legend), and an Amortised cost section with a static schematic after "Learned policy". Sepsis: an animated DQN loop after the loss, with the six extensions tagged where they act. Approved from `drafts/options/figure-options.html` (2026-11-18).
- Captions that change with an animation name the step in two to four words; explanation lives in prose or a legend. No coloured side rules on any callout or formula.

## Unresolved

- Thesis: the two poster figures ship as poster crops until they are redrawn in the site palette from the thesis repo's result files; the episode stays labelled illustrative until a real trace is exported.
