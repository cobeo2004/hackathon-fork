# Solar Lifecycle AI Platform Design Spec

Product name:

```text
SolarCycle AI
```

Positioning:

```text
Predict solar failures. Plan recycling routes. Close the loop.
```

## 1. Product Goal

Build SolarCycle AI, an AI-assisted lifecycle management platform for solar energy assets in Victoria, Australia. The MVP demonstrates how asset health data can trigger predictive maintenance decisions, how the UI tells users when a solar panel or inverter is likely breaking, how high-risk or end-of-life assets become collection demand, and how reverse logistics can optimize pickup routes to recycling facilities.

The product must make the problem obvious on the UI before showing the technical solution. Judges should understand within the first page that solar waste collection is currently reactive, fragmented, and expensive, while the proposed platform predicts collection demand and optimizes vehicle movement before assets become unmanaged waste.

The core demo story is:

1. The first screen explains the problem and the proposed solution.
2. The user sees when solar assets are expected to reach end-of-life.
3. The user sees which panels or inverters are likely breaking now.
4. The user sees the current baseline: scattered high-risk assets, inefficient pickup behavior, and high estimated logistics cost.
5. The platform runs predictive risk scoring, end-of-life forecasting, and route optimization.
6. The map animates trucks moving under the existing approach and under the optimized approach.
7. Two live graphs compare existing logistics cost against optimized logistics cost.
8. The digital passport records the lifecycle events created by the optimized workflow.

## 2. Problem, Solution, Test, Demo Flow

The MVP should be structured as a short story:

```text
Problem -> Solution -> Hypothetical Test -> Demo
```

### 2.1 Problem Page

The first page of the product should be a quick, one-screen introduction. It should not feel like a marketing landing page; it should frame the operational problem that the dashboard is about to solve.

Problem statement:

```text
Solar panels and inverters are being installed faster than health monitoring and end-of-life logistics systems are being planned. Operators often do not know which assets are starting to break until performance drops or failure happens. When assets degrade or fail, collection is reactive, routes are inefficient, and recycling centers receive demand without good forecasting.
```

The UI should show:

- A map preview of scattered high-risk solar sites.
- A breaking-risk warning for panels or inverters likely to fail soon.
- A near-term end-of-life forecast for panels and inverters.
- A cost metric for the current baseline approach.
- A waste mass metric for assets likely to need collection.
- A short statement that the platform predicts risk, plans collection, and reduces logistics cost.

Recommended first-page metrics:

```text
High-risk assets detected
Panels or inverters likely breaking
Assets forecast to expire within 5 years
Estimated recyclable mass
Baseline collection cost
Optimized collection cost
Estimated cost reduction
```

### 2.2 Solution Page

The solution page explains the operating model in one flow:

```text
Health data -> AI risk score -> end-of-life forecast -> collection demand -> route optimizer -> passport event log
```

The UI should show this as a compact pipeline with live status indicators:

- Health data received
- Risk score calculated
- Breaking-risk warning generated
- End-of-life window forecast
- Collection demand generated
- Route optimized
- Passport event appended

### 2.3 Hypothetical Test Page

The test page explains how the team would validate the solution if deployed with real operators.

Hypothesis:

```text
If high-risk solar assets are predicted before failure and grouped into optimized collection routes, then total logistics cost and distance will be lower than reactive collection.
```

Test design:

- Use the same set of collection points for both approaches.
- Use the same forecasted end-of-life asset demand for both approaches.
- Baseline approach: simulate reactive pickup in received-order or nearest-single-job order.
- Optimized approach: group pickups using vehicle capacity, recycling center capacity, and route distance.
- Compare cost, distance, vehicle utilization, and collected mass.

Baseline definition:

```text
The original way is reactive unoptimized collection. Operators wait until panels or inverters fail, are manually reported, or are already ready for disposal. Jobs are handled one-by-one or in the order received. Routes are planned manually or with simple nearest-job logic, without global optimization across vehicle capacity, recycling center capacity, risk priority, or forecasted demand.
```

This baseline is labeled in the UI as:

```text
Current reactive collection
```

Success metrics:

```text
cost_reduction_percent
distance_reduction_percent
vehicle_utilization_percent
collected_mass_kg
missed_or_skipped_points
```

### 2.4 Demo Page

The final demo page is the main visualization. It should show the superiority of the proposed solution through direct comparison.

The demo must include:

- One map with two visible truck simulations, or two synchronized map panels.
- Existing approach truck movement.
- Optimized approach truck movement.
- Two live graphs that update during the simulation.
- A final comparison summary showing why the optimized solution is superior.

Required graphs:

1. Cumulative logistics cost over simulation time.
2. Cumulative route distance or collected mass over simulation time.

The key message:

```text
Our solution predicts collection demand earlier and moves trucks more efficiently, reducing cost while collecting the same or greater recyclable mass.
```

Target demo result:

```text
32% lower logistics cost
28% shorter route distance
same collected mass
```

## 3. MVP Scope

### Geographic Scope

The MVP focuses on Victoria, Australia, narrowed to Melbourne west and north councils:

- Wyndham
- Melton
- Brimbank
- Hume
- Whittlesea
- Merri-bek
- Darebin
- Moonee Valley
- Maribyrnong

This scope is narrow enough for a hackathon demo while still representing a realistic urban solar recovery network.

### Product Scope

The MVP includes:

- Solar asset dashboard
- Inverter health visualization
- Rule-based predictive risk scoring
- Breaking-risk alerts for panels and inverters
- End-of-life forecasting for panels and inverters
- Digital passport records
- Append-only lifecycle event log
- Collection demand generation
- Route optimization for reverse logistics
- Map view of collection points, recycling centers, and optimized routes

The MVP does not include:

- Real blockchain deployment
- Production-grade ML training pipeline
- Real-time IoT ingestion
- Live fleet dispatch
- Regulatory compliance workflow automation

## 4. Stakeholders

### Solar Asset Operators

Examples:

- Solar installation companies
- Operations and maintenance providers
- Commercial rooftop owners
- Solar farm operators

They provide:

- Inverter health data
- Site metadata
- Maintenance records

They receive:

- Failure risk predictions
- Maintenance recommendations
- Collection planning support

### Logistics and Recycling Operators

Examples:

- E-waste collection companies
- Recycling centers
- Council transfer stations
- Material recovery facilities

They provide:

- Facility locations
- Capacity constraints
- Vehicle information
- Transport cost assumptions

They receive:

- Optimized pickup routes
- Expected mass and volume per route
- Recycling center allocation

### Regulators and Councils

Examples:

- Victorian local councils
- Sustainability Victoria
- Product stewardship bodies

They provide:

- Geographic boundaries
- Waste infrastructure data
- Policy requirements

They receive:

- Traceability data
- Aggregate waste flow insights
- Circular economy reporting support

### Manufacturers and Certifiers

They provide:

- Product metadata
- Serial numbers
- Original performance specifications
- Warranty information

They receive:

- Lifecycle traceability
- Product performance feedback
- End-of-life recovery data

## 5. Data Sources

### Solar Installation Density

Use public solar installation datasets to estimate where future solar panel waste will appear.

Recommended sources:

- Clean Energy Regulator small-scale installation postcode data
- Victorian Solar Homes products and systems installed per Local Government Area dataset

Usage:

- Estimate solar asset density by postcode or LGA
- Prioritize councils with high rooftop solar concentration
- Generate realistic mock collection points

### Waste and Recycling Infrastructure

Use Victorian waste infrastructure datasets to locate candidate logistics nodes.

Recommended sources:

- Data Vic waste and resource recovery infrastructure map data
- Sustainability Victoria public information on solar panel, inverter, and battery lifecycle management

Usage:

- Identify transfer stations, recycling centers, material recovery facilities, and reprocessors
- Create `logistics_nodes.csv`
- Assign capacity and cost assumptions

### Routing and Distance Data

Primary routing source:

- OpenRouteService Matrix API

Fallback routing method:

- Haversine straight-line distance between coordinates

Optional future source:

- Vicmap Transport Road Line
- OpenStreetMap plus OSRM

### Inverter Health and Fault Data

The MVP can use public or synthetic inverter health data.

Candidate sources:

- Public photovoltaic fault datasets
- Kaggle solar PV anomaly datasets
- GitHub PV fault datasets
- Synthetic time-series generated from expected operating ranges

Usage:

- Build `inverter_health_data.csv`
- Demonstrate risk scoring
- Optionally train a Decision Tree or Random Forest model as a stretch goal

## 6. Core Data Model

### 6.1 Asset Passport

File:

```text
asset_passport.csv
```

Purpose:

Stores the identity and lifecycle state of each solar asset.

Fields:

```csv
asset_id,asset_type,serial_number,manufacturer,model,capacity_wp,production_date,installation_date,expected_lifespan_years,warranty_end_date,owner_id,site_id,lifecycle_status,state_of_health,estimated_end_of_life_date,estimated_recycling_value_aud
```

Example lifecycle statuses:

```text
active
monitoring
high_risk
ready_for_collection
collected
recycled
```

Granularity:

- Passport granularity is per asset or panel.
- Health monitoring can be per inverter or site.
- Logistics operates at collection site level.

### 6.2 Inverter Health Data

File:

```text
inverter_health_data.csv
```

Purpose:

Stores health telemetry used by the predictive maintenance engine.

Fields:

```csv
timestamp,asset_id,site_id,dc_voltage,ac_voltage,current,temperature_c,conversion_efficiency,power_factor,thd,energy_output_kw,fault_label
```

Fault labels:

```text
normal
overheating
efficiency_drop
harmonic_distortion
voltage_instability
failure_risk
```

### 6.3 Collection Points

File:

```text
collection_points.csv
```

Purpose:

Represents the logistics demand generated by high-risk, failed, or end-of-life assets.

Fields:

```csv
collection_id,site_id,lga,postcode,lat,lon,address,asset_count,total_mass_kg,total_volume_m3,priority_score,ready_from,deadline,status
```

Statuses:

```text
forecasted
high_risk
ready_for_collection
scheduled
collected
cancelled
```

Example:

```csv
COL_001,SITE_001,Wyndham,3029,-37.8500,144.6900,"Wyndham VIC",84,1680,6.2,0.87,2026-06-08,2026-06-15,ready_for_collection
```

### 6.4 Logistics Nodes

File:

```text
logistics_nodes.csv
```

Purpose:

Defines depots, aggregation points, and recycling centers.

Fields:

```csv
node_id,node_type,name,lat,lon,address,capacity_kg_per_day,cost_per_kg,operating_hours
```

Node types:

```text
depot
collection_point
aggregation_point
recycling_center
```

### 6.5 Vehicles

File:

```text
vehicles.csv
```

Purpose:

Defines vehicle constraints for route optimization.

Fields:

```csv
vehicle_id,depot_id,capacity_kg,max_volume_m3,cost_per_km,max_route_km,available_from,available_until
```

### 6.6 Passport Event Log

File:

```text
passport_event_log.csv
```

Purpose:

Provides verifiable lifecycle traceability without requiring blockchain in the MVP.

Fields:

```csv
event_id,asset_id,event_type,timestamp,actor,location_id,notes,previous_event_hash,event_hash
```

Event types:

```text
manufactured
installed
health_checked
fault_predicted
maintenance_completed
collection_scheduled
collected
recycled
```

### 6.7 End-of-Life Forecast Data

File:

```text
asset_end_of_life_forecast.csv
```

Purpose:

Stores the estimated expiry window for panels, inverters, and site-level solar assets.

Fields:

```csv
asset_id,site_id,asset_type,installation_date,expected_lifespan_years,current_age_years,state_of_health,degradation_rate_per_year,estimated_end_of_life_date,end_of_life_confidence,forecast_reason
```

MVP assumptions:

```text
Solar panel expected lifespan: 25 years by default
Solar panel optimistic lifespan: 30 years
String inverter expected lifespan: 10-15 years
Microinverter expected lifespan: 20-25 years
End-of-life threshold: state_of_health below 80% or asset age above expected lifespan
```

Forecast formula:

```text
estimated_end_of_life_date =
  installation_date + expected_lifespan_years
```

If measured degradation data exists:

```text
years_until_eol = (current_state_of_health - 80%) / annual_degradation_rate
estimated_end_of_life_date = current_date + years_until_eol
```

The forecast should be shown as a window, not a false-precision exact date:

```text
2029-2031
2034-2036
already_due
```

MVP behavior:

- Events are append-only.
- Each event includes `previous_event_hash`.
- Each event generates `event_hash`.
- The dashboard shows the asset provenance chain.

Post-MVP behavior:

- Anchor event hashes to a blockchain or verifiable registry.
- Integrate with Digital Product Passport standards.

## 7. Predictive Maintenance Engine

### MVP Approach

The MVP uses a deterministic rule-based risk score and an end-of-life forecast so the demo remains stable.

Input:

- Inverter health telemetry
- Asset age
- Degradation estimate
- Installation date
- Expected lifespan by asset type

Output:

```json
{
  "asset_id": "INV_001",
  "risk_score": 0.87,
  "breaking_risk": "likely_breaking",
  "predicted_fault_type": "overheating",
  "estimated_failure_window_days": 21,
  "estimated_end_of_life_date": "2028-09-30",
  "end_of_life_window": "2028-2029",
  "recommended_action": "schedule_collection_or_maintenance"
}
```

Baseline formula:

```text
risk_score =
  0.30 * normalized_temperature
+ 0.25 * normalized_thd
+ 0.20 * efficiency_drop
+ 0.15 * voltage_instability
+ 0.10 * age_factor
```

Risk thresholds:

```text
0.00 - 0.39 = normal
0.40 - 0.64 = monitoring
0.65 - 0.79 = high_risk
0.80 - 1.00 = ready_for_collection_or_urgent_maintenance
```

Breaking-risk labels:

```text
normal = no immediate warning
watch = abnormal signal detected, monitor closely
likely_breaking = failure pattern detected, maintenance or replacement should be planned
urgent = severe anomaly, inspect immediately
```

The UI should translate these into user-facing messages:

```text
This inverter is likely breaking due to overheating and high THD.
This panel group is degrading faster than expected and may need replacement planning.
```

End-of-life forecast rules:

```text
if asset_type = solar_panel:
  expected_lifespan_years = manufacturer_value_or_25

if asset_type = string_inverter:
  expected_lifespan_years = manufacturer_value_or_12

if asset_type = microinverter:
  expected_lifespan_years = manufacturer_value_or_22

if state_of_health < 80:
  lifecycle_status = ready_for_collection_or_replacement

if estimated_end_of_life_date is within 5 years:
  lifecycle_status = forecasted_collection_demand
```

### Stretch Goal

Train or integrate a real ML model using public or synthetic datasets.

Candidate models:

- Decision Tree
- Random Forest
- XGBoost
- SVM
- LSTM for time-series forecasting

The ML model must preserve the same API output contract as the rule-based engine.

## 8. Reverse Logistics Optimizer

### MVP Goal

The logistics engine must optimize how collection vehicles should pick up high-risk or ready-for-collection solar assets and deliver them to a recycling center or aggregation point.

It is not enough to display points on a map. The MVP must produce an optimized route output.

### Optimization Objective

Primary objective:

```text
Minimize total transport cost.
```

Cost formula:

```text
route_cost =
  total_distance_km * vehicle.cost_per_km
+ stop_count * handling_cost_per_stop
+ route_count * dispatch_cost_per_route
```

Priority formula:

```text
priority_score =
  0.50 * risk_score
+ 0.30 * recycling_value_score
+ 0.20 * age_score
```

### Constraints

The MVP optimizer must respect:

- Each ready collection point is visited at most once.
- Vehicle mass capacity cannot be exceeded.
- Vehicle volume capacity should not be exceeded when volume data is available.
- Recycling center daily capacity cannot be exceeded.
- Route distance should not exceed vehicle `max_route_km`.
- Only points with `status = high_risk` or `status = ready_for_collection` are eligible.

### Routing Distance Strategy

Primary:

- Use OpenRouteService Matrix API for road distance and travel time.

Fallback:

- Use Haversine distance between latitude and longitude pairs.

### MVP Algorithm

Use a greedy nearest-neighbor algorithm with capacity constraints.

Steps:

1. Filter collection points to eligible statuses.
2. Sort points by `priority_score` descending.
3. Assign each point to the nearest recycling center with remaining capacity.
4. For each vehicle, start at its depot.
5. Add the nearest eligible point that fits remaining vehicle capacity.
6. Continue until no more point fits or route limit is reached.
7. End the route at the assigned recycling center.
8. Return skipped points with reasons.

### Post-MVP Optimizer

Upgrade to one of:

- Mixed-Integer Programming with PuLP or Pyomo
- Vehicle Routing Problem solver
- OR-Tools
- PSO or metaheuristic routing

## 9. Optimized Route Output

File or API response:

```text
optimized_routes.json
```

Example:

```json
{
  "summary": {
    "total_distance_km": 186.4,
    "total_cost_aud": 372.8,
    "total_mass_kg": 1980,
    "collected_points": 5,
    "skipped_points": 1
  },
  "routes": [
    {
      "route_id": "ROUTE_001",
      "vehicle_id": "V001",
      "assigned_recycling_center": "RC_001",
      "total_distance_km": 86.4,
      "total_cost_aud": 172.8,
      "total_mass_kg": 980,
      "stops": [
        {
          "node_id": "DEPOT_1",
          "type": "depot",
          "lat": -37.7300,
          "lon": 144.8500
        },
        {
          "node_id": "COL_012",
          "type": "collection_point",
          "pickup_mass_kg": 320,
          "lat": -37.8100,
          "lon": 144.7000
        },
        {
          "node_id": "COL_004",
          "type": "collection_point",
          "pickup_mass_kg": 660,
          "lat": -37.7600,
          "lon": 144.9000
        },
        {
          "node_id": "RC_001",
          "type": "recycling_center",
          "lat": -37.6900,
          "lon": 144.9700
        }
      ]
    }
  ],
  "skipped_points": [
    {
      "collection_id": "COL_009",
      "reason": "vehicle_capacity_exceeded"
    }
  ]
}
```

## 10. Dashboard Requirements

### Main Views

The frontend should include:

- Problem and solution intro page
- Hypothetical test methodology page
- Comparison demo page
- Operations dashboard
- Asset passport detail view
- Health telemetry chart view
- Logistics map view
- Route optimization result panel

### Problem Intro Page

The first page should show the user what problem is being solved before showing the full dashboard.

Required content:

- Current problem: reactive solar waste collection is costly and inefficient.
- Proposed solution: detect assets likely breaking, forecast expiry, and optimize collection routes.
- Scope: Melbourne west and north, Victoria.
- Baseline cost vs optimized cost preview.
- Button or control to run the comparison demo.

This page should be concise and visual. It should use real-looking metrics from the demo dataset rather than long explanatory text.

### Hypothetical Test View

The test view should explain the experiment:

- Same collection points.
- Same vehicle capacity.
- Same recycling center capacity.
- Baseline route generated with a simple reactive strategy.
- Optimized route generated with the platform optimizer.
- Compare cost, distance, utilization, and collected mass.

The purpose is to show that the claim is testable, not just visually impressive.

### Comparison Demo View

This is the most important hackathon screen.

Required elements:

- Interactive Victoria map focused on Melbourne west and north.
- Baseline truck animation.
- Optimized truck animation.
- Collection point markers.
- Recycling center markers.
- End-of-life forecast markers or filter.
- Live graph 1: cumulative cost over time.
- Live graph 2: cumulative distance or collected mass over time.
- Final comparison card showing percentage improvement.

Recommended layout:

```text
Top: problem/solution metrics
Center: map with animated trucks and routes
Right or bottom: two live comparison graphs
Footer/side panel: final cost, distance, mass, improvement percentage
```

Truck animation requirements:

- The existing solution truck should follow the baseline route.
- The optimized solution truck should follow the optimized route.
- Both trucks should move during the same simulation timeline.
- The map should make it visually clear that the optimized route is shorter, better grouped, or less wasteful.
- The simulation should be replayable.

### Dashboard Metrics

Top-level metrics:

- Total monitored assets
- High-risk assets
- Assets likely breaking now
- Assets forecast to expire within 5 years
- Ready-for-collection assets
- Estimated recyclable mass
- Optimized route distance
- Estimated logistics cost
- Recycling center capacity used
- Baseline logistics cost
- Optimized logistics cost
- Cost reduction percentage
- Baseline route distance
- Optimized route distance

### Charts

Health charts:

- DC voltage over time
- AC voltage over time
- Current over time
- Temperature over time
- Conversion efficiency over time
- THD over time
- Risk score over time
- Breaking-risk timeline
- State of health over time
- Forecasted end-of-life count by year

Comparison charts:

- Cumulative baseline cost vs optimized cost
- Cumulative baseline distance vs optimized distance
- Optional: cumulative collected mass for both approaches

### Map

The map should display:

- Collection points
- Depots
- Recycling centers
- Optimized routes
- Baseline routes
- Animated baseline truck
- Animated optimized truck
- End-of-life forecast layer
- Marker color by collection status
- Marker size by total mass or asset count

### Asset Detail

The asset detail view should show:

- Serial number
- Manufacturer
- Model
- Installation date
- State of health
- Expected end-of-life window
- Latest risk score
- Breaking-risk status
- Predicted fault type
- Estimated failure window
- Lifecycle status
- Maintenance history
- Passport event log

## 11. Recommended Tech Stack

### Base44 Build Target

This spec is intended to be used in Base44 or a similar AI app builder. The implementation should prioritize a polished, working demo over perfect backend architecture.

Build the app as a single-page dashboard experience with four navigable sections:

```text
1. Problem
2. Solution
3. Test
4. Live Demo
```

The app should feel like an operational control room, not a marketing landing page. The first screen can introduce the problem, but the product should quickly become interactive and data-driven.

### Base44 Pages

#### Page 1: Problem

Purpose:

Show what problem the platform solves.

Required UI:

- Title: `Solar assets are aging faster than recovery logistics can react`
- Subtitle: `We predict which assets are breaking, forecast end-of-life demand, and optimize recycling collection routes.`
- Map preview with high-risk collection points in Melbourne west and north.
- KPI cards:
  - `Assets likely breaking now`
  - `Assets expiring within 5 years`
  - `Estimated recyclable mass`
  - `Baseline logistics cost`
- Primary action: `See the solution`

Header brand:

```text
SolarCycle AI
```

Header tagline:

```text
Predict failures. Plan collections. Recover value.
```

#### Page 2: Solution

Purpose:

Show the workflow that makes the solution superior.

Required UI:

- Pipeline:

```text
Health telemetry -> Breaking-risk alert -> End-of-life forecast -> Collection demand -> Optimized route -> Passport event
```

- A selected site summary showing:
  - site name
  - LGA
  - risk score
  - breaking-risk status
  - end-of-life window
  - estimated recyclable mass
- Health chart for the selected asset.
- Passport event preview.
- Primary action: `Test the hypothesis`

#### Page 3: Test

Purpose:

Show that the claim is testable and not just visual.

Required UI:

- Hypothesis card:

```text
If high-risk solar assets are predicted before failure and grouped into optimized collection routes, total logistics cost and route distance will be lower than reactive collection.
```

- Experiment setup table:
  - Same collection points
  - Same vehicles
  - Same recycling center capacity
  - Same cost per km
  - Different routing strategy
- Baseline strategy:

```text
Current reactive collection: pickup requests are handled in received order, with weak grouping and no global optimization.
```

- Optimized strategy:

```text
Priority-aware route grouping with vehicle and recycling capacity constraints.
```

- Primary action: `Run live demo`

#### Page 4: Live Demo

Purpose:

Prove visually that the optimized solution is better.

Required UI:

- One shared map with two animated trucks:
  - Red truck: current reactive collection route
  - Green truck: optimized route
- Same collection points visible for both routes.
- Recycling center marker.
- Two live graphs:
  - cumulative cost: baseline vs optimized
  - cumulative distance: baseline vs optimized
- Final comparison card:
  - baseline cost
  - optimized cost
  - cost reduction percent
  - baseline distance
  - optimized distance
  - distance reduction percent
  - collected mass
- The final comparison should target:

```text
Baseline cost: about AUD 310
Optimized cost: about AUD 210
Cost reduction: about 32%
Baseline distance: about 142 km
Optimized distance: about 102 km
Distance reduction: about 28%
Collected mass: same for both routes
```
- Replay button.
- Asset passport drawer or panel.

### Base44 Data Collections

Create mock data directly in the app if CSV import is slower. Use realistic values and coordinates around Melbourne west and north.

### Deterministic Demo Dataset

Use this fixed dataset for the live demo. Do not randomize the route, cost, health values, or final percentages during the pitch.

Cost assumptions:

```text
vehicle_cost_per_km = AUD 1.60
baseline_handling_cost_per_collection_stop = AUD 15
optimized_handling_cost_per_collection_stop = AUD 6
dispatch_cost_per_route = AUD 25
vehicle_capacity_kg = 2500
selected_collection_mass_kg = 1980
```

Final comparison:

```text
Baseline route distance: 142 km
Optimized route distance: 102 km
Distance reduction: 28.2%

Baseline route cost: AUD 312
Optimized route cost: AUD 212
Cost reduction: 32.1%

Collected mass: 1,980 kg in both cases
```

The optimized solution wins because it uses the same truck and collects the same mass, but groups stops better and reduces both distance and handling overhead.

#### Fixed Demo Sites

Use these sites on the map. The four `ready_for_collection` sites are included in both baseline and optimized routes. The other sites are visible as monitored or forecasted demand.

```json
[
  {
    "site_id": "SITE_001",
    "site_name": "Wyndham Rooftop Cluster",
    "lga": "Wyndham",
    "postcode": "3029",
    "lat": -37.8500,
    "lon": 144.6900,
    "asset_count": 84,
    "total_mass_kg": 620,
    "risk_score": 0.87,
    "breaking_risk": "likely_breaking",
    "estimated_end_of_life_window": "2029-2031",
    "status": "ready_for_collection"
  },
  {
    "site_id": "SITE_002",
    "site_name": "Melton Residential Solar Group",
    "lga": "Melton",
    "postcode": "3337",
    "lat": -37.6830,
    "lon": 144.5830,
    "asset_count": 52,
    "total_mass_kg": 410,
    "risk_score": 0.58,
    "breaking_risk": "watch",
    "estimated_end_of_life_window": "2031-2033",
    "status": "forecasted"
  },
  {
    "site_id": "SITE_003",
    "site_name": "Brimbank Commercial Rooftop",
    "lga": "Brimbank",
    "postcode": "3020",
    "lat": -37.7820,
    "lon": 144.8320,
    "asset_count": 68,
    "total_mass_kg": 530,
    "risk_score": 0.82,
    "breaking_risk": "likely_breaking",
    "estimated_end_of_life_window": "2028-2030",
    "status": "ready_for_collection"
  },
  {
    "site_id": "SITE_004",
    "site_name": "Hume Industrial Solar Site",
    "lga": "Hume",
    "postcode": "3061",
    "lat": -37.6400,
    "lon": 144.9500,
    "asset_count": 61,
    "total_mass_kg": 470,
    "risk_score": 0.91,
    "breaking_risk": "urgent",
    "estimated_end_of_life_window": "2027-2029",
    "status": "ready_for_collection"
  },
  {
    "site_id": "SITE_005",
    "site_name": "Whittlesea Community Solar",
    "lga": "Whittlesea",
    "postcode": "3752",
    "lat": -37.5950,
    "lon": 145.1000,
    "asset_count": 44,
    "total_mass_kg": 360,
    "risk_score": 0.49,
    "breaking_risk": "watch",
    "estimated_end_of_life_window": "2032-2034",
    "status": "monitoring"
  },
  {
    "site_id": "SITE_006",
    "site_name": "Merri-bek Apartment Solar",
    "lga": "Merri-bek",
    "postcode": "3058",
    "lat": -37.7350,
    "lon": 144.9600,
    "asset_count": 47,
    "total_mass_kg": 360,
    "risk_score": 0.76,
    "breaking_risk": "likely_breaking",
    "estimated_end_of_life_window": "2029-2031",
    "status": "ready_for_collection"
  },
  {
    "site_id": "SITE_007",
    "site_name": "Darebin School Solar",
    "lga": "Darebin",
    "postcode": "3072",
    "lat": -37.7400,
    "lon": 145.0100,
    "asset_count": 39,
    "total_mass_kg": 300,
    "risk_score": 0.35,
    "breaking_risk": "normal",
    "estimated_end_of_life_window": "2034-2036",
    "status": "active"
  },
  {
    "site_id": "SITE_008",
    "site_name": "Moonee Valley Retail Solar",
    "lga": "Moonee Valley",
    "postcode": "3039",
    "lat": -37.7650,
    "lon": 144.9200,
    "asset_count": 58,
    "total_mass_kg": 450,
    "risk_score": 0.62,
    "breaking_risk": "watch",
    "estimated_end_of_life_window": "2030-2032",
    "status": "forecasted"
  },
  {
    "site_id": "SITE_009",
    "site_name": "Maribyrnong Warehouse Solar",
    "lga": "Maribyrnong",
    "postcode": "3012",
    "lat": -37.8050,
    "lon": 144.8850,
    "asset_count": 63,
    "total_mass_kg": 490,
    "risk_score": 0.66,
    "breaking_risk": "watch",
    "estimated_end_of_life_window": "2030-2032",
    "status": "forecasted"
  }
]
```

Fixed logistics nodes:

```json
[
  {
    "node_id": "DEPOT_1",
    "node_type": "depot",
    "name": "Western Collection Depot",
    "lat": -37.7350,
    "lon": 144.8000
  },
  {
    "node_id": "RC_001",
    "node_type": "recycling_center",
    "name": "Northern Solar Recovery Centre",
    "lat": -37.6900,
    "lon": 144.9700,
    "capacity_kg_per_day": 5000
  }
]
```

#### `sites`

```json
{
  "site_id": "SITE_001",
  "site_name": "Wyndham Rooftop Cluster",
  "lga": "Wyndham",
  "postcode": "3029",
  "lat": -37.8500,
  "lon": 144.6900,
  "asset_count": 84,
  "total_mass_kg": 1680,
  "status": "ready_for_collection"
}
```

#### `assets`

```json
{
  "asset_id": "PV_001",
  "site_id": "SITE_001",
  "asset_type": "solar_panel",
  "serial_number": "PV-WYN-0001",
  "manufacturer": "MockSolar",
  "model": "MS-400W",
  "capacity_wp": 400,
  "installation_date": "2010-04-12",
  "expected_lifespan_years": 25,
  "state_of_health": 72,
  "estimated_end_of_life_window": "2029-2031",
  "breaking_risk": "likely_breaking",
  "lifecycle_status": "ready_for_collection"
}
```

#### `healthReadings`

```json
{
  "timestamp": "2026-06-06T10:00:00+10:00",
  "asset_id": "INV_001",
  "site_id": "SITE_001",
  "dc_voltage": 615,
  "ac_voltage": 238,
  "current": 18.2,
  "temperature_c": 78,
  "conversion_efficiency": 89.5,
  "power_factor": 0.91,
  "thd": 7.8,
  "risk_score": 0.87
}
```

#### `vehicles`

```json
{
  "vehicle_id": "TRUCK_001",
  "name": "Collection Truck 1",
  "capacity_kg": 2500,
  "cost_per_km": 1.6,
  "max_route_km": 220
}
```

#### `routes`

```json
{
  "route_id": "BASELINE_001",
  "strategy": "baseline",
  "vehicle_id": "TRUCK_001",
  "color": "red",
  "total_distance_km": 142,
  "total_cost_aud": 312,
  "collected_mass_kg": 1980,
  "stops": ["DEPOT_1", "SITE_004", "SITE_001", "SITE_006", "SITE_003", "RC_001"]
}
```

Create another route with:

```json
{
  "route_id": "OPTIMIZED_001",
  "strategy": "optimized",
  "vehicle_id": "TRUCK_001",
  "color": "green",
  "total_distance_km": 102,
  "total_cost_aud": 212,
  "collected_mass_kg": 1980,
  "stops": ["DEPOT_1", "SITE_001", "SITE_003", "SITE_006", "SITE_004", "RC_001"]
}
```

#### `passportEvents`

```json
{
  "event_id": "EVT_001",
  "asset_id": "PV_001",
  "event_type": "collection_scheduled",
  "timestamp": "2026-06-06T11:00:00+10:00",
  "actor": "SolarCycle AI",
  "notes": "Collection scheduled after likely_breaking warning and route optimization.",
  "previous_event_hash": "abc123",
  "event_hash": "def456"
}
```

### Base44 Computed Logic

Risk score:

```text
risk_score =
  0.30 * normalized_temperature
+ 0.25 * normalized_thd
+ 0.20 * efficiency_drop
+ 0.15 * voltage_instability
+ 0.10 * age_factor
```

Breaking-risk label:

```text
risk_score >= 0.85 -> urgent
risk_score >= 0.70 -> likely_breaking
risk_score >= 0.45 -> watch
else -> normal
```

End-of-life window:

```text
base_eol_year = installation_year + expected_lifespan_years
window = base_eol_year - 1 to base_eol_year + 1
```

Cost comparison:

```text
baseline_cost =
  baseline_distance_km * vehicle_cost_per_km
+ collection_stop_count * baseline_handling_cost_per_collection_stop
+ dispatch_cost_per_route

optimized_cost =
  optimized_distance_km * vehicle_cost_per_km
+ collection_stop_count * optimized_handling_cost_per_collection_stop
+ dispatch_cost_per_route

cost_reduction_percent = (baseline_cost - optimized_cost) / baseline_cost * 100
distance_reduction_percent = (baseline_distance - optimized_distance) / baseline_distance * 100
```

Exact demo calculation:

```text
baseline_cost = 142 * 1.6 + 4 * 15 + 25 = 312.2, display as AUD 312
optimized_cost = 102 * 1.6 + 4 * 6 + 25 = 212.2, display as AUD 212
cost_reduction = 32.1%
distance_reduction = 28.2%
```

### Base44 Animation Behavior

Use a timed simulation rather than real GPS.

Animation requirements:

- When the user clicks `Run live demo`, both trucks start moving.
- The red truck follows the baseline route.
- The green truck follows the optimized route.
- Graph values update every animation tick.
- The green line should finish earlier or at lower cost.
- The final comparison card appears or updates when animation completes.
- The animation must be deterministic and replayable.
- The red route should visibly look less direct.
- The green route should visibly group nearby sites better.

If route polyline animation is hard in Base44, approximate it by moving truck markers between stop coordinates at each tick.

Exact final comparison copy:

```text
SolarCycle AI reduced logistics cost by 32% and route distance by 28% while collecting the same 1,980 kg of recyclable solar assets.
```

### Base44 Visual Style

Use a clean operational dashboard style:

- White or very light background.
- Dark text.
- Red for baseline/current problem.
- Green for optimized solution.
- Amber for warning or likely breaking.
- Blue or neutral gray for normal infrastructure.
- Avoid decorative hero sections.
- Avoid long paragraphs in the app UI.

### Base44 Acceptance Criteria

The app is acceptable if:

- A judge can understand the problem within 10 seconds.
- The UI explicitly says which assets are likely breaking.
- The UI forecasts when assets are expected to expire.
- The demo compares existing baseline logistics against optimized logistics.
- Two trucks animate on one shared map.
- Two live graphs update during the animation.
- The final result clearly shows lower cost and shorter distance for the optimized solution.
- The final demo result is approximately 32% lower logistics cost and 28% shorter route distance.
- A passport event is shown after collection is scheduled.

### Frontend

- React or Next.js
- Tailwind CSS
- ECharts or Chart.js
- Leaflet or Mapbox GL JS

### Backend

- Python FastAPI or Node.js API
- CSV/JSON for hackathon MVP data storage
- SQLite or PostgreSQL as a stretch goal

### AI and Optimization

- Python
- pandas
- numpy
- scikit-learn
- PuLP, Pyomo, or OR-Tools as stretch goal
- OpenRouteService for road distance matrix

## 12. Team Split

### Person 1: Frontend and Visualization

Responsibilities:

- Build the one-page problem and solution intro
- Build the hypothetical test explanation view
- Build the comparison demo view
- Build dashboard UI
- Build health charts
- Build breaking-risk alert UI
- Build end-of-life forecast display
- Build logistics map
- Show optimized routes
- Animate baseline and optimized trucks on the map
- Build two live comparison graphs
- Show digital passport detail view

Inputs:

- `asset_passport.csv`
- `inverter_health_data.csv`
- `collection_points.csv`
- `logistics_nodes.csv`
- `optimized_routes.json`

### Person 2: AI and Optimization

Responsibilities:

- Implement risk scoring
- Implement breaking-risk classification
- Implement end-of-life forecast logic
- Generate AI prediction output
- Implement route optimization
- Implement baseline route simulation
- Produce side-by-side cost and distance comparison data
- Integrate OpenRouteService matrix
- Implement Haversine fallback

Inputs:

- `inverter_health_data.csv`
- `collection_points.csv`
- `logistics_nodes.csv`
- `vehicles.csv`

Outputs:

- AI prediction JSON
- End-of-life forecast CSV or JSON
- Updated collection point statuses
- `optimized_routes.json`
- `baseline_routes.json`
- `route_comparison.json`

### Person 3: Data Collection and Preparation

Responsibilities:

- Collect public Victorian solar and waste datasets
- Create mock collection points for selected councils
- Create asset passport mock data
- Add installation dates and expected lifespan assumptions
- Create synthetic inverter health data if needed
- Create baseline cost assumptions for the existing collection approach
- Normalize all CSV files

Outputs:

- `asset_passport.csv`
- `inverter_health_data.csv`
- `collection_points.csv`
- `logistics_nodes.csv`
- `vehicles.csv`

## 13. Demo Script

1. Open the problem intro page.
2. Explain the current problem: operators often do not know a panel or inverter is breaking early enough, collection is reactive, and transport cost is high.
3. Show the proposed solution pipeline: health data, breaking-risk warning, end-of-life forecast, collection demand, route optimization, passport event log.
4. Open the hypothetical test page.
5. Explain the experiment: same demand, same vehicles, same recycling centers, baseline route versus optimized route.
6. Start the demo simulation.
7. Show two trucks moving on the map at the same time.
8. Show graph 1 updating cumulative cost for baseline versus optimized route.
9. Show graph 2 updating cumulative distance or collected mass for baseline versus optimized route.
10. End with the comparison card: cost reduction, distance reduction, collected mass, and vehicle utilization.
11. Open one asset passport and show that `collection_scheduled` was appended to the lifecycle event log.

## 14. Success Criteria

The MVP is successful if it can:

- Explain the problem and solution clearly on the first page.
- Show how the solution would be tested hypothetically.
- Load realistic Victoria-based solar and logistics data.
- Display health telemetry for assets.
- Produce a risk score for each monitored asset.
- Tell the user when a solar panel or inverter is likely breaking.
- Forecast when panels and inverters are likely to reach end-of-life.
- Convert high-risk assets into collection demand.
- Optimize at least one vehicle route with capacity constraints.
- Generate a baseline route for comparison.
- Display the optimized route on a map.
- Animate baseline and optimized trucks on the map.
- Show two live comparison graphs during the route simulation.
- Calculate cost and distance improvement versus the existing approach.
- Show a digital passport and append-only event history.

## 15. Open Questions

These decisions can be finalized during implementation:

- Should the MVP model assets mostly as panels, inverters, or site-level bundles?
- Which exact recycling facilities should be treated as solar-capable in the demo?
- Should route optimization end at a recycling center or return to depot?
- Should the frontend consume CSV files directly or call a backend API?
- Should the demo use real OpenRouteService road distances or fallback distances by default?
- Should the map use one shared panel with two truck overlays or two synchronized map panels?
- Should the second comparison graph show cumulative distance or cumulative collected mass?
- Should panel expiry be shown as a specific date, year range, or urgency category?

## 16. Current Decisions

- Use Victoria as the geographic scope.
- Narrow the MVP to Melbourne west and north councils.
- Use collection site as the logistics granularity.
- Use per-asset digital passports.
- Use rule-based predictive risk scoring for MVP.
- Add end-of-life forecasting based on installation date, expected lifespan, state of health, and degradation rate.
- UI must explicitly tell users when a solar panel or inverter is likely breaking.
- Treat ML model training as a stretch goal.
- Implement real route optimization, not just map visualization.
- Use OpenRouteService as the primary distance matrix provider.
- Use Haversine as the offline fallback.
- Do not implement real blockchain in the MVP.
- Use append-only hashed event logs for traceability.
- UI must first show the problem, then the solution, then the hypothetical test, then the live demo.
- Demo must compare the existing baseline route against the optimized route.
- Demo must include animated trucks on the map.
- Demo must include two live comparison graphs.
- The product claim is that the proposed solution is superior because it reduces logistics cost and distance for the same collection demand.
