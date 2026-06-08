"use client";

// The payoff band. Baseline-vs-optimized bars whose fill is LINKED to scroll
// progress: they grow as the band scrolls in and shrink as it scrolls out (scrubbed,
// reversible) — not a one-shot reveal. Real numbers from buildComparison(4).
// Green = the win. Reduced-motion → bars shown at full final width, static.

import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { buildComparison } from "~/lib/cost";
import { Card } from "~/components/ui";
import { MotionProvider, useScrubbedReveal } from "./motion-features";

const c = buildComparison(4);

export function ResultsBand() {
  const headRef = useRef<HTMLDivElement>(null);
  const head = useScrubbedReveal(headRef);
  return (
    <MotionProvider>
      <section>
        <m.div ref={headRef} style={head} className="mb-10 max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            The result
          </span>
          <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.01em] text-ink md:text-5xl">
            Same assets recovered.{" "}
            <span className="text-recover">Less driving, less cost.</span>
          </h2>
        </m.div>
        <div className="grid gap-5 md:grid-cols-2">
          <BarPairCard
            label="Route distance"
            unit="km"
            baseline={c.baselineDistance}
            optimized={c.optimizedDistance}
            reductionPct={c.distanceReductionPct}
          />
          <BarPairCard
            label="Collection cost"
            unit="$"
            prefix
            baseline={c.baselineCost}
            optimized={c.optimizedCost}
            reductionPct={c.costReductionPct}
          />
        </div>
      </section>
    </MotionProvider>
  );
}

function BarPairCard({
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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  // Fill tracks scroll 0→1 as the card rises to centered, holds full while centered,
  // and unwinds on scroll-up. Spring-smoothed.
  const fill = useSpring(scrollYProgress, { stiffness: 110, damping: 28 });

  const fmt = (n: number) =>
    prefix ? `${unit}${Math.round(n)}` : `${Math.round(n)}${unit}`;
  const optimizedFrac = optimized / baseline;

  return (
    <Card className="p-6">
      <div ref={ref}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {label}
          </span>
          <span className="font-display text-2xl font-extrabold tabular-nums text-recover">
            −{Math.round(reductionPct)}%
          </span>
        </div>
        <div className="mt-5 space-y-4">
          <Bar
            tag="Reactive"
            valueLabel={fmt(baseline)}
            targetFrac={1}
            fill={fill}
            reduce={reduce}
            barClass="bg-ink/25"
            tagClass="text-muted"
          />
          <Bar
            tag="Optimized"
            valueLabel={fmt(optimized)}
            targetFrac={optimizedFrac}
            fill={fill}
            reduce={reduce}
            barClass="bg-recover"
            tagClass="text-recover"
          />
        </div>
      </div>
    </Card>
  );
}

function Bar({
  tag,
  valueLabel,
  targetFrac,
  fill,
  reduce,
  barClass,
  tagClass,
}: {
  tag: string;
  valueLabel: string;
  targetFrac: number;
  fill: ReturnType<typeof useSpring>;
  reduce: boolean | null;
  barClass: string;
  tagClass: string;
}) {
  // Hook is always called (no conditional hooks); reduced-motion just ignores it
  // and renders the bar at its final width via a static transform.
  const scaleX = useTransform(fill, [0, 1], [0, targetFrac]);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide">
        <span className={tagClass}>{tag}</span>
        <span className="tabular-nums text-ink">{valueLabel}</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-line/50">
        <m.div
          className={`h-full origin-left rounded-full ${barClass}`}
          style={reduce ? { transform: `scaleX(${targetFrac})` } : { scaleX }}
        />
      </div>
    </div>
  );
}
