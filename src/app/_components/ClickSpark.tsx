"use client";

// Click "energy burst" — every pointer-down fires a tiny solar spark at the
// cursor: a white-hot core flash, an expanding amber ring, and six radiating
// rays (the brand's sun glyph, animated). Site-wide client island (PPR-safe),
// pure CSS animations (keyframes in globals.css), elements removed on
// animation end. Honours prefers-reduced-motion: no sparks at all.

import { useCallback, useEffect, useState } from "react";

type Spark = { id: number; x: number; y: number };

const RAYS = [0, 60, 120, 180, 240, 300];
const MAX_SPARKS = 8;

let nextId = 0;

export function ClickSpark() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onPointerDown(e: PointerEvent) {
      if (reduce.matches) return;
      setSparks((prev) => [
        ...prev.slice(-(MAX_SPARKS - 1)),
        { id: nextId++, x: e.clientX, y: e.clientY },
      ]);
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const remove = useCallback((id: number) => {
    setSparks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  if (sparks.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2000]">
      {sparks.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          // The ring runs longest — when it ends, drop the whole spark.
          onAnimationEnd={(e) => {
            if (e.animationName === "spark-ring") remove(s.id);
          }}
        >
          {/* White-hot core flash. NOTE: no -translate-x/y utilities here —
              Tailwind v4 translate is the `translate` PROPERTY, which would
              stack with the keyframes' transform translate and double the
              offset. The keyframes own the centering. */}
          <span className="spark-core absolute rounded-full" />
          {/* Expanding amber ring */}
          <span className="spark-ring absolute rounded-full" />
          {/* Six rays — the sun glyph bursting */}
          {RAYS.map((deg) => (
            <span
              key={deg}
              className="spark-ray absolute"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
