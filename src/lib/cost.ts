// Logistics cost model and baseline-vs-optimized comparison.

import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE } from "../data/demo";

export interface CostInputs {
  distance_km: number;
  duration_min: number;
  collection_stops: number;
  handling_per_stop: number;
  dispatch_count?: number; // defaults to 1; multi-trip reactive routes dispatch once per trip
}

/**
 * Estimated route operating cost.
 *
 * Vehicle operating cost bundles fuel, maintenance, tyres, depreciation, and
 * similar distance-linked assumptions. Driver labour is time-linked.
 */
export function routeCost(i: CostInputs): number {
  return (
    i.distance_km * COSTS.vehicle_operating_cost_per_km +
    (i.duration_min / 60) * COSTS.driver_labour_cost_per_hour +
    i.collection_stops * i.handling_per_stop +
    (i.dispatch_count ?? 1) * COSTS.dispatch_per_route
  );
}

export interface Comparison {
  baselineCost: number;
  optimizedCost: number;
  costReductionPct: number;
  baselineDistance: number;
  optimizedDistance: number;
  distanceReductionPct: number;
  collectedMassKg: number;
}

/** Full headline comparison derived from the canonical route constants. */
export function buildComparison(): Comparison {
  const baselineDistance = BASELINE_ROUTE.total_distance_km;
  const optimizedDistance = OPTIMIZED_ROUTE.total_distance_km;
  // Only POA_ stops are collection stops — depot returns and RC mid-route are not.
  const baselineCollectionStops = BASELINE_ROUTE.stops.filter((s) => s.startsWith("POA_")).length;
  const optimizedCollectionStops = OPTIMIZED_ROUTE.stops.filter((s) => s.startsWith("POA_")).length;
  // Each DEPOT_1 after index 0 is a new dispatch event.
  const baselineTrips =
    1 + BASELINE_ROUTE.stops.filter((s, i) => s === "DEPOT_1" && i > 0).length;
  const baselineCost = routeCost({
    distance_km: baselineDistance,
    duration_min: (baselineDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: baselineCollectionStops,
    handling_per_stop: COSTS.baseline_handling_per_stop,
    dispatch_count: baselineTrips,
  });
  const optimizedCost = routeCost({
    distance_km: optimizedDistance,
    duration_min: (optimizedDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: optimizedCollectionStops,
    handling_per_stop: COSTS.optimized_handling_per_stop,
    dispatch_count: 1,
  });

  return {
    baselineCost,
    optimizedCost,
    costReductionPct: ((baselineCost - optimizedCost) / baselineCost) * 100,
    baselineDistance,
    optimizedDistance,
    distanceReductionPct:
      ((baselineDistance - optimizedDistance) / baselineDistance) * 100,
    collectedMassKg: 1980,
  };
}
