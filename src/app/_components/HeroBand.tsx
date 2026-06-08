"use client";

// Hero band: the elevated landing headline. Eyebrow + headline + sub + CTAs
// stagger in on load; the amber radial glow behind the text drifts on scroll
// (parallax). Text never parallaxes. Reduced-motion disables the drift.

import Link from "next/link";
import { m, useScroll, useTransform, useReducedMotion } from "motion/react";
import { MotionProvider, staggerContainer, staggerChild } from "./motion-features";

export function HeroBand() {
  return (
    <MotionProvider>
      <HeroInner />
    </MotionProvider>
  );
}

function HeroInner() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // Glow drifts up + fades slightly as you scroll past the hero.
  const glowY = useTransform(scrollY, [0, 500], [0, -80]);
  const glowOpacity = useTransform(scrollY, [0, 400], [1, 0.35]);

  return (
    <section className="relative overflow-hidden">
      {/* Parallax glow layer — purely decorative, behind the text. */}
      <m.div
        aria-hidden
        style={{ y: reduce ? 0 : glowY, opacity: reduce ? 1 : glowOpacity }}
        className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(224,124,8,0.18),transparent)] blur-2xl"
      />
      <m.div
        variants={staggerContainer}
        initial="initial"
        animate="whileInView"
        transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
        className="relative"
      >
        <m.p
          variants={staggerChild}
          className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar"
        >
          Solar lifecycle &amp; recovery · Melbourne west &amp; north
        </m.p>
        <m.h1
          variants={staggerChild}
          className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]"
        >
          We predict which solar assets fail next —
          <span className="text-solar">
            {" "}
            and recover them on the cheapest possible route.
          </span>
        </m.h1>
        <m.p
          variants={staggerChild}
          className="mt-4 max-w-2xl text-base leading-relaxed text-muted"
        >
          Aging panels and inverters fail unpredictably. Today collection is
          reactive and wasteful. SolarCycle AI turns health data into a plan — in
          three steps.
        </m.p>
        <m.nav variants={staggerChild} className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/problem"
            className="rounded-lg bg-ink px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-solar"
          >
            See the problem →
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border border-line px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
          >
            Jump to the live demo
          </Link>
        </m.nav>
      </m.div>
    </section>
  );
}
