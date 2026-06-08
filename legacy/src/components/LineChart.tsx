// Lightweight dependency-free SVG line chart. We hand-roll this because the demo
// charts are simple multi-series lines we update tick-by-tick, and a custom SVG
// gives exact deterministic control with zero version/peer-dependency risk.

import { useMemo } from "react";

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function LineChart({
  xValues,
  series,
  height = 200,
  yLabel,
  valueFormat = (v) => `${v}`,
}: {
  xValues: number[];
  series: Series[];
  height?: number;
  yLabel?: string;
  valueFormat?: (v: number) => string;
}) {
  const width = 480;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const { maxY, maxX } = useMemo(() => {
    const allY = series.flatMap((s) => s.values);
    const my = allY.length ? Math.max(...allY) : 1;
    const mx = xValues.length ? Math.max(...xValues) : 1;
    return { maxY: my === 0 ? 1 : my * 1.1, maxX: mx === 0 ? 1 : mx };
  }, [series, xValues]);

  const x = (i: number) =>
    padding.left + (xValues.length <= 1 ? 0 : (xValues[i] / maxX) * plotW);
  const y = (v: number) => padding.top + plotH - (v / maxY) * plotH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img">
      {/* y grid + labels */}
      {gridLines.map((g) => {
        const yy = padding.top + plotH - g * plotH;
        return (
          <g key={g}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yy}
              y2={yy}
              stroke="#e7e0ce"
              strokeWidth={1}
            />
            <text x={4} y={yy + 4} fontSize={10} fill="#a89e8c" fontFamily="IBM Plex Mono, monospace">
              {valueFormat(Math.round(g * maxY))}
            </text>
          </g>
        );
      })}

      {/* series lines + leading dot */}
      {series.map((s) => {
        if (s.values.length === 0) return null;
        const d = s.values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
          .join(" ");
        const lastI = s.values.length - 1;
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={x(lastI)} cy={y(s.values[lastI])} r={3.5} fill={s.color} />
          </g>
        );
      })}

      {yLabel && (
        <text x={4} y={11} fontSize={10} fill="#64748b" fontWeight={600}>
          {yLabel}
        </text>
      )}
    </svg>
  );
}

export function Legend({ series }: { series: { name: string; color: string }[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-wide text-muted">
      {series.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: s.color }}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}
