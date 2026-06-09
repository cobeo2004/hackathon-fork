// Rule-based predictive maintenance engine (MVP). Deterministic, so the demo is stable.

import type { BreakingRisk } from "../data/types";

export interface RiskInputs {
  temperature_c: number; // expected operating range ~25-85C
  thd: number; // total harmonic distortion %, healthy < 5
  conversion_efficiency: number; // %, healthy ~ 97
  ac_voltage: number; // V, nominal 230
  age_years: number;
  expected_lifespan_years: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Weighted risk score per design.md:
 *   0.30*temp + 0.25*thd + 0.20*efficiency_drop + 0.15*voltage_instability + 0.10*age
 */
export function riskScore(i: RiskInputs): number {
  const normTemp = clamp01((i.temperature_c - 45) / (90 - 45));
  const normThd = clamp01(i.thd / 10);
  const efficiencyDrop = clamp01((97 - i.conversion_efficiency) / 15);
  const voltageInstability = clamp01(Math.abs(i.ac_voltage - 230) / 25);
  const ageFactor = clamp01(i.age_years / i.expected_lifespan_years);

  const score =
    0.3 * normTemp +
    0.25 * normThd +
    0.2 * efficiencyDrop +
    0.15 * voltageInstability +
    0.1 * ageFactor;

  return Math.round(clamp01(score) * 100) / 100;
}

/** Breaking-risk label thresholds (design.md "Base44 Computed Logic"). */
export function breakingRisk(score: number): BreakingRisk {
  if (score >= 0.85) return "urgent";
  if (score >= 0.7) return "likely_breaking";
  if (score >= 0.45) return "watch";
  return "normal";
}

/** Lifecycle status band from risk score. */
export function lifecycleBand(score: number): string {
  if (score >= 0.8) return "ready_for_collection";
  if (score >= 0.65) return "high_risk";
  if (score >= 0.4) return "monitoring";
  return "normal";
}

const DEFAULT_LIFESPAN: Record<string, number> = {
  solar_panel: 25,
  string_inverter: 12,
  microinverter: 22,
};

export function expectedLifespan(assetType: string, manufacturerValue?: number): number {
  return manufacturerValue ?? DEFAULT_LIFESPAN[assetType] ?? 25;
}

/** End-of-life window as a +/-1 year range around installation_year + lifespan. */
export function endOfLifeWindow(installationDate: string, lifespanYears: number): string {
  const baseYear = new Date(installationDate).getFullYear() + lifespanYears;
  return `${baseYear - 1}-${baseYear + 1}`;
}

/** Plain-English breaking-risk message for the UI. */
export function breakingRiskMessage(risk: BreakingRisk, faultType: string): string {
  switch (risk) {
    case "urgent":
      return `Severe anomaly detected (${faultType}). Inspect immediately.`;
    case "likely_breaking":
      return `This inverter is likely breaking due to ${faultType}. Plan maintenance or replacement.`;
    case "watch":
      return `Abnormal signal detected (${faultType}). Monitor closely.`;
    default:
      return "Operating within expected range. No immediate warning.";
  }
}
