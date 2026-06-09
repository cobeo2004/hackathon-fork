// Logistics cost model and baseline-vs-optimized comparison.

import { COSTS } from "../data/demo";

export interface CostInputs {
  distance_km: number;
  duration_min: number;
  collection_stops: number;
  handling_per_stop: number;
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
    COSTS.dispatch_per_route
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

/** Full headline comparison computed from the canonical demo inputs. */
export function buildComparison(collectionStops = 4): Comparison {
  const baselineDistance = 142;
  const optimizedDistance = 102;
  const baselineCost = routeCost({
    distance_km: baselineDistance,
    duration_min: (baselineDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: collectionStops,
    handling_per_stop: COSTS.baseline_handling_per_stop,
  });
  const optimizedCost = routeCost({
    distance_km: optimizedDistance,
    duration_min: (optimizedDistance / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: collectionStops,
    handling_per_stop: COSTS.optimized_handling_per_stop,
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
