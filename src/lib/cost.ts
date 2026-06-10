// Logistics cost model and baseline-vs-optimized comparison.

import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE } from "../data/demo";
import type { Route } from "../data/types";

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
  baselineCollectionStops: number;
  optimizedCollectionStops: number;
  baselineUniquePostcodes: number;
  optimizedUniquePostcodes: number;
  baselineDuplicatePostcodeStops: number;
  optimizedDuplicatePostcodeStops: number;
  baselineDispatches: number;
  optimizedDispatches: number;
}

export function collectionStopAudit(route: Pick<Route, "stops">) {
  const collectionStops = route.stops.filter((s) => s.startsWith("POA_"));
  const uniquePostcodes = new Set(collectionStops);
  return {
    collectionStops: collectionStops.length,
    uniquePostcodes: uniquePostcodes.size,
    duplicatePostcodeStops: collectionStops.length - uniquePostcodes.size,
  };
}

export function dispatchCount(route: Pick<Route, "stops">): number {
  return 1 + route.stops.filter((s, i) => s === "DEPOT_1" && i > 0).length;
}

/** Full headline comparison derived from the canonical route constants. */
export function buildComparison(): Comparison {
  const baselineDistance = BASELINE_ROUTE.total_distance_km;
  const optimizedDistance = OPTIMIZED_ROUTE.total_distance_km;
  const baselineAudit = collectionStopAudit(BASELINE_ROUTE);
  const optimizedAudit = collectionStopAudit(OPTIMIZED_ROUTE);
  const baselineTrips = dispatchCount(BASELINE_ROUTE);
  const optimizedTrips = dispatchCount(OPTIMIZED_ROUTE);
  const baselineCost = routeCost({
    distance_km: baselineDistance,
    duration_min: (baselineDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: baselineAudit.collectionStops,
    handling_per_stop: COSTS.baseline_handling_per_stop,
    dispatch_count: baselineTrips,
  });
  const optimizedCost = routeCost({
    distance_km: optimizedDistance,
    duration_min: (optimizedDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: optimizedAudit.collectionStops,
    handling_per_stop: COSTS.optimized_handling_per_stop,
    dispatch_count: optimizedTrips,
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
    baselineCollectionStops: baselineAudit.collectionStops,
    optimizedCollectionStops: optimizedAudit.collectionStops,
    baselineUniquePostcodes: baselineAudit.uniquePostcodes,
    optimizedUniquePostcodes: optimizedAudit.uniquePostcodes,
    baselineDuplicatePostcodeStops: baselineAudit.duplicatePostcodeStops,
    optimizedDuplicatePostcodeStops: optimizedAudit.duplicatePostcodeStops,
    baselineDispatches: baselineTrips,
    optimizedDispatches: optimizedTrips,
  };
}
