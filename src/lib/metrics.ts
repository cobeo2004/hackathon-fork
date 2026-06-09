// Derived dashboard metrics, computed from the demo data (not hard-coded) so the
// numbers stay consistent with whatever is shown on the map.
//
// PROVENANCE NOTE:
//   All aggregate counts (likelyBreakingCount, expiringWithin5Count, etc.) and
//   recyclableMassKg are derived from demo_site_scenario fields (risk_score, status,
//   total_mass_kg, estimated_end_of_life_window) — these are illustrative assumptions,
//   not directly verified by public datasets.
//   CER postcode-level install counts (postcode_installs, eol_cohort) are genuine
//   government data but are per-postcode totals — they do not identify specific
//   failing sites.

import { SITES } from "../data/demo";
import { buildComparison } from "./cost";

const CURRENT_YEAR = 2026;

function windowStartYear(window: string): number {
  return parseInt(window.split("-")[0], 10);
}

export function dashboardMetrics() {
  // All filters below use demo_site_scenario fields (illustrative assumptions).
  const likelyBreaking = SITES.filter(
    (s) => s.breaking_risk === "likely_breaking" || s.breaking_risk === "urgent",
  );
  const expiringWithin5 = SITES.filter(
    (s) => windowStartYear(s.estimated_end_of_life_window) <= CURRENT_YEAR + 5,
  );
  const readyForCollection = SITES.filter((s) => s.status === "ready_for_collection");
  // Use eol_mass_kg_estimate (generated) when available — actual kg vs the routing proxy count.
  const recyclableMassKg = readyForCollection.reduce(
    (sum, s) => sum + (s.eol_mass_kg_estimate ?? s.total_mass_kg),
    0,
  );
  const comparison = buildComparison(readyForCollection.length);

  return {
    totalSites: SITES.length,
    likelyBreakingCount: likelyBreaking.length,
    expiringWithin5Count: expiringWithin5.length,
    readyForCollectionCount: readyForCollection.length,
    recyclableMassKg,
    comparison,
    // Provenance labels for any UI that surfaces these numbers.
    fieldProvenance: {
      totalSites: "demo_scenario",
      likelyBreakingCount: "demo_scenario",
      expiringWithin5Count: "demo_scenario",
      readyForCollectionCount: "demo_scenario",
      recyclableMassKg: "demo_scenario",
    } as const,
  };
}
