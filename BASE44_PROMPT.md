# Base44 Prompt: SolarCycle AI

Build a polished hackathon demo app called **SolarCycle AI**.

Tagline:

```text
Predict failures. Plan collections. Recover value.
```

Positioning:

```text
Predict solar failures. Plan recycling routes. Close the loop.
```

Create a single-page dashboard experience with four sections:

```text
Problem -> Solution -> Test -> Live Demo
```

Use a clean operational dashboard style, not a marketing landing page.

## Core Story

Solar panels and inverters are aging, but collection and recycling logistics are reactive. Operators often do not know which assets are likely breaking until performance drops or failure happens. SolarCycle AI predicts breaking risk, forecasts end-of-life demand, and optimizes truck routes for recycling collection.

## Required Pages

### 1. Problem

Show:

- Title: `Solar assets are aging faster than recovery logistics can react`
- Subtitle: `We predict which assets are breaking, forecast end-of-life demand, and optimize recycling collection routes.`
- Map preview of Melbourne west and north with high-risk sites.
- KPI cards:
  - `Assets likely breaking now`
  - `Assets expiring within 5 years`
  - `Estimated recyclable mass`
  - `Baseline logistics cost`
- Button: `See the solution`

### 2. Solution

Show this pipeline:

```text
Health telemetry -> Breaking-risk alert -> End-of-life forecast -> Collection demand -> Optimized route -> Passport event
```

Show one selected site with:

- site name
- LGA
- risk score
- breaking-risk status
- end-of-life window
- estimated recyclable mass
- health chart
- passport event preview

Button: `Test the hypothesis`

### 3. Test

Show hypothesis:

```text
If high-risk solar assets are predicted before failure and grouped into optimized collection routes, total logistics cost and route distance will be lower than reactive collection.
```

Show the comparison:

- Baseline: `Current reactive collection`
- Optimized: `SolarCycle AI optimized route`
- Same sites
- Same vehicle
- Same recycling center
- Same collected mass
- Different routing strategy

Button: `Run live demo`

### 4. Live Demo

This is the main screen.

Show one shared map with:

- Red truck = current reactive collection
- Green truck = SolarCycle AI optimized route
- Same collection points
- Same recycling center
- Animated truck movement
- Replay button

Show two live graphs:

- cumulative cost: baseline vs optimized
- cumulative distance: baseline vs optimized

Show final comparison card:

```text
SolarCycle AI reduced logistics cost by 32% and route distance by 28% while collecting the same 1,980 kg of recyclable solar assets.
```

## Fixed Demo Numbers

Use these exact final values:

```text
Baseline distance: 142 km
Optimized distance: 102 km
Distance reduction: 28.2%

Baseline cost: AUD 312
Optimized cost: AUD 212
Cost reduction: 32.1%

Collected mass: 1,980 kg for both routes
Vehicle capacity: 2,500 kg
```

Cost assumptions:

```text
vehicle_cost_per_km = AUD 1.60
baseline_handling_cost_per_collection_stop = AUD 15
optimized_handling_cost_per_collection_stop = AUD 6
dispatch_cost_per_route = AUD 25
```

Cost calculation:

```text
baseline_cost = 142 * 1.6 + 4 * 15 + 25 = AUD 312
optimized_cost = 102 * 1.6 + 4 * 6 + 25 = AUD 212
```

## Mock Sites

Use these map points:

```json
[
  {"site_id":"SITE_001","site_name":"Wyndham Rooftop Cluster","lga":"Wyndham","lat":-37.8500,"lon":144.6900,"total_mass_kg":620,"risk_score":0.87,"breaking_risk":"likely_breaking","estimated_end_of_life_window":"2029-2031","status":"ready_for_collection"},
  {"site_id":"SITE_002","site_name":"Melton Residential Solar Group","lga":"Melton","lat":-37.6830,"lon":144.5830,"total_mass_kg":410,"risk_score":0.58,"breaking_risk":"watch","estimated_end_of_life_window":"2031-2033","status":"forecasted"},
  {"site_id":"SITE_003","site_name":"Brimbank Commercial Rooftop","lga":"Brimbank","lat":-37.7820,"lon":144.8320,"total_mass_kg":530,"risk_score":0.82,"breaking_risk":"likely_breaking","estimated_end_of_life_window":"2028-2030","status":"ready_for_collection"},
  {"site_id":"SITE_004","site_name":"Hume Industrial Solar Site","lga":"Hume","lat":-37.6400,"lon":144.9500,"total_mass_kg":470,"risk_score":0.91,"breaking_risk":"urgent","estimated_end_of_life_window":"2027-2029","status":"ready_for_collection"},
  {"site_id":"SITE_005","site_name":"Whittlesea Community Solar","lga":"Whittlesea","lat":-37.5950,"lon":145.1000,"total_mass_kg":360,"risk_score":0.49,"breaking_risk":"watch","estimated_end_of_life_window":"2032-2034","status":"monitoring"},
  {"site_id":"SITE_006","site_name":"Merri-bek Apartment Solar","lga":"Merri-bek","lat":-37.7350,"lon":144.9600,"total_mass_kg":360,"risk_score":0.76,"breaking_risk":"likely_breaking","estimated_end_of_life_window":"2029-2031","status":"ready_for_collection"},
  {"site_id":"SITE_007","site_name":"Darebin School Solar","lga":"Darebin","lat":-37.7400,"lon":145.0100,"total_mass_kg":300,"risk_score":0.35,"breaking_risk":"normal","estimated_end_of_life_window":"2034-2036","status":"active"},
  {"site_id":"SITE_008","site_name":"Moonee Valley Retail Solar","lga":"Moonee Valley","lat":-37.7650,"lon":144.9200,"total_mass_kg":450,"risk_score":0.62,"breaking_risk":"watch","estimated_end_of_life_window":"2030-2032","status":"forecasted"},
  {"site_id":"SITE_009","site_name":"Maribyrnong Warehouse Solar","lga":"Maribyrnong","lat":-37.8050,"lon":144.8850,"total_mass_kg":490,"risk_score":0.66,"breaking_risk":"watch","estimated_end_of_life_window":"2030-2032","status":"forecasted"}
]
```

Logistics nodes:

```json
[
  {"node_id":"DEPOT_1","node_type":"depot","name":"Western Collection Depot","lat":-37.7350,"lon":144.8000},
  {"node_id":"RC_001","node_type":"recycling_center","name":"Northern Solar Recovery Centre","lat":-37.6900,"lon":144.9700,"capacity_kg_per_day":5000}
]
```

Routes:

```json
[
  {
    "route_id": "BASELINE_001",
    "label": "Current reactive collection",
    "color": "red",
    "total_distance_km": 142,
    "total_cost_aud": 312,
    "collected_mass_kg": 1980,
    "stops": ["DEPOT_1", "SITE_004", "SITE_001", "SITE_006", "SITE_003", "RC_001"]
  },
  {
    "route_id": "OPTIMIZED_001",
    "label": "SolarCycle AI optimized route",
    "color": "green",
    "total_distance_km": 102,
    "total_cost_aud": 212,
    "collected_mass_kg": 1980,
    "stops": ["DEPOT_1", "SITE_001", "SITE_003", "SITE_006", "SITE_004", "RC_001"]
  }
]
```

## Interaction Rules

- The demo must be deterministic.
- Do not randomize final results.
- Both trucks start when the user clicks `Run live demo`.
- Red truck should visibly follow a less efficient route.
- Green truck should visibly group sites better.
- Graphs update while trucks move.
- The final comparison card appears after the animation completes.
- Include a small asset passport drawer showing `collection_scheduled` after optimization.

## Visual Style

- Light background.
- Red for baseline/current reactive collection.
- Green for optimized SolarCycle AI route.
- Amber for likely breaking or urgent warnings.
- Blue or gray for neutral infrastructure.
- Compact operational dashboard layout.
- Avoid long paragraphs.
