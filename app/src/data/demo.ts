// Fixed, deterministic demo dataset.
// Sourced directly from design.md / BASE44_PROMPT.md so the pitch numbers never drift.

import { CER_EOL_COHORT_PRE2011, CER_INSTALLS } from "./cer";
import type { LogisticsNode, Route, Site, Vehicle } from "./types";

// Per-site demo attributes (risk, mass, status, EOL window). The real rooftop-solar
// install count and end-of-life cohort are merged in from the Clean Energy Regulator
// dataset (see cer.ts), so `asset_count` and the EOL basis are genuine government data.
type SiteBase = Omit<Site, "asset_count" | "postcode_installs" | "eol_cohort">;

const SITE_BASE: SiteBase[] = [
  { site_id: "SITE_001", site_name: "Wyndham Rooftop Cluster", lga: "Wyndham", postcode: "3029", lat: -37.85, lon: 144.69, total_mass_kg: 620, risk_score: 0.87, breaking_risk: "likely_breaking", estimated_end_of_life_window: "2029-2031", status: "ready_for_collection" },
  { site_id: "SITE_002", site_name: "Melton Residential Solar Group", lga: "Melton", postcode: "3337", lat: -37.683, lon: 144.583, total_mass_kg: 410, risk_score: 0.58, breaking_risk: "watch", estimated_end_of_life_window: "2031-2033", status: "forecasted" },
  { site_id: "SITE_003", site_name: "Brimbank Commercial Rooftop", lga: "Brimbank", postcode: "3020", lat: -37.782, lon: 144.832, total_mass_kg: 530, risk_score: 0.82, breaking_risk: "likely_breaking", estimated_end_of_life_window: "2028-2030", status: "ready_for_collection" },
  { site_id: "SITE_004", site_name: "Hume Industrial Solar Site", lga: "Hume", postcode: "3061", lat: -37.64, lon: 144.95, total_mass_kg: 470, risk_score: 0.91, breaking_risk: "urgent", estimated_end_of_life_window: "2027-2029", status: "ready_for_collection" },
  { site_id: "SITE_005", site_name: "Whittlesea Community Solar", lga: "Whittlesea", postcode: "3752", lat: -37.595, lon: 145.1, total_mass_kg: 360, risk_score: 0.49, breaking_risk: "watch", estimated_end_of_life_window: "2032-2034", status: "monitoring" },
  { site_id: "SITE_006", site_name: "Merri-bek Apartment Solar", lga: "Merri-bek", postcode: "3058", lat: -37.735, lon: 144.96, total_mass_kg: 360, risk_score: 0.76, breaking_risk: "likely_breaking", estimated_end_of_life_window: "2029-2031", status: "ready_for_collection" },
  { site_id: "SITE_007", site_name: "Darebin School Solar", lga: "Darebin", postcode: "3072", lat: -37.74, lon: 145.01, total_mass_kg: 300, risk_score: 0.35, breaking_risk: "normal", estimated_end_of_life_window: "2034-2036", status: "active" },
  { site_id: "SITE_008", site_name: "Moonee Valley Retail Solar", lga: "Moonee Valley", postcode: "3039", lat: -37.765, lon: 144.92, total_mass_kg: 450, risk_score: 0.62, breaking_risk: "watch", estimated_end_of_life_window: "2030-2032", status: "forecasted" },
  { site_id: "SITE_009", site_name: "Maribyrnong Warehouse Solar", lga: "Maribyrnong", postcode: "3012", lat: -37.805, lon: 144.885, total_mass_kg: 490, risk_score: 0.66, breaking_risk: "watch", estimated_end_of_life_window: "2030-2032", status: "forecasted" },
];

export const SITES: Site[] = SITE_BASE.map((s) => ({
  ...s,
  // Real Clean Energy Regulator data for the postcode; fall back gracefully.
  asset_count: CER_INSTALLS[s.postcode] ?? 0,
  postcode_installs: CER_INSTALLS[s.postcode],
  eol_cohort: CER_EOL_COHORT_PRE2011[s.postcode],
}));

// Real Melbourne logistics nodes. Depot = Cleanaway (Australia's largest waste
// operator); recycling centre = Lotus Recycling (Australia's first solar-panel &
// e-waste recycler), which sits in Hume 3061 — the same postcode as SITE_004.
// Coordinates are suburb/street level; daily capacity for Lotus is an assumption.
export const NODES: LogisticsNode[] = [
  {
    node_id: "DEPOT_1",
    node_type: "depot",
    name: "Cleanaway Laverton MRF",
    lat: -37.8205,
    lon: 144.7975,
    address: "32 Gilbertson Rd, Laverton VIC 3026",
    operator: "Cleanaway (ASX:CWY)",
    source: "https://www.cleanaway.com.au/location/laverton-mrf",
  },
  {
    node_id: "RC_001",
    node_type: "recycling_center",
    name: "Lotus Recycling",
    lat: -37.6745,
    lon: 144.946,
    capacity_kg_per_day: 5000,
    address: "1/164-170 Barry Rd, Campbellfield VIC 3061",
    operator: "Lotus Recycling — Australia's first solar panel & e-waste recycler",
    source: "https://www.lotusrecycling.com.au/",
  },
];

export const VEHICLE: Vehicle = {
  vehicle_id: "TRUCK_001",
  name: "Collection Truck 1",
  capacity_kg: 2500,
  cost_per_km: 1.6,
  max_route_km: 220,
};

// The four ready_for_collection sites are the shared collection demand for both routes.
export const COLLECTION_SITE_IDS = ["SITE_001", "SITE_003", "SITE_004", "SITE_006"];

// Canonical demo routes. Distances/costs are pinned to the spec so the headline
// numbers are stable; the optimizer in lib/optimizer.ts independently re-derives
// an equivalent grouping to prove the optimization is real.
export const BASELINE_ROUTE: Route = {
  route_id: "BASELINE_001",
  label: "Current reactive collection",
  strategy: "baseline",
  color: "#dc2626",
  total_distance_km: 142,
  total_cost_aud: 312,
  collected_mass_kg: 1980,
  stops: ["DEPOT_1", "SITE_004", "SITE_001", "SITE_006", "SITE_003", "RC_001"],
};

export const OPTIMIZED_ROUTE: Route = {
  route_id: "OPTIMIZED_001",
  label: "SolarCycle AI optimized route",
  strategy: "optimized",
  color: "#2563eb",
  total_distance_km: 102,
  total_cost_aud: 212,
  collected_mass_kg: 1980,
  stops: ["DEPOT_1", "SITE_001", "SITE_003", "SITE_006", "SITE_004", "RC_001"],
};

// Cost assumptions (AUD).
export const COSTS = {
  vehicle_cost_per_km: 1.6,
  baseline_handling_per_stop: 15,
  optimized_handling_per_stop: 6,
  dispatch_per_route: 25,
};

// Lookup helper used across the map / simulation layers.
export const POINTS_BY_ID: Record<string, { lat: number; lon: number; name: string }> =
  Object.fromEntries([
    ...SITES.map((s) => [s.site_id, { lat: s.lat, lon: s.lon, name: s.site_name }]),
    ...NODES.map((n) => [n.node_id, { lat: n.lat, lon: n.lon, name: n.name }]),
  ]);
