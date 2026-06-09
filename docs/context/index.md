# SolarCycle AI — Context & Strategy

Strategy and data-direction docs for SolarCycle AI, split from the original
`/CONTEXT.md` into focused topics. Read the relevant doc for the area you are
working in.

| Document | Description |
|----------|-------------|
| [direction.md](./direction.md) | Current direction — moving from hackathon demo to a data-driven Victorian product prototype. |
| [product-thesis.md](./product-thesis.md) | Who the product serves and the two modes (public-data vs operator-data). |
| [data-boundary.md](./data-boundary.md) | What public data can and cannot support; honesty rules for health prediction claims. |
| [data-sources.md](./data-sources.md) | Canonical list of public source dataset and routing/benchmark API URLs. |
| [technical-direction.md](./technical-direction.md) | The 10-step data-foundation pipeline (ingest → normalize → join → forecast → route). |
| [ml-scope.md](./ml-scope.md) | First ML/analytics tasks and the separate telemetry fault-prediction module. |
| [agentic.md](./agentic.md) | Agentic workflow opportunities around the pipeline and operations layer. |

## Related

- [`../../app/data-real/CONTEXT.md`](../../app/data-real/CONTEXT.md) — dataset-level
  reference: per-file sources, column meanings, normalized outputs, and which demo
  values are real vs synthetic. (Separate doc; kept alongside the raw data, not moved here.)
