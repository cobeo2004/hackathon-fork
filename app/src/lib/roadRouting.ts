import { COSTS, POINTS_BY_ID } from "../data/demo";
import type { Route } from "../data/types";
import type { LatLon } from "./geo";

export interface RoadRoute {
  provider: "osrm" | "fallback";
  stops: string[];
  distanceKm: number;
  durationMin?: number;
  coordinates: LatLon[];
}

interface OsrmRouteResponse {
  code: string;
  message?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  }>;
}

function stopCoordinates(stops: string[]): string {
  return stops
    .map((id) => {
      const point = POINTS_BY_ID[id];
      if (!point) throw new Error(`Unknown route stop: ${id}`);
      return `${point.lon},${point.lat}`;
    })
    .join(";");
}

export function fallbackRoadRoute(route: Pick<Route, "stops" | "total_distance_km">): RoadRoute {
  return {
    provider: "fallback",
    stops: route.stops,
    distanceKm: route.total_distance_km,
    durationMin: Math.round((route.total_distance_km / COSTS.fallback_average_speed_kmh) * 60),
    coordinates: route.stops.map((id) => {
      const point = POINTS_BY_ID[id];
      return { lat: point.lat, lon: point.lon };
    }),
  };
}

export async function fetchOsrmRoadRoute(
  stops: string[],
  signal?: AbortSignal,
): Promise<RoadRoute> {
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${stopCoordinates(stops)}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM request failed: HTTP ${res.status}`);

  const body = (await res.json()) as OsrmRouteResponse;
  const first = body.routes?.[0];
  if (body.code !== "Ok" || !first) {
    throw new Error(body.message ?? `OSRM request failed: ${body.code}`);
  }

  return {
    provider: "osrm",
    stops,
    distanceKm: Math.round((first.distance / 1000) * 10) / 10,
    durationMin: Math.round(first.duration / 60),
    coordinates: first.geometry.coordinates.map(([lon, lat]) => ({ lat, lon })),
  };
}
