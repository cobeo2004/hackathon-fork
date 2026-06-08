"use client";

// Imperative Leaflet map. We drive Leaflet directly (rather than react-leaflet) so the
// two trucks can be repositioned every animation frame without React re-renders.
//
// Client island: Leaflet touches `window`, so this is imported via next/dynamic with
// `ssr: false`. It reads route/site geometry from ~/data/demo directly — the same
// client-rendering exemption the simulation has — rather than through tRPC.

import L from "leaflet";
import { useEffect, useRef } from "react";
import { BASELINE_ROUTE, NODES, OPTIMIZED_ROUTE, POINTS_BY_ID, SITES } from "~/data/demo";
import type { Route, Site } from "~/data/types";
import { haversineKm } from "~/lib/geo";
import { formatNumber } from "~/lib/format";
import type { FrameState } from "./useSimulation";

const STATUS_COLOR: Record<Site["status"], string> = {
  ready_for_collection: "#dc2626",
  forecasted: "#f59e0b",
  monitoring: "#f59e0b",
  active: "#3b82f6",
};

type SimStatus = "idle" | "running" | "done";

function routeLatLngs(route: Route): L.LatLngExpression[] {
  return route.stops.map((id) => [POINTS_BY_ID[id].lat, POINTS_BY_ID[id].lon]);
}

function truckIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div class="truck-marker" style="background:${color}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
    html: `<div style="background:${color};color:#fff;border-radius:6px;padding:2px 5px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3)">${label}</div>`,
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
}: {
  showRoutes?: boolean;
  networkGraph?: boolean;
  subscribe?: (cb: (f: FrameState) => void) => () => void;
  status?: SimStatus;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baselineTruckRef = useRef<L.Marker | null>(null);
  const optimizedTruckRef = useRef<L.Marker | null>(null);
  const focusRef = useRef<L.Marker | null>(null);
  const followRef = useRef(false);
  const lastPanRef = useRef(0);

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

    // Site markers: colour by status, radius by mass.
    for (const s of SITES) {
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 6 + s.total_mass_kg / 90,
        color: "#fff",
        weight: 1.5,
        fillColor: STATUS_COLOR[s.status],
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(
        `<strong>${s.site_name}</strong><br/>${s.lga} · ${s.postcode}<br/>` +
          `<span style="color:#f59e0b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">◌ Demo scenario</span><br/>` +
          `Risk ${s.risk_score} · ${s.breaking_risk.replace(/_/g, " ")}<br/>` +
          `Mass ${s.total_mass_kg} kg · EOL ${s.estimated_end_of_life_window}<br/>` +
          `Status: ${s.status.replace(/_/g, " ")}<br/>` +
          (s.postcode_installs
            ? `<hr style="margin:4px 0;border:none;border-top:1px solid #e2e8f0"/>` +
              `<span style="color:#0ea5e9;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">● CER postcode context</span><br/>` +
              `<span style="color:#0ea5e9">${formatNumber(s.postcode_installs)} rooftop installs · ${s.eol_cohort != null ? formatNumber(s.eol_cohort) : "—"} nearing EOL</span><br/>` +
              `<span style="color:#94a3b8;font-size:10px">Source: Clean Energy Regulator</span>`
            : ""),
      );
    }

    // Depot + recycling centre.
    for (const n of NODES) {
      const color = n.node_type === "depot" ? "#475569" : "#0ea5e9";
      const label = n.node_type === "depot" ? "DEPOT" : "RECYCLING";
      L.marker([n.lat, n.lon], { icon: nodeIcon(label, color) })
        .addTo(map)
        .bindPopup(
          `<strong>${n.name}</strong><br/>${n.node_type.replace(/_/g, " ")}` +
            (n.address ? `<br/>${n.address}` : "") +
            (n.operator ? `<br/><span style="color:#64748b">${n.operator}</span>` : "") +
            (n.assumed_capacity_kg_per_day
              ? `<br/><span style="color:#f59e0b;font-size:10px;font-weight:700;text-transform:uppercase">◌ Assumed demo capacity:</span> ${formatNumber(n.assumed_capacity_kg_per_day)} kg/day`
              : "") +
            (n.source
              ? `<br/><a href="${n.source}" target="_blank" rel="noreferrer" style="color:#0ea5e9;font-size:10px">source ↗</a>`
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

    const baseLine = L.polyline(routeLatLngs(BASELINE_ROUTE), {
      color: BASELINE_ROUTE.color,
      weight: 4,
      opacity: 0.7,
      dashArray: "8 6",
    }).addTo(map);
    const optLine = L.polyline(routeLatLngs(OPTIMIZED_ROUTE), {
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
    };
  }, [showRoutes]);

  // Camera: keep the whole region framed the entire time — no zoom or follow while
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
      const optPos: L.LatLngExpression = [f.optimized.pos.lat, f.optimized.pos.lon];
      baselineTruckRef.current?.setLatLng([f.baseline.pos.lat, f.baseline.pos.lon]);
      optimizedTruckRef.current?.setLatLng(optPos);
      focusRef.current?.setLatLng(optPos);

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
  }, [subscribe]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
    />
  );
}
