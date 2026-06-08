"use client";

// Count-up hook: animates 0 → target when the element scrolls into view, once.
// Driven by motion's `animate()` + `useInView`. Respects reduced-motion (snaps to
// the final value). Returns a ref to attach and the current display value.

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, { duration = 1.2 } = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, target, duration]);

  return { ref, value };
}
