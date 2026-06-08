"use client";

// Problem → Solution → Demo, as three cards on a diagonal. Each card scrubs in on
// its OWN element scroll progress (so they reveal in reading order as you scroll,
// and reverse on scroll-up) and is nudged off-axis for an overlapping, asymmetric
// feel rather than a flat 3-up row. Links keep the view-transition cross-fade.

import Link from "next/link";
import { useRef } from "react";
import { m } from "motion/react";
import { Card } from "~/components/ui";
import { MotionProvider, useScrubbedReveal } from "./motion-features";

const STEPS = [
  {
    n: 1,
    href: "/problem",
    eyebrow: "The problem",
    title: "A failure wave is already here",
    body: "Victoria's 2011–2014 rooftop boom is hitting inverter end-of-life now — 247k systems, growing recycling demand, reactive collection.",
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
    body: "Two trucks race the same job: reactive vs optimized. Shorter route, lower cost, same assets recovered — live on the map.",
    cta: "Run the demo",
    offset: "md:mt-32",
  },
] as const;

export function StorySteps() {
  const headRef = useRef<HTMLDivElement>(null);
  const head = useScrubbedReveal(headRef);
  return (
    <MotionProvider>
      <section>
        <m.div ref={headRef} style={head} className="mb-10 max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            The walkthrough
          </span>
          <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.01em] text-ink md:text-5xl">
            Three steps, one continuous story
          </h2>
        </m.div>
        <div className="grid gap-5 md:grid-cols-3 md:items-start">
          {STEPS.map((s) => (
            <StepCard key={s.href} step={s} />
          ))}
        </div>
      </section>
    </MotionProvider>
  );
}

function StepCard({ step }: { step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reveal = useScrubbedReveal(ref);
  return (
    <m.div ref={ref} style={reveal} className={step.offset}>
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
    </m.div>
  );
}
