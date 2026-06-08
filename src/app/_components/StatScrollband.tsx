"use client";

// Sticky/pinned centerpiece. A tall outer container (min-h ~280vh) holds a sticky
// inner panel that stays fixed while you scroll past it. Whole-section scroll
// progress is divided into four bands — one per real VIC figure. Each number scrubs
// up + fades in on its band and dims as the next arrives; scrolling up reverses it.
// Reads deterministic build-time constants directly (same ~/data exemption as
// MapView/useSimulation). Reduced-motion → static list, all figures visible.

import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { VIC_FACTS } from "~/data/victoria";
import { buildComparison } from "~/lib/cost";
import { MotionProvider } from "./motion-features";

const comparison = buildComparison(4);

const FIGURES = [
  {
    value: VIC_FACTS.totalSystems.toLocaleString(),
    label: "VIC systems installed",
    sub: "Clean Energy Regulator · 2001–2026",
    tone: "text-ink",
  },
  {
    value: VIC_FACTS.eolNowSystems.toLocaleString(),
    label: "At end-of-life right now",
    sub: "installed ≤2014 · 12+ years old",
    tone: "text-risk",
  },
  {
    value: `${VIC_FACTS.vicShareOfNationalPct}%`,
    label: "Share of the national fleet",
    sub: "of Australia's ~4.4M systems",
    tone: "text-solar",
  },
  {
    value: `−${Math.round(comparison.costReductionPct)}%`,
    label: "Recovery cost cut",
    sub: "optimized vs reactive collection",
    tone: "text-recover",
  },
];

export function StatScrollband() {
  return (
    <MotionProvider>
      <Inner />
    </MotionProvider>
  );
}

function Inner() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30 });

  // Reduced motion: a plain readable grid, no pinning drama.
  if (reduce) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIGURES.map((f) => (
          <div key={f.label} className="rounded-xl border border-line bg-panel p-5">
            <div className={`font-display text-4xl font-extrabold tabular-nums ${f.tone}`}>
              {f.value}
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {f.label}
            </div>
            <div className="mt-1 text-[12px] text-muted">{f.sub}</div>
          </div>
        ))}
      </section>
    );
  }

  const n = FIGURES.length;
  return (
    <section ref={ref} className="relative" style={{ minHeight: "300vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-10 flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            By the numbers
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
            real Victorian solar data
          </span>
        </div>
        <div className="relative h-[42vh]">
          {FIGURES.map((f, i) => (
            <Figure key={f.label} figure={f} index={i} count={n} progress={progress} />
          ))}
        </div>
        {/* Band ticks — show which of the four you're on. */}
        <div className="mt-8 flex gap-2">
          {FIGURES.map((f, i) => (
            <Tick key={f.label} index={i} count={n} progress={progress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Figure({
  figure,
  index,
  count,
  progress,
}: {
  figure: (typeof FIGURES)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  // Each figure owns a slice of [0,1]; it rises in, holds, then exits up.
  const band = 1 / count;
  const start = index * band;
  const opacity = useTransform(
    progress,
    [start, start + band * 0.25, start + band * 0.75, start + band],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [start, start + band * 0.25, start + band * 0.75, start + band],
    [70, 0, 0, -70],
  );

  return (
    <m.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <div
        className={`font-display text-[clamp(64px,13vw,180px)] font-extrabold leading-none tabular-nums ${figure.tone}`}
      >
        {figure.value}
      </div>
      <div className="mt-4 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-ink">
        {figure.label}
      </div>
      <div className="mt-1 text-[14px] text-muted">{figure.sub}</div>
    </m.div>
  );
}

function Tick({
  index,
  count,
  progress,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const band = 1 / count;
  const start = index * band;
  const scaleX = useTransform(
    progress,
    [start, start + band * 0.25, start + band],
    [0.2, 1, 1],
  );
  const opacity = useTransform(
    progress,
    [start - 0.001, start, start + band, start + band + 0.001],
    [0.25, 1, 1, 0.25],
  );
  return (
    <div className="h-[3px] w-16 overflow-hidden rounded-full bg-line">
      <m.div style={{ scaleX, opacity }} className="h-full origin-left rounded-full bg-solar" />
    </div>
  );
}
