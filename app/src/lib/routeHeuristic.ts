import type { LogisticsNode, Site, Vehicle } from "../data/types";
import { haversineKm, type LatLon } from "./geo";

export interface RouteMatrixProvider {
  distanceKm(from: LatLon, to: LatLon): number;
}

export interface CandidateScore {
  siteId: string;
  score: number;
  parts: {
    risk: number;
    mass: number;
    age: number;
    facilityFit: number;
    routeEfficiency: number;
    confidence: number;
  };
}

const WEIGHTS = {
  risk: 0.35,
  mass: 0.2,
  age: 0.15,
  facilityFit: 0.1,
  routeEfficiency: 0.1,
  confidence: 0.1,
} as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const round3 = (v: number) => Math.round(v * 1000) / 1000;

export const haversineMatrixProvider: RouteMatrixProvider = {
  distanceKm: haversineKm,
};

function parseEolStartYear(window: string): number | undefined {
  const match = window.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function ageUrgencyScore(site: Site, currentYear = new Date().getFullYear()): number {
  const eolStart = parseEolStartYear(site.estimated_end_of_life_window);
  if (!eolStart) return 0.35;

  // Full urgency once the EOL window is current/past; fades to zero beyond 10 years.
  return clamp01((10 - Math.max(0, eolStart - currentYear)) / 10);
}

function facilityFitScore(facility: LogisticsNode): number {
  const text = `${facility.node_type} ${facility.name} ${facility.operator ?? ""}`.toLowerCase();
  if (text.includes("solar") || text.includes("e-waste") || text.includes("recycling")) return 1;
  if (facility.node_type === "recycling_center") return 0.8;
  return 0.35;
}

function confidenceScore(site: Site): number {
  let score = 0.35;
  if (site.postcode_installs !== undefined) score += 0.25;
  if (site.eol_cohort !== undefined) score += 0.2;
  if (site.status === "ready_for_collection") score += 0.2;
  return clamp01(score);
}

function routeEfficiencyScore(
  current: LatLon,
  site: Site,
  destination: LogisticsNode,
  provider: RouteMatrixProvider,
): number {
  const extraKm =
    provider.distanceKm(current, site) +
    provider.distanceKm(site, destination) -
    provider.distanceKm(current, destination);

  // 0 extra km is best. At 80+ marginal km the route is inefficient for this metro demo.
  return clamp01(1 - Math.max(0, extraKm) / 80);
}

export function scoreRouteCandidate(
  site: Site,
  context: {
    current: LatLon;
    destination: LogisticsNode;
    maxMassKg: number;
    provider?: RouteMatrixProvider;
    currentYear?: number;
  },
): CandidateScore {
  const provider = context.provider ?? haversineMatrixProvider;
  const parts = {
    risk: clamp01(site.risk_score),
    mass: context.maxMassKg > 0 ? clamp01(site.total_mass_kg / context.maxMassKg) : 0,
    age: ageUrgencyScore(site, context.currentYear),
    facilityFit: facilityFitScore(context.destination),
    routeEfficiency: routeEfficiencyScore(context.current, site, context.destination, provider),
    confidence: confidenceScore(site),
  };

  const score =
    WEIGHTS.risk * parts.risk +
    WEIGHTS.mass * parts.mass +
    WEIGHTS.age * parts.age +
    WEIGHTS.facilityFit * parts.facilityFit +
    WEIGHTS.routeEfficiency * parts.routeEfficiency +
    WEIGHTS.confidence * parts.confidence;

  return {
    siteId: site.site_id,
    score: round3(score),
    parts: {
      risk: round3(parts.risk),
      mass: round3(parts.mass),
      age: round3(parts.age),
      facilityFit: round3(parts.facilityFit),
      routeEfficiency: round3(parts.routeEfficiency),
      confidence: round3(parts.confidence),
    },
  };
}

export function buildHeuristicRoute(
  sites: Site[],
  depot: LogisticsNode,
  destination: LogisticsNode,
  vehicle: Vehicle,
  provider: RouteMatrixProvider = haversineMatrixProvider,
): { orderedSites: Site[]; skipped: { site: Site; reason: string }[]; scores: CandidateScore[] } {
  const candidates = sites.filter((s) => s.status === "ready_for_collection");
  const maxMassKg = Math.max(0, ...candidates.map((s) => s.total_mass_kg));
  const remaining = [...candidates];
  const orderedSites: Site[] = [];
  const skipped: { site: Site; reason: string }[] = [];
  const scores: CandidateScore[] = [];
  let loadKg = 0;
  let current: LatLon = depot;

  while (remaining.length > 0) {
    const feasible = remaining.filter((s) => loadKg + s.total_mass_kg <= vehicle.capacity_kg);
    if (feasible.length === 0) {
      skipped.push(...remaining.map((site) => ({ site, reason: "vehicle_capacity_exceeded" })));
      break;
    }

    const ranked = feasible
      .map((site) => scoreRouteCandidate(site, { current, destination, maxMassKg, provider }))
      .sort((a, b) => b.score - a.score);
    const bestScore = ranked[0];
    const bestIndex = remaining.findIndex((s) => s.site_id === bestScore.siteId);
    const [bestSite] = remaining.splice(bestIndex, 1);

    orderedSites.push(bestSite);
    scores.push(bestScore);
    loadKg += bestSite.total_mass_kg;
    current = bestSite;
  }

  return { orderedSites, skipped, scores };
}
