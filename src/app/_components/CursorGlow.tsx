"use client";

// Page-wide cursor spotlight. A fixed, full-viewport layer (behind content) where an
// amber radial pool trails the pointer and a tighter mask lights up an amber grid only
// under the cursor — so the whole landing page reads as one "live instrument panel",
// not just the hero. Tracks the pointer on `window` in viewport coordinates.
//
// Sits at the page level (mounted from the RSC shell as a client island) so it does
// NOT break PPR. Renders nothing under reduced motion. `pointer-events-none` + low
// z-index keep it purely decorative — it never intercepts clicks.

import { useEffect } from "react";
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import { MotionProvider } from "./motion-features";

export function CursorGlow() {
  return (
    <MotionProvider>
      <Inner />
    </MotionProvider>
  );
}

function Inner() {
  const reduce = useReducedMotion();

  // Pointer position as a 0..1 fraction of the viewport; spring-smoothed so the glow
  // trails softly. Default upper-right (matches the hero's static base glow) before
  // the first move. Fractions stay correct on resize without re-measuring.
  const px = useMotionValue(0.82);
  const py = useMotionValue(0.18);
  const sx = useSpring(px, { stiffness: 150, damping: 26, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 150, damping: 26, mass: 0.4 });
  const xPct = useTransform(sx, (n) => `${(n * 100).toFixed(2)}%`);
  const yPct = useTransform(sy, (n) => `${(n * 100).toFixed(2)}%`);

  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${xPct} ${yPct}, rgba(224,124,8,0.14), transparent 70%)`;
  const gridMask = useMotionTemplate`radial-gradient(340px circle at ${xPct} ${yPct}, #000 0%, transparent 72%)`;

  useEffect(() => {
    if (reduce) return;
    function onMove(e: PointerEvent) {
      px.set(e.clientX / window.innerWidth);
      py.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* Amber grid revealed only under the cursor via a radial mask. */}
      <m.div
        style={{ WebkitMaskImage: gridMask, maskImage: gridMask }}
        className="absolute inset-0 [background-image:linear-gradient(rgba(224,124,8,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(224,124,8,0.14)_1px,transparent_1px)] [background-size:54px_54px]"
      />
      {/* Amber pool that trails the cursor. */}
      <m.div style={{ background: spotlight }} className="absolute inset-0" />
    </div>
  );
}
