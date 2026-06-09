// Reverse-logistics optimizer (MVP). Two strategies over the SAME demand, so the
// improvement is genuinely derived from the real coordinates (not a drawn line):
//
//   baseline  — reactive "received order": jobs handled first-reported-first-served,
//               no grouping. This is how manual dispatch actually behaves.
//   optimized — exact shortest depot→…→recycling-centre route. With the demo's small
//               stop count we brute-force every permutation, so the result is the true
//               optimum (and therefore always ≤ the baseline). Falls back to greedy
//               nearest-neighbour if the stop count ever grows too large to enumerate.

import { NODES, SITES, VEHICLE } from "../data/demo";
import { haversineKm, pathLengthKm, type LatLon } from "./geo";
import { buildHeuristicRoute, type CandidateScore } from "./routeHeuristic";

const byId = Object.fromEntries(
  [...SITES, ...NODES].map((p) => [
    "site_id" in p ? p.site_id : p.node_id,
    p as LatLon,
  ]),
);

export interface OptimizerResult {
  strategy: "baseline" | "optimized";
  stops: string[];
  distanceKm: number;
  collectedMassKg: number;
  skipped: { id: string; reason: string }[];
  scores?: CandidateScore[];
}

interface SiteLite {
  id: string;
  lat: number;
  lon: number;
  mass: number;
  risk: number;
}

function eligibleSites(): SiteLite[] {
  return SITES.filter((s) => s.status === "ready_for_collection").map((s) => ({
    id: s.site_id,
    lat: s.lat,
    lon: s.lon,
    mass: s.total_mass_kg,
    risk: s.risk_score,
  }));
}

/** Distance of depot → ordered sites → recycling centre. */
function routeDistance(order: SiteLite[]): number {
  const path = [byId["DEPOT_1"], ...order.map((s) => byId[s.id]), byId["RC_001"]];
  return pathLengthKm(path);
}

function summarize(
  strategy: OptimizerResult["strategy"],
  visited: SiteLite[],
  skipped: SiteLite[],
  scores?: CandidateScore[],
): OptimizerResult {
  return {
    strategy,
    stops: ["DEPOT_1", ...visited.map((s) => s.id), "RC_001"],
    distanceKm: Math.round(routeDistance(visited) * 10) / 10,
    collectedMassKg: visited.reduce((sum, s) => sum + s.mass, 0),
    skipped: skipped.map((s) => ({ id: s.id, reason: "vehicle_capacity_exceeded" })),
    scores,
  };
}

/** Select the sites that fit the vehicle (highest priority first); rest are skipped. */
function selectWithinCapacity(sites: SiteLite[]): { kept: SiteLite[]; skipped: SiteLite[] } {
  const byPriority = [...sites].sort((a, b) => b.risk - a.risk);
  const kept: SiteLite[] = [];
  const skipped: SiteLite[] = [];
  let load = 0;
  for (const s of byPriority) {
    if (load + s.mass <= VEHICLE.capacity_kg) {
      kept.push(s);
      load += s.mass;
    } else {
      skipped.push(s);
    }
  }
  return { kept, skipped };
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const out: T[][] = [];
  items.forEach((x, i) => {
    for (const rest of permutations([...items.slice(0, i), ...items.slice(i + 1)])) {
      out.push([x, ...rest]);
    }
  });
  return out;
}

function greedyNearestNeighbour(sites: SiteLite[]): SiteLite[] {
  const remaining = [...sites];
  const order: SiteLite[] = [];
  let current: LatLon = byId["DEPOT_1"];
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    order.push(next);
    current = next;
  }
  return order;
}

/** Reactive baseline: eligible jobs in received order, capacity-limited. */
export function baselineRoute(): OptimizerResult {
  const { kept, skipped } = selectWithinCapacity(eligibleSites());
  // received order = the order sites were reported (their natural id order)
  const received = kept.sort((a, b) => a.id.localeCompare(b.id));
  return summarize("baseline", received, skipped);
}

/** Optimized: exact shortest route over the capacity-feasible sites. */
export function optimizedRoute(): OptimizerResult {
  const depot = NODES.find((n) => n.node_id === "DEPOT_1");
  const destination = NODES.find((n) => n.node_id === "RC_001");
  if (!depot || !destination) {
    throw new Error("Demo logistics nodes are missing DEPOT_1 or RC_001");
  }

  // The heuristic selects capacity-feasible jobs by priority. The current small demo
  // then still uses an exact TSP pass for final ordering, equivalent to Google waypoint
  // optimization after the candidate set has been chosen.
  const heuristic = buildHeuristicRoute(SITES, depot, destination, VEHICLE);
  const kept = heuristic.orderedSites.map((s) => ({
    id: s.site_id,
    lat: s.lat,
    lon: s.lon,
    mass: s.total_mass_kg,
    risk: s.risk_score,
  }));
  const skipped = heuristic.skipped.map(({ site }) => ({
    id: site.site_id,
    lat: site.lat,
    lon: site.lon,
    mass: site.total_mass_kg,
    risk: site.risk_score,
  }));

  let best: SiteLite[];
  if (kept.length <= 8) {
    best = kept;
    let bestDist = routeDistance(kept);
    for (const order of permutations(kept)) {
      const d = routeDistance(order);
      if (d < bestDist) {
        bestDist = d;
        best = order;
      }
    }
  } else {
    best = greedyNearestNeighbour(kept); // large-N fallback
  }
  return summarize("optimized", best, skipped, heuristic.scores);
}
