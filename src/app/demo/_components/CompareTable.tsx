import type { Comparison } from "~/lib/cost";
import { Card } from "~/components/ui";
import { formatNumber } from "~/lib/format";

type Row = {
  metric: string;
  base: string;
  ours: string;
  delta: string;
  strikeBase?: boolean;
};

export function CompareTable({
  comparison,
  baselineColor,
  optimizedColor,
  failDays,
  baseDist,
  optDist,
  baseCost,
  optCost,
}: {
  comparison: Comparison;
  baselineColor: string;
  optimizedColor: string;
  failDays: number;
  baseDist?: number;
  optDist?: number;
  baseCost?: number;
  optCost?: number;
}) {
  const displayBaseDist = baseDist ?? comparison.baselineDistance;
  const displayOptDist = optDist ?? comparison.optimizedDistance;
  const displayBaseCost = baseCost ?? comparison.baselineCost;
  const displayOptCost = optCost ?? comparison.optimizedCost;
  const rows: Row[] = [
    {
      metric: "When you act",
      base: "After it fails",
      ours: `~${failDays} days early`,
      delta: "Predictive",
      strikeBase: true,
    },
    {
      metric: "Dispatch",
      base: `${comparison.baselineDispatches} reactive trips`,
      ours: `${comparison.optimizedDispatches} campaign`,
      delta: "Coordinated",
      strikeBase: true,
    },
    {
      metric: "Postcode revisits",
      base: `${comparison.baselineDuplicatePostcodeStops} duplicate stops`,
      ours: `${comparison.optimizedDuplicatePostcodeStops} duplicate stops`,
      delta: "Fair",
    },
    {
      metric: "Route distance",
      base: `${displayBaseDist.toFixed(1)} km`,
      ours: `${displayOptDist.toFixed(1)} km`,
      delta: `-${comparison.distanceReductionPct.toFixed(0)}%`,
      strikeBase: true,
    },
    {
      metric: "Est. cost per run",
      base: `A$${Math.round(displayBaseCost)}`,
      ours: `A$${Math.round(displayOptCost)}`,
      delta: `-${comparison.costReductionPct.toFixed(0)}%`,
      strikeBase: true,
    },
    {
      metric: "Mass recovered",
      base: `${formatNumber(comparison.collectedMassKg)} kg`,
      ours: `${formatNumber(comparison.collectedMassKg)} kg`,
      delta: "Same",
    },
    {
      metric: "Asset record",
      base: "None",
      ours: "Digital passport",
      delta: "Provable",
      strikeBase: true,
    },
  ];
  return (
    <Card className="mt-5 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_5.5rem] items-center gap-x-4 border-b border-line bg-paper/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            <span className="min-w-0">Metric</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: baselineColor }}
              />
              Reactive (today)
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: optimizedColor }}
              />
              SolarCycle AI
            </span>
            <span className="text-right text-recover">Gain</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.metric}
              className={`grid grid-cols-[1.1fr_1fr_1fr_5.5rem] items-center gap-x-4 px-5 py-3 ${
                i < rows.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="min-w-0 font-mono text-[11px] uppercase tracking-wide text-muted">
                {r.metric}
              </span>
              <span
                className={`min-w-0 text-[15px] text-ink/70 ${
                  r.strikeBase ? "line-through decoration-risk/40" : ""
                }`}
              >
                {r.base}
              </span>
              <span className="min-w-0 font-display text-base font-extrabold tracking-tight text-ink">
                {r.ours}
              </span>
              <span className="justify-self-end rounded-full bg-[#e7f3ec] px-2.5 py-0.5 text-center font-mono text-[11px] font-semibold text-recover">
                {r.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
