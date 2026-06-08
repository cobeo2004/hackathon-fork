"use client";

// The payoff band: baseline (reactive) vs optimized recovery, shown as two bars
// that grow on scroll. Real numbers from buildComparison(4). Green = the win.

import { m } from "motion/react";
import { buildComparison } from "~/lib/cost";
import { Card } from "~/components/ui";
import { MotionProvider, revealUp } from "./motion-features";
import { useCountUp } from "./useCountUp";

const c = buildComparison(4);

export function ResultsBand() {
  return (
    <MotionProvider>
      <section>
        <m.div {...revealUp} className="mb-7 max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            The result
          </span>
          <h2 className="mt-3 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.01em] text-ink md:text-4xl">
            Same assets recovered. <span className="text-recover">Less driving, less cost.</span>
          </h2>
        </m.div>
        <m.div {...revealUp} className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <BarPair
              label="Route distance"
              unit="km"
              baseline={c.baselineDistance}
              optimized={c.optimizedDistance}
              reductionPct={c.distanceReductionPct}
            />
          </Card>
          <Card className="p-5">
            <BarPair
              label="Collection cost"
              unit="$"
              prefix
              baseline={c.baselineCost}
              optimized={c.optimizedCost}
              reductionPct={c.costReductionPct}
            />
          </Card>
        </m.div>
      </section>
    </MotionProvider>
  );
}

function BarPair({
  label,
  unit,
  prefix = false,
  baseline,
  optimized,
  reductionPct,
}: {
  label: string;
  unit: string;
  prefix?: boolean;
  baseline: number;
  optimized: number;
  reductionPct: number;
}) {
  const { ref, value: delta } = useCountUp(reductionPct);
  const fmt = (n: number) =>
    prefix ? `${unit}${Math.round(n)}` : `${Math.round(n)}${unit}`;
  // optimized bar width as a fraction of baseline (baseline = full width).
  const optimizedPct = (optimized / baseline) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        <span ref={ref} className="font-display text-xl font-extrabold tabular-nums text-recover">
          −{Math.round(delta)}%
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <Bar
          tag="Reactive"
          valueLabel={fmt(baseline)}
          widthPct={100}
          barClass="bg-ink/25"
          tagClass="text-muted"
        />
        <Bar
          tag="Optimized"
          valueLabel={fmt(optimized)}
          widthPct={optimizedPct}
          barClass="bg-recover"
          tagClass="text-recover"
        />
      </div>
    </div>
  );
}

function Bar({
  tag,
  valueLabel,
  widthPct,
  barClass,
  tagClass,
}: {
  tag: string;
  valueLabel: string;
  widthPct: number;
  barClass: string;
  tagClass: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide">
        <span className={tagClass}>{tag}</span>
        <span className="tabular-nums text-ink">{valueLabel}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-line/50">
        <m.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: widthPct / 100 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}
