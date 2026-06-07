# SolarCycle AI Context

## Current Direction

SolarCycle AI is moving from a hackathon demo into a data-driven product prototype for Victoria, Australia.

The near-term focus is not a scripted demo. The focus is building a credible public-data pipeline that can ingest, merge, spatially join, model, and visualize real Victorian solar deployment, product, infrastructure, and routing data.

## Product Thesis

Solar companies, councils, recyclers, and operations teams need better visibility into where installed solar assets are concentrated, when those assets are likely to reach end of life, and how collection/recycling logistics should be planned.

SolarCycle AI should support two modes:

- Public-data mode: forecast regional solar asset lifecycle and recycling demand using public Victorian/Australian datasets.
- Operator-data mode: when a solar company connects private asset records and telemetry, track customer assets, health, energy saved, maintenance risk, and collection planning.

The public-data version must be honest about granularity. Public sources can support LGA/postcode/area-level modelling. They do not provide exact customer rooftop coordinates or real asset-level health telemetry.

## Data Boundary

Public data can support:

- Solar installation density by LGA/postcode.
- Installed capacity and DER counts by postcode where privacy rules allow.
- Product/model mix for Solar Victoria program installs.
- Solar irradiance by grid cell across Victoria.
- Waste and resource recovery facility locations.
- Road distance and travel-time matrices through routing APIs.
- Derived end-of-life and collection demand forecasts.

Public data does not appear to support:

- Exact household/customer solar panel geolocation.
- Exact per-site inverter telemetry from Victorian operators.
- Real maintenance tickets, fault codes, or replacement history for private systems.

If exact panel health prediction is shown before operator integration, it must be labelled as a benchmark/lab model or synthetic demonstration, not real Victorian health prediction.

## Core Data Sources

- Solar Victoria LGA installations: https://discover.data.vic.gov.au/dataset/products-and-systems-installed-per-local-government-area-lga
- Solar Victoria PV module models: https://discover.data.vic.gov.au/dataset/solar-pv-modules-january-2026/resource/827a06b8-c1a7-4f0f-8c1d-51fc73ccdc6b
- Solar Victoria inverter models: https://discover.data.vic.gov.au/dataset/inverter-models-january-2026/resource/b1a43da1-5974-449f-a031-02431f304a90
- Clean Energy Regulator postcode SGU solar data: https://cer.gov.au/markets/reports-and-data/small-scale-installation-postcode-data
- AEMO DER Register data downloads: https://www.aemo.com.au/energy-systems/electricity/der-register/data-der/data-downloads
- AEMO DER Register background: https://www.aemo.com.au/energy-systems/electricity/der-register/about-the-der-register
- Victoria waste and resource recovery infrastructure: https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/1dc1c2d9-515d-426b-8548-efac5c53e8bc
- Victoria solar irradiance: https://discover.data.vic.gov.au/dataset/solar-irradiance-for-victoria
- Vicmap Admin boundaries: https://discover.data.vic.gov.au/dataset/vicmap-admin
- Google Routes API: https://developers.google.com/maps/documentation/routes/reference/rest
- OpenRouteService Matrix API: https://giscience.github.io/openrouteservice/api-reference/endpoints/matrix/
- OSRM documentation: https://project-osrm.org/docs/
- GPVS-Faults benchmark PV fault dataset: https://data.mendeley.com/datasets/n76t439f65/1

## Recommended Technical Direction

Build the data foundation first:

1. Ingest public datasets into raw storage with source metadata.
2. Normalize LGA, postcode, date, capacity, product, and coordinate fields.
3. Join solar installation data to boundary centroids or polygons.
4. Create modelled solar demand nodes at LGA/postcode/cluster granularity.
5. Join product/model mix and irradiance features.
6. Load waste/recovery facilities as logistics nodes.
7. Build a cached road distance/time edge matrix using Google Routes, OpenRouteService, or OSRM.
8. Forecast end-of-life mass and inverter replacement demand by area/year.
9. Rank areas by collection priority.
10. Allocate demand to facilities and route vehicles using heuristic or OR-Tools.

## ML Scope

Good first ML/analytics tasks:

- End-of-life demand forecasting by postcode/LGA/year.
- Inverter replacement demand forecasting.
- Collection priority scoring.
- Facility allocation and route-cost modelling.
- Scenario comparison across routing heuristics.

Telemetry fault prediction should be a separate module:

- Train or evaluate on public PV fault benchmark data.
- Expose the model interface needed for future operator telemetry.
- Do not claim real Victorian asset health prediction until private telemetry is available.

## Agentic Engineering Opportunities

Agentic workflows can help around the data pipeline and operations layer:

- Dataset ingestion agent to monitor new government data releases.
- Schema matching agent to map changing CSV/XLSX columns.
- Data quality agent to flag missing postcodes, impossible coordinates, stale facilities, and broken joins.
- Route planning agent to explain allocation decisions.
- Maintenance/reporting agent to turn forecasts into operator or council summaries.

These should be implemented as auditable workflow helpers, not opaque decision makers.
