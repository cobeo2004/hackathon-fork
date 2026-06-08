// One focused telemetry chart for the featured inverter: failure risk climbing
// as conversion efficiency falls. The two lines crossing tells the whole story.

import { HEALTH_SERIES } from "../data/asset";
import { LineChart, Legend, type Series } from "./LineChart";

export function HealthChart() {
  const x = HEALTH_SERIES.map((_, i) => i);

  const series: Series[] = [
    {
      name: "Failure risk (×100)",
      color: "#cf3d29",
      values: HEALTH_SERIES.map((r) => Math.round(r.risk_score * 100)),
    },
    {
      name: "Conversion efficiency (%)",
      color: "#2563eb",
      values: HEALTH_SERIES.map((r) => r.conversion_efficiency),
    },
  ];

  return (
    <div>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        Last 12 hours of telemetry
      </div>
      <LineChart xValues={x} series={series} height={190} />
      <Legend series={series} />
    </div>
  );
}
