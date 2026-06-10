"use client";

// Layered isometric solar panel — the product figure. One SVG, six layers
// (junction box, backsheet, PV cells, EVA, glass, frame), each wrapped in an
// m.g whose screen-space Y is driven by a single `separation` MotionValue:
// 0 = assembled panel, 1 = fully exploded stack. Callers own the animation
// policy (hero idle/tilt vs scroll-scrubbed explode) and the reduced-motion
// fallback (pass a static MotionValue).

import { useId } from "react";
import { m, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

// Isometric projection: local (u,v) → screen x = .866(u−v)+190, y = .5(u+v).
const ISO = "matrix(0.866 0.5 -0.866 0.5 190 0)";

// Local panel footprint: 320 × 210. Inner (glass) area: 14,14 → 306,196.
const FRAME_PATH = "M0 0 H320 V210 H0 Z M14 14 V196 H306 V14 Z";

// Per-layer vertical travel at separation=1 (screen px) and the tiny intrinsic
// stacking offset that gives the assembled panel its thickness.
const TRAVEL = {
  frame: -175,
  glass: -105,
  eva: -45,
  cells: 25,
  backsheet: 95,
  jbox: 170,
} as const;

const STACK = {
  frame: 0,
  glass: 5,
  eva: 10,
  cells: 14,
  backsheet: 20,
  jbox: 34,
} as const;

function Layer({
  separation,
  travel,
  stackDy,
  children,
}: {
  separation: MotionValue<number>;
  travel: number;
  stackDy: number;
  children: ReactNode;
}) {
  const y = useTransform(separation, [0, 1], [stackDy, stackDy + travel]);
  return <m.g style={{ y }}>{children}</m.g>;
}

// Screen-space lift (dy) → isometric plane. dy is used for the extruded
// "thickness" silhouettes drawn beneath a face.
function Iso({ dy = 0, children }: { dy?: number; children: ReactNode }) {
  return (
    <g transform={`translate(0 ${dy})`}>
      <g transform={ISO}>{children}</g>
    </g>
  );
}

function Cells({ gradientId }: { gradientId: string }) {
  // 6 × 4 cell matrix inside u 22..298, v 22..188, with thin busbars.
  const cells: ReactNode[] = [];
  const u0 = 22;
  const v0 = 22;
  const cols = 6;
  const rows = 4;
  const gap = 5;
  const cw = (276 - gap * (cols - 1)) / cols;
  const ch = (166 - gap * (rows - 1)) / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = u0 + c * (cw + gap);
      const y = v0 + r * (ch + gap);
      cells.push(
        <g key={`${c}-${r}`}>
          <rect x={x} y={y} width={cw} height={ch} rx={2} fill={`url(#${gradientId})`} />
          <line
            x1={x + cw / 3}
            y1={y + 1.5}
            x2={x + cw / 3}
            y2={y + ch - 1.5}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={0.7}
          />
          <line
            x1={x + (2 * cw) / 3}
            y1={y + 1.5}
            x2={x + (2 * cw) / 3}
            y2={y + ch - 1.5}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={0.7}
          />
          {/* Crystal facet glints — deterministic, varies with grid position. */}
          <line
            x1={x + ((c + r) % 3) * 6 + 4}
            y1={y + ch - 4}
            x2={x + ((c + r) % 3) * 6 + 12}
            y2={y + 4}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={2}
          />
          <line
            x1={x + cw - 14 - ((c * r) % 2) * 5}
            y1={y + ch - 3}
            x2={x + cw - 6 - ((c * r) % 2) * 5}
            y2={y + 3}
            stroke="rgba(160,200,255,0.18)"
            strokeWidth={3}
          />
        </g>,
      );
    }
  }
  return <>{cells}</>;
}

export function PanelLayers({
  separation,
  sheen = false,
  className,
}: {
  /** 0 = assembled, 1 = fully exploded. Drive with a spring/scrub MotionValue. */
  separation: MotionValue<number>;
  /** Looping amber glint sweeping across the glass (hero idle effect). */
  sheen?: boolean;
  className?: string;
}) {
  const id = useId();
  const cellGrad = `${id}-cell`;
  const sheenGrad = `${id}-sheen`;
  const glassClip = `${id}-glass-clip`;

  return (
    <svg
      viewBox="0 0 480 760"
      className={className}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Exploded view of a solar panel: aluminium frame, tempered glass, EVA encapsulant, photovoltaic cells, backsheet and junction box"
    >
      <defs>
        {/* Polycrystalline PV blue — a MATERIAL color (panel silicon), not a UI
            accent. See DESIGN-SYSTEM.md "material colors". */}
        <linearGradient id={cellGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={sheenGrad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(224,124,8,0)" />
          <stop offset="50%" stopColor="rgba(224,124,8,0.16)" />
          <stop offset="100%" stopColor="rgba(224,124,8,0)" />
        </linearGradient>
        <clipPath id={glassClip}>
          <rect x={14} y={14} width={292} height={182} />
        </clipPath>
      </defs>

      <g transform="translate(0 280)">
        {/* Soft ground shadow (static — anchors the figure on the paper). */}
        <ellipse cx={238} cy={310} rx={205} ry={34} fill="rgba(26,22,17,0.05)" />

        {/* ── Junction box + cabling (deepest layer) ── */}
        <Layer separation={separation} travel={TRAVEL.jbox} stackDy={STACK.jbox}>
          <Iso>
            <path
              d="M254 140 C 296 140, 304 178, 342 178"
              fill="none"
              stroke="#2a251d"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              d="M254 150 C 288 150, 298 196, 336 196"
              fill="none"
              stroke="#2a251d"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <rect x={198} y={118} width={58} height={40} rx={3} fill="#241f18" />
            <rect x={204} y={124} width={46} height={10} rx={2} fill="#3a332a" />
          </Iso>
        </Layer>

        {/* ── Backsheet ── */}
        <Layer separation={separation} travel={TRAVEL.backsheet} stackDy={STACK.backsheet}>
          <Iso dy={4}>
            <rect x={14} y={14} width={292} height={182} fill="#e8e4dc" />
          </Iso>
          <Iso>
            <rect
              x={14}
              y={14}
              width={292}
              height={182}
              fill="#f4f1ea"
              stroke="#ddd8cf"
              strokeWidth={1}
            />
          </Iso>
        </Layer>

        {/* ── PV cell matrix (the star) ── */}
        <Layer separation={separation} travel={TRAVEL.cells} stackDy={STACK.cells}>
          <Iso dy={5}>
            <rect x={18} y={18} width={284} height={174} fill="#c9c5ba" />
          </Iso>
          <Iso>
            {/* White cell bed — the gaps between cells read as the white grid. */}
            <rect
              x={18}
              y={18}
              width={284}
              height={174}
              fill="#f6f4ee"
              stroke="#d9d6cc"
              strokeWidth={1}
            />
            <Cells gradientId={cellGrad} />
          </Iso>
        </Layer>

        {/* ── EVA encapsulant ── */}
        <Layer separation={separation} travel={TRAVEL.eva} stackDy={STACK.eva}>
          <Iso>
            <rect
              x={20}
              y={20}
              width={280}
              height={170}
              fill="rgba(251,236,205,0.16)"
              stroke="#ecd9b4"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </Iso>
        </Layer>

        {/* ── Tempered glass ── */}
        {/* No opaque thickness face here — the glass must stay see-through so the
            cell matrix reads beneath it when assembled. */}
        <Layer separation={separation} travel={TRAVEL.glass} stackDy={STACK.glass}>
          <Iso>
            <rect
              x={14}
              y={14}
              width={292}
              height={182}
              fill="rgba(247,243,235,0.2)"
              stroke="#ddd8cf"
              strokeWidth={1}
            />
            {/* Corner highlight strokes — reads as reflective glass. */}
            <line x1={44} y1={22} x2={22} y2={44} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
            <line x1={62} y1={22} x2={22} y2={62} stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} />
            {sheen && (
              <g clipPath={`url(#${glassClip})`}>
                <m.rect
                  y={14}
                  width={72}
                  height={182}
                  fill={`url(#${sheenGrad})`}
                  initial={{ x: -100 }}
                  animate={{ x: 380 }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: "linear",
                  }}
                />
              </g>
            )}
          </Iso>
        </Layer>

        {/* ── Aluminium frame ── */}
        <Layer separation={separation} travel={TRAVEL.frame} stackDy={STACK.frame}>
          <Iso dy={7}>
            <path d={FRAME_PATH} fillRule="evenodd" fill="#a8a8a4" />
          </Iso>
          <Iso>
            <path
              d={FRAME_PATH}
              fillRule="evenodd"
              fill="#d9d9d6"
              stroke="#aeaeaa"
              strokeWidth={1}
            />
            {/* Corner screws. */}
            <circle cx={7} cy={7} r={2.2} fill="#94948f" />
            <circle cx={313} cy={7} r={2.2} fill="#94948f" />
            <circle cx={7} cy={203} r={2.2} fill="#94948f" />
            <circle cx={313} cy={203} r={2.2} fill="#94948f" />
          </Iso>
        </Layer>
      </g>
    </svg>
  );
}
