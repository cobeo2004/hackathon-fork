import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE } from "../data/demo";
import { MapView } from "../components/MapView";
import { Button, Card, DataNote, SectionLead } from "../components/ui";
import type { useSimulation } from "../hooks/useSimulation";
import { useRoadRoutes, type RoadRoutesState } from "../hooks/useRoadRoutes";
import { useMemo, type ChangeEvent } from "react";

type Sim = ReturnType<typeof useSimulation>;

export function DemoSection({ sim }: { sim: Sim }) {
  const { status, series, start, reset, subscribe, speedMultiplier, setSpeedMultiplier } = sim;
  const roadRoutes = useRoadRoutes();
  const mapRoadRoutes = useMemo(
    () => ({ baseline: roadRoutes.baseline, optimized: roadRoutes.optimized }),
    [roadRoutes.baseline, roadRoutes.optimized],
  );
  const comparison = roadRoutes.comparison;
  const latest = series[series.length - 1];

  // Live figures: while idle, preview the planned route totals so the cards are never
  // a confusing "0"; once running they follow the live totals and settle on the result.
  const preview = status === "idle";
  const baseDist =
    status === "done" ? comparison.baselineDistance : latest?.baselineDist ?? (preview ? comparison.baselineDistance : 0);
  const optDist =
    status === "done" ? comparison.optimizedDistance : latest?.optimizedDist ?? (preview ? comparison.optimizedDistance : 0);
  const baseCost =
    status === "done" ? comparison.baselineCost : latest?.baselineCost ?? (preview ? comparison.baselineCost : 0);
  const optCost =
    status === "done" ? comparison.optimizedCost : latest?.optimizedCost ?? (preview ? comparison.optimizedCost : 0);

  return (
    <div>
      <SectionLead
        step={3}
        eyebrow="The demo"
        title="Real postcode demand, routed to real PV recyclers"
        subtitle="The dots are Victorian postcodes backed by CER install data. Red is postcode-by-postcode planning; blue prioritizes the same demand areas by age cohort, solar density, and route distance."
      />

      <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
        <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
          Data provenance
        </span>
        Phase 1 uses real public datasets for postcode-level solar installation context, product
        mix, and facility locations.{" "}
        <strong>
          Demand dots are postcode-area centroids, not exact rooftops. Priority scores are
          derived from real CER install totals, real CER pre-2011 cohorts, and route distance.
        </strong>{" "}
        Solar PV recycler/drop-point locations are public listings. Daily processing capacity is
        not used because per-facility capacity is not public.
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel px-4 py-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Route engine:{" "}
          <span className={roadRoutes.status === "ready" ? "text-recover" : "text-amber-700"}>
            {roadRoutes.status === "loading"
              ? "connecting to OSRM roads"
              : roadRoutes.status === "ready"
                ? "live OSRM road routing"
                : "offline fallback"}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-wide text-muted">
          <span>Baseline {comparison.baselineDistance.toFixed(1)} km</span>
          <span>Optimized {comparison.optimizedDistance.toFixed(1)} km</span>
          {roadRoutes.optimized.durationMin ? <span>{roadRoutes.optimized.durationMin} min drive time</span> : null}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-line bg-paper/70 px-4 py-3 text-[12px] leading-relaxed text-muted">
        Cost is an estimated route operating cost: A${COSTS.vehicle_operating_cost_per_km.toFixed(2)}/km vehicle
        operating cost, A${COSTS.driver_labour_cost_per_hour}/hour driver labour, A$
        {COSTS.baseline_handling_per_stop}/stop reactive handling, A${COSTS.optimized_handling_per_stop}/stop
        coordinated handling, and A${COSTS.dispatch_per_route}/run dispatch admin.
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wide text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: BASELINE_ROUTE.color }} />
            Reactive (today)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: OPTIMIZED_ROUTE.color }} />
            SolarCycle AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SpeedControl value={speedMultiplier} onChange={setSpeedMultiplier} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {status === "idle" ? "Ready" : status === "running" ? "Running..." : "Complete"}
          </span>
          {status === "idle" ? (
            <Button onClick={start} variant="success">Run live demo</Button>
          ) : (
            <Button onClick={() => { reset(); start(); }} variant="ghost">Replay</Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <MapView
            height={520}
            showRoutes
            networkGraph
            status={status}
            subscribe={subscribe}
            roadRoutes={mapRoadRoutes}
          />
        </Card>

        <div className="space-y-4">
          <TruckStat
            color={BASELINE_ROUTE.color}
            title="Reactive (today)"
            distance={baseDist}
            cost={baseCost}
          />
          <TruckStat
            color={OPTIMIZED_ROUTE.color}
            title="SolarCycle AI"
            distance={optDist}
            cost={optCost}
          />

          {status === "done" ? (
            <Card className="border-recover/40 bg-[#e7f3ec] p-5">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-recover">
                Result
              </div>
              <div className="mt-1 font-display text-6xl font-extrabold leading-none tracking-tight text-recover">
                -{comparison.costReductionPct.toFixed(0)}%
              </div>
              <div className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-recover">
                logistics cost
              </div>
              <div className="mt-3 text-[13px] leading-snug text-[#2a5f43]">
                A${Math.round(comparison.baselineCost)} to A${Math.round(comparison.optimizedCost)} estimated route
                operating cost. -{comparison.distanceReductionPct.toFixed(0)}% distance, same{" "}
                {comparison.collectedMassKg.toLocaleString()} pre-2011 systems covered
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-[13px] leading-relaxed text-muted">
              Press <strong className="text-ink">Run live demo</strong> to dispatch both
              campaign routes. Watch the blue route cover the same postcode demand with less travel.
            </Card>
          )}
        </div>
      </div>

      <CompareTable
        comparison={comparison}
        baseDist={baseDist}
        optDist={optDist}
        baseCost={baseCost}
        optCost={optCost}
      />

      <DataNote
        real="postcode install counts and pre-2011 EOL cohorts (Clean Energy Regulator); postcode-area centroid approximations (ABS ASGS 2021 POA); public solar PV recycler/drop-point listings"
        illustrative="estimated route operating-cost assumptions and route-comparison strategy only; no invented rooftop/site pickup locations or invented facility capacity"
        source="CER SRES postcode data (to Apr 2026); ABS Postal Areas; Solar Victoria, Lotus Recycling, Elecsome, Sircel; OSRM/OpenStreetMap road distance/time with speed-based fallback"
      />
    </div>
  );
}

const SPEED_PRESETS = [0.5, 1, 1.5, 2];

function SpeedControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const handleSlider = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Speed
      </div>
      <input
        aria-label="Truck speed"
        type="range"
        min="0.25"
        max="2.5"
        step="0.25"
        value={value}
        onChange={handleSlider}
        className="h-1.5 w-24 accent-recover"
      />
      <div className="w-10 text-right font-mono text-[11px] font-semibold tabular-nums text-ink">
        {value.toFixed(2).replace(/\.00$/, "")}x
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-md px-2 py-1 font-mono text-[10px] font-semibold tabular-nums transition-colors ${
              Math.abs(value - preset) < 0.01
                ? "bg-ink text-paper"
                : "bg-paper text-muted hover:bg-line/60 hover:text-ink"
            }`}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  );
}

type Row = {
  metric: string;
  base: string;
  ours: string;
  delta: string;
};

function CompareTable({
  comparison,
  baseDist,
  optDist,
  baseCost,
  optCost,
}: {
  comparison: RoadRoutesState["comparison"];
  baseDist: number;
  optDist: number;
  baseCost: number;
  optCost: number;
}) {
  const rows: Row[] = [
    { metric: "Demand signal", base: "Individual calls", ours: "CER postcode cohort", delta: "Observed" },
    { metric: "Dispatch", base: "Postcode order", ours: "One campaign route", delta: "Coordinated" },
    {
      metric: "Route distance",
      base: `${baseDist.toFixed(1)} km`,
      ours: `${optDist.toFixed(1)} km`,
      delta: `-${comparison.distanceReductionPct.toFixed(0)}%`,
    },
    {
      metric: "Estimated cost per run",
      base: `A$${Math.round(baseCost)}`,
      ours: `A$${Math.round(optCost)}`,
      delta: `-${comparison.costReductionPct.toFixed(0)}%`,
    },
    {
      metric: "EOL cohort covered",
      base: `${comparison.collectedMassKg.toLocaleString()} systems`,
      ours: `${comparison.collectedMassKg.toLocaleString()} systems`,
      delta: "Same",
    },
    { metric: "Destination", base: "Generic facility", ours: "Listed PV recycler", delta: "Verified" },
  ];

  return (
    <Card className="mt-5 overflow-hidden p-0">
      <div className="grid grid-cols-[1.1fr_1fr_1fr_auto] items-center gap-x-4 border-b border-line bg-paper/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>Metric</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: BASELINE_ROUTE.color }} />
          Reactive (today)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: OPTIMIZED_ROUTE.color }} />
          SolarCycle AI
        </span>
        <span className="text-right text-recover">Gain</span>
      </div>

      {rows.map((r, i) => (
        <div
          key={r.metric}
          className={`grid grid-cols-[1.1fr_1fr_1fr_auto] items-center gap-x-4 px-5 py-3 ${
            i < rows.length - 1 ? "border-b border-line" : ""
          }`}
        >
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted">{r.metric}</span>
          <span className="text-[15px] text-ink/70 line-through decoration-risk/40">{r.base}</span>
          <span className="font-display text-base font-extrabold tracking-tight text-ink">{r.ours}</span>
          <span className="justify-self-end rounded-full bg-[#e7f3ec] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-recover">
            {r.delta}
          </span>
        </div>
      ))}
    </Card>
  );
}

function TruckStat({
  color,
  title,
  distance,
  cost,
}: {
  color: string;
  title: string;
  distance: number;
  cost: number;
}) {
  return (
    <Card className="p-4" >
      <div className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight text-ink">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
        {title}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Distance</div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">{distance.toFixed(1)} <span className="text-base text-muted">km</span></div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Est. cost</div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">A${Math.round(cost)}</div>
        </div>
      </div>
    </Card>
  );
}
