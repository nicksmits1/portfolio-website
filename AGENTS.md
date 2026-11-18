# Portfolio website

Nicolas Smits's portfolio, extended project by project through a Chemical Engineering PhD. `PRODUCT.md` holds the product truth; read it before any design or content work.

You are the owner and long term maintainer of this codebase, and its design is up to you.

## State

Direction chosen: **draft E, descent** (`drafts/e-descent.html`). The site is built in Astro (`src/`), from two contracts: home, `.impeccable/surfaces/src-pages-index-astro.md`, and project pages ("Arrival"), `.impeccable/surfaces/src-pages-projects-id-astro.md`. Reload the matching contract before any page work; its Unresolved list holds the open choices. The mocks in `drafts/options/` are the visual reference the build was ported from; change the site, not the mocks. Layout and page changes get an options artifact for Nicolas to pick from before they are built. Hosting is Cloudflare Pages, deploying from the public GitHub repo `nicksmits1/portfolio-website`. `DESIGN.md` is written at the end, from the built site.

## The repo is public

Commit only what may appear on the public site. The private CV (`Nicolas_Smits_Resume_Oct_2026_ML.md`) holds a personal phone number, so it stays local and gitignored. Read it for facts; never commit it. The public CV is `content/cv/cv.md`; `tools/cv/build.sh` renders it to the downloadable `content/cv/Nicolas_Smits_CV.pdf` (rebuild and commit both after any edit).

`/assets/` at the repo root is Nicolas's upload inbox and is gitignored. Process what he drops there (resize, strip metadata) into `content/assets/<project or profile>/` and commit only the processed copy.

Student work is never source material. `../Sys&Tool TA` holds submissions and grades; read only its course-level READMEs.

## Sources are read-only

Project material lives in sibling directories (`../rl-sc-design`, `../CMU/SiNDAE`, `../CMU/ML in Production/...`, `../wayfinder-sidebar`) and on GitHub under `nicksmits1`. Read them; copy what the site needs into `content/assets/<project>/`; write only inside this repo. `../git_token.txt` and any `.env` or `.secrets` file stay unread.

## Where a fact lives

- `content/projects/<id>.md`: one file per project, and the only place its copy and numbers live. Frontmatter holds the page: `rail` (at most four facts), `links`, `figures` (each a `kind` drawn by a component in `src/components/figures/`), `order` (figure ids and `### ` headings, top to bottom) and `reading`. The body holds the one-line summary, `## Facts` (evidence notes with sources), `## Sections` (the prose; display math in `$$`, rendered to MathML at build time) and `## Visual` (notes and TODOs for agents). The `disclosure` line is binding. The build fails on an `order` entry that matches nothing and on a section left out of `order`.
- `content/data/`: Latest, publications, the experience / teaching / education timeline, skill groups and the profile. Never list the SiNDAE method paper (Lueg et al.) as Nicolas's publication.
- `content/assets/<id>/`: every shipping image, PDF and video, each named in that folder's README with its provenance.
- `src/scripts/`: the drawing engine (landscape and solver, network episode, recommender, streamlines and two-tank field, pipeline, ladder, scales). Numbers drawn there come from the project file; change the file first, then the script.
- `content/diagrams/*.proschi`: system diagrams as code. After any edit run `npx proschi@latest check <file>` and `npx proschi@latest test <file>`, then re-render into `content/diagrams/rendered/`.

## Adding a project

1. Read the source project and write `content/projects/<id>.md` in the shape of the existing seven.
2. Pick the lead visual from the project's own mathematics, data or system. A figure that could illustrate a different project is the wrong figure. A new kind of figure is a new component in `src/components/figures/` with a reduced-motion still.
3. Copy real assets into `content/assets/<id>/` and record their provenance in its README. Anything illustrative is labelled as illustrative on the page until a real export replaces it.
4. Give it a place in `ORDER` (`src/lib/site.ts`), a minimum in every map (`src/scripts/maps.ts`) and a thumbnail (`src/lib/thumbs.ts`); the build stops until all three exist.
5. One line of prose, then the visual, then at most four facts. A sentence that restates the visual or another page gets deleted.

## Writing

Headings are short noun phrases that name their topic, such as Motivation, Formulation, Method, Comparison or Results. A heading is never a clause, a question or a sentence fragment ("Why the operating rule matters", "What was compared", "How it was measured"), and it never opens with an article ("Two-tank example", not "The two-tank example").

## Design work

Use `/impeccable` for any interface change, and hold every change to `DESIGN.md`. Every animation needs a reduced-motion still that shows the result. Book of Shapes patterns may appear as generated output on the site; their node graphs and source are not licensed, so flow fields here are drawn by our own implementation (`streamlines` in `src/scripts/flow.ts`).

## Previewing

`npm run build` then `npx astro preview --port 4321`. Desktop: headless Chrome with `--force-prefers-reduced-motion` for the converged stills. Phone: `tools/shoot/phone.sh <url> <out.png>` renders a true 390 px width (headless Chrome cannot go below 500 px). Drafts are artifact fragments; `drafts/_preview/wrap.sh <name>` makes one openable.

## Deploy

Cloudflare Pages builds every push (`main` is production; other branches get preview URLs) with `npm ci` on npm 10. A lockfile written by npm 11 fails there, so change dependencies with `npx npm@10.9.2 install <pkg>` and commit the lockfile it writes.

## Paper mockups

Drafts B and E also exist as artboards in the Paper file "Portfolio mockups" (Projects folder, file id in `tools/paper/lib.mjs`). If the Paper MCP tools are not loaded in a session, `tools/paper/` drives the relay directly: `node pc.mjs list` shows the tools, `node pc.mjs call <tool> '<json>'` calls one. `gen.mjs` regenerates the vector assets in `drafts/paper-assets/`, `land.html` renders E's landscapes (screenshot it with headless Chrome), and `b.mjs B` / `e.mjs E` rebuild an artboard from scratch. Paper renders SVG `<text>` in a fallback serif, so figure labels are HTML text nodes positioned over the SVG.
