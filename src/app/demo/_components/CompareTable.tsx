import type { Comparison } from "~/lib/cost";
import { Card } from "~/components/ui";
import { formatNumber } from "~/lib/format";

type Row = { metric: string; base: string; ours: string; delta: string };

export function CompareTable({
  comparison,
  baselineColor,
  optimizedColor,
  failDays,
}: {
  comparison: Comparison;
  baselineColor: string;
  optimizedColor: string;
  failDays: number;
}) {
  const rows: Row[] = [
    {
      metric: "When you act",
      base: "After it fails",
      ours: `~${failDays} days early`,
      delta: "Predictive",
    },
    {
      metric: "Dispatch",
      base: "One job at a time",
      ours: "One optimized plan",
      delta: "Coordinated",
    },
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
      base: `${formatNumber(comparison.collectedMassKg)} kg`,
      ours: `${formatNumber(comparison.collectedMassKg)} kg`,
      delta: "Same",
    },
    {
      metric: "Asset record",
      base: "None",
      ours: "Digital passport",
      delta: "Provable",
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
              <span className="min-w-0 text-[15px] text-ink/70 line-through decoration-risk/40">
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
