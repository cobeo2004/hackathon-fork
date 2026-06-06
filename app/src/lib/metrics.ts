// Derived dashboard metrics, computed from the demo data (not hard-coded) so the
// numbers stay consistent with whatever is shown on the map.

import { SITES } from "../data/demo";
import { buildComparison } from "./cost";

const CURRENT_YEAR = 2026;

function windowStartYear(window: string): number {
  return parseInt(window.split("-")[0], 10);
}

export function dashboardMetrics() {
  const likelyBreaking = SITES.filter(
    (s) => s.breaking_risk === "likely_breaking" || s.breaking_risk === "urgent",
  );
  const expiringWithin5 = SITES.filter(
    (s) => windowStartYear(s.estimated_end_of_life_window) <= CURRENT_YEAR + 5,
  );
  const readyForCollection = SITES.filter((s) => s.status === "ready_for_collection");
  const recyclableMassKg = readyForCollection.reduce((sum, s) => sum + s.total_mass_kg, 0);
  const comparison = buildComparison(readyForCollection.length);

  return {
    totalSites: SITES.length,
    likelyBreakingCount: likelyBreaking.length,
    expiringWithin5Count: expiringWithin5.length,
    readyForCollectionCount: readyForCollection.length,
    recyclableMassKg,
    comparison,
  };
}
