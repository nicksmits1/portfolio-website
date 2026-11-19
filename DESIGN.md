---
name: Nicolas Smits
description: A research portfolio drawn as an objective function; every project is a minimum the visitor can descend into.
colors:
  night: "#120A2A"
  ink: "#0D0722"
  panel: "#1A1038"
  node: "#1E1244"
  lavender-white: "#F3EDFF"
  lavender-mist: "#B9AAE8"
  dusk-violet: "#7C6BB8"
  solver-coral: "#FF7C6B"
  signal-violet: "#8B5CF6"
  peach: "#FFD9C2"
  ramp-indigo: "#2A1670"
  ramp-violet: "#7044E8"
  ramp-coral: "#EE6B60"
  ramp-peach: "#FFD6BF"
  hairline: "rgba(243, 237, 255, .22)"
  hairline-faint: "rgba(243, 237, 255, .1)"
  ink-tab: "rgba(13, 7, 34, .72)"
  plate-white: "#FFFFFF"
typography:
  display:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.75rem)"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4.2vw, 3.1rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  card-title:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  prose:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "1.06rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  math:
    fontFamily: "STIX Two Text, Times New Roman, serif"
    fontSize: "1.05em"
    fontWeight: 400
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
rounded:
  thumb-sm: "6px"
  thumb: "8px"
  plate: "10px"
  banner: "12px"
  tab: "14px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 3.4vw, 44px)"
  chip-gap: "7px"
  row: "16px"
  column-gap: "28px"
  figure-gap: "48px"
  block: "clamp(34px, 5vw, 56px)"
components:
  pill-link:
    backgroundColor: "rgba(13, 7, 34, .6)"
    textColor: "{colors.lavender-white}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 12px"
    height: "40px"
  button-cv:
    backgroundColor: "{colors.peach}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 12px"
    height: "40px"
  chip:
    textColor: "{colors.lavender-white}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  chip-selected:
    backgroundColor: "{colors.solver-coral}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  map-label:
    backgroundColor: "{colors.ink-tab}"
    textColor: "{colors.lavender-white}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
  map-label-hit:
    backgroundColor: "{colors.solver-coral}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
  formula-tab:
    backgroundColor: "{colors.ink-tab}"
    textColor: "{colors.lavender-white}"
    typography: "{typography.math}"
    padding: "18px 22px 12px 44px"
  nav-tab:
    backgroundColor: "{colors.ink-tab}"
    textColor: "{colors.lavender-white}"
    padding: "18px 44px 12px 20px"
  lead-link:
    backgroundColor: "{colors.lavender-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px 0 16px"
  plate:
    backgroundColor: "{colors.plate-white}"
    rounded: "{rounded.plate}"
    padding: "12px"
  contact-block:
    backgroundColor: "{colors.peach}"
    textColor: "{colors.ink}"
    padding: "56px 0"
---

# Design System: Nicolas Smits

## Overview

**Creative North Star: "The Objective Landscape"**

Every page is a surface the visitor probes. The home page is an objective function drawn as a banded contour map: research topics are its local minima, a click starts a gradient-descent solver, and where the solver converges decides what the page shows. Project pages open on the same landscape, close in on that project's basin, with the solver arriving. The interface is the chart's furniture: labels, rails and pills sit on the map and step back so the work, and the figures made from its own mathematics, lead.

The world is one dark night-violet ground warming through a 13-band ramp, ink to indigo to violet to coral to peach, which are the SiNDAE logo's colours. Warmth means arrival: coral marks where the solver lands and every selected state; peach carries the figures that matter (rail facts), the primary action (the CV) and the closing contact block. Density is low on the map and comfortable in lists; prose is the smallest part of any page.

There is one theme by choice. No light mode, no glass cards, no gradient text, no coloured side rules.

**Key Characteristics:**
- Full-bleed contour landscapes under the name (home, 640 px) and the title (project pages, 300 px strip).
- Translucent ink tabs and pills sitting on the map; hairline rules everywhere else.
- Coral is the solver's end and every pressed, hit or current state; peach is reserved for numbers, the CV and contact.
- Unbounded light for display, Onest for text, STIX Two italic for every mathematical symbol.
- Every animation converges to a still that reduced motion shows directly.

## Colors

A night-violet ground with a warm end: cool lavenders carry reading, coral and peach carry arrival.

### Primary
- **Solver Coral** (#FF7C6B): the solver's end point, the x* mark, a hit map label, pressed chips and tabs, focus outlines, link hover, the reel label, status tags. It means "selected" or "arrived", never decoration.

### Secondary
- **Peach** (#FFD9C2): rail fact figures, the CV button, inline code in prose, and the full-width contact block that closes every page (ink text on peach).

### Tertiary
- **Signal Violet** (#8B5CF6): scrollbar thumb and the outer ring of the reel's minimum mark; a quiet structural accent.

### Contour Ramp
- **Ramp** (#0D0722 → #2A1670 → #7044E8 → #EE6B60 → #FFD6BF): the 13 discrete bands of every landscape, low to high. Drawn by `src/scripts/landscape.ts` (WebGL, with a canvas fallback); also the palette for kind colours in system diagrams (services indigo, stores violet, streams coral, third parties peach).

### Neutral
- **Night** (#120A2A): page ground.
- **Ink** (#0D0722): deepest surface: tabs (at 72%), the reel (at 80%), dialogs, screenshot plates, text on peach and coral.
- **Panel** (#1A1038) and **Node** (#1E1244): thumbnail backgrounds and diagram node fills.
- **Lavender White** (#F3EDFF): primary text and headings.
- **Lavender Mist** (#B9AAE8): secondary text: where-lines, captions, readouts, row summaries.
- **Dusk Violet** (#7C6BB8): eyebrows, dates, list markers; tertiary text only, never body copy.
- **Hairline** (lavender white at 22%) and **Faint Hairline** (at 10%): every rule, outline and row divider.
- **Plate White** (#FFFFFF): only under raster figures from papers and posters, which were made on white.

### Named Rules
**The Arrival Rule.** Coral marks where something landed: the solver's end, a selected chip, a hit label, a focused control. If nothing was chosen or reached, nothing is coral.

**The Peach Is Scarce Rule.** Peach appears on numbers that matter, the one primary action and the contact block. A second peach button on a page is wrong.

## Typography

**Display Font:** Unbounded (with system-ui)
**Body Font:** Onest (with system-ui)
**Math Font:** STIX Two Text italic for inline symbols, STIX Two Math for MathML
**Mono:** JetBrains Mono 400, only for kind and edge labels in system diagrams

**Character:** Unbounded at weight 300 with tight negative tracking gives a wide, light, geometric display voice; Onest is a plain, legible text face. STIX italic makes every x*, f and equation read as real mathematics, matching the MathML in prose.

### Hierarchy
- **Display** (300, clamp(2.5rem, 6.4vw, 4.75rem), 0.96): the name on the home hero, one per site.
- **Headline** (300, clamp(1.75rem, 4.2vw, 3.1rem), 1): project page titles on the strip, two lines at most, balanced. Section heads on home (Skills, Contact) use the same voice at about 2.9 rem.
- **Title** (400, 1.6rem, 1.15): prose section headings and Further reading on project pages; home block heads at clamp(1.4rem, 2.6vw, 1.9rem).
- **Card Title** (400, 1.12rem, 1.2): project row titles, previous / next, reel cards (1 rem).
- **Body** (400, 1rem, 1.55): default text. Prose sections run at 1.06 rem / 1.6, measure under 62ch.
- **Meta** (400, 0.82rem, 1.4): dates, where-lines, row details, captions' source lines, rail fact labels; Lavender Mist or Dusk Violet, tabular numerals where digits line up. Secondary prose runs at 0.95 rem.
- **Label** (600, 0.75rem, 0.08em, uppercase): eyebrows, sub-heads, the reel label, the formula tab's Next.

### Named Rules
**The Math Is Set In Math Rule.** Every variable, in labels, captions, legends or prose, is STIX Two italic. Never fake maths in Onest italic.

**The Noun Heading Rule.** Headings are short noun phrases (Motivation, Formulation, Results), never a clause, a question or opened with an article.

## Layout

A 1320 px max container with a fluid gutter (clamp(16px, 3.4vw, 44px), respecting safe-area insets). Landscapes are full bleed; content blocks are separated by hairline rules and clamp(34px, 5vw, 56px) of vertical padding.

Project pages use a 12-column grid with 28 px gaps: a sticky rail in columns 1 to 4 (top 24 px, from 900 px up) and figures in columns 5 to 12 with 48 px between them. Below 900 px the rail stacks above the figures and chip rows scroll sideways in one line.

Home order: hero with the Latest reel across its lower edge, project rows (168 × 96 thumbnail, title, summary, year), Publications beside Experience in two columns (one below 860 px), Skills as chips left and a framed landscape right, then the peach contact block. Phone checks run at a true 390 px width.

## Elevation & Depth

Flat. Depth comes from the landscape itself and from translucent ink laid over it, not from shadows. Outlines are drawn as hairline box-shadows (`0 0 0 1px`), which keep layout stable. The one real shadow is the system diagrams' hard offset (3 px, #07031A, no blur), part of Proschi's grammar; there is no backdrop blur anywhere. The reel is plain translucent ink (84%); it had a 3 px blur until the pinned hero's dive made it flicker.

### Named Rules
**The Ink Over Map Rule.** Anything that sits on a landscape (nav, name tab, labels, reel, cue) sits on translucent ink so the bands show through. Anything off the map sits directly on Night with a hairline.

## Shapes

Pills (999 px) for every control, label and tag. Small radii for framed media: 6 to 8 px thumbnails, 10 px plates and screenshots, 12 px banners and dialogs, 14 px on the one inside corner of each ink tab (the name tab rounds bottom right, the nav bottom left). Rules are 1 px hairlines. No sharp-cornered buttons, no side accent bars.

## Components

Precise and warm: hairline restraint everywhere, with coral and peach doing the talking when something is chosen or matters.

### Buttons and Link Pills
- **Shape:** full pill (999px), 40 px tall on home (36 px on phones and in the rail), icon 18 px left of the label.
- **Default:** transparent or translucent ink with a hairline border, Lavender White text, Onest 500 0.875 rem.
- **Primary (CV):** Peach fill, Ink text, one per view.
- **Lead links (project pages):** 48 px, Lavender White fill and Ink text for the first, hairline ghost for the second; both turn coral on hover.
- **Hover / Focus:** the border brightens to Lavender White; focus is a 2 px coral outline offset 3 px. Placeholder links (ORCID pending) use a dashed border.

### Chips
- **Style:** pill, hairline border, no fill, 8 × 12 px padding, 7 px gaps.
- **State:** pressed (`aria-pressed`) fills coral with Night text. Topic tags on rows are smaller (0.7 rem) with an inset hairline.

### Map Labels
- **Style:** pill on translucent ink, Onest 600 0.9 rem, an optional STIX italic symbol before and an uppercase small count after.
- **State:** a hit label (where the solver converged) turns coral; off labels fade to 30%; link labels invert to Lavender White on hover.

### Rows and Cards
- **Project rows:** thumbnail cropped from the project's own figure, a Card Title that turns coral on hover, Lavender Mist summary, faint hairline between rows. No card backgrounds.
- **Reel cards:** 300 px text-only cards on the translucent reel, separated by a small contour-minimum mark (violet ring, mist ring, coral dot).
- **Rail facts:** numbers in Unbounded 1.5 rem Peach over a 0.82 rem Lavender Mist label, each under a hairline, two per row.

### Plates and Figures
- **Plate:** white, 10 px radius, hairline outline, 12 px padding, for paper and poster rasters. Screenshot and dashboard plates use Ink or #111217 with no padding.
- **Captions:** 0.875 rem, a second line in Lavender Mist naming the source. An animated figure's step caption names the step in two to four words; explanation lives in a legend (definition grid under a hairline) or the prose.
- **Steppers:** small dots that grow and turn coral on the current step.

### Navigation
- **Style:** an ink tab flush top right of every landscape, Onest 500 0.95 rem; the current or hovered item turns coral. Below 700 px only Research, CV and Contact remain. A matching name tab sits top left on project pages.

### Formula Tab
- **Style:** an ink tab flush top left of the home landscape, mirroring the nav tab, its one inside corner rounded (14px). It holds the landscape's function as its caption, set in STIX Two italic (Himmelblau's and Rosenbrock's exact formulas; a description for the ripple field), and a coral uppercase Next with a chevron.
- **Behaviour:** clicking rotates the surface: four bowls (default), Himmelblau, Rosenbrock, ripple field. The surface blends into the next over 0.7 s while the topic labels glide to their new minima, then a fresh descent runs. Below 1100 px the formula gives way to the function's name after a coral italic *f*. Reduced motion swaps at once.

### Contact Block
- **Style:** full-width Peach band closing every page, Ink text, the email in Unbounded at display scale (selectable as a whole), outline pills in ink at 25%, the copy button filled Ink on Peach.

### Landscape (signature)
The banded contour map with a click-to-descend solver and a live iteration readout ("Converged in 38 iterations on GenAI"). Over the map the pointer becomes the start ring x0 with a −∇f needle. On home the name block rests on a calm basin: a flat floor in the darkest band, measured from the block, with the contours ringing it rather than crossing it; a descent that ends there lands on Contact. The opening descent starts top right and never runs through the text. Reduced motion draws the converged path at once. On scroll the hero pins for one screen and dives: scroll progress sets the solver's iteration along the latest descent, and a camera follows the iterate from straight above the map down into its basin, the surface turning into a wire mesh in the band colours with depth fade. The name block fades out over the first fifth, and the basin under it fills back in unless the descent ended there. Reduced motion has no pin and no dive.

**The Calm Basin Rule.** Text that sits on a landscape gets a flat floor of the darkest band under it, never an overlay card. Labels and tabs (ink pills) are the only things laid over the map.

### Character-grid header (list pages)
Publications and Experience open on a 320 px header in place of the landscape strip: a canvas of JetBrains Mono cells coloured from the 13-band ramp, after ascii-magic's character renderings (`src/scripts/glyphs.ts`, `src/components/GlyphHead.astro`). The name tab and nav sit on ink as everywhere; the title and its line stay HTML on a calm patch the grid leaves under them. Below 600 px the header grows, the title moves to the bottom, and the drawing fits above it.
- **Publications, scenario tree:** a first-stage decision x branching on uncertainty into recourse stages (3, 2, 2 on desktop, 3, 2 on phones), edges drawn in slope characters. A sampled scenario every half second runs root to leaf with a coral tail and peach head; edges brighten where scenarios have just passed. Each leaf's bar sits on the leaf's own row and converges to p(ξ). Faint annotations: branch probabilities, and x, y₁, y₂, ξ, p(ξ) in STIX italic along the bottom.
- **Experience, strata:** each Experience and Education entry from `timeline.yaml` a sediment layer, oldest at the bottom, in its own shade character and band colour, labelled at the right edge with its short name and years. The newest layer (the PhD) is still being laid: coral characters fall and settle on it.
- **Reduced motion:** the tree with four highlighted scenarios and bars at the exact probabilities; the strata with the top layer part laid.

## Do's and Don'ts

### Do:
- **Do** lead every project with a figure built from that project's own mathematics, data or system.
- **Do** keep coral for arrival and selection only (The Arrival Rule) and peach for numbers, the CV and contact.
- **Do** put labels and tabs that sit on a landscape on translucent ink (#0D0722 at 72 to 84%), and give a block of text a calm basin instead.
- **Do** set every mathematical symbol in STIX Two italic, and every equation as build-time MathML in STIX Two Math.
- **Do** give every animation a reduced-motion still that shows its converged result.
- **Do** separate items in meta lines with spacing or plain punctuation, each item its own span.

### Don't:
- **Don't** add a light theme, glass cards or gradient text; the world is one dark theme by choice.
- **Don't** set a callout, quote, caption or formula apart with a coloured side rule or a tinted side highlight; use spacing and type.
- **Don't** put a middle dot (·) between meta items; it reads as machine-made.
- **Don't** use soft drop shadows for depth; outlines are 1 px hairlines and the only real shadow is the diagrams' hard 3 px offset.
- **Don't** write a step caption as a sentence, or explanation inside a drawing.
- **Don't** use Dusk Violet (#7C6BB8) for body copy; it is for eyebrows, dates and markers.
