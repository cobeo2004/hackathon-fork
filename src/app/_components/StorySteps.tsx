"use client";

// The Problem → Solution → Demo story, previewed as three cards that stagger in on
// scroll. Each links to its route; <Link> nav keeps the view-transition cross-fade.

import Link from "next/link";
import { m } from "motion/react";
import { Card } from "~/components/ui";
import { MotionProvider, revealUp, staggerContainer, staggerChild } from "./motion-features";

const STEPS = [
  {
    n: 1,
    href: "/problem",
    eyebrow: "The problem",
    title: "A failure wave is already here",
    body: "Victoria's 2011–2014 rooftop boom is hitting inverter end-of-life now — 247k systems, growing recycling demand, reactive collection.",
    cta: "See the problem",
  },
  {
    n: 2,
    href: "/solution",
    eyebrow: "The solution",
    title: "Predict, then plan the route",
    body: "Health telemetry becomes a risk score and a failure window; high-risk assets become a collection job with a verifiable passport.",
    cta: "How it works",
  },
  {
    n: 3,
    href: "/demo",
    eyebrow: "The demo",
    title: "Watch the recovery run",
    body: "Two trucks race the same job: reactive vs optimized. Shorter route, lower cost, same assets recovered — live on the map.",
    cta: "Run the demo",
  },
] as const;

export function StorySteps() {
  return (
    <MotionProvider>
      <section>
        <m.div {...revealUp} className="mb-7 max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            The walkthrough
          </span>
          <h2 className="mt-3 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.01em] text-ink md:text-4xl">
            Three steps, one continuous story
          </h2>
        </m.div>
        <m.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {STEPS.map((s) => (
            <m.div key={s.href} variants={staggerChild}>
              <Link href={s.href} className="group block h-full">
                <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-[0_1px_0_rgba(26,22,17,0.04),0_18px_40px_-20px_rgba(26,22,17,0.45)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-mono text-sm font-semibold text-paper">
                      {s.n}
                    </span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-solar">
                      {s.eyebrow}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[19px] font-extrabold tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">
                    {s.body}
                  </p>
                  <span className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-solar">
                    {s.cta} →
                  </span>
                </Card>
              </Link>
            </m.div>
          ))}
        </m.div>
      </section>
    </MotionProvider>
  );
}
