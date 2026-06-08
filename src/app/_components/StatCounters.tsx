"use client";

// Telemetry stat row: real Victorian headline figures that count up when scrolled
// into view. Reads deterministic build-time constants directly (the same
// client-reads-~/data exemption MapView/useSimulation use) — these are static
// facts, not server state, so no tRPC round-trip is needed.

import { m } from "motion/react";
import { VIC_FACTS } from "~/data/victoria";
import { buildComparison } from "~/lib/cost";
import { Card } from "~/components/ui";
import { MotionProvider, staggerContainer, staggerChild } from "./motion-features";
import { useCountUp } from "./useCountUp";

const comparison = buildComparison(4);

const STATS: { label: string; target: number; format: (n: number) => string; sub: string; tone: string }[] = [
  {
    label: "VIC systems installed",
    target: VIC_FACTS.totalSystems,
    format: (n) => Math.round(n).toLocaleString(),
    sub: "Clean Energy Regulator · 2001–2026",
    tone: "text-ink",
  },
  {
    label: "At end-of-life now",
    target: VIC_FACTS.eolNowSystems,
    format: (n) => Math.round(n).toLocaleString(),
    sub: "installed ≤2014 · 12+ yrs old",
    tone: "text-risk",
  },
  {
    label: "Share of national fleet",
    target: VIC_FACTS.vicShareOfNationalPct,
    format: (n) => `${Math.round(n)}%`,
    sub: "of Australia's ~4.4M systems",
    tone: "text-solar",
  },
  {
    label: "Recovery cost cut",
    target: comparison.costReductionPct,
    format: (n) => `−${Math.round(n)}%`,
    sub: "optimized vs reactive collection",
    tone: "text-recover",
  },
];

export function StatCounters() {
  return (
    <MotionProvider>
      <m.section
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: 0.08 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {STATS.map((s) => (
          <m.div key={s.label} variants={staggerChild}>
            <CounterCard {...s} />
          </m.div>
        ))}
      </m.section>
    </MotionProvider>
  );
}

function CounterCard({
  label,
  target,
  format,
  sub,
  tone,
}: {
  label: string;
  target: number;
  format: (n: number) => string;
  sub: string;
  tone: string;
}) {
  const { ref, value } = useCountUp(target);
  return (
    <Card className="p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-3xl font-extrabold leading-none tabular-nums md:text-4xl ${tone}`}
      >
        <span ref={ref}>{format(value)}</span>
      </div>
      <div className="mt-1.5 text-[12px] leading-snug text-muted">{sub}</div>
    </Card>
  );
}
