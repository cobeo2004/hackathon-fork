---
# DESIGN-SYSTEM.md — machine-readable visual design tokens for SolarCycle AI.
#
# NOTE: the existing `design.md` is the PRODUCT/DATA spec (scope, datasets, ML).
# THIS file is the VISUAL design system (colors, type, motion, components).
# Different jobs — don't merge them. Agents doing UI work read this one.
#
# Front-matter = tokens (exact values). Body = rationale. Read both.
name: SolarCycle AI
identity: Solar Instrument Panel
theme: light

colors:
  # Surfaces — warm paper, never flat (see background.* for the page texture).
  paper: "#ffffff"        # page floor
  panel: "#ffffff"        # card surface — lifted off paper by shadow + hairline, NOT by hue
  ink: "#1a1611"          # near-black warm ink — primary text + dark buttons
  muted: "#6f675a"        # secondary text, telemetry labels
  line: "#e9e6e0"         # hairline borders, dividers
  # Semantic — each color means ONE thing. Do not repurpose.
  solar: "#e07c08"        # BRAND amber — eyebrows, accents, ageing/warning
  solar-soft: "#fbeccd"   # amber tint fill (watch badges, soft callouts)
  risk: "#cf3d29"         # failure / urgent / red
  recover: "#1d7a4d"      # the WIN — savings, success, "recovered". Reserved.
  route: "#2563eb"        # optimized route / blue logistics line

fonts:
  display:
    family: Archivo
    var: "--font-archivo"
    weights: [500, 600, 700, 800, 900]
    use: headlines, big telemetry numbers, nav brand
  body:
    family: IBM Plex Sans
    var: "--font-plex-sans"
    weights: [400, 500, 600]
    use: paragraphs, descriptive copy
  mono:
    family: IBM Plex Mono
    var: "--font-plex-mono"
    weights: [400, 500, 600]
    use: telemetry labels, eyebrows, nav links, fine print, data provenance

typography:
  display-hero: { size: "56px", weight: 800, line: 1.05, tracking: "-0.02em" }   # h1
  display-lg:   { size: "36px", weight: 800, line: 1.08, tracking: "-0.01em" }   # SectionLead h2 (md+)
  display-num:  { size: "36px", weight: 800, line: 1.0,  tracking: "0", feature: "tabular-nums" } # Stat value
  body:         { size: "16px", weight: 400, line: 1.6 }
  body-sm:      { size: "13px", weight: 400, line: 1.4 }
  label-mono:   { size: "11px", weight: 600, line: 1.3, tracking: "0.14em", transform: "uppercase" } # telemetry-label voice
  eyebrow-mono: { size: "12px", weight: 600, tracking: "0.22em", transform: "uppercase", color: solar }

spacing:
  base: 4
  scale: { xs: "8px", sm: "12px", md: "16px", lg: "20px", xl: "32px", section: "56px" }
  container-max: "72rem"   # max-w-6xl — the global content column
  page-pad-x: "20px"       # px-5
  page-pad-y: "56px"       # py-14 main padding

radius:
  md: "0.5rem"   # rounded-lg — buttons, nav items, small chips
  lg: "0.75rem"  # rounded-xl — cards
  pill: "9999px" # rounded-full — risk badges, glow halos

elevation:
  card: "0 1px 0 rgba(26,22,17,0.04), 0 12px 30px -22px rgba(26,22,17,0.35)"  # the one card shadow
  success-glow: "0 8px 22px -10px rgba(29,122,77,0.9)"                         # success button only

background:
  # The page is white but not flat — a faint solar glow + grid. Atmosphere, not decoration.
  solar-glow: "radial-gradient(900px 520px at 95% -10%, rgba(224,124,8,0.05), transparent 60%)"
  grid: "linear-gradient(rgba(26,22,17,0.016) 1px, transparent 1px) — 64px cells, both axes"

motion:
  easing: "cubic-bezier(0.16, 1, 0.3, 1)"   # the house curve — used by .reveal and all motion
  reveal:    { duration: "0.6s", from: "opacity 0, translateY 24px", to: "opacity 1, translateY 0" }
  load:      { duration: "0.7s", stagger: "0.08s" }   # .reveal load-in cadence
  scroll:    { trigger: "whileInView", viewport: "{ once: true, margin: -80px }" }  # animate once
  count-up:  { duration: "1.2s" }
  parallax:  "background glow layer only; text never parallaxes"
  reduced-motion: "MANDATORY — prefers-reduced-motion: reduce snaps to final state, no parallax/transform"
  library: "motion (motion/react), client islands only — keep RSC shells static (PPR)"

view-transition:
  enabled: true   # experimental.viewTransition — <Link> nav cross-fades <main>
  name: route-main
---

## Overview

SolarCycle AI wears a **"Solar Instrument Panel"** identity: warm white paper, a
near-black warm ink, and a single solar-amber brand accent — it reads like a calm
telemetry dashboard, not a flashy SaaS landing. The surface is white but never
flat: a faint amber radial glow sits top-right and a whisper of 64px grid runs
underneath (`{background.solar-glow}` + `{background.grid}`), giving depth without
color. Big tabular display numbers (`{fonts.display}` Archivo) carry the data;
small uppercase mono labels (`{fonts.mono}` IBM Plex Mono, `{typography.label-mono}`)
caption them like instrument readouts. The voice is **measured and evidentiary** —
every figure can cite a source (`DataNote`), and color is used sparingly with strict
meaning.

**Key characteristics**
- Warm-paper canvas (`{colors.paper}`) with warm-black ink (`{colors.ink}`) — light theme, no dark mode.
- One brand accent: solar amber (`{colors.solar}`). Eyebrows, accents, ageing/warning — never the "win".
- Mono uppercase letter-spaced labels are the signature: they tag every number like a gauge.
- Color carries fixed meaning: amber = brand/warning, **green = the win (reserved)**, red = risk, blue = optimized route.
- Cards lift off the paper by shadow + hairline, not by a different fill (`{colors.panel}` == `{colors.paper}`).
- Motion is purposeful: a staggered load-in, scroll-reveals that fire **once**, count-up numbers, one parallax glow — all reduced-motion-guarded.

## Colors

### Brand & semantic — each means ONE thing
- **Solar** (`{colors.solar}` #e07c08) — the brand amber. Eyebrows, accent spans in headlines, "ageing/watch" states, hover targets. The only brand color; do not introduce a second.
- **Solar-soft** (`{colors.solar-soft}` #fbeccd) — amber tint fill for watch badges and soft warning callouts.
- **Recover** (`{colors.recover}` #1d7a4d) — **the win.** Savings, success, "recovered value", the optimized payoff. **Reserved** — never green as a generic accent; it must signal a positive outcome.
- **Risk** (`{colors.risk}` #cf3d29) — failure, urgent, danger. Risk badges, fault states.
- **Route** (`{colors.route}` #2563eb) — the optimized logistics route / blue line on map and comparison bars. Baseline routes stay ink/muted.

### Surface & text
- **Paper / Panel** (both #ffffff). Cards are distinguished by `{elevation.card}` shadow + a `{colors.line}` hairline, not a fill change.
- **Ink** (`{colors.ink}` #1a1611) — primary text, dark (primary) buttons.
- **Muted** (`{colors.muted}` #6f675a) — secondary copy and all mono telemetry labels.
- **Line** (`{colors.line}` #e9e6e0) — hairline borders, dividers, low-opacity chip fills.

## Typography

Three families, three jobs — never blur them:
- **Archivo** (`{fonts.display}`, weight 800 default) — headlines and big numbers. Heavy and tight.
- **IBM Plex Sans** (`{fonts.body}`, 400) — running text.
- **IBM Plex Mono** (`{fonts.mono}`, 600, uppercase, `0.14em`–`0.22em` tracking) — the
  instrument-label voice: eyebrows, stat captions, nav links, provenance, fine print.

The pairing of heavy tabular Archivo numbers against tiny letter-spaced mono labels
IS the instrument-panel signature. Body copy is sans, never mono; labels are mono,
never sans. Headlines may color a fragment in `{colors.solar}` for emphasis (see the
hero) — sparingly.

## Layout

- **Container:** centered `{spacing.container-max}` (max-w-6xl), `{spacing.page-pad-x}` gutters. `<main>` uses `{spacing.page-pad-y}` vertical padding.
- **Band rhythm:** stack content in full-width bands separated by `{spacing.section}` (56px). Alternate dense card rows with breathing-room text bands; don't run two flat text bands back to back.
- **Cards:** `{radius.lg}` corners, `{elevation.card}` shadow, `{colors.line}` hairline, interior padding `{spacing.lg}`–`{spacing.xl}`.
- **Header:** sticky, `paper/85` + `backdrop-blur`, hairline bottom. Nav items are mono uppercase with an amber index numeral.

## Components

Documented from `src/components/ui.tsx` — reuse these; do not reinvent.

- **`Card`** — base surface. `{radius.lg}` + `{elevation.card}` + hairline. Pass padding via className (`p-4`/`p-5`).
- **`Stat`** — one telemetry figure: mono `{typography.label-mono}` label + `{typography.display-num}` value (tabular) + optional muted sub. `tone`: ink | risk | solar | recover.
- **`KpiCard`** — `Stat` wrapped in a `Card`. `tone`: neutral | danger | warning | success → ink/risk/solar/recover.
- **`RiskBadge`** — pill (`{radius.pill}`) for `BreakingRisk` (normal | watch | likely_breaking | urgent), color-coded by meaning.
- **`Button`** — `{radius.md}`. `variant`: primary (ink fill, hover amber), success (recover fill + `{elevation.success-glow}`), ghost (panel + hairline).
- **`SectionLead`** — numbered step chip + mono eyebrow + Archivo `{typography.display-lg}` title + muted subtitle. Opens every section.
- **`DataNote`** — provenance strip: ● Real (recover) vs ◌ Illustrative (solar) + source in mono. Use under any section showing figures, so judges know what's real.

## Motion

Implemented with the **`motion`** library (`motion/react`) in `"use client"` islands
only — route shells stay RSC so pages keep static prerender (PPR).

- **House easing:** `{motion.easing}` for everything (matches the existing `.reveal` CSS keyframe).
- **Load-in:** staggered reveal on first paint — `{motion.load}` (the `.reveal` class: opacity+translateY, `0.08s` stagger via `animation-delay`).
- **Scroll reveal:** `whileInView` with `{motion.scroll.viewport}` — fires **once**, never re-triggers on scroll-up. From `opacity 0 / y 24px` to rest, `{motion.reveal.duration}`.
- **Stagger:** parent `variants` + `staggerChildren: 0.08` for stat rows and card grids.
- **Count-up:** numbers animate 0 → target over `{motion.count-up.duration}` when scrolled into view; format with `toLocaleString()`.
- **Parallax:** only the background amber glow layer drifts on scroll (`useScroll`/`useTransform`). **Text never parallaxes.**
- **Reduced motion:** **mandatory.** `useReducedMotion()` (and the CSS `prefers-reduced-motion: reduce` guard) snaps every animation to its final state — no transform, no parallax, full readability.
- **View transitions:** `<Link>` navigation cross-fades `<main>` (`{view-transition.name}`); keep it — don't add per-element exit animations that fight it.

## Do's and Don'ts

### Do
- Keep the warm-paper canvas with its faint glow + grid. Atmosphere comes from `{background.*}`, not solid fills.
- Tag every number with a mono `{typography.label-mono}` label. Numbers without labels read as un-instrumented.
- Reserve `{colors.recover}` green for genuine wins (savings, success). It is the payoff color.
- Reuse `Card` / `Stat` / `Button` / `SectionLead` from `ui.tsx`.
- Guard all motion with reduced-motion. Animate scroll reveals **once**.
- Keep route shells RSC; put motion in client islands.

### Don't
- Don't introduce a second brand color, or a purple/blue gradient. Amber is the brand.
- Don't use green as a generic accent — it means "win" only.
- Don't set body copy in mono, or labels in sans. The split is the signature.
- Don't make `/` (or any data page's shell) a client component — it breaks PPR.
- Don't parallax or heavily animate text; don't let animations re-fire on every scroll.
- Don't distinguish cards by changing the fill hue — use the shadow + hairline.

## Iteration guide

1. Change one component at a time; reference its name (`Stat`, `SectionLead`).
2. New components default to `{radius.lg}` (cards) or `{radius.md}` (controls), `{colors.line}` hairline, `{elevation.card}` shadow.
3. Use token references, never inline hex.
4. When adding emphasis: bigger number/type before more color. Color is rationed.
5. New motion: `whileInView once` + reduced-motion guard, house easing. No exceptions.
