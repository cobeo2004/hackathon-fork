"use client";

// Closing CTA band: reveals on scroll, amber-glow panel, two routes out.

import Link from "next/link";
import { m } from "motion/react";
import { MotionProvider, revealUp } from "./motion-features";

export function CtaBand() {
  return (
    <MotionProvider>
      <m.section
        {...revealUp}
        className="relative overflow-hidden rounded-xl border border-line bg-panel p-8 text-center shadow-[0_1px_0_rgba(26,22,17,0.04),0_12px_30px_-22px_rgba(26,22,17,0.35)] md:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(224,124,8,0.16),transparent)] blur-2xl"
        />
        <div className="relative">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
            Problem → Solution → Demo
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink md:text-[40px]">
            See a failing inverter become a scheduled recovery.
          </h2>
          <nav className="mt-7 flex flex-wrap justify-center gap-3">
            <m.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                href="/demo"
                className="inline-block rounded-lg bg-recover px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-white shadow-[0_8px_22px_-10px_rgba(29,122,77,0.9)] transition-[filter] hover:brightness-110"
              >
                Run the live demo →
              </Link>
            </m.span>
            <m.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                href="/problem"
                className="inline-block rounded-lg border border-line px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
              >
                Start from the problem
              </Link>
            </m.span>
          </nav>
        </div>
      </m.section>
    </MotionProvider>
  );
}
