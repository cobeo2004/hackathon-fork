"use client";

// LazyMotion wrapper: loads only the `domAnimation` feature bundle (not the full
// motion engine) so the home-page islands ship less JS. Children use the `m.*`
// components (from motion/react-m) instead of `motion.*` to stay tree-shakeable.

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

// The shared reveal preset — matches globals.css `.reveal` (opacity + rise) and the
// house easing. Used by every scroll-in band via whileInView.
export const revealUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

// Stagger container/child pair for rows of cards or stats.
export const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: "-80px" },
  transition: { staggerChildren: 0.08 },
};

export const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};
