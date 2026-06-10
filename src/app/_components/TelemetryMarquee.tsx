// Telemetry ticker — a slow infinite mono readout strip between the hero and
// the stats centerpiece. RSC-safe: the loop is a CSS keyframe animation
// (`.marquee-track` in globals.css) with a prefers-reduced-motion override that
// freezes it. Figures come from the same deterministic build-time constants the
// stat band uses.

import { VIC_FACTS } from "~/data/victoria";
import { buildComparison } from "~/lib/cost";
import { formatNumber } from "~/lib/format";

const comparison = buildComparison();

const READOUTS: { label: string; value: string; tone?: string }[] = [
  { label: "VIC systems", value: formatNumber(VIC_FACTS.totalSystems) },
  { label: "At end-of-life", value: formatNumber(VIC_FACTS.eolNowSystems), tone: "text-risk" },
  { label: "National share", value: `${VIC_FACTS.vicShareOfNationalPct}%` },
  {
    label: "Recovery cost",
    value: `−${Math.round(comparison.costReductionPct)}%`,
    tone: "text-recover",
  },
  { label: "PV waste 2035", value: `${formatNumber(VIC_FACTS.wasteTonnes2035)} t` },
  { label: "Panels/yr by 2035", value: "~1,000,000", tone: "text-solar" },
];

function Sequence() {
  return (
    <>
      {READOUTS.map((r) => (
        <span key={r.label} className="flex items-baseline gap-2 whitespace-nowrap">
          <span aria-hidden className="text-solar">
            ●
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {r.label}
          </span>
          <span
            className={`font-display text-sm font-extrabold tabular-nums ${r.tone ?? "text-ink"}`}
          >
            {r.value}
          </span>
        </span>
      ))}
    </>
  );
}

export function TelemetryMarquee() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-line py-3">
      <div className="marquee-track flex w-max gap-10 pr-10">
        {/* Two identical halves → seamless −50% translate loop. */}
        <div className="flex gap-10" aria-hidden="false">
          <Sequence />
        </div>
        <div className="flex gap-10" aria-hidden>
          <Sequence />
        </div>
      </div>
    </div>
  );
}
