# Portfolio website

Nicolas Smits's portfolio, extended project by project through a Chemical Engineering PhD. `PRODUCT.md` holds the product truth; read it before any design or content work.

You are the owner and long term maintainer of this codebase, and its design is up to you.

## State

Direction chosen: **draft E, descent** (`drafts/e-descent.html`): its palette, typefaces, landscape solver, iteration readout and peach contact footer stay. Every project lives on its own page, `/projects/<id>`, and the site also covers publications, experience, education, a CV link and a headshot (see `PRODUCT.md`). Nicolas is choosing the home layout and skills placement from `drafts/options/layout-options.html`. Once he picks, record the direction contract with `/impeccable`, then scaffold Astro (see `## Stack` in `PRODUCT.md`) and build. `DESIGN.md` is written at the end, from the built site. Layout and page changes get an options artifact for Nicolas to pick from before they are built. Hosting is Cloudflare Pages, deploying from the public GitHub repo `nicksmits1/portfolio-website`.

## The repo is public

Commit only what may appear on the public site. The CV (`Nicolas_Smits_Resume_Oct_2026_ML.md`) holds a personal phone number, so it stays local and gitignored. Read it for facts; never commit it.

## Sources are read-only

Project material lives in sibling directories (`../rl-sc-design`, `../CMU/SiNDAE`, `../CMU/ML in Production/...`, `../wayfinder-sidebar`) and on GitHub under `nicksmits1`. Read them; copy what the site needs into `content/assets/<project>/`; write only inside this repo. `../git_token.txt` and any `.env` or `.secrets` file stay unread.

## Where a fact lives

- `content/projects/<id>.md`: one file per project. Its frontmatter and `## Facts` are the single source for copy and numbers; its `## Visual` names the lead visual and open TODOs; its `disclosure` line is binding.
- `content/diagrams/*.proschi`: system diagrams as code. After any edit run `npx proschi@latest check <file>` and `npx proschi@latest test <file>`, then re-render into `content/diagrams/rendered/`.
- `drafts/shared/core.js`: the drafts' copy of project data plus the drawing engine (network episode, streamlines, request flow, scales, alignment chart). When a number changes, change it in `content/projects/` first, then here.

## Adding a project

1. Read the source project and write `content/projects/<id>.md` in the shape of the existing six.
2. Pick the lead visual from the project's own mathematics, data or system. A figure that could illustrate a different project is the wrong figure.
3. Copy real assets into `content/assets/<id>/`. Anything illustrative is labelled as illustrative on the page until a real export replaces it.
4. One line of prose, then the visual, then at most four facts. A sentence that restates the visual or another page gets deleted.

## Design work

Use `/impeccable` for any interface change, and hold every change to `DESIGN.md`. Every animation needs a reduced-motion still that shows the result. Book of Shapes patterns may appear as generated output on the site; their node graphs and source are not licensed, so flow fields here are drawn by our own implementation (`NS.streamlines`).

## Previewing drafts

Drafts are artifact fragments (no `<html>` wrapper). `drafts/_preview/wrap.sh <name>` writes an openable page; `shoot.sh <name> <outdir>` captures desktop; `phone.sh <name> <outdir>` captures a true 390px render.

## Paper mockups

Drafts B and E also exist as artboards in the Paper file "Portfolio mockups" (Projects folder, file id in `tools/paper/lib.mjs`). If the Paper MCP tools are not loaded in a session, `tools/paper/` drives the relay directly: `node pc.mjs list` shows the tools, `node pc.mjs call <tool> '<json>'` calls one. `gen.mjs` regenerates the vector assets in `drafts/paper-assets/`, `land.html` renders E's landscapes (screenshot it with headless Chrome), and `b.mjs B` / `e.mjs E` rebuild an artboard from scratch. Paper renders SVG `<text>` in a fallback serif, so figure labels are HTML text nodes positioned over the SVG.
