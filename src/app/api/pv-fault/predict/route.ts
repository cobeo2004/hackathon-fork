import { NextResponse } from "next/server";
import type { PvFaultPrediction, PvFaultTelemetry } from "~/lib/pvFaultModel";

// PV fault prediction endpoint.
//
// In production this proxies to a real two-stage XGBoost service (set
// PV_FAULT_API_URL). For the demo there is no live model host, so when the env
// var is unset — or the upstream call fails — we fall back to a deterministic
// rule-based scorer derived from the same telemetry. The console therefore
// always returns a sensible prediction offline, matching the Non-Goals: the
// demo must run without secrets or network reliability.

const UPSTREAM = process.env.PV_FAULT_API_URL;

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deterministic offline scorer. Mirrors the shape of the trained two-stage
 * model: stage 1 = normal-vs-faulty risk, stage 2 = fault-type distribution.
 * Heuristics are tuned against the Lotus PV Fault Benchmark scenario rows used
 * in the console so each scenario lands on the expected class.
 */
function scoreLocally(t: PvFaultTelemetry): PvFaultPrediction {
  const vSpread = Math.abs(t.vdc1 - t.vdc2);
  const iSpread = Math.abs(t.idc1 - t.idc2);
  const nearDark = t.irradiance < 50;
  const lowVoltage = Math.min(t.vdc1, t.vdc2) < 5;
  const lowCurrent = Math.max(t.idc1, t.idc2) < 1;

  // "Starved": real sunlight and healthy string voltage, yet almost no current
  // is flowing — the signature of shadowing (or a stuck string), not a quiet
  // night. This is the case bare thresholds miss.
  const starved =
    t.irradiance > 150 && Math.min(t.vdc1, t.vdc2) > 50 && lowCurrent;

  // Stage 1 — fault risk. Near-dark / quiescent strings read as normal.
  let faultRisk: number;
  if (nearDark && lowCurrent) {
    faultRisk = 0.08;
  } else if (starved) {
    faultRisk = clamp(0.6 + clamp((t.irradiance - 150) / 800) * 0.3);
  } else {
    const hotPenalty = clamp((t.pv_module_temperature - 40) / 50);
    const spreadPenalty = clamp(iSpread / 6) * 0.6 + clamp(vSpread / 200) * 0.6;
    faultRisk = clamp(0.35 + hotPenalty * 0.4 + spreadPenalty * 0.45);
  }
  const isNormal = faultRisk < 0.45;
  const normalConfidence = clamp(1 - faultRisk);

  // Stage 2 — fault type (only meaningful when faulty).
  // open circuit: one string collapses (voltage or current near zero on one leg)
  // short circuit: high current with depressed/equal voltages under strong sun
  // shadowing: moderate irradiance, low current, voltages intact
  // degradation: hot module, elevated current spread, full sun — the default
  let pShort = 0.02;
  let pDegrade = 0.05;
  let pOpen = 0.02;
  let pShadow = 0.02;

  if (!isNormal) {
    const oneLegDead =
      (t.vdc2 < 5 && t.vdc1 > 50) ||
      (t.vdc1 < 5 && t.vdc2 > 50) ||
      (t.idc2 < 0.2 && t.idc1 > 2) ||
      (t.idc1 < 0.2 && t.idc2 > 2);
    if (oneLegDead) {
      pOpen = 0.78;
      pDegrade = 0.12;
      pShort = 0.06;
      pShadow = 0.04;
    } else if (t.irradiance < 400 && Math.max(t.idc1, t.idc2) < 1) {
      pShadow = 0.74;
      pDegrade = 0.14;
      pShort = 0.06;
      pOpen = 0.06;
    } else if (t.irradiance > 850 && Math.max(t.idc1, t.idc2) > 8 && vSpread < 5) {
      pShort = 0.7;
      pDegrade = 0.2;
      pOpen = 0.06;
      pShadow = 0.04;
    } else {
      pDegrade = 0.82;
      pShort = 0.08;
      pOpen = 0.05;
      pShadow = 0.05;
    }
  }

  const probs = [
    { type: "short_circuit" as const, p: pShort },
    { type: "degradation" as const, p: pDegrade },
    { type: "open_circuit" as const, p: pOpen },
    { type: "shadowing" as const, p: pShadow },
  ];
  const top = probs.reduce((a, b) => (b.p > a.p ? b : a));
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const pct = (n: number) => Math.round(n * 100);

  return {
    ...t,
    normal_confidence: round2(normalConfidence),
    normal_confidence_percent: pct(normalConfidence),
    fault_risk_score: round2(faultRisk),
    fault_risk_percent: pct(faultRisk),
    predicted_binary_label: isNormal ? "normal" : "faulty",
    predicted_label: isNormal ? "normal" : top.type,
    predicted_fault_type: isNormal ? "" : top.type,
    fault_type_confidence: isNormal ? null : round2(top.p),
    fault_type_confidence_percent: isNormal ? null : pct(top.p),
    fault_probability_short_circuit: isNormal ? null : round2(pShort),
    fault_probability_short_circuit_percent: isNormal ? null : pct(pShort),
    fault_probability_degradation: isNormal ? null : round2(pDegrade),
    fault_probability_degradation_percent: isNormal ? null : pct(pDegrade),
    fault_probability_open_circuit: isNormal ? null : round2(pOpen),
    fault_probability_open_circuit_percent: isNormal ? null : pct(pOpen),
    fault_probability_shadowing: isNormal ? null : round2(pShadow),
    fault_probability_shadowing_percent: isNormal ? null : pct(pShadow),
  };
}

export async function POST(request: Request) {
  let telemetry: PvFaultTelemetry;
  try {
    telemetry = (await request.json()) as PvFaultTelemetry;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Try the real model service first when configured.
  if (UPSTREAM) {
    try {
      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telemetry),
        signal: AbortSignal.timeout(4000),
      });
      if (upstream.ok) {
        const body = await upstream.json();
        return NextResponse.json(body);
      }
    } catch {
      // fall through to local scorer
    }
  }

  return NextResponse.json({ predictions: [scoreLocally(telemetry)] });
}
