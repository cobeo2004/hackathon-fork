import { useEffect, useMemo, useState } from "react";
import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE } from "../data/demo";
import { collectionStopAudit, dispatchCount, routeCost } from "../lib/cost";
import { optimizedRoute } from "../lib/optimizer";
import {
  fallbackRoadRoute,
  fetchOsrmRoadRoute,
  type RoadRoute,
} from "../lib/roadRouting";

type Status = "loading" | "ready" | "fallback";

export interface RoadRoutesState {
  status: Status;
  error?: string;
  baseline: RoadRoute;
  optimized: RoadRoute;
  optimizedScores: ReturnType<typeof optimizedRoute>["scores"];
  comparison: {
    baselineDistance: number;
    optimizedDistance: number;
    baselineCost: number;
    optimizedCost: number;
    distanceReductionPct: number;
    costReductionPct: number;
    collectedMassKg: number;
    baselineCollectionStops: number;
    optimizedCollectionStops: number;
    baselineUniquePostcodes: number;
    optimizedUniquePostcodes: number;
    baselineDuplicatePostcodeStops: number;
    optimizedDuplicatePostcodeStops: number;
    baselineDispatches: number;
    optimizedDispatches: number;
  };
}

function comparisonFor(baseline: RoadRoute, optimized: RoadRoute): RoadRoutesState["comparison"] {
  // Recompute costs with OSRM distances; stop counts and dispatch counts mirror
  // the canonical route structure (same logic as buildComparison in cost.ts).
  const baselineAudit = collectionStopAudit(BASELINE_ROUTE);
  const optimizedAudit = collectionStopAudit(OPTIMIZED_ROUTE);
  const baselineTrips = dispatchCount(BASELINE_ROUTE);
  const optimizedTrips = dispatchCount(OPTIMIZED_ROUTE);

  const baselineCost = routeCost({
    distance_km: baseline.distanceKm,
    duration_min: baseline.durationMin ?? (baseline.distanceKm / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: baselineAudit.collectionStops,
    handling_per_stop: COSTS.baseline_handling_per_stop,
    dispatch_count: baselineTrips,
  });
  const optimizedCost = routeCost({
    distance_km: optimized.distanceKm,
    duration_min: optimized.durationMin ?? (optimized.distanceKm / COSTS.fallback_average_speed_kmh) * 60,
    collection_stops: optimizedAudit.collectionStops,
    handling_per_stop: COSTS.optimized_handling_per_stop,
    dispatch_count: optimizedTrips,
  });

  return {
    baselineDistance: baseline.distanceKm,
    optimizedDistance: optimized.distanceKm,
    baselineCost,
    optimizedCost,
    distanceReductionPct:
      baseline.distanceKm > 0
        ? ((baseline.distanceKm - optimized.distanceKm) / baseline.distanceKm) * 100
        : 0,
    costReductionPct:
      baselineCost > 0 ? ((baselineCost - optimizedCost) / baselineCost) * 100 : 0,
    collectedMassKg: OPTIMIZED_ROUTE.collected_mass_kg,
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

export function useRoadRoutes(): RoadRoutesState {
  const optimized = useMemo(() => optimizedRoute(), []);
  const fallbackBaseline = useMemo(() => fallbackRoadRoute(BASELINE_ROUTE), []);
  const fallbackOptimized = useMemo(
    () =>
      fallbackRoadRoute({
        stops: optimized.stops,
        total_distance_km: OPTIMIZED_ROUTE.total_distance_km,
      }),
    [optimized.stops],
  );

  const [state, setState] = useState<Pick<RoadRoutesState, "status" | "error" | "baseline" | "optimized">>({
    status: "loading",
    baseline: fallbackBaseline,
    optimized: fallbackOptimized,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [baselineRoad, optimizedRoad] = await Promise.all([
          fetchOsrmRoadRoute(BASELINE_ROUTE.stops, controller.signal),
          fetchOsrmRoadRoute(optimized.stops, controller.signal),
        ]);
        setState({
          status: "ready",
          baseline: baselineRoad,
          optimized: optimizedRoad,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: "fallback",
          error: err instanceof Error ? err.message : "Road routing unavailable",
          baseline: fallbackBaseline,
          optimized: fallbackOptimized,
        });
      }
    }

    load();
    return () => controller.abort();
  }, [fallbackBaseline, fallbackOptimized, optimized.stops]);

  return {
    ...state,
    optimizedScores: optimized.scores,
    comparison: comparisonFor(state.baseline, state.optimized),
  };
}
