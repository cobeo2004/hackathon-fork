// Health chart: both lines update their final point from the live ML prediction.
// Health = 100 - fault_risk_percent (inverted risk). Efficiency is derived from
// the same risk value so both lines move together when telemetry changes.

import { HEALTH_SERIES } from "../data/asset";
import { LineChart, Legend, type Series } from "./LineChart";

const BASELINE_RISK_PCT = Math.round(HEALTH_SERIES[0].risk_score * 100);

function deriveEfficiency(riskPct: number): number {
  const raw = 96 - (riskPct - BASELINE_RISK_PCT) * 0.24;
  return Math.min(100, Math.max(80, Math.round(raw * 10) / 10));
}

export function HealthChart({ mlFaultRiskPercent }: { mlFaultRiskPercent?: number }) {
  const x = HEALTH_SERIES.map((_, i) => i);
  const lastIdx = HEALTH_SERIES.length - 1;

  const healthValues = HEALTH_SERIES.map((r, i) => {
    if (i === lastIdx && mlFaultRiskPercent != null) {
      return Math.round(100 - mlFaultRiskPercent);
    }
    return Math.round(100 - r.risk_score * 100);
  });

  const efficiencyValues = HEALTH_SERIES.map((r, i) => {
    if (i === lastIdx && mlFaultRiskPercent != null) {
      return deriveEfficiency(mlFaultRiskPercent);
    }
    return r.conversion_efficiency;
  });

  const series: Series[] = [
    {
      name: "Inverter health (%)",
      color: "#cf3d29",
      values: healthValues,
    },
    {
      name: "Conversion efficiency (%)",
      color: "#2563eb",
      values: efficiencyValues,
    },
  ];

  return (
    <div>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        Last 12 hours · final point = live ML prediction
      </div>
      <LineChart xValues={x} series={series} height={190} />
      <Legend series={series} />
    </div>
  );
}
