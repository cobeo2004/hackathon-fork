"use client";

// Deterministic two-truck simulation engine for the Live Demo.
//
// Both trucks move at the SAME ground speed, so the optimized truck (shorter route)
// visibly finishes earlier. Cumulative cost/distance are sampled over time to feed
// the two live comparison charts, and always land exactly on the canonical totals.
//
// Client animation island: imports route geometry from ~/data/demo directly. This
// is the documented exemption from the tRPC boundary — it is animation math, not a
// server data read.

import { useCallback, useEffect, useRef, useState } from "react";
import { BASELINE_ROUTE, COSTS, OPTIMIZED_ROUTE, POINTS_BY_ID } from "~/data/demo";
import type { Route } from "~/data/types";
import { haversineKm, lerpLatLon, type LatLon } from "~/lib/geo";
import { routeCost } from "~/lib/cost";

const BASELINE_SECONDS = 13; // wall-clock duration of the baseline run at 1x speed
const SAMPLE_INTERVAL_MS = 180; // how often the charts get a new data point
const DEFAULT_SPEED_MULTIPLIER = 1;
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 2.5;

type Status = "idle" | "running" | "done";

export interface SimSample {
  t: number; // seconds since start
  baselineCost: number;
  optimizedCost: number;
  baselineDist: number;
  optimizedDist: number;
}

export interface TruckState {
  pos: LatLon;
  progress: number; // 0..1
  done: boolean;
}

export interface FrameState {
  baseline: TruckState;
  optimized: TruckState;
}

type FrameListener = (f: FrameState) => void;

// Precomputed geometry for one route: per-segment endpoints + cumulative km,
// scaled so the route's total matches the canonical demo distance exactly.
interface RouteGeometry {
  segs: { a: LatLon; b: LatLon; len: number; startKm: number }[];
  totalKm: number;
  totalDurationMin: number;
  handlingPerStop: number;
  collectionStopBoundaries: number[]; // cumulative km at which a POA_ collection stop is reached
  depotDepartureBoundaries: number[]; // cumulative km at which the truck arrives at an intermediate depot (new dispatch)
}

function buildGeometry(route: Route, handlingPerStop: number): RouteGeometry {
  const pts = route.stops.map((id) => POINTS_BY_ID[id]);
  const rawLens: number[] = [];
  let rawTotal = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = haversineKm(pts[i - 1], pts[i]);
    rawLens.push(len);
    rawTotal += len;
  }
  const scale = route.total_distance_km / rawTotal;

  const segs: RouteGeometry["segs"] = [];
  const collectionStopBoundaries: number[] = [];
  const depotDepartureBoundaries: number[] = [];
  let startKm = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = rawLens[i - 1] * scale;
    segs.push({ a: pts[i - 1], b: pts[i], len, startKm });
    startKm += len;
    // Only POA_ stops are collection stops (depot returns and mid-route RCs are not)
    if (route.stops[i].startsWith("POA_")) collectionStopBoundaries.push(startKm);
    // Intermediate depot arrivals mark the start of a new dispatch
    if (i > 0 && route.stops[i] === "DEPOT_1") depotDepartureBoundaries.push(startKm);
  }

  return {
    segs,
    totalKm: route.total_distance_km,
    totalDurationMin: (route.total_distance_km / COSTS.fallback_average_speed_kmh) * 60,
    handlingPerStop,
    collectionStopBoundaries,
    depotDepartureBoundaries,
  };
}

function truckAt(geo: RouteGeometry, distanceKm: number): TruckState {
  const d = Math.min(distanceKm, geo.totalKm);
  let pos = geo.segs[geo.segs.length - 1].b;
  for (const seg of geo.segs) {
    if (d <= seg.startKm + seg.len || seg.len === 0) {
      const t = seg.len === 0 ? 1 : (d - seg.startKm) / seg.len;
      pos = lerpLatLon(seg.a, seg.b, Math.max(0, Math.min(1, t)));
      break;
    }
  }
  return { pos, progress: d / geo.totalKm, done: distanceKm >= geo.totalKm };
}

function costAt(geo: RouteGeometry, distanceKm: number): number {
  const d = Math.min(distanceKm, geo.totalKm);
  const stopsDone = (geo.collectionStopBoundaries ?? []).filter((b) => d >= b).length;
  const dispatchCount = 1 + (geo.depotDepartureBoundaries ?? []).filter((b) => d >= b).length;
  return routeCost({
    distance_km: d,
    duration_min: geo.totalKm > 0 ? (d / geo.totalKm) * geo.totalDurationMin : 0,
    collection_stops: stopsDone,
    handling_per_stop: geo.handlingPerStop,
    dispatch_count: dispatchCount,
  });
}

export function useSimulation() {
  const baseGeo = useRef(buildGeometry(BASELINE_ROUTE, COSTS.baseline_handling_per_stop));
  const optGeo = useRef(buildGeometry(OPTIMIZED_ROUTE, COSTS.optimized_handling_per_stop));

  const [status, setStatus] = useState<Status>("idle");
  const [series, setSeries] = useState<SimSample[]>([]);
  const [speedMultiplier, setSpeedMultiplierState] = useState(DEFAULT_SPEED_MULTIPLIER);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const lastSampleRef = useRef<number>(0);
  const baselineDistanceRef = useRef<number>(0);
  const optimizedDistanceRef = useRef<number>(0);
  const samplesRef = useRef<SimSample[]>([]);
  const listenersRef = useRef<Set<FrameListener>>(new Set());
  // Ref-backed so the rAF tick reads the live speed without re-binding `start`.
  const speedMultiplierRef = useRef(DEFAULT_SPEED_MULTIPLIER);

  const speedKmPerSec = baseGeo.current.totalKm / BASELINE_SECONDS;

  const setSpeedMultiplier = useCallback((value: number) => {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, value));
    speedMultiplierRef.current = clamped;
    setSpeedMultiplierState(clamped);
  }, []);

  const subscribe = useCallback((cb: FrameListener) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const emit = useCallback((f: FrameState) => {
    listenersRef.current.forEach((cb) => cb(f));
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    samplesRef.current = [];
    baselineDistanceRef.current = 0;
    optimizedDistanceRef.current = 0;
    setSeries([]);
    setStatus("running");
    startRef.current = performance.now();
    lastFrameRef.current = startRef.current;
    lastSampleRef.current = -Infinity;

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      // Distance accumulates per-frame at the live speed, so dragging the speed bar
      // mid-run takes effect immediately (no jump). Both trucks share the same ground
      // speed; the shorter (optimized) route simply finishes first.
      const deltaSeconds = Math.max(0, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      const deltaKm = deltaSeconds * speedKmPerSec * speedMultiplierRef.current;
      baselineDistanceRef.current += deltaKm;
      optimizedDistanceRef.current += deltaKm;
      const baseDist = baselineDistanceRef.current;
      const optDist = optimizedDistanceRef.current;

      const baseline = truckAt(baseGeo.current, baseDist);
      const optimized = truckAt(optGeo.current, optDist);
      emit({ baseline, optimized });

      if (t - lastSampleRef.current >= SAMPLE_INTERVAL_MS / 1000) {
        lastSampleRef.current = t;
        samplesRef.current = [
          ...samplesRef.current,
          {
            t: Math.round(t * 10) / 10,
            baselineCost: Math.round(costAt(baseGeo.current, baseDist)),
            optimizedCost: Math.round(costAt(optGeo.current, optDist)),
            baselineDist: Math.round(Math.min(baseDist, baseGeo.current.totalKm)),
            optimizedDist: Math.round(Math.min(optDist, optGeo.current.totalKm)),
          },
        ];
        setSeries(samplesRef.current);
      }

      if (baseline.done && optimized.done) {
        // Pin the final sample to exact canonical totals.
        const finalSample: SimSample = {
          t: Math.round(t * 10) / 10,
          baselineCost: Math.round(costAt(baseGeo.current, baseGeo.current.totalKm)),
          optimizedCost: Math.round(costAt(optGeo.current, optGeo.current.totalKm)),
          baselineDist: BASELINE_ROUTE.total_distance_km,
          optimizedDist: OPTIMIZED_ROUTE.total_distance_km,
        };
        samplesRef.current = [...samplesRef.current, finalSample];
        setSeries(samplesRef.current);
        setStatus("done");
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [emit, speedKmPerSec, stop]);

  // Park both trucks at their depots before the first run / after reset.
  const reset = useCallback(() => {
    stop();
    samplesRef.current = [];
    baselineDistanceRef.current = 0;
    optimizedDistanceRef.current = 0;
    setSeries([]);
    setStatus("idle");
    emit({
      baseline: truckAt(baseGeo.current, 0),
      optimized: truckAt(optGeo.current, 0),
    });
  }, [emit, stop]);

  useEffect(() => stop, [stop]);

  return { status, series, start, reset, subscribe, speedMultiplier, setSpeedMultiplier };
}
