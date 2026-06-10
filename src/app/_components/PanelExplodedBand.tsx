"use client";

// Sticky exploded-view centerpiece. Same pinned-traverse pattern as
// StatScrollband: a tall outer section (~320vh) with a sticky h-screen inner.
// Section scroll progress drives the panel layers apart (reverses on
// scroll-up); each material callout owns a slice of the progress and fades in
// as its layer separates. Reduced motion → static mid-exploded figure with all
// callouts visible.

import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { DataNote } from "~/components/ui";
import { PanelLayers } from "./PanelLayers";
import { MotionProvider } from "./motion-features";

// Mass shares are rounded literature figures (IRENA / IEA-PVPS end-of-life PV
// reports) — illustrative, not measured from our fleet.
const CALLOUTS = [
  {
    label: "Aluminium frame",
    fact: "~10% of mass",
    sub: "Infinitely recyclable — highest-volume metal recovered.",
  },
  {
    label: "Tempered glass",
    fact: "~76% of mass",
    sub: "The bulk of every panel. Clean cullet feeds new glass.",
  },
  {
    label: "EVA encapsulant",
    fact: "polymer interlayer",
    sub: "Seals the cells — separated by thermal delamination.",
  },
  {
    label: "PV cells",
    fact: "silicon + silver",
    sub: "Highest value per kilogram. Silver drives the economics.",
  },
  {
    label: "Backsheet + junction box",
    fact: "copper, polymers",
    sub: "Copper wiring and connectors round out the recovery.",
  },
] as const;

export function PanelExplodedBand() {
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
  // Layers are fully apart by ~70% of the traverse, then hold.
  const separation = useTransform(progress, [0.05, 0.7], [0, 1]);
  // Reduced-motion fallback: a static, readable mid-explode.
  const staticSeparation = useMotionValue(0.85);

  const header = (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
        Inside every panel
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
        what we recover at end-of-life
      </span>
    </div>
  );

  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl">
        {header}
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <PanelLayers separation={staticSeparation} className="mx-auto h-auto w-full max-w-xl" />
          <div className="space-y-5">
            {CALLOUTS.map((c, i) => (
              <CalloutBody key={c.label} callout={c} index={i} />
            ))}
          </div>
        </div>
        <Provenance />
      </section>
    );
  }

  return (
    <section ref={ref} className="relative" style={{ minHeight: "320vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {header}
        <div className="mt-4 grid flex-none items-center gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <PanelLayers
            separation={separation}
            className="mx-auto h-[min(58vh,540px)] w-auto max-w-full"
          />
          <div className="hidden space-y-4 lg:block">
            {CALLOUTS.map((c, i) => (
              <Callout key={c.label} callout={c} index={i} progress={progress} />
            ))}
          </div>
          {/* Mobile: callouts ride below the figure, two-up. */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {CALLOUTS.map((c, i) => (
              <Callout key={c.label} callout={c} index={i} progress={progress} compact />
            ))}
          </div>
        </div>
        <Provenance />
      </div>
    </section>
  );
}

function Callout({
  callout,
  index,
  progress,
  compact = false,
}: {
  callout: (typeof CALLOUTS)[number];
  index: number;
  progress: MotionValue<number>;
  compact?: boolean;
}) {
  // Each callout fades in over its own slice and stays — scrubbing back hides it.
  const start = 0.12 + index * 0.13;
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const x = useTransform(progress, [start, start + 0.1], [24, 0]);
  return (
    <m.div style={{ opacity, x }}>
      <CalloutBody callout={callout} index={index} compact={compact} />
    </m.div>
  );
}

function CalloutBody({
  callout,
  index,
  compact = false,
}: {
  callout: (typeof CALLOUTS)[number];
  index: number;
  compact?: boolean;
}) {
  return (
    <div className="border-l-2 border-solar/70 pl-3">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
        <span className="mr-2 text-solar">{String(index + 1).padStart(2, "0")}</span>
        {callout.label}
      </div>
      <div className="mt-0.5 font-display text-sm font-bold text-ink">{callout.fact}</div>
      {!compact && <p className="mt-1 text-[13px] leading-snug text-muted">{callout.sub}</p>}
    </div>
  );
}

function Provenance() {
  return (
    <div className="mt-4 max-w-2xl">
      <DataNote
        real="Panel construction — the six-layer laminate is how crystalline PV modules are built."
        illustrative="Mass shares are rounded industry figures, not measurements from our fleet."
        source="IRENA / IEA-PVPS end-of-life PV management reports"
      />
    </div>
  );
}
