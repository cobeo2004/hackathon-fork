import {
  CaretDown,
  CurrencyDollar,
  MapPin,
  Truck,
} from "@phosphor-icons/react/dist/ssr";
import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE, POINTS_BY_ID } from "~/data/demo";
import type { Route } from "~/data/types";
import type { Comparison } from "~/lib/cost";
import { collectionStopAudit, dispatchCount } from "~/lib/cost";
import type { RoadRoute } from "~/lib/roadRouting";

type TraceRoute = Pick<Route, "label" | "color" | "strategy"> & {
  stops: string[];
};

type CostBreakdown = {
  distanceCost: number;
  labourCost: number;
  handlingCost: number;
  dispatchCost: number;
  total: number;
  durationMin: number;
  handlingPerStop: number;
  dispatches: number;
  collectionStops: number;
  uniquePostcodes: number;
  duplicatePostcodeStops: number;
};

export function RouteTrace({
  comparison,
  baselineRoad,
  optimizedRoad,
}: {
  comparison: Comparison;
  baselineRoad: RoadRoute;
  optimizedRoad: RoadRoute;
}) {
  const baseline = buildTraceRoute(BASELINE_ROUTE, baselineRoad.stops);
  const optimized = buildTraceRoute(OPTIMIZED_ROUTE, optimizedRoad.stops);
  const baselineCost = costBreakdown(
    baseline,
    comparison.baselineDistance,
    baselineRoad.durationMin,
    COSTS.baseline_handling_per_stop,
  );
  const optimizedCost = costBreakdown(
    optimized,
    comparison.optimizedDistance,
    optimizedRoad.durationMin,
    COSTS.optimized_handling_per_stop,
  );

  return (
    <details className="group border-t border-line bg-paper/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 outline-none transition-colors hover:bg-line/20 focus-visible:ring-2 focus-visible:ring-recover/40 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            <Truck size={15} weight="fill" className="text-ink" />
            Route trace and cost ledger
          </div>
          <div className="mt-1 text-[13px] leading-snug text-ink/70">
            Open to see every stop, why red has extra trips, and how each cost is
            calculated.
          </div>
        </div>
        <CaretDown
          size={18}
          weight="bold"
          className="shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="grid gap-4 border-t border-line px-5 py-5 xl:grid-cols-2">
        <TracePanel
          title="Reactive red truck"
          route={baseline}
          distanceKm={comparison.baselineDistance}
          cost={baselineCost}
          groupedStops={splitDispatches(baseline.stops)}
          note="Four separate dispatches as faults arrive. Postcode pickups are not repeated; only depot and recycler returns repeat."
        />
        <TracePanel
          title="SolarCycle AI blue truck"
          route={optimized}
          distanceKm={comparison.optimizedDistance}
          cost={optimizedCost}
          groupedStops={[optimized.stops]}
          note="One planned campaign collects the same postcode demand areas once before going to the recycler."
        />
      </div>
    </details>
  );
}

function buildTraceRoute(route: Route, stops: string[]): TraceRoute {
  return {
    label: route.label,
    color: route.color,
    strategy: route.strategy,
    stops,
  };
}

function costBreakdown(
  route: TraceRoute,
  distanceKm: number,
  durationMin: number | undefined,
  handlingPerStop: number,
): CostBreakdown {
  const audit = collectionStopAudit(route);
  const dispatches = dispatchCount(route);
  const effectiveDurationMin =
    durationMin ?? (distanceKm / COSTS.fallback_average_speed_kmh) * 60;
  const distanceCost = distanceKm * COSTS.vehicle_operating_cost_per_km;
  const labourCost = (effectiveDurationMin / 60) * COSTS.driver_labour_cost_per_hour;
  const handlingCost = audit.collectionStops * handlingPerStop;
  const dispatchCost = dispatches * COSTS.dispatch_per_route;

  return {
    distanceCost,
    labourCost,
    handlingCost,
    dispatchCost,
    total: distanceCost + labourCost + handlingCost + dispatchCost,
    durationMin: effectiveDurationMin,
    handlingPerStop,
    dispatches,
    ...audit,
  };
}

function splitDispatches(stops: string[]): string[][] {
  const trips: string[][] = [];
  let current: string[] = [];

  for (const stop of stops) {
    if (stop === "DEPOT_1" && current.length > 0) {
      trips.push(current);
      current = [stop];
      continue;
    }
    current.push(stop);
  }

  if (current.length > 0) trips.push(current);
  return trips;
}

function TracePanel({
  title,
  route,
  distanceKm,
  cost,
  groupedStops,
  note,
}: {
  title: string;
  route: TraceRoute;
  distanceKm: number;
  cost: CostBreakdown;
  groupedStops: string[][];
  note: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-panel/80">
      <div
        className="border-b border-line px-4 py-3"
        style={{ borderTop: `3px solid ${route.color}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-lg font-extrabold leading-tight text-ink">
              {title}
            </div>
            <div className="mt-1 text-[12px] leading-snug text-muted">{route.label}</div>
          </div>
          <div className="shrink-0 rounded-md bg-paper px-2.5 py-1 text-right font-mono text-[11px] font-semibold tabular-nums text-ink">
            A${Math.round(cost.total)}
            <div className="text-[9px] uppercase tracking-[0.12em] text-muted">
              {distanceKm.toFixed(1)} km
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-md border border-line bg-paper/65 p-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            <MapPin size={13} weight="fill" style={{ color: route.color }} />
            Stop trace
          </div>
          <div className="space-y-2">
            {groupedStops.map((tripStops, index) => (
              <div key={`${route.strategy}-${index}`} className="min-w-0">
                <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {groupedStops.length > 1 ? `Trip ${index + 1}` : "Campaign"}
                </div>
                <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
                  {tripStops.map((stop, stopIndex) => (
                    <li key={`${stop}-${stopIndex}`} className="contents">
                      {stopIndex > 0 && (
                        <span className="text-[11px] text-muted" aria-hidden>
                          -&gt;
                        </span>
                      )}
                      <StopChip stop={stop} color={route.color} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <LedgerItem
            label="Distance"
            value={`A$${Math.round(cost.distanceCost)}`}
            formula={`${distanceKm.toFixed(1)} km x A$${COSTS.vehicle_operating_cost_per_km.toFixed(2)}/km`}
          />
          <LedgerItem
            label="Driver labour"
            value={`A$${Math.round(cost.labourCost)}`}
            formula={`${(cost.durationMin / 60).toFixed(1)} hr x A$${COSTS.driver_labour_cost_per_hour}/hr`}
          />
          <LedgerItem
            label="Handling"
            value={`A$${Math.round(cost.handlingCost)}`}
            formula={`${cost.collectionStops} pickups x A$${cost.handlingPerStop}/stop`}
          />
          <LedgerItem
            label="Dispatch"
            value={`A$${Math.round(cost.dispatchCost)}`}
            formula={`${cost.dispatches} dispatches x A$${COSTS.dispatch_per_route}`}
          />
        </div>

        <div className="rounded-md bg-paper/75 px-3 py-2 text-[12px] leading-relaxed text-ink/70">
          <strong className="font-semibold text-ink">
            {cost.uniquePostcodes} unique postcode pickups,{" "}
            {cost.duplicatePostcodeStops} duplicate postcode pickups.
          </strong>{" "}
          {note}
        </div>
      </div>
    </section>
  );
}

function StopChip({ stop, color }: { stop: string; color: string }) {
  const point = POINTS_BY_ID[stop];
  const isCollection = stop.startsWith("POA_");
  const label = isCollection ? stop.replace("POA_", "") : point?.name ?? stop;

  return (
    <span
      className="max-w-full rounded-md border border-line bg-panel px-2 py-1 font-mono text-[10px] font-semibold text-ink"
      style={isCollection ? { borderColor: color, color } : undefined}
      title={point?.name ?? stop}
    >
      {label}
    </span>
  );
}

function LedgerItem({
  label,
  value,
  formula,
}: {
  label: string;
  value: string;
  formula: string;
}) {
  return (
    <div className="rounded-md border border-line bg-paper/65 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          <CurrencyDollar size={13} weight="bold" />
          {label}
        </div>
        <div className="font-display text-lg font-extrabold tabular-nums text-ink">
          {value}
        </div>
      </div>
      <div className="mt-1 font-mono text-[10px] text-muted">{formula}</div>
    </div>
  );
}
