---
name: Kmelier Portfolio
description: A developer portfolio designed as a Miura-fold deployable sheet — matte paper, crease grid, one gold packet, live data pinned like specimens.
colors:
  primary: "#c9a227"
  primary-deep: "#8f7016"
  signal: "#b3261e"
  paper: "#f7f5ef"
  paper-deep: "#edebe1"
  ink: "#1c1c19"
  ink-soft: "#4e4e45"
  ink-faint: "#64645b"
  crease: "#e2e0d3"
  valley: "#d9e6f2"
  mountain: "#8f8f84"
typography:
  display:
    fontFamily: "'Saira Semi Condensed', 'Arial Narrow', ui-sans-serif, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Saira Semi Condensed', 'Arial Narrow', ui-sans-serif, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  title:
    fontFamily: "'Saira Semi Condensed', 'Arial Narrow', ui-sans-serif, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.04em"
  body:
    fontFamily: "'Barlow', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.22em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "6px"
spacing:
  section-gap: "96px (128px at ≥640px)"
  container-x: "24px (40px at ≥640px)"
  container-max: "80rem"
components:
  packet:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "14px 20px"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  live-stamp:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.signal}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  fold-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "0 (parallelogram clip-path)"
    padding: "28px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
---

# Design System: Kmelier Portfolio

## Overview

**Creative North Star: "The Deployable Sheet"**

The portfolio is a single sheet of matte paper that unfolds like a Miura fold. A gold-foil packet tucked in the top-left corner is the only saturated object on the page; everything else is ink on warm paper, ruled by a fixed parallelogram crease grid that runs behind all content and ends anchored at the footer. Live GitHub data is pinned to the sheet like specimens — a crease pin plus a deep-red LIVE stamp — never presented as dashboard chrome.

The world is single-light by design: there is no theme toggle, because the approved visual world is the sheet itself. Density is calm and deliberate — one diagonal statement, three pinned stats, three fold cells — with generous vertical rhythm between bands. Motion is a single authored moment: the sheet deploys once on load (wipe, rise, pin-settle), scroll sections rise quietly into place, and pulling the packet replays the deploy. Everything is inert under `prefers-reduced-motion`.

**Key Characteristics:**
- Matte warm-paper ground with a fixed parallelogram crease grid and faint paper grain.
- One committed gold accent (packet, underlines, active states) and one reserved deep-red signal used only for LIVE stamps.
- Three-voice type system: condensed grotesk display, humanist sans body, wide-tracked mono for labels and data.
- Fold geometry: 7%-slant parallelogram clip-paths on desktop, collapsing to 3px radii on mobile.
- Proof over claims: every number is live from the GitHub API; zero-value stats stay hidden.

## Colors

Warm paper neutrals with one committed gold accent and one reserved signal red. Gold does the brand work; red is rationed to a single meaning.

### Primary
- **Foil Gold** (#c9a227): The packet, gold underlines on links, star fills, active command-palette states, icon accents. The one saturated color allowed to carry regions. Deepens to Gold-Deep (#8f7016) for text-on-paper contrast (nav hover, arrows, category icons).

### Secondary
- **Signal Red** (#b3261e): Reserved exclusively for LIVE stamps and their hairline borders. Never used for errors, decoration, or emphasis elsewhere.

### Neutral
- **Sheet Paper** (#f7f5ef): Page ground and card ground. Everything sits on the same paper; there are no elevated surface tones.
- **Paper Deep** (#edebe1): Recessed detail only — the ESC kbd chip in the command palette, skeleton loaders.
- **Ink** (#1c1c19): Primary text, pins, focus outlines.
- **Ink Soft** (#4e4e45): Body copy, secondary text.
- **Ink Faint** (#64645b): Labels at small sizes, hairline rules (at 15% alpha), placeholders.
- **Crease** (#e2e0d3): The crease grid lines (drawn at 5.5% ink alpha, not as a flat fill).
- **Valley Wash** (#d9e6f2): Flat pale-blue parallelogram fields at 25–40% opacity — the folded-paper light play. Never used for text backgrounds.
- **Mountain Gray** (#8f8f84): Scrollbar thumb, the darkest neutral for non-text detail.

### Named Rules
**The Red Reserve Rule.** Deep red appears only on LIVE stamps. If red shows up anywhere else, it is a defect, not a decision.
**The One Accent Rule.** Gold is the single committed accent. No second saturated hue enters the system; emphasis comes from weight, scale, or the pin — never a new color.

## Typography

**Display Font:** Saira Semi Condensed (with Arial Narrow fallback), self-hosted latin/latin-ext woff2.
**Body Font:** Barlow (with system sans fallback), self-hosted.
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback), self-hosted.

**Character:** An aerospace-spec voice: condensed grotesk headlines set tight and large, plainspoken humanist body copy, and wide-tracked uppercase mono for every label, stat, and annotation — the way a drawing sheet labels its views.

### Hierarchy
- **Display** (800, clamp(2.4rem, 6vw, 5.4rem), 1.04): The hero statement riding the main diagonal. One use per page.
- **Headline** (700, clamp(1.5rem, 3vw, 1.875rem), 1.2, tracking 0.08em, uppercase): Section band titles (ABOUT, PROJECTS — SELECTED, CONTACT).
- **Title** (700, 1.25rem, 1.3, tracking 0.04em, uppercase): Project names in fold cells, the contact email link.
- **Body** (400, 1.125rem/15px, 1.625): Bio, project descriptions, skill lists. Max measure held to ~42rem by layout.
- **Label** (500, 9–12px, tracking 0.14–0.32em, uppercase): Nav items, stat labels, spec annotations (SPEC — 01, TIMELINE), stamps, buttons, footer strip.

### Named Rules
**The Tabular Figures Rule.** Every numeral in data — stats, counts, timestamps — rides `font-variant-numeric: tabular-nums` (the `.tnum` utility). Numbers must not jitter as live values update.
**The Tracked Label Rule.** Labels are always JetBrains Mono, uppercase, tracked at least 0.14em. A label set in the body face at default spacing is off-system.
**The No Gradient Text Rule.** Emphasis comes from weight or scale. Text is never gradient-filled.

## Layout

One centered sheet: `max-w-7xl` (80rem) container, `px-6` gutters widening to `px-10` at ≥640px. Sections are separated by large vertical rhythm — `pt-24` (96px) rising to `pt-32` (128px) at ≥640px — with each band opening on a hairline rule (`border-ink/15`) carrying the band title left and a spec annotation right (SPEC — 01, N LIVE, OPEN CHANNEL).

The crease grid is a fixed full-bleed background layer (two repeating-linear-gradients at 115°/65°, 148px pitch, 96px on mobile) plus three flat valley-wash parallelograms positioned per section and a 5%-opacity paper-grain tile that ends with the sheet at the footer. Content grids: stats in 3 columns, projects in 3 fold cells (`md:grid-cols-3`), about in 2 columns — all collapsing to a single column on mobile, where parallelogram clip-paths are dropped in favor of 3px radii.

**The Anchor Rule.** The sheet ends anchored: the grain overlay is absolutely positioned (not fixed) so the paper finish terminates at the footer strip, and the footer carries the status line (© line left, last-push/sync timestamps right).

## Elevation & Depth

Flat by default. Depth is conveyed by the paper's own devices — crease lines, valley washes, and one directional hero shade — not by stacked surfaces. Shadows appear only on elements that lift off the sheet.

### Shadow Vocabulary
- **Fold shadow** (`2px 3px 12px rgb(28 28 25 / 0.22)`): Project fold cells at rest — the paper's own curl.
- **Lift shadow** (`6px 10px 28px rgb(28 28 25 / 0.16)`): Hover state on fold cells, the command-palette slip. The hover lift is the system's one elevation change.
- **Control shadow** (`1px 2px 6px rgb(28 28 25 / 0.12)`): Small paper buttons (palette trigger, copy-email, GitHub) — barely-there tactility.
- **Foil packet shadow** (`2px 3px 10px rgb(28 28 25 / 0.28)` plus inner top highlight and bottom shade): The packet's metallic read; the only element allowed an inset highlight.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, dialog, the packet) — never as decoration on static content.

## Shapes

The form language is the fold: parallelogram clip-paths with a 7% slant (`polygon(7% 0, 100% 0, 93% 100%, 0 100%)`) for project cells, and the hero's focal-fold shade clipped to a matching slant. Everything else is near-square: 2px radius on the packet and stamps, 3px on buttons, kbd chips, and the palette slip. Borders are hairlines (`border-ink/15` rules, `border-ink/10`–`/20` on interactive elements). No pills, no circles except the pin's paper center.

**The Parallelogram Rule.** Fold geometry is always the 7%-slant clip-path on desktop. On mobile it drops to a 3px radius — never a different slant, never a generic rounded card.

## Components

### Packet (signature)
A gold-foil envelope tucked top-left, reading CHRIS KMELIER with a PULL TO DEPLOY subline. Foil is a four-stop gold gradient with a diagonal sheen plus inner top highlight; the packet sits at −5° rotation, straightening and scaling slightly on hover. It is a real control: pulling it scrolls to top and replays the sheet's deploy motion.

### LiveStamp + CreasePin (signature)
Live data is pinned, never badged. A CreasePin (ink map-pin SVG with paper center) anchors the stat to its crease intersection; the LIVE stamp (deep-red text, 45%-alpha red hairline border, 3px radius, mono 10px tracked) certifies the number below it is live. Stat values are display type at 4xl/5xl with tabular figures; zero-value stats render nothing.

### FoldCell (project card)
Parallelogram clip-path, paper ground, 1px ink/10 border, fold shadow; two crease pins along the top edge. Title (display, uppercase), description (body), and a mono meta row (language · topics · starred count · updated year). Hover lifts (−4px translate, lift shadow) and warms the arrow to gold-deep. On mobile: clip-path removed, 3px radius.

### Section band header
Band title (headline, uppercase, tracked) left, spec annotation (mono 10px, ink-faint, tracked) right, on a shared baseline above a full-width hairline rule. The annotation carries sheet truth: SPEC — 01, N LIVE, OPEN CHANNEL.

### Paper buttons
Paper ground, 1px ink/20 border, 3px radius, mono 11px tracked uppercase labels, control shadow; hover deepens the border to ink/45. Used for the palette trigger (with ⌘ icon), COPY EMAIL, and the GitHub link button. Focus is always the 2px ink outline at 3px offset — never a glow.

### Command palette
A paper slip dialog (max-w-lg, 3px radius, lift shadow) over a 45%-ink scrim: search row with icon and ESC kbd chip, grouped results (GO TO / PROJECTS / ACTIONS) with mono group labels, active row washed in gold/20. Keyboard-first: arrows move, Enter runs, Escape closes, focus restores on close.

### Primary nav
Mono 12px tracked-0.22em uppercase links separated by faint slashes, ink at rest, gold-deep on hover. Not sticky — the sheet stays clean on scroll.

### Motion grammar
One authored deploy on load — sheet fade (900ms), hero diagonal wipe (1100ms), pin drop with overshoot (600ms), staggered rises (800ms, 250–770ms delays) — all on `cubic-bezier(0.22, 1, 0.36, 1)` exponential ease-out. Scroll sections rise once via IntersectionObserver (700ms). Fully inert under `prefers-reduced-motion`; the packet's redeploy replays the same keyframes on demand.

## Do's and Don'ts

### Do:
- **Do** pin live data with the CreasePin + LIVE stamp pair; the pin is what makes a number sheet-native.
- **Do** keep every number tabular (`.tnum`) so live updates never reflow the layout.
- **Do** use the 7%-slant parallelogram for any new fold surface on desktop, and drop it to 3px radius on mobile.
- **Do** reserve deep red for LIVE stamps only.
- **Do** write labels in JetBrains Mono, uppercase, tracked ≥0.14em.
- **Do** let empty config fields hide their sections — adaptive honesty is a visual rule, not just a data rule.

### Don't:
- **Don't** use gradient text, glass/blur decoration, or hard offset block shadows — none exist in this world.
- **Don't** add a second saturated accent; gold carries the brand, red carries live status, nothing else.
- **Don't** use colored left-border rails on list items — the floor refuses them and the timeline keeps its gold rail only as a carried defect, not a pattern to repeat.
- **Don't** put kickers or eyebrows above headings; section band headers carry their annotation on the shared baseline instead.
- **Don't** invent stats, locations, testimonials, or project copy — unfilled config renders nothing, never a placeholder.
- **Don't** reintroduce a theme toggle; the world is a single light sheet by design decision.
