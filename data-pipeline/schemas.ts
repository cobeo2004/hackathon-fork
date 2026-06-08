// Normalized output schemas for SolarCycle AI Phase 1 public data pipeline.
// Mirrors the data model in design.md §5, with extra provenance columns on
// every record as required by §8.4.

export interface SourceRecord {
  source_id: string;
  name: string;
  url: string;
  publisher: string;
  license: string;
  retrieved_at: string;
  file_path: string;
  coverage_start: string;
  coverage_end: string;
  notes: string;
}

// Demand node at postcode, LGA, or modelled-cluster granularity.
// Public data populates postcode and lga types only.
// modelled_cluster must be flagged as derived.
//
// AGGREGATION RULES — read before summing installed_system_count:
//   CER rows  (count_role = "total_installation_base")    → postcode-level totals since 2001
//   SolarVic rows (count_role = "program_subsidy_subset") → Solar Homes program rebates only
//   These two sources OVERLAP. Never sum across both count_roles for the same geography.
//   Always group by area_type AND source_ids AND count_role before aggregating.
export interface SolarAreaNode {
  solar_area_id: string;
  area_type: string;          // postcode | lga | modelled_cluster
  postcode: string;
  lga: string;
  centroid_lat: string;       // populated in Phase 2 spatial join
  centroid_lon: string;
  installed_system_count: string;
  installed_capacity_kw: string;   // empty when source provides counts only
  estimated_panel_count: string;   // populated when product mix available
  estimated_inverter_count: string;
  estimated_mass_kg: string;
  install_period_start: string;
  install_period_end: string;
  // count_role: how this count should be used in demand modelling.
  //   total_installation_base        — CER: cumulative total; use as primary demand signal
  //   program_subsidy_subset         — SolarVic: program-rebated subset; use for proportional
  //                                    product-mix allocation only, NOT as additive demand
  count_role: string;
  // count_granularity: the time grain of installed_system_count.
  //   monthly_aggregated_total        — CER: sum of monthly columns → postcode lifetime total
  //   period_cumulative_program_count — SolarVic LGA: cumulative since program start
  count_granularity: string;
  source_ids: string;
  data_confidence: string;    // observed_aggregate | estimated | placeholder
  source_url: string;         // provenance
  derivation_method: string;  // provenance
}

export interface ProductMixRecord {
  product_mix_id: string;
  // area_id MUST remain empty unless populated via an explicit allocation table that
  // records the method (e.g. allocated_by_lga_install_share). Never infer from context.
  area_id: string;
  product_type: string;       // pv_module | inverter | battery
  manufacturer: string;
  model: string;
  capacity_w: string;
  count: string;
  install_quarter: string;
  // area_allocation_method describes how area_id was assigned.
  //   not_allocated                — default; product mix is statewide/program-level only
  //   allocated_by_lga_install_share — Phase 2: proportioned by SolarVic LGA share
  area_allocation_method: string;
  // count_granularity: the time grain of count.
  //   quarterly_program_count — Solar Victoria: rebate counts per quarter
  count_granularity: string;
  source_id: string;
  source_url: string;
  data_confidence: string;
  derivation_method: string;
}

export interface FacilityNode {
  facility_id: string;
  name: string;
  facility_type: string;
  infrastructure_type: string;
  owner: string;
  address: string;
  suburb: string;
  lga: string;
  lat: string;
  lon: string;
  accepted_materials: string;
  capacity_kg_per_day: string;
  capacity_source: string;
  capacity_confidence: string;  // observed | inferred | unknown
  source_id: string;
  source_url: string;
  data_confidence: string;
  derivation_method: string;
}

export const SOURCE_REGISTRY_HEADERS: (keyof SourceRecord)[] = [
  'source_id', 'name', 'url', 'publisher', 'license', 'retrieved_at',
  'file_path', 'coverage_start', 'coverage_end', 'notes',
];

export const SOLAR_AREA_NODE_HEADERS: (keyof SolarAreaNode)[] = [
  'solar_area_id', 'area_type', 'postcode', 'lga', 'centroid_lat', 'centroid_lon',
  'installed_system_count', 'installed_capacity_kw', 'estimated_panel_count',
  'estimated_inverter_count', 'estimated_mass_kg', 'install_period_start',
  'install_period_end', 'count_role', 'count_granularity',
  'source_ids', 'data_confidence', 'source_url', 'derivation_method',
];

export const PRODUCT_MIX_HEADERS: (keyof ProductMixRecord)[] = [
  'product_mix_id', 'area_id', 'product_type', 'manufacturer', 'model',
  'capacity_w', 'count', 'install_quarter', 'area_allocation_method', 'count_granularity',
  'source_id', 'source_url', 'data_confidence', 'derivation_method',
];

export const FACILITY_NODE_HEADERS: (keyof FacilityNode)[] = [
  'facility_id', 'name', 'facility_type', 'infrastructure_type', 'owner',
  'address', 'suburb', 'lga', 'lat', 'lon', 'accepted_materials',
  'capacity_kg_per_day', 'capacity_source', 'capacity_confidence',
  'source_id', 'source_url', 'data_confidence', 'derivation_method',
];
