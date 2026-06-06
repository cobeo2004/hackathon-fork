import { FEATURED_ASSET } from "../data/asset";
import { BASELINE_ROUTE, OPTIMIZED_ROUTE } from "../data/demo";
import { MapView } from "../components/MapView";
import { Button, Card, DataNote, SectionLead } from "../components/ui";
import type { useSimulation } from "../hooks/useSimulation";
import { buildComparison } from "../lib/cost";

type Sim = ReturnType<typeof useSimulation>;

export function DemoSection({ sim }: { sim: Sim }) {
  const { status, series, start, reset, subscribe } = sim;
  const comparison = buildComparison(4);
  const latest = series[series.length - 1];

  // Live figures: while idle, preview the planned route totals so the cards are never
  // a confusing "0"; once running they follow the live totals and settle on the result.
  const preview = status === "idle";
  const baseDist = latest?.baselineDist ?? (preview ? BASELINE_ROUTE.total_distance_km : 0);
  const optDist = latest?.optimizedDist ?? (preview ? OPTIMIZED_ROUTE.total_distance_km : 0);
  const baseCost = latest?.baselineCost ?? (preview ? BASELINE_ROUTE.total_cost_aud : 0);
  const optCost = latest?.optimizedCost ?? (preview ? OPTIMIZED_ROUTE.total_cost_aud : 0);

  return (
    <div>
      <SectionLead
        step={3}
        eyebrow="The demo"
        title="Same job, same truck — watch ours finish cheaper"
        subtitle="Both trucks recover the same 1,980 kg. Red is today's reactive route; blue is SolarCycle AI. Only the routing strategy changes."
      />

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
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {status === "idle" ? "● Ready" : status === "running" ? "● Running…" : "● Complete"}
          </span>
          {status === "idle" ? (
            <Button onClick={start} variant="success">▶ Run live demo</Button>
          ) : (
            <Button onClick={() => { reset(); start(); }} variant="ghost">↻ Replay</Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <MapView height={520} showRoutes networkGraph status={status} subscribe={subscribe} />
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
                −{comparison.costReductionPct.toFixed(0)}%
              </div>
              <div className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-recover">
                logistics cost
              </div>
              <div className="mt-3 text-[13px] leading-snug text-[#2a5f43]">
                −{comparison.distanceReductionPct.toFixed(0)}% distance · same{" "}
                {comparison.collectedMassKg.toLocaleString()} kg recovered
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-[13px] leading-relaxed text-muted">
              Press <strong className="text-ink">Run live demo</strong> to dispatch both
              trucks. Watch the blue route finish shorter and cheaper than the red one.
            </Card>
          )}
        </div>
      </div>

      <CompareTable comparison={comparison} />

      <DataNote
        real="depot & recycling centre are real Melbourne facilities (Cleanaway Laverton; Lotus Recycling, Campbellfield); the optimizer runs on their real coordinates"
        illustrative="headline route distances (142/102 km) & costs are pinned to the spec target; cost rates are operator assumptions"
        source="Cleanaway & Lotus Recycling (public sites); straight-line distances (OpenRouteService roads = future upgrade)"
      />
    </div>
  );
}

const FAIL_DAYS = FEATURED_ASSET.estimated_failure_window_days;

type Row = {
  metric: string;
  base: string;
  ours: string;
  delta: string;
};

function CompareTable({ comparison }: { comparison: ReturnType<typeof buildComparison> }) {
  const rows: Row[] = [
    { metric: "When you act", base: "After it fails", ours: `~${FAIL_DAYS} days early`, delta: "Predictive" },
    { metric: "Dispatch", base: "One job at a time", ours: "One optimized plan", delta: "Coordinated" },
    {
      metric: "Route distance",
      base: `${comparison.baselineDistance} km`,
      ours: `${comparison.optimizedDistance} km`,
      delta: `−${comparison.distanceReductionPct.toFixed(0)}%`,
    },
    {
      metric: "Cost per run",
      base: `A$${Math.round(comparison.baselineCost)}`,
      ours: `A$${Math.round(comparison.optimizedCost)}`,
      delta: `−${comparison.costReductionPct.toFixed(0)}%`,
    },
    {
      metric: "Mass recovered",
      base: `${comparison.collectedMassKg.toLocaleString()} kg`,
      ours: `${comparison.collectedMassKg.toLocaleString()} kg`,
      delta: "Same",
    },
    { metric: "Asset record", base: "None", ours: "Digital passport", delta: "Provable" },
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
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">{distance} <span className="text-base text-muted">km</span></div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Cost</div>
          <div className="font-display text-2xl font-extrabold tabular-nums text-ink">A${cost}</div>
        </div>
      </div>
    </Card>
  );
}
