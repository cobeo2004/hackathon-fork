import type { HealthReading } from "../data/types";

export type PvFaultTelemetry = {
  vdc1: number;
  vdc2: number;
  idc1: number;
  idc2: number;
  irradiance: number;
  pv_module_temperature: number;
};

export type PvFaultPrediction = PvFaultTelemetry & {
  normal_confidence: number;
  normal_confidence_percent: number;
  fault_risk_score: number;
  fault_risk_percent: number;
  predicted_binary_label: "normal" | "faulty";
  predicted_label: string;
  predicted_fault_type: "" | "short_circuit" | "degradation" | "open_circuit" | "shadowing";
  fault_type_confidence: number | null;
  fault_type_confidence_percent: number | null;
  fault_probability_short_circuit: number | null;
  fault_probability_short_circuit_percent: number | null;
  fault_probability_degradation: number | null;
  fault_probability_degradation_percent: number | null;
  fault_probability_open_circuit: number | null;
  fault_probability_open_circuit_percent: number | null;
  fault_probability_shadowing: number | null;
  fault_probability_shadowing_percent: number | null;
};

export function healthReadingToPvTelemetry(reading: HealthReading): PvFaultTelemetry {
  return {
    vdc1: Math.round((reading.dc_voltage * 0.52) * 1000) / 1000,
    vdc2: Math.round((reading.dc_voltage * 0.5) * 1000) / 1000,
    idc1: Math.round((reading.current * 0.52) * 1000) / 1000,
    idc2: Math.round((reading.current * 0.5) * 1000) / 1000,
    irradiance: Math.round((880 - reading.thd * 32) * 1000) / 1000,
    pv_module_temperature: reading.temperature_c,
  };
}

export async function predictPvFault(
  telemetry: PvFaultTelemetry,
): Promise<PvFaultPrediction> {
  const response = await fetch("/api/pv-fault/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(telemetry),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `PV fault API returned ${response.status}`);
  }

  const body = await response.json();
  const prediction = body?.predictions?.[0];
  if (!prediction) {
    throw new Error("PV fault API returned no prediction.");
  }
  return prediction;
}

export const FALLBACK_PV_FAULT_PREDICTION: PvFaultPrediction = {
  vdc1: 301.6,
  vdc2: 290,
  idc1: 9.828,
  idc2: 9.45,
  irradiance: 617.6,
  pv_module_temperature: 80,
  normal_confidence: 0.12,
  normal_confidence_percent: 12,
  fault_risk_score: 0.88,
  fault_risk_percent: 88,
  predicted_binary_label: "faulty",
  predicted_label: "degradation",
  predicted_fault_type: "degradation",
  fault_type_confidence: 0.91,
  fault_type_confidence_percent: 91,
  fault_probability_short_circuit: 0.02,
  fault_probability_short_circuit_percent: 2,
  fault_probability_degradation: 0.91,
  fault_probability_degradation_percent: 91,
  fault_probability_open_circuit: 0.03,
  fault_probability_open_circuit_percent: 3,
  fault_probability_shadowing: 0.04,
  fault_probability_shadowing_percent: 4,
};
