"use client";

// Full-height hero. Two background layers (amber glow + faint grid) parallax at
// different speeds, scrubbed to scroll — they drift as you scroll and drift back
// when you scroll up. The headline lifts + fades on the same scroll progress. A
// scroll cue fades out as you leave. A thin amber progress rail (top of viewport)
// fills with whole-page scroll. All reversible; reduced-motion disables movement.

import Link from "next/link";
import { useRef } from "react";
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { MotionProvider, useParallax } from "./motion-features";

export function HeroBand() {
  return (
    <MotionProvider>
      <HeroInner />
    </MotionProvider>
  );
}

function HeroInner() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Whole-page progress → the fixed amber rail at the very top.
  const { scrollYProgress: pageProgress } = useScroll();
  const railScaleX = useSpring(pageProgress, { stiffness: 120, damping: 30 });

  // Hero-element progress drives the foreground lift + scroll-cue fade.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const contentY = useTransform(smooth, [0, 1], [0, -90]);
  const contentOpacity = useTransform(smooth, [0, 0.7], [1, 0]);
  const cueOpacity = useTransform(smooth, [0, 0.2], [1, 0]);

  // Background layers move at different speeds → depth.
  const glowY = useParallax(ref, 120);
  const gridY = useParallax(ref, 48);

  return (
    <>
      {/* Page scroll-progress rail — pinned to the top of the viewport. */}
      <m.div
        aria-hidden
        style={{ scaleX: reduce ? 0 : railScaleX }}
        className="fixed inset-x-0 top-0 z-[2000] h-[3px] origin-left bg-solar"
      />

      <section
        ref={ref}
        className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden"
      >
        {/* Parallax glow layer. */}
        <m.div
          aria-hidden
          style={{ y: glowY }}
          className="pointer-events-none absolute -right-40 -top-32 h-[620px] w-[860px] rounded-full bg-[radial-gradient(closest-side,rgba(224,124,8,0.20),transparent)] blur-2xl"
        />
        {/* Parallax grid layer (slower). */}
        <m.div
          aria-hidden
          style={{ y: gridY }}
          className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(26,22,17,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(26,22,17,0.035)_1px,transparent_1px)] [background-size:54px_54px]"
        />

        <m.div style={{ y: contentY, opacity: contentOpacity }} className="relative">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            Solar lifecycle &amp; recovery · Melbourne west &amp; north
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] text-ink md:text-[76px]">
            We predict which solar assets fail next —
            <span className="text-solar">
              {" "}
              and recover them on the cheapest route.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Aging panels and inverters fail unpredictably. Today collection is
            reactive and wasteful. SolarCycle AI turns health data into a plan — in
            three steps.
          </p>
          <nav className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/problem"
              className="rounded-lg bg-ink px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-solar"
            >
              See the problem →
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-line px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
            >
              Jump to the live demo
            </Link>
          </nav>
        </m.div>

        {/* Scroll cue — fades as the hero leaves. */}
        <m.div
          aria-hidden
          style={{ opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
        >
          Scroll
          <span className="h-9 w-[1px] bg-gradient-to-b from-solar to-transparent" />
        </m.div>
      </section>
    </>
  );
}
