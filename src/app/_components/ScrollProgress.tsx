"use client";

// Site-wide scroll-progress rail. A thin amber bar pinned to the very top of the
// viewport whose width tracks whole-page scroll (scaleX = scrollYProgress), spring-
// smoothed so it glides. A soft glowing dot rides the leading edge. Mounted once from
// the RSC root layout as a client island, so it slides on EVERY route without making
// the layout a client component (PPR stays intact).
//
// Reduced motion: the bar is hidden (scaleX 0, no glow) — no creeping/sliding motion.

import {
  m,
  useScroll,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { MotionProvider } from "./motion-features";

export function ScrollProgress() {
  return (
    <MotionProvider>
      <Inner />
    </MotionProvider>
  );
}

function Inner() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) return null;

  // Simple solid amber bar that scales from the left with scroll.
  return (
    <m.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[2000] h-[3px] origin-left bg-solar"
    />
  );
}
