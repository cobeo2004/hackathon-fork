"use client";

// Problem → Solution → Demo as a pinned 3-up section. A tall outer container
// (min-h ~280vh) holds a sticky inner panel that stays fixed while you scroll past.
// Whole-section scroll progress (after a lead-in for the heading) is split into three
// bands — one per card. Each card fades + rises into its slot in reading order, so
// they FILL one-by-one L→R on scroll-down and EMPTY R→L on scroll-up (the same
// transforms run in reverse). Mirrors StatScrollband's sticky-scrub pattern.
// Reduced-motion → a plain static 3-up grid, all cards visible. Links keep the
// view-transition cross-fade.

import Link from "next/link";
import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Card } from "~/components/ui";
import { MotionProvider } from "./motion-features";

const STEPS = [
  {
    n: 1,
    href: "/problem",
    eyebrow: "The problem",
    title: "A failure wave is already here",
    body: "Victoria's 2011–2014 rooftop boom is hitting inverter end-of-life now: 247k systems, growing recycling demand, reactive collection.",
    cta: "See the problem",
    offset: "md:mt-0",
  },
  {
    n: 2,
    href: "/solution",
    eyebrow: "The solution",
    title: "Predict, then plan the route",
    body: "Health telemetry becomes a risk score and a failure window; high-risk assets become a collection job with a verifiable passport.",
    cta: "How it works",
    offset: "md:mt-16",
  },
  {
    n: 3,
    href: "/demo",
    eyebrow: "The demo",
    title: "Watch the recovery run",
    body: "Two trucks race the same job: reactive vs optimized. Shorter route, lower cost, same assets recovered, live on the map.",
    cta: "Run the demo",
    offset: "md:mt-32",
  },
] as const;

const LEAD = 0.15; // first 15% of progress lets the heading settle before card 1 fills.

export function StorySteps() {
  return (
    <MotionProvider>
      <Inner />
    </MotionProvider>
  );
}

function Heading() {
  return (
    <div className="mb-10 max-w-3xl">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
        The walkthrough
      </span>
      <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.01em] text-ink md:text-5xl">
        Three steps, one continuous story
      </h2>
    </div>
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

  // Reduced motion: a plain readable 3-up grid, no pinning, all cards visible.
  if (reduce) {
    return (
      <section>
        <Heading />
        <div className="grid gap-5 md:grid-cols-3 md:items-start">
          {STEPS.map((s) => (
            <div key={s.href} className={s.offset}>
              <StepCardBody step={s} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const n = STEPS.length;
  return (
    <>
      {/* Mobile: a plain stacked grid — no pinning, so the heading never hides under
          the fixed header and the 3-up isn't crushed. Scrubbed sticky version is md+. */}
      <section className="md:hidden">
        <Heading />
        <div className="grid gap-5">
          {STEPS.map((s) => (
            <div key={s.href}>
              <StepCardBody step={s} />
            </div>
          ))}
        </div>
      </section>

      {/* md+: pinned, scroll-scrubbed reveal. */}
      <section
        ref={ref}
        className="relative hidden md:block"
        style={{ minHeight: "280vh" }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <Heading />
          <div className="grid gap-5 md:grid-cols-3 md:items-start">
            {STEPS.map((s, i) => (
              <StepCard key={s.href} step={s} index={i} count={n} progress={progress} />
            ))}
          </div>
          {/* Band ticks — show which of the three cards you're on. */}
          <div className="mt-10 flex gap-2">
            {STEPS.map((s, i) => (
              <Tick key={s.href} index={i} count={n} progress={progress} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StepCard({
  step,
  index,
  count,
  progress,
}: {
  step: (typeof STEPS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  // Each card owns a band of the post-lead progress; it fades + rises in over the
  // first 60% of its band, then HOLDS (fill-in-place). Reverses on scroll-up.
  const span = 1 - LEAD;
  const band = span / count;
  const start = LEAD + index * band;
  const opacity = useTransform(progress, [start, start + band * 0.6], [0, 1]);
  const y = useTransform(progress, [start, start + band * 0.6], [40, 0]);

  return (
    <m.div style={{ opacity, y }} className={step.offset}>
      <StepCardBody step={step} />
    </m.div>
  );
}

function StepCardBody({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <Link href={step.href} className="group block h-full">
      <Card className="flex h-full flex-col p-6 transition-shadow group-hover:shadow-[0_1px_0_rgba(26,22,17,0.04),0_22px_44px_-20px_rgba(26,22,17,0.5)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-mono text-sm font-semibold text-paper">
            {step.n}
          </span>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-solar">
            {step.eyebrow}
          </span>
        </div>
        <h3 className="mt-4 font-display text-[21px] font-extrabold tracking-tight text-ink">
          {step.title}
        </h3>
        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">
          {step.body}
        </p>
        <span className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-solar">
          {step.cta} →
        </span>
      </Card>
    </Link>
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
  const span = 1 - LEAD;
  const band = span / count;
  const start = LEAD + index * band;
  const scaleX = useTransform(
    progress,
    [start, start + band * 0.6],
    [0.2, 1],
  );
  const opacity = useTransform(
    progress,
    [start - 0.001, start + band * 0.6],
    [0.25, 1],
  );
  return (
    <div className="h-[3px] w-16 overflow-hidden rounded-full bg-line">
      <m.div style={{ scaleX, opacity }} className="h-full origin-left rounded-full bg-solar" />
    </div>
  );
}
