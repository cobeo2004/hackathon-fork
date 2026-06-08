// The Victorian rooftop-solar install wave, by year (real CER data). Bars are
// coloured by age so the judge sees the 2011–2014 boom that is failing *now*.

import { VIC_INSTALLS } from "../data/victoria";

const BAND_COLOR: Record<string, string> = {
  eol: "#cf3d29", // 12+ yrs — at end-of-life now
  ageing: "#e07c08", // reaching end-of-life within ~5 yrs
  healthy: "#c9bfa8", // still in service
};

export function InstallWaveChart({ height = 260 }: { height?: number }) {
  const data = VIC_INSTALLS;
  const width = 720;
  const pad = { top: 24, right: 12, bottom: 34, left: 12 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxV = Math.max(...data.map((d) => d.installs));
  const gap = 6;
  const barW = (plotW - gap * (data.length - 1)) / data.length;

  // y of the boom peak, for the annotation line.
  const peak = data.reduce((a, b) => (b.installs > a.installs ? b : a));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Victorian rooftop solar installs per year">
      {data.map((d, i) => {
        const h = (d.installs / maxV) * plotH;
        const x = pad.left + i * (barW + gap);
        const y = pad.top + plotH - h;
        const label = d.year === 2010 ? "≤10" : `'${String(d.year).slice(2)}`;
        return (
          <g key={d.year}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill={BAND_COLOR[d.band]}
            >
              <title>{`${d.year === 2010 ? "2001–2010" : d.year}: ${d.installs.toLocaleString()} systems`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={height - 18}
              textAnchor="middle"
              fontSize={11}
              fontFamily="IBM Plex Mono, monospace"
              fill="#a89e8c"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Annotation over the boom peak. */}
      <g>
        <text
          x={pad.left}
          y={14}
          fontSize={12}
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={600}
          fill="#cf3d29"
        >
          ▮ 2011–2014 boom - these inverters are failing now
        </text>
      </g>
      <text
        x={width - pad.right}
        y={height - 4}
        textAnchor="end"
        fontSize={10}
        fontFamily="IBM Plex Mono, monospace"
        fill="#a89e8c"
      >
        peak {peak.year}: {Math.round(peak.installs / 1000)}k systems
      </text>
    </svg>
  );
}
