// Logistics cost model and baseline-vs-optimized comparison.

import { COSTS } from "../data/demo";

export interface CostInputs {
  distance_km: number;
  collection_stops: number;
  handling_per_stop: number;
}

/** route_cost = distance*cost_per_km + stops*handling + dispatch */
export function routeCost(i: CostInputs): number {
  return (
    i.distance_km * COSTS.vehicle_cost_per_km +
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
    collection_stops: collectionStops,
    handling_per_stop: COSTS.baseline_handling_per_stop,
  });
  const optimizedCost = routeCost({
    distance_km: optimizedDistance,
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
