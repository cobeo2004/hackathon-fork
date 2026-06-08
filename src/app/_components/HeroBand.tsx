"use client";

// Full-height hero, styled as a LIVE INSTRUMENT PANEL (the product's identity).
//
// Layers, back to front:
//  1. Faint grid + amber glow that PARALLAX on scroll (depth, reversible).
//  2. A slow horizontal "telemetry sweep" line that crosses the panel on a loop.
//  3. The headline reveals word-by-word on load (staggered rise), then the whole
//     foreground lifts + fades on scroll. Scroll cue + page progress rail kept.
//
// The cursor-reactive amber spotlight is now PAGE-WIDE (see CursorGlow.tsx, mounted
// from page.tsx) rather than scoped to this section.
//
// All motion honours prefers-reduced-motion: the sweep, parallax and scroll lift are
// dropped and the content renders in its final static state.

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

const HEAD_LEAD = ["We", "predict", "which", "solar", "assets", "fail", "next —"];
const HEAD_ACCENT = ["and", "recover", "them", "on", "the", "cheapest", "route."];

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
        {/* Parallax glow layer (static base glow). */}
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

        {/* Telemetry sweep — a thin amber line crossing the panel on a slow loop. */}
        {!reduce && (
          <m.div
            aria-hidden
            initial={{ x: "-20%", opacity: 0 }}
            animate={{ x: "120%", opacity: [0, 0.7, 0.7, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-solar/60 to-transparent"
          />
        )}

        <m.div
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative"
        >
          <m.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-solar align-middle" />
            Solar lifecycle &amp; recovery · Melbourne west &amp; north
          </m.p>

          <h1 className="mt-4 max-w-5xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] text-ink md:text-[76px]">
            <Words words={HEAD_LEAD} reduce={!!reduce} startDelay={0.15} />{" "}
            <span className="text-solar">
              <Words
                words={HEAD_ACCENT}
                reduce={!!reduce}
                startDelay={0.15 + HEAD_LEAD.length * 0.05}
              />
            </span>
          </h1>

          <m.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15 + (HEAD_LEAD.length + HEAD_ACCENT.length) * 0.05,
            }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          >
            Aging panels and inverters fail unpredictably. Today collection is
            reactive and wasteful. SolarCycle AI turns health data into a plan — in
            three steps.
          </m.p>

          <m.nav
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25 + (HEAD_LEAD.length + HEAD_ACCENT.length) * 0.05,
            }}
            className="mt-9 flex flex-wrap gap-3"
          >
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
          </m.nav>
        </m.div>

        {/* Scroll cue — fades as the hero leaves. */}
        <m.div
          aria-hidden
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
        >
          Scroll
          <span className="h-9 w-[1px] bg-gradient-to-b from-solar to-transparent" />
        </m.div>
      </section>
    </>
  );
}

// Word-by-word staggered rise. Under reduced motion the words render plainly (no
// per-word wrappers needed for movement, but kept for consistent spacing).
function Words({
  words,
  reduce,
  startDelay,
}: {
  words: readonly string[];
  reduce: boolean;
  startDelay: number;
}) {
  if (reduce) return <>{words.join(" ")}</>;
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <m.span
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: startDelay + i * 0.05,
            }}
            className="inline-block"
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </m.span>
        </span>
      ))}
    </>
  );
}
