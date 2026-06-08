// Fixed, deterministic demo dataset.
//
// The demo map no longer invents exact failing rooftop/site locations. It uses:
// - real CER postcode install totals and pre-2011 end-of-life cohort counts;
// - ABS ASGS 2021 Postal Area centroid approximations for postcode demand dots;
// - publicly listed solar PV recycler/drop-point locations.
//
// Capacity-constrained facility routing is not claimed because per-facility solar
// PV throughput is not public.

import { CER_EOL_COHORT_PRE2011, CER_INSTALLS, CER_TOTAL_EOL_COHORT } from "./cer";
import type { LogisticsNode, Route, Site, Vehicle } from "./types";

export const DEMO_FIELD_PROVENANCE = {
  real_postcode_context: {
    fields: ["postcode", "asset_count", "postcode_installs", "eol_cohort"] as const,
    source: "CER" as const,
    label: "CER postcode context",
  },
  poa_centroid: {
    fields: ["lat", "lon"] as const,
    source: "ABS_ASGS_2021_POA" as const,
    label: "ABS postcode-area centroid",
  },
  pv_recycler_drop_point: {
    fields: ["name", "address", "operator", "source"] as const,
    source: "Solar Victoria / recycler public pages" as const,
    label: "Verified solar PV recycler/drop point",
  },
} as const;

type SiteBase = Omit<Site, "asset_count" | "postcode_installs" | "eol_cohort">;

function priority(postcode: string): number {
  const installs = CER_INSTALLS[postcode] ?? 0;
  const eol = CER_EOL_COHORT_PRE2011[postcode] ?? 0;
  const installScore = installs / Math.max(...Object.values(CER_INSTALLS));
  const eolScore = eol / Math.max(...Object.values(CER_EOL_COHORT_PRE2011));
  return Math.round((0.55 * installScore + 0.45 * eolScore) * 100) / 100;
}

function riskFromPriority(score: number): Site["breaking_risk"] {
  if (score >= 0.8) return "urgent";
  if (score >= 0.55) return "likely_breaking";
  if (score >= 0.25) return "watch";
  return "normal";
}

function demandArea(
  postcode: string,
  lga: string,
  lat: number,
  lon: number,
): SiteBase {
  const score = priority(postcode);
  return {
    site_id: `POA_${postcode}`,
    site_name: `Postcode ${postcode} solar demand area`,
    lga,
    postcode,
    lat,
    lon,
    // Internal route-priority quantity. Unit is pre-2011 CER systems, not kg.
    total_mass_kg: CER_EOL_COHORT_PRE2011[postcode] ?? 0,
    risk_score: score,
    breaking_risk: riskFromPriority(score),
    estimated_end_of_life_window: "2026-2035",
    status: "ready_for_collection",
  };
}

const SITE_BASE: SiteBase[] = [
  demandArea("3029", "Wyndham", -37.843693, 144.673511),
  demandArea("3337", "Melton", -37.632468, 144.579487),
  demandArea("3020", "Brimbank", -37.77699, 144.833265),
  demandArea("3061", "Hume", -37.669281, 144.966936),
  demandArea("3752", "Whittlesea", -37.631755, 145.106495),
  demandArea("3058", "Merri-bek", -37.737658, 144.967496),
  demandArea("3072", "Darebin", -37.742253, 145.018659),
  demandArea("3039", "Moonee Valley", -37.763921, 144.920392),
  demandArea("3012", "Maribyrnong", -37.802392, 144.854727),
];

export const SITES: Site[] = SITE_BASE.map((s) => ({
  ...s,
  asset_count: CER_INSTALLS[s.postcode] ?? 0,
  postcode_installs: CER_INSTALLS[s.postcode],
  eol_cohort: CER_EOL_COHORT_PRE2011[s.postcode],
}));

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
    name: "Lotus Recycling Campbellfield",
    lat: -37.6745,
    lon: 144.946,
    address: "1/164-170 Barry Rd, Campbellfield VIC 3061",
    operator: "Lotus Recycling - solar panel and e-waste recycler",
    source: "https://www.lotusrecycling.com.au/recycling-services",
  },
  {
    node_id: "PV_DROP_LOTUS_DERRIMUT",
    node_type: "recycling_center",
    name: "Krannich Derrimut / Lotus drop point",
    lat: -37.8117,
    lon: 144.766,
    address: "122 Castro Way, Derrimut VIC 3026",
    operator: "Lotus Recycling drop point",
    source: "https://www.lotusrecycling.com.au/recycling-services",
  },
  {
    node_id: "PV_DROP_ELECSOME_KEYS",
    node_type: "recycling_center",
    name: "Elecsome Keysborough drop-off",
    lat: -37.9909,
    lon: 145.156,
    address: "67 Naxos Way, Keysborough VIC 3173",
    operator: "Elecsome solar panel recycling/upcycling",
    source: "https://elecsome.com/contact.php",
  },
  {
    node_id: "PV_DROP_SIRCEL_DANDENONG",
    node_type: "recycling_center",
    name: "Sircel Dandenong solar panel acceptance",
    lat: -38.026,
    lon: 145.207,
    address: "Dandenong South VIC",
    operator: "Sircel solar panel recycling",
    source: "https://sircel.com/services/solar-panel-recycling/",
  },
];

export const VEHICLE: Vehicle = {
  vehicle_id: "CAMPAIGN_001",
  name: "Collection Campaign 1",
  capacity_kg: 2500,
  cost_per_km: 1.6,
  max_route_km: 260,
};

export const COLLECTION_SITE_IDS = SITES.map((s) => s.site_id);

export const BASELINE_ROUTE: Route = {
  route_id: "BASELINE_001",
  label: "Current postcode-by-postcode planning",
  strategy: "baseline",
  color: "#dc2626",
  total_distance_km: 180,
  total_cost_aud: 420,
  collected_mass_kg: CER_TOTAL_EOL_COHORT,
  stops: [
    "DEPOT_1",
    "POA_3012",
    "POA_3020",
    "POA_3029",
    "POA_3039",
    "POA_3058",
    "POA_3061",
    "POA_3072",
    "POA_3337",
    "POA_3752",
    "RC_001",
  ],
};

export const OPTIMIZED_ROUTE: Route = {
  route_id: "OPTIMIZED_001",
  label: "SolarCycle AI campaign route",
  strategy: "optimized",
  color: "#2563eb",
  total_distance_km: 130,
  total_cost_aud: 300,
  collected_mass_kg: CER_TOTAL_EOL_COHORT,
  stops: [
    "DEPOT_1",
    "POA_3337",
    "POA_3029",
    "POA_3012",
    "POA_3020",
    "POA_3039",
    "POA_3058",
    "POA_3072",
    "POA_3061",
    "POA_3752",
    "RC_001",
  ],
};

export const COSTS = {
  vehicle_operating_cost_per_km: 0.95,
  driver_labour_cost_per_hour: 45,
  baseline_handling_per_stop: 15,
  optimized_handling_per_stop: 6,
  dispatch_per_route: 25,
  fallback_average_speed_kmh: 55,
};

export const POINTS_BY_ID: Record<string, { lat: number; lon: number; name: string }> =
  Object.fromEntries([
    ...SITES.map((s) => [s.site_id, { lat: s.lat, lon: s.lon, name: s.site_name }]),
    ...NODES.map((n) => [n.node_id, { lat: n.lat, lon: n.lon, name: n.name }]),
  ]);
