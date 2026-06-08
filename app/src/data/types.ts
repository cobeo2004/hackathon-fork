// Shared domain types for the SolarCycle AI demo.

export type BreakingRisk = "normal" | "watch" | "likely_breaking" | "urgent";

export type SiteStatus =
  | "active"
  | "monitoring"
  | "forecasted"
  | "ready_for_collection";

export interface Site {
  site_id: string;
  site_name: string;
  lga: string;
  postcode: string;
  lat: number;
  lon: number;
  asset_count: number;
  total_mass_kg: number;
  risk_score: number;
  breaking_risk: BreakingRisk;
  estimated_end_of_life_window: string;
  status: SiteStatus;
  /** Real cumulative rooftop-solar installs in this postcode (Clean Energy Regulator). */
  postcode_installs?: number;
  /** Real pre-2011 install cohort nearing 25-year end-of-life (CER). */
  eol_cohort?: number;
}

export type NodeType = "depot" | "recycling_center";

export interface LogisticsNode {
  node_id: string;
  node_type: NodeType;
  name: string;
  lat: number;
  lon: number;
  /** Illustrative throughput assumption — not sourced from a public dataset. */
  assumed_capacity_kg_per_day?: number;
  capacity_source?: string;
  /** Real-world facility details (used in map popups). */
  address?: string;
  operator?: string;
  source?: string;
}

export interface Vehicle {
  vehicle_id: string;
  name: string;
  capacity_kg: number;
  cost_per_km: number;
  max_route_km: number;
}

export interface Route {
  route_id: string;
  label: string;
  strategy: "baseline" | "optimized";
  color: string;
  total_distance_km: number;
  total_cost_aud: number;
  collected_mass_kg: number;
  stops: string[]; // node_id / site_id sequence
}

export interface HealthReading {
  timestamp: string;
  dc_voltage: number;
  ac_voltage: number;
  current: number;
  temperature_c: number;
  conversion_efficiency: number;
  power_factor: number;
  thd: number;
  risk_score: number;
}

export interface PassportEvent {
  event_id: string;
  asset_id: string;
  event_type: string;
  timestamp: string;
  actor: string;
  notes: string;
  previous_event_hash: string;
  event_hash: string;
}
