"use client";

// Direction-aware route slide-over. On every navigation a full-screen, logo-bearing
// panel sweeps across to COVER the page, then off the far side to REVEAL the new
// route. Direction follows nav order (RANK): going DEEPER (Home→Problem→Solution→Demo)
// sweeps L→R (forward); going back/up — including browser Back, since usePathname()
// updates on popstate — sweeps R→L.
//
// Mounted once from the RSC root layout as a client island, so it overlays every route
// without making the layout a client component (PPR stays intact). Renders nothing
// under reduced motion — navigation then falls back to the native experimental
// viewTransition cross-fade, which is itself disabled under reduced motion (instant,
// accessible nav).

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { MotionProvider } from "./motion-features";

// Nav order — higher rank = deeper. Drives forward (L→R) vs back (R→L).
const RANK: Record<string, number> = {
  "/": 0,
  "/problem": 1,
  "/solution": 2,
  "/demo": 3,
};

function rankOf(path: string): number {
  return RANK[path] ?? 99; // unknown paths read as "deep" → default forward
}

export function RouteTransition() {
  return (
    <MotionProvider>
      <Inner />
    </MotionProvider>
  );
}

type Run = { id: number; dir: "forward" | "back" };

function Inner() {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  const prevPath = useRef<string | null>(null);
  const seq = useRef(0);
  const [run, setRun] = useState<Run | null>(null);

  useEffect(() => {
    // First commit: record the landing path, never sweep on initial load.
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;

    const dir = rankOf(pathname) > rankOf(prevPath.current) ? "forward" : "back";
    prevPath.current = pathname;
    if (reduce) return; // native VT handles it; no overlay
    seq.current += 1;
    setRun({ id: seq.current, dir });
  }, [pathname, reduce]);

  if (reduce || run === null) return null;

  const forward = run.dir === "forward";
  // Cover from the lead edge, hold, then exit the far side (reveals the new page).
  const xKeyframes = forward
    ? ["-100%", "0%", "0%", "100%"]
    : ["100%", "0%", "0%", "-100%"];
  // The amber leading stripe rides the edge that enters first.
  const stripeSide = forward ? "right-0" : "left-0";

  return (
    <m.div
      key={run.id}
      aria-hidden
      initial={{ x: xKeyframes[0] }}
      animate={{ x: xKeyframes }}
      transition={{
        duration: 1.3,
        times: [0, 0.42, 0.5, 1],
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationComplete={() => setRun(null)}
      className="pointer-events-auto fixed inset-0 z-[3000] flex items-center justify-center overflow-hidden bg-paper"
    >
      {/* The page's own atmosphere — solar glow + faint ink grid (mirrors body in
          globals.css) so the panel reads as the instrument surface sliding over,
          not a foreign slab. */}
      <span className="pointer-events-none absolute inset-0 [background:radial-gradient(900px_520px_at_95%_-10%,rgba(224,124,8,0.10),transparent_60%)]" />
      <span className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(26,22,17,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(26,22,17,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      {/* Soft amber bloom centered on the lockup. */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(224,124,8,0.14),transparent)] blur-2xl" />

      {/* Amber leading-edge stripe on the side that sweeps in first. */}
      <span
        className={`pointer-events-none absolute inset-y-0 ${stripeSide} w-1.5 bg-solar`}
      />

      {/* Logo lockup — fades + scales in while the panel covers. */}
      <m.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0, 1, 1, 1, 1], scale: [0.92, 1, 1, 1, 1] }}
        transition={{
          duration: 1.3,
          times: [0, 0.3, 0.5, 0.82, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative flex flex-col items-center gap-4 text-center"
      >
        <Image src="/logo-transparent.png" alt="" width={56} height={56} priority />
        <div className="font-display text-2xl font-extrabold tracking-tight text-ink">
          SolarCycle<span className="text-solar"> AI</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-solar" />
          Predict · Plan · Recover
        </div>
      </m.div>
    </m.div>
  );
}
