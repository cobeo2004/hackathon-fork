"use client";

// Home-page scroll-progress rail: a thin amber bar pinned to the top of the viewport
// whose fill tracks how far down the page you've scrolled (0% at the top, 100% at the
// bottom). A soft dot rides the leading edge.
//
// Why this is hand-rolled rather than motion's useScroll(): the app shell sets
// `html, body { height: 100% }`. That makes `<body>` (not `<html>`) the actual scrolling
// element, so anything that measures `document.documentElement` reads scrollHeight ==
// clientHeight and never advances. We instead read scroll position and total scroll range
// from whichever element is really scrolling (documentElement OR body, whichever reports a
// non-zero range), every frame via rAF. Width is driven by a direct CSS transform — no
// spring/measurement library in the path — so there is nothing left to misread.
//
// Reduced motion: the bar is hidden entirely.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  // Portal to <body> so the fixed rail escapes the landing wrapper's `relative z-10`
  // stacking context — otherwise the sticky header (its own stacking context) paints
  // over the rail no matter how high its z-index is.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (reduce) return;

    const doc = document.documentElement;
    const body = document.body;

    const measure = () => {
      rafRef.current = null;
      // Pick whichever element actually scrolls (height:100% on <html> pushes the
      // overflow onto <body>). Fall back to window.scrollY for the documentElement case.
      const docRange = doc.scrollHeight - doc.clientHeight;
      const bodyRange = body.scrollHeight - body.clientHeight;
      let range = docRange;
      let pos = window.scrollY || doc.scrollTop;
      if (bodyRange > docRange) {
        range = bodyRange;
        pos = body.scrollTop || window.scrollY;
      }
      const p = range > 0 ? Math.min(1, Math.max(0, pos / range)) : 0;

      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (dotRef.current) dotRef.current.style.left = `${p * 100}%`;
    };

    const onScroll = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(measure);
    };

    measure();
    // Capture phase so we catch scroll on whichever element/container dispatches it.
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, mounted]);

  if (reduce || !mounted) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[3000] h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-solar"
        style={{ transform: "scaleX(0)", transition: "transform 80ms linear" }}
      />
      <div
        ref={dotRef}
        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-solar shadow-[0_0_8px_2px_rgba(224,124,8,0.6)]"
        style={{ left: "0%", transition: "left 80ms linear" }}
      />
    </div>,
    document.body,
  );
}
