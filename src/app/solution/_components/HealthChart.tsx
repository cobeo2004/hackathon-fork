"use client";

// One focused telemetry chart for the featured inverter: failure risk climbing
// as conversion efficiency falls. The two lines crossing tells the whole story.
// Readings are supplied by the caller (sourced from tRPC `health.featured`).

import type { HealthReading } from "~/data/types";
import { LineChart, Legend, type Series } from "~/components/LineChart";

export function HealthChart({ readings }: { readings: HealthReading[] }) {
  const x = readings.map((_, i) => i);

  const series: Series[] = [
    {
      name: "Failure risk (×100)",
      color: "#cf3d29",
      values: readings.map((r) => Math.round(r.risk_score * 100)),
    },
    {
      name: "Conversion efficiency (%)",
      color: "#2563eb",
      values: readings.map((r) => r.conversion_efficiency),
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
