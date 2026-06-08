"use client";

// Closing CTA band. Scrubbed scale + fade entrance (grows in as it scrolls up to
// center, eases back on scroll-up), amber glow parallax, hover lift on the buttons.

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

export function CtaBand() {
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
    offset: ["start end", "center center"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const scale = useTransform(smooth, [0, 1], [0.92, 1]);
  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const glowY = useParallax(ref, 70);

  return (
    <m.section
      ref={ref}
      style={reduce ? undefined : { scale, opacity }}
      className="relative overflow-hidden rounded-xl border border-line bg-panel p-10 text-center shadow-[0_1px_0_rgba(26,22,17,0.04),0_12px_30px_-22px_rgba(26,22,17,0.35)] md:p-16"
    >
      <m.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(224,124,8,0.18),transparent)] blur-2xl"
      />
      <div className="relative">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
          Problem → Solution → Demo
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.01em] text-ink md:text-[48px]">
          See a failing inverter become a scheduled recovery.
        </h2>
        <nav className="mt-8 flex flex-wrap justify-center gap-3">
          <m.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link
              href="/demo"
              className="inline-block rounded-lg bg-recover px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-wide text-white shadow-[0_8px_22px_-10px_rgba(29,122,77,0.9)] transition-[filter] hover:brightness-110"
            >
              Run the live demo →
            </Link>
          </m.span>
          <m.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Link
              href="/problem"
              className="inline-block rounded-lg border border-line px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
            >
              Start from the problem
            </Link>
          </m.span>
        </nav>
      </div>
    </m.section>
  );
}
