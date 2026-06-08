"use client";

// LazyMotion wrapper: loads only the `domAnimation` feature bundle (not the full
// motion engine) so the home-page islands ship less JS. Children use the `m.*`
// components (from motion/react-m) instead of `motion.*` to stay tree-shakeable.

import {
  LazyMotion,
  domAnimation,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import type { ReactNode, RefObject } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

// ── Scroll-linked (scrubbed) motion ──────────────────────────────────────────
// All home-page motion is bound to scroll position so it plays forward on
// scroll-down and REVERSES on scroll-up. Spring-smoothed for a glide, not a jitter.
// Every hook honours prefers-reduced-motion by returning the final/static value.

const SPRING = { stiffness: 120, damping: 30, restDelta: 0.001 } as const;

/**
 * Scrubbed reveal for a band: opacity + rise driven by the element's own scroll
 * progress. Enters as it arrives from the bottom, settles while centered, eases
 * back out near the top — fully reversible. Reduced motion → fully visible, no move.
 */
export function useScrubbedReveal(ref: RefObject<HTMLElement | null>) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  // 0=below viewport, 0.5=centered, 1=above. Fade+rise in over the first third,
  // hold through the middle, ease out in the last third.
  const opacity = useTransform(smooth, [0, 0.3, 0.7, 1], [0, 1, 1, 0.15]);
  const y = useTransform(smooth, [0, 0.3, 0.7, 1], [60, 0, 0, -40]);
  return reduce
    ? { opacity: 1 as const, y: 0 as const }
    : { opacity, y };
}

/**
 * Parallax y for a background layer: moves `distance`px across the element's pass
 * through the viewport. Positive distance drifts down, negative up. Reversible.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  distance = 80,
): MotionValue<number> | number {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  const y = useTransform(smooth, [0, 1], [-distance, distance]);
  return reduce ? 0 : y;
}
