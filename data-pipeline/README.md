# SolarCycle AI — Phase 1 Public Data Pipeline

Ingests real Victorian public datasets, normalizes them into consistent schemas,
and writes output CSVs to `app/data-pipeline/output/`.

All output records carry provenance fields (`source_ids`, `source_url`,
`data_confidence`, `derivation_method`) so downstream code can distinguish
observed aggregate public data from inferred or modelled records.

---

## Quick start

```bash
cd app
npm install          # installs tsx and @types/node for the pipeline
npm run pipeline     # parse available files, write output CSVs
npm run pipeline:validate  # report counts, gaps, and quality issues
```

---

## Datasets

### 1. Clean Energy Regulator — postcode solar installations

| | |
|---|---|
| **Source** | https://cer.gov.au/markets/reports-and-data/small-scale-installation-postcode-data |
| **Local file** | `app/data-real/cer_sgu_solar_postcode.csv` |
| **Status** | **Available** (retrieved 2026-06-06) |
| **Output** | `solar_area_nodes.csv` (postcode rows) |

This file is already present. The pipeline filters to Victorian postcodes
(3000–3999) and sums monthly columns to produce one `solar_area_node` per
postcode with a non-zero installation count.

Installed capacity is **not** in this dataset (counts only). Coordinates and
LGA assignment require Phase 2 spatial join with Vicmap boundaries.

---

### 2. Solar Victoria — LGA installations

| | |
|---|---|
| **Source** | https://discover.data.vic.gov.au/dataset/products-and-systems-installed-per-local-government-area-lga |
| **Local file** | `app/data-real/solar_vic_lga.xlsx` |
| **Status** | **Not downloaded** |
| **Output** | `solar_area_nodes.csv` (lga rows, once parsed) |

**To download:**
1. Open the source URL.
2. Click the XLSX download link for the most recent release.
3. Save to `app/data-real/solar_vic_lga.xlsx`.
4. Add an XLSX library (`npm install --save-dev exceljs`) and implement the
   parser in `app/data-pipeline/parsers/solar-vic-lga.ts`.

---

### 3. Solar Victoria — PV module models

| | |
|---|---|
| **Source** | https://discover.data.vic.gov.au/dataset/solar-pv-modules-january-2026/resource/827a06b8-c1a7-4f0f-8c1d-51fc73ccdc6b |
| **Local file** | `app/data-real/solar_vic_pv_modules.xlsx` |
| **Status** | **Not downloaded** |
| **Output** | `product_mix.csv` (pv_module rows) |

**To download:** Open source URL → download XLSX → save to local file path.
Then implement the parser in `app/data-pipeline/parsers/solar-vic-products.ts`.

---

### 4. Solar Victoria — inverter models

| | |
|---|---|
| **Source** | https://discover.data.vic.gov.au/dataset/inverter-models-january-2026/resource/b1a43da1-5974-449f-a031-02431f304a90 |
| **Local file** | `app/data-real/solar_vic_inverters.xlsx` |
| **Status** | **Not downloaded** |
| **Output** | `product_mix.csv` (inverter rows) |

**To download:** Open source URL → download XLSX → save to local file path.
Implement in the same `solar-vic-products.ts` parser.

---

### 5. Sustainability Victoria — waste and resource recovery infrastructure

| | |
|---|---|
| **Source** | https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/1dc1c2d9-515d-426b-8548-efac5c53e8bc |
| **Direct CSV** | `https://www.vic.gov.au/sites/default/files/2025-03/Victoria%27s-waste-and-resource-recovery-infrastructure-map-data-March-2025.csv` |
| **Local file** | `app/data-real/vic_waste_infrastructure.csv` |
| **Status** | **Not downloaded** |
| **Output** | `facility_nodes.csv` |

**To download:**
```powershell
Invoke-WebRequest `
  -Uri "https://www.vic.gov.au/sites/default/files/2025-03/Victoria%27s-waste-and-resource-recovery-infrastructure-map-data-March-2025.csv" `
  -OutFile "data-real/vic_waste_infrastructure.csv"
```
Or download manually from the source URL. The parser auto-detects column names
using known aliases; verify the output after the first run.

---

## Output files

All outputs are written to `app/data-pipeline/output/`.

| File | Schema source | Description |
|---|---|---|
| `source_registry.csv` | design.md §5.1 | Provenance record for every dataset |
| `solar_area_nodes.csv` | design.md §5.2 | Demand nodes at postcode / LGA level |
| `product_mix.csv` | design.md §5.3 | PV module and inverter counts by model |
| `facility_nodes.csv` | design.md §5.4 | Waste and recovery facility locations |

Every output row carries:
- `source_ids` — which source(s) the row came from
- `source_url` — canonical URL for the source
- `data_confidence` — `observed_aggregate` | `estimated` | `observed` | `placeholder`
- `derivation_method` — short description of how the value was produced

---

## Expected gaps after Phase 1

These are not pipeline errors; they are filled in Phase 2 and beyond:

| Field | Why empty | Resolution |
|---|---|---|
| `centroid_lat/lon` on solar nodes | Spatial join needed | Phase 2: join to Vicmap boundaries |
| `lga` on postcode solar nodes | Spatial join needed | Phase 2: join to Vicmap boundaries |
| `installed_capacity_kw` | CER provides counts only | Phase 2: join to Solar Vic capacity data |
| `estimated_panel/inverter/mass` | Product mix not yet loaded | Phase 2 once Solar Vic XLSX parsed |
| `capacity_kg_per_day` on facilities | Not in source data | Derive proxy from facility type if needed |

---

## Architecture notes

- Raw files stay in `app/data-real/` (never modified by the pipeline).
- Pipeline scripts live in `app/data-pipeline/` and are TypeScript run with `tsx`.
- The pipeline does **not** call live APIs during normal execution.
- The main Vite app (`app/src/`) does not import from `data-pipeline/`.
- Phase 2 will add Vicmap spatial joins and routing matrix computation.
