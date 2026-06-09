# SolarCycle AI — We Maid AI

> Predict solar failures. Plan recycling routes. Close the loop.

A single-page operational dashboard that tells the demo story in four steps:
**Problem → Solution → Test → Live Demo**.

## Run it

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

Build / preview a production bundle:

```bash
npm run build
npm run preview
```

## What's inside

| Page | Shows |
| --- | --- |
| **Problem** | Map of high-risk Melbourne sites + KPI cards (likely breaking, expiring <5y, recyclable mass, baseline cost). |
| **Solution** | The operating pipeline, a featured failing inverter with live health charts, breaking-risk message, and the digital passport. |
| **Test** | Hypothesis + controlled-variable experiment. Runs the real optimizer (greedy nearest-neighbour vs reactive baseline). |
| **Live Demo** | One shared map, two animated trucks, two live cost/distance charts, final comparison card, and the appended `collection_scheduled` passport event. |

## Tech

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4**
- **Leaflet** (driven imperatively for per-frame truck animation)
- Hand-rolled **SVG line charts** (no chart dependency)
- Frontend-only; the optimizer, Haversine distance, risk scoring and cost model all run in `src/lib`.

## Determinism

The demo dataset (`src/data/demo.ts`) is fixed. Headline results always resolve to:

```
Baseline:  142 km · A$312
Optimized: 102 km · A$212
Cost reduction 32%  ·  Distance reduction 28%
Collected mass: 1,980 kg (both routes)
```

## Code map

```
src/
  data/      fixed demo dataset, featured asset, types
  lib/       geo (haversine), risk scoring, optimizer, cost model, hash chain, metrics
  hooks/     useSimulation — deterministic two-truck engine feeding the live charts
  components/ MapView, LineChart, HealthChart, Pipeline, PassportPanel, ui primitives
  pages/     ProblemPage, SolutionPage, TestPage, DemoPage
```
