// Imperative Leaflet map. We drive Leaflet directly (rather than react-leaflet) so the
// two trucks can be repositioned every animation frame without React re-renders.

import L from "leaflet";
import { useEffect, useRef } from "react";
import { BASELINE_ROUTE, NODES, OPTIMIZED_ROUTE, POINTS_BY_ID, SITES } from "../data/demo";
import type { Route, Site } from "../data/types";
import { haversineKm, type LatLon } from "../lib/geo";
import type { RoadRoute } from "../lib/roadRouting";
import type { FrameState } from "../hooks/useSimulation";

const STATUS_COLOR: Record<Site["status"], string> = {
  ready_for_collection: "#0ea5e9",
  forecasted: "#f59e0b",
  monitoring: "#f59e0b",
  active: "#3b82f6",
};

type SimStatus = "idle" | "running" | "done";

function routeLatLngs(route: Route): L.LatLngExpression[] {
  return route.stops.map((id) => [POINTS_BY_ID[id].lat, POINTS_BY_ID[id].lon]);
}

function roadLatLngs(road?: RoadRoute): L.LatLngExpression[] | undefined {
  return road?.coordinates.map((p) => [p.lat, p.lon]);
}

function routePath(route: Route, road?: RoadRoute): LatLon[] {
  return road?.coordinates.length ? road.coordinates : route.stops.map((id) => POINTS_BY_ID[id]);
}

function pointAtProgress(path: LatLon[], progress: number): LatLon {
  if (path.length === 0) return POINTS_BY_ID["DEPOT_1"];
  if (path.length === 1) return path[0];

  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const len = haversineKm(path[i - 1], path[i]);
    lens.push(len);
    total += len;
  }
  if (total === 0) return path[path.length - 1];

  const target = Math.max(0, Math.min(1, progress)) * total;
  let covered = 0;
  for (let i = 1; i < path.length; i++) {
    const len = lens[i - 1];
    if (target <= covered + len || i === path.length - 1) {
      const t = len === 0 ? 1 : (target - covered) / len;
      return {
        lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * t,
        lon: path[i - 1].lon + (path[i].lon - path[i - 1].lon) * t,
      };
    }
    covered += len;
  }
  return path[path.length - 1];
}

// Returns clockwise bearing in degrees from North (matches CSS rotate()).
function bearingDeg(from: LatLon, to: LatLon): number {
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function closestEquivalentAngle(prev: number | null, next: number): number {
  if (prev === null) return next;
  let adjusted = next;
  while (adjusted - prev > 180) adjusted -= 360;
  while (adjusted - prev < -180) adjusted += 360;
  return adjusted;
}

function truckIcon(color: string) {
  // SVG drawn pointing North (cab at top). Rotate via bearingDeg() at runtime.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="24" viewBox="0 0 30 48"
    style="transform-origin:50% 50%;transform-box:fill-box;transition:transform 0.14s linear;display:block">
    <rect x="3" y="17" width="24" height="25" rx="2" fill="${color}" stroke="white" stroke-width="1.5"/>
    <rect x="4" y="5" width="22" height="16" rx="4" fill="${color}" stroke="white" stroke-width="1.5"/>
    <rect x="7" y="6" width="16" height="8" rx="2" fill="rgba(200,235,255,0.75)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
    <rect x="0" y="9" width="4" height="9" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <rect x="26" y="9" width="4" height="9" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <rect x="0" y="25" width="4" height="8" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <rect x="26" y="25" width="4" height="8" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <rect x="0" y="33" width="4" height="8" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <rect x="26" y="33" width="4" height="8" rx="1.5" fill="#1a1a1a" stroke="white" stroke-width="0.5"/>
    <line x1="3" y1="25" x2="27" y2="25" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
    <line x1="3" y1="33" x2="27" y2="33" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
    <rect x="9" y="19" width="12" height="5" rx="1" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
  </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [15, 24],
    iconAnchor: [7, 12],
  });
}

function focusIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="focus-ping"></div>`,
    iconSize: [0, 0],
  });
}

function nodeIcon(label: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:rgba(255,255,255,0.85);color:#1a1611;border:1.5px solid ${color};border-radius:6px;padding:2px 5px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.2)">${label}</div>`,
    iconSize: [0, 0],
  });
}

interface GraphPoint {
  id: string;
  lat: number;
  lon: number;
}

// Build a sparse "candidate network": connect every node to its two nearest
// neighbours. Gives the map a graph-network look the routes are drawn on top of.
function networkEdges(): [GraphPoint, GraphPoint][] {
  const pts: GraphPoint[] = [
    ...SITES.map((s) => ({ id: s.site_id, lat: s.lat, lon: s.lon })),
    ...NODES.map((n) => ({ id: n.node_id, lat: n.lat, lon: n.lon })),
  ];
  const seen = new Set<string>();
  const edges: [GraphPoint, GraphPoint][] = [];
  for (const a of pts) {
    const nearest = pts
      .filter((b) => b.id !== a.id)
      .sort((b, c) => haversineKm(a, b) - haversineKm(a, c))
      .slice(0, 2);
    for (const b of nearest) {
      const key = [a.id, b.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }
  return edges;
}

export function MapView({
  showRoutes = false,
  networkGraph = false,
  subscribe,
  status = "idle",
  height = 420,
  roadRoutes,
}: {
  showRoutes?: boolean;
  networkGraph?: boolean;
  subscribe?: (cb: (f: FrameState) => void) => () => void;
  status?: SimStatus;
  height?: number;
  roadRoutes?: {
    baseline: RoadRoute;
    optimized: RoadRoute;
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baselineTruckRef = useRef<L.Marker | null>(null);
  const optimizedTruckRef = useRef<L.Marker | null>(null);
  const focusRef = useRef<L.Marker | null>(null);
  const followRef = useRef(false);
  const lastPanRef = useRef(0);
  const prevBasePosRef = useRef<LatLon | null>(null);
  const prevOptPosRef = useRef<LatLon | null>(null);
  const prevBaseAngleRef = useRef<number | null>(null);
  const prevOptAngleRef = useRef<number | null>(null);

  // Build the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-37.74, 144.86],
      zoom: 11,
      zoomControl: true,
      zoomSnap: 0.25,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    // Candidate network mesh (drawn first so it sits under everything else).
    if (networkGraph) {
      for (const [a, b] of networkEdges()) {
        L.polyline(
          [
            [a.lat, a.lon],
            [b.lat, b.lon],
          ],
          { color: "#94a3b8", weight: 1, opacity: 0.35, interactive: false },
        ).addTo(map);
      }
    }

    // Postcode demand markers: radius by real CER pre-2011 cohort.
    for (const s of SITES) {
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 6 + Math.sqrt(s.eol_cohort ?? 0) / 2,
        color: "#fff",
        weight: 1.5,
        fillColor: STATUS_COLOR[s.status],
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(
        `<strong>${s.site_name}</strong><br/>${s.lga} · ${s.postcode}<br/>` +
          `<span style="color:#0ea5e9;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Real postcode demand</span><br/>` +
          `Priority ${s.risk_score} · ${s.breaking_risk.replace(/_/g, " ")}<br/>` +
          `EOL planning window ${s.estimated_end_of_life_window}<br/>` +
          `<span style="color:#64748b;font-size:10px">Dot position: ABS 2021 Postal Area centroid approximation</span><br/>` +
          (s.postcode_installs
            ? `<hr style="margin:4px 0;border:none;border-top:1px solid #e2e8f0"/>` +
              `<span style="color:#0ea5e9;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">CER postcode context</span><br/>` +
              `<span style="color:#0ea5e9">${s.postcode_installs.toLocaleString()} rooftop installs · ${s.eol_cohort?.toLocaleString()} pre-2011 systems</span><br/>` +
              `<span style="color:#94a3b8;font-size:10px">Source: Clean Energy Regulator</span>`
            : ""),
      );
    }

    // Depot + recycling centre.
    for (const n of NODES) {
      const color = n.node_type === "depot" ? "#475569" : "#16a34a";
      const label = n.node_type === "depot" ? "DEPOT" : "PV DROP";
      L.marker([n.lat, n.lon], { icon: nodeIcon(label, color) })
        .addTo(map)
        .bindPopup(
          `<strong>${n.name}</strong><br/>${n.node_type.replace(/_/g, " ")}` +
            (n.address ? `<br/>${n.address}` : "") +
            (n.operator ? `<br/><span style="color:#64748b">${n.operator}</span>` : "") +
            (n.source
              ? `<br/><a href="${n.source}" target="_blank" rel="noreferrer" style="color:#0ea5e9;font-size:10px">source</a>`
              : ""),
        );
    }

    map.fitBounds(
      L.latLngBounds(SITES.map((s) => [s.lat, s.lon] as [number, number])).pad(0.25),
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [networkGraph]);

  // Routes + truck markers (only on the demo).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showRoutes) return;

    const baseLine = L.polyline(roadLatLngs(roadRoutes?.baseline) ?? routeLatLngs(BASELINE_ROUTE), {
      color: BASELINE_ROUTE.color,
      weight: 4,
      opacity: 0.7,
      dashArray: "8 6",
    }).addTo(map);
    const optLine = L.polyline(roadLatLngs(roadRoutes?.optimized) ?? routeLatLngs(OPTIMIZED_ROUTE), {
      color: OPTIMIZED_ROUTE.color,
      weight: 5,
      opacity: 0.9,
    }).addTo(map);

    const depot = POINTS_BY_ID["DEPOT_1"];
    const focus = L.marker([depot.lat, depot.lon], {
      icon: focusIcon(),
      zIndexOffset: 500,
      interactive: false,
    }).addTo(map);
    const baselineTruck = L.marker([depot.lat, depot.lon], {
      icon: truckIcon(BASELINE_ROUTE.color),
      zIndexOffset: 1000,
    }).addTo(map);
    const optimizedTruck = L.marker([depot.lat, depot.lon], {
      icon: truckIcon(OPTIMIZED_ROUTE.color),
      zIndexOffset: 1100,
    }).addTo(map);
    baselineTruckRef.current = baselineTruck;
    optimizedTruckRef.current = optimizedTruck;
    focusRef.current = focus;

    return () => {
      baseLine.remove();
      optLine.remove();
      baselineTruck.remove();
      optimizedTruck.remove();
      focus.remove();
      baselineTruckRef.current = null;
      optimizedTruckRef.current = null;
      focusRef.current = null;
      prevBasePosRef.current = null;
      prevOptPosRef.current = null;
      prevBaseAngleRef.current = null;
      prevOptAngleRef.current = null;
    };
  }, [showRoutes, roadRoutes]);

  // Camera: keep the whole region framed the entire time - no zoom or follow while
  // the trucks run, so judges always see both trucks and the full route network.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showRoutes) return;
    followRef.current = false;
    map.fitBounds(
      L.latLngBounds(SITES.map((s) => [s.lat, s.lon] as [number, number])).pad(0.25),
      { animate: true },
    );
  }, [status, showRoutes]);

  // Subscribe to simulation frames and move the trucks + focus halo imperatively.
  useEffect(() => {
    if (!subscribe) return;
    const unsub = subscribe((f) => {
      const baselinePath = routePath(BASELINE_ROUTE, roadRoutes?.baseline);
      const optimizedPath = routePath(OPTIMIZED_ROUTE, roadRoutes?.optimized);
      const baselinePos = pointAtProgress(baselinePath, f.baseline.progress);
      const optimizedPos = pointAtProgress(optimizedPath, f.optimized.progress);
      const optPos: L.LatLngExpression = [optimizedPos.lat, optimizedPos.lon];

      baselineTruckRef.current?.setLatLng([baselinePos.lat, baselinePos.lon]);
      optimizedTruckRef.current?.setLatLng(optPos);
      focusRef.current?.setLatLng(optPos);

      // Rotate each truck SVG to face its direction of travel.
      const rotateTruck = (
        markerRef: { current: L.Marker | null },
        prevRef: { current: LatLon | null },
        angleRef: { current: number | null },
        pos: LatLon,
      ) => {
        const prev = prevRef.current;
        if (prev && (pos.lat !== prev.lat || pos.lon !== prev.lon)) {
          const angle = closestEquivalentAngle(angleRef.current, bearingDeg(prev, pos));
          const svg = markerRef.current?.getElement()?.querySelector("svg") as HTMLElement | null;
          if (svg) svg.style.transform = `rotate(${angle}deg)`;
          angleRef.current = angle;
        }
        prevRef.current = pos;
      };
      rotateTruck(baselineTruckRef, prevBasePosRef, prevBaseAngleRef, baselinePos);
      rotateTruck(optimizedTruckRef, prevOptPosRef, prevOptAngleRef, optimizedPos);

      // Keep the blue truck centred while running, throttled so panning stays smooth.
      if (followRef.current && !f.optimized.done) {
        const now = performance.now();
        if (now - lastPanRef.current > 500) {
          lastPanRef.current = now;
          mapRef.current?.panTo(optPos, { animate: true, duration: 0.5 });
        }
      }
    });
    return unsub;
  }, [roadRoutes, subscribe]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
    />
  );
}

