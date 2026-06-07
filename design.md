# SolarCycle AI Product and Data Design

## 1. Product Direction

SolarCycle AI is a Victoria-focused solar lifecycle intelligence platform.

The post-hackathon goal is to move from a deterministic demo into a credible data and ML prototype that handles real public datasets, builds a geospatial graph, forecasts solar asset lifecycle demand, and supports route and facility planning.

The product should be honest about data boundaries:

- Public data supports area-level modelling by LGA, postcode, grid cell, and facility location.
- Public data does not provide exact customer rooftop coordinates or real Victorian asset-level telemetry.
- Exact site health prediction becomes possible when a solar company connects private customer asset records, inverter telemetry, maintenance history, and fault outcomes.

Positioning:

```text
Forecast solar asset lifecycle demand. Prioritize collection. Optimize recovery routes.
```

## 2. Product Scope

### 2.1 Public-Data Mode

Public-data mode is the immediate build target.

It helps councils, recyclers, solar companies, and planners answer:

- Where are installed solar assets concentrated in Victoria?
- Which LGAs or postcodes are likely to generate future panel and inverter replacement demand?
- What waste/recovery facilities are near those demand areas?
- How much travel time and cost is required to reach demand nodes?
- Which areas should be prioritized under capacity, distance, cost, and lifecycle assumptions?

Public-data mode outputs:

- Solar deployment map by LGA/postcode.
- Estimated installed capacity and panel/inverter counts.
- End-of-life forecast by area and year.
- Inverter replacement demand forecast.
- Facility and logistics network graph.
- Route-time and distance matrix.
- Collection priority ranking.
- Scenario comparison for route/facility allocation heuristics.

### 2.2 Operator-Data Mode

Operator-data mode is the future commercial product.

It helps solar companies manage customer-installed solar assets:

- Track registered panels, inverters, and batteries.
- Track energy produced and energy saved.
- Monitor health telemetry and fault events.
- Predict maintenance and replacement risk.
- Convert high-risk or end-of-life assets into collection demand.
- Maintain a lifecycle/passport event history.

Operator-data mode requires private data:

- Customer/site asset registry.
- Exact site coordinates or service area coordinates.
- Inverter telemetry.
- Fault codes.
- Maintenance tickets.
- Replacement and warranty history.

## 3. Data Reality and Claims

### 3.1 Claims We Can Support Now

```text
Using real Victorian and Australian public datasets, SolarCycle AI forecasts regional solar lifecycle and recycling demand, builds a logistics graph, and evaluates collection strategies.
```

```text
The platform models solar demand nodes at postcode, LGA, or cluster level, not exact private rooftop level.
```

```text
Routing uses real road distance and travel-time data from a routing provider, cached into an edge matrix.
```

### 3.2 Claims We Must Avoid Until Private Data Exists

```text
We know the exact location of every installed Victorian solar panel.
```

```text
We predict real Victorian inverter failures from real Victorian telemetry.
```

```text
We have verified solar panel state of health for private customer systems.
```

## 4. Real Data Sources

### 4.1 Solar Installation Density

#### Solar Victoria installations by LGA

Source:

```text
https://discover.data.vic.gov.au/dataset/products-and-systems-installed-per-local-government-area-lga
```

Use:

- Real Solar Homes Program system counts by Victorian LGA.
- Council-level solar deployment features.
- LGA-level lifecycle demand estimation.

Notes:

- The Data Vic page states that location-based files contain counts of Solar Homes systems per Local Government Area.
- Solar Victoria uses Vicmap spatial boundaries to match property addresses with LGAs.
- This is not a complete record of all Victorian solar systems, only Solar Victoria program installs.

#### Clean Energy Regulator small-scale installation postcode data

Source:

```text
https://cer.gov.au/markets/reports-and-data/small-scale-installation-postcode-data
```

Use:

- Australian small-scale solar installation counts by postcode.
- Filter to Victorian postcodes.
- Estimate installation year distribution and postcode-level demand.

Notes:

- Good public source for postcode-level deployment.
- Does not provide exact customer addresses.

#### AEMO DER Register data downloads

Source:

```text
https://www.aemo.com.au/energy-systems/electricity/der-register/data-der/data-downloads
```

Background:

```text
https://www.aemo.com.au/energy-systems/electricity/der-register/about-the-der-register
```

Use:

- DER device count and installed capacity by region/postcode where privacy allows.
- Validation source against CER and Solar Victoria counts.
- Postcode-level capacity features.

Notes:

- AEMO explains that the DER Register stores information about DER devices installed on-site at residential or business locations.
- Public reporting is down to postcode where privacy and National Electricity Rules requirements allow.
- Postcodes below privacy thresholds may be absent or suppressed.

### 4.2 Product and Asset Mix

#### Solar Victoria PV module models

Source:

```text
https://discover.data.vic.gov.au/dataset/solar-pv-modules-january-2026/resource/827a06b8-c1a7-4f0f-8c1d-51fc73ccdc6b
```

Use:

- Real module model counts for Solar Victoria installs.
- Estimate product mix, panel capacity assumptions, and likely replacement cohorts.

#### Solar Victoria inverter models

Source:

```text
https://discover.data.vic.gov.au/dataset/inverter-models-january-2026/resource/b1a43da1-5974-449f-a031-02431f304a90
```

Use:

- Real inverter model counts for Solar Victoria installs.
- Estimate inverter replacement demand.
- Build future operator-facing asset passport metadata.

Notes:

- The Data Vic resource describes inverter model counts installed with Solar Victoria rebate and/or loan.
- Temporal coverage shown on the resource is 2019-03-31 to 2025-12-31.

### 4.3 Geography and Spatial Joins

#### Vicmap Admin boundaries

Source:

```text
https://discover.data.vic.gov.au/dataset/vicmap-admin
```

Use:

- LGA polygons.
- Postcode polygons.
- Centroids for demand nodes.
- Spatial joins from installation data to map features.

Expected transformations:

- Join postcode-level solar data to postcode polygons.
- Join LGA-level Solar Victoria data to LGA polygons.
- Generate centroids for route matrix origins.
- Optionally distribute modelled demand points inside polygons for visualization.

### 4.4 Solar Resource Features

#### Victoria solar irradiance

Source:

```text
https://discover.data.vic.gov.au/dataset/solar-irradiance-for-victoria
```

Use:

- Regional solar resource features.
- Forecasting features for expected generation, exposure, and potential degradation context.
- Grid-cell join to LGA/postcode nodes.

Notes:

- The Data Vic page describes a 5 km x 5 km grid across Victoria.
- Measures include GHI, GTI, GNI, DNI, and diffuse horizontal irradiance.

### 4.5 Recycling and Logistics Infrastructure

#### Victoria waste and resource recovery infrastructure map data

Source:

```text
https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/1dc1c2d9-515d-426b-8548-efac5c53e8bc
```

Direct CSV observed:

```text
https://www.vic.gov.au/sites/default/files/2025-03/Victoria%27s-waste-and-resource-recovery-infrastructure-map-data-March-2025.csv
```

Use:

- Real facility nodes.
- Facility type, owner, address, suburb, LGA, latitude, and longitude.
- Candidate transfer, aggregation, recovery, and recycling locations.

Important limitation:

- Solar-specific processing capacity may not be available for every facility.
- If missing, use a clearly marked inferred `capacity_proxy`.

### 4.6 Routing and Travel Time

#### Google Routes API

Source:

```text
https://developers.google.com/maps/documentation/routes/reference/rest
```

Use:

- `computeRouteMatrix` for origin-destination travel times and distances.
- `computeRoutes` for detailed route geometry.
- Traffic-aware routing if enabled and affordable.

Notes:

- Best commercial option for traffic-aware routing.
- Requires API key, billing, quota management, and caching.

#### OpenRouteService Matrix API

Source:

```text
https://giscience.github.io/openrouteservice/api-reference/endpoints/matrix/
```

Use:

- Distance and duration matrices between demand and facility nodes.
- Open routing alternative for prototypes.

Notes:

- Matrix endpoint calculates profile-specific distance and time matrices between multiple coordinate pairs.
- Still requires API limits and caching discipline.

#### OSRM

Source:

```text
https://project-osrm.org/docs/
```

Use:

- Open-source routing engine based on OpenStreetMap data.
- Good future option if the project needs reproducible offline routing.

Notes:

- For production or large experiments, prefer self-hosting or controlled infrastructure.

### 4.7 Public PV Fault Benchmark Data

#### GPVS-Faults

Source:

```text
https://data.mendeley.com/datasets/n76t439f65/1
```

Use:

- Benchmark PV fault/anomaly model.
- Validate fault classification code paths.
- Build the interface needed for future operator telemetry.

Important limitation:

- This is not Victorian operator telemetry.
- Model outputs must be labelled as benchmark-trained or lab-trained unless fine-tuned on real operator data.

## 5. Data Model

### 5.1 Raw Source Registry

```csv
source_id,name,url,publisher,license,retrieved_at,file_path,coverage_start,coverage_end,notes
```

Purpose:

- Track provenance for every dataset.
- Support repeatable ingestion.
- Preserve license and source metadata.

### 5.2 Solar Area Nodes

```csv
solar_area_id,area_type,postcode,lga,centroid_lat,centroid_lon,installed_system_count,installed_capacity_kw,estimated_panel_count,estimated_inverter_count,estimated_mass_kg,install_period_start,install_period_end,source_ids,data_confidence
```

Area types:

```text
postcode
lga
modelled_cluster
```

Rules:

- `postcode` and `lga` records come from public aggregate data.
- `modelled_cluster` records are generated for visualization or route planning and must be flagged as derived.

### 5.3 Product Mix

```csv
product_mix_id,area_id,product_type,manufacturer,model,capacity_w,count,install_quarter,source_id
```

Product types:

```text
pv_module
inverter
battery
```

### 5.4 Facility Nodes

```csv
facility_id,name,facility_type,infrastructure_type,owner,address,suburb,lga,lat,lon,accepted_materials,capacity_kg_per_day,capacity_source,capacity_confidence,source_id
```

Capacity confidence:

```text
observed
inferred
unknown
```

### 5.5 Road Edges

```csv
edge_id,origin_node_id,destination_node_id,distance_km,duration_seconds,traffic_duration_seconds,routing_provider,routing_profile,retrieved_at,cache_key
```

Rules:

- Store routing API results in a cache.
- ML and optimization should read cached edges, not call routing APIs inside training loops.
- Rebuild cache only when node coordinates or routing provider settings change.

### 5.6 End-of-Life Forecast

```csv
forecast_id,solar_area_id,asset_type,forecast_year,estimated_asset_count,estimated_mass_kg,lower_mass_kg,upper_mass_kg,method,confidence,source_ids
```

Asset types:

```text
pv_module
string_inverter
microinverter
battery
```

### 5.7 Collection Priority

```csv
priority_id,solar_area_id,forecast_year,priority_score,forecasted_mass_kg,age_score,distance_score,facility_capacity_score,product_risk_score,data_confidence,recommended_action
```

Recommended actions:

```text
monitor
plan_collection_capacity
schedule_collection_campaign
operator_data_needed
```

### 5.8 Operator Asset Records

Future private-data table:

```csv
asset_id,operator_id,site_id,asset_type,serial_number,manufacturer,model,capacity_w,installation_date,warranty_end_date,lat,lon,state_of_health,last_telemetry_at,lifecycle_status
```

Rules:

- This table should not be populated from public data as if it were real customer data.
- Demo records may exist, but must be marked synthetic or sample.

## 6. Graph Design

The platform graph links public demand areas to real logistics infrastructure.

Node categories:

```text
solar_area_node
facility_node
depot_node
operator_site_node
```

Edge categories:

```text
road_time_edge
road_distance_edge
facility_assignment_edge
service_area_edge
```

Initial graph:

```text
solar_area_node -> facility_node
```

Edge weights:

- Road distance.
- Travel duration.
- Traffic duration if provider supports it.
- Estimated transport cost.
- Capacity penalty.
- Priority score.

Graph use cases:

- Find nearest capable facilities.
- Estimate service coverage.
- Compare route scenarios.
- Prioritize high-demand areas with poor facility access.
- Visualize lifecycle pressure across Victoria.

## 7. ML and Analytics

### 7.1 End-of-Life Demand Forecasting

Goal:

```text
Forecast solar panel and inverter end-of-life demand by LGA/postcode/year.
```

Possible features:

- Install year or quarter.
- Installed system count.
- Installed capacity.
- Product mix.
- Expected lifespan.
- Solar irradiance grid values.
- LGA/postcode.
- Historical cumulative install trend.

Targets:

- Estimated PV module mass reaching EOL by year.
- Estimated inverter count reaching replacement age by year.

Baseline method:

- Cohort model using installation year plus expected lifespan assumptions.

ML upgrade:

- Gradient boosted regression or random forest regression.
- Quantile regression or prediction intervals for low/medium/high scenarios.

### 7.2 Collection Priority Scoring

Goal:

```text
Rank areas for collection planning and outreach.
```

Features:

- Forecasted mass.
- Asset age.
- Distance to nearest capable facility.
- Travel time.
- Facility capacity or capacity proxy.
- Product mix.
- Data confidence.

Baseline formula:

```text
priority_score =
  0.35 * normalized_forecasted_mass
+ 0.20 * normalized_asset_age
+ 0.20 * normalized_distance_or_access_gap
+ 0.15 * capacity_pressure
+ 0.10 * product_risk_or_uncertainty
```

ML upgrade:

- Train a ranking or classification model once labelled outcomes exist.
- Until labelled outcomes exist, treat priority scoring as a transparent heuristic.

### 7.3 Route and Facility Allocation

This is primarily optimization, not ML.

Inputs:

- Demand nodes.
- Facility nodes.
- Vehicle/depot assumptions.
- Cached road edge matrix.
- Facility capacity or capacity proxy.

Baseline:

- Assign each demand node to nearest facility.
- Greedy route construction by priority and nearest neighbor.

Upgrade:

- OR-Tools vehicle routing problem.
- Capacity-aware facility assignment.
- Scenario comparison across vehicle capacities and facility constraints.

### 7.4 Telemetry Fault Prediction

Current public-data status:

- Real Victorian telemetry is not available publicly.
- Public PV fault benchmarks can train a model interface and prove technical readiness.

Acceptable claim:

```text
Fault detection module trained on public PV fault benchmark data. Deployment requires operator telemetry for calibration and validation.
```

Future operator features:

- Inverter temperature anomaly detection.
- Energy output deviation from expected irradiance.
- Fault code classification.
- State-of-health trend.
- Maintenance recommendation.

## 8. Data Pipeline

### 8.1 Ingestion

Raw ingestion should preserve original files and metadata.

Expected raw inputs:

- Solar Victoria LGA XLSX.
- Solar Victoria PV module model XLSX.
- Solar Victoria inverter model XLSX.
- CER postcode CSV/XLSX.
- AEMO DER Register CSV/XLSX.
- Vicmap boundary files.
- Victoria solar irradiance spatial layer.
- Waste/recovery infrastructure CSV.
- Routing API matrix JSON responses.

### 8.2 Normalization

Normalize:

- LGA names.
- Postcodes.
- Dates and quarters.
- Capacity units.
- Coordinate systems to WGS84 latitude/longitude.
- Product model names.
- Source IDs.

### 8.3 Spatial Processing

Required joins:

- Postcode data to postcode polygons.
- LGA data to LGA polygons.
- Irradiance grid cells to postcode/LGA polygons.
- Facility points to nearest demand areas.
- Demand and facility nodes to routing matrix inputs.

### 8.4 Derived Records

Derived records must include:

- Source IDs.
- Derivation method.
- Confidence level.
- Whether the record is observed, aggregated, inferred, or synthetic.

Do not create customer-like records from public data without marking them as modelled.

## 9. Routing Provider Strategy

Preferred implementation:

1. Start with OpenRouteService for prototype road duration/distance matrix.
2. Add Google Routes API when traffic-aware travel time is needed and billing is acceptable.
3. Cache all route matrix responses.
4. Keep Haversine distance only as a fallback for unavailable API responses.

Provider comparison:

| Provider | Best Use | Tradeoff |
| --- | --- | --- |
| Google Routes API | Traffic-aware route matrix and detailed routes | Commercial billing and quotas |
| OpenRouteService | Open routing matrix for prototypes | API limits and less traffic detail |
| OSRM | Reproducible offline routing | Requires setup/hosting for serious use |
| Haversine | Fallback and testing | Not real road travel |

## 10. UI Requirements

The UI should become a data operations dashboard, not a hackathon landing page.

Primary views:

- Data source registry and ingestion status.
- Victoria solar deployment map.
- Product mix and installation cohort view.
- End-of-life forecast chart by LGA/postcode/year.
- Waste/recovery facility map.
- Logistics graph view.
- Route scenario comparison.
- Collection priority table.
- Operator-data placeholder explaining what private telemetry unlocks.

The UI must clearly label:

- Real public data.
- Aggregated area-level data.
- Modelled/derived demand nodes.
- Synthetic demo records.
- Future operator-only telemetry features.

## 11. Engineering Roadmap

### Phase 1: Public Data Foundation

- Download and store source files.
- Create source registry.
- Parse Solar Victoria, CER, AEMO, facility, and boundary data.
- Normalize LGA/postcode/product/capacity fields.
- Create solar area nodes.
- Create facility nodes.
- Add provenance metadata.

### Phase 2: Spatial Joins and Graph

- Join area data to Vicmap boundaries.
- Generate centroids.
- Join irradiance features.
- Build demand-to-facility candidate edges.
- Fetch/calculate route matrix.
- Cache road edges.

### Phase 3: Forecasting and Priority

- Implement cohort-based EOL forecast.
- Estimate PV module and inverter replacement mass.
- Implement transparent collection priority score.
- Add forecast uncertainty bands.
- Validate against simple baselines.

### Phase 4: Routing and Optimization

- Implement greedy route/facility allocation.
- Compare against nearest-facility baseline.
- Add vehicle capacity assumptions.
- Add facility capacity proxies.
- Evaluate OR-Tools for multi-vehicle routing.

### Phase 5: Operator-Data Readiness

- Define operator asset schema.
- Define telemetry schema.
- Define fault prediction API contract.
- Train benchmark PV fault model on public datasets.
- Build integration boundary for future operator data.

## 12. Acceptance Criteria

The next version is successful if it can:

- Ingest at least three real public datasets.
- Preserve source URLs, dates, and license metadata.
- Produce LGA/postcode solar demand nodes from real public data.
- Display real facility nodes from Victorian infrastructure data.
- Build a cached travel-time/distance edge matrix.
- Forecast end-of-life demand by area/year.
- Rank collection priority using transparent inputs.
- Compare at least two route/facility allocation strategies.
- Clearly distinguish observed public data from inferred/modelled records.
- Avoid claiming private telemetry or exact customer locations unless integrated from a real operator.

## 13. Open Decisions

- Should the first geographic unit be postcode or LGA?
- Should the first routing provider be OpenRouteService or Google Routes API?
- Which facility types should count as solar-capable in the first model?
- How should missing facility capacity be proxied?
- Should modelled demand be represented as centroids or distributed points inside polygons?
- Should the first forecast target panels, inverters, or both?
- Should the first UI be dashboard-first or notebook/report-first?

## 14. Current Decisions

- Use Victoria, Australia as the geographic scope.
- Focus first on public-data mode.
- Treat exact rooftop/site records as private operator data, not public data.
- Use LGA/postcode/cluster demand nodes for public modelling.
- Use real public datasets for installation density, product mix, irradiance, boundaries, and facilities.
- Use cached routing API outputs for graph edges.
- Use transparent cohort forecasting before complex ML.
- Treat route planning as optimization/heuristic first.
- Treat PV fault prediction as a benchmark module until operator telemetry is available.
- Preserve provenance and confidence labels for all derived records.
