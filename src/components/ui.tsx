"use client";

// Shared UI primitives — "Solar Instrument Panel" look: warm panels, hairline
// borders, mono telemetry labels, big display numbers.

import type { ReactNode } from "react";
import type { BreakingRisk } from "~/data/types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-panel shadow-[0_1px_0_rgba(26,22,17,0.04),0_12px_30px_-22px_rgba(26,22,17,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

/** A single big telemetry figure — the pitch reads these at a glance. */
export function Stat({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ink" | "risk" | "solar" | "recover";
}) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    risk: "text-risk",
    solar: "text-solar",
    recover: "text-recover",
  };
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-4xl font-extrabold leading-none tabular-nums ${tones[tone]}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[13px] leading-snug text-muted">{sub}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "danger" | "warning" | "success";
}) {
  const map: Record<string, "ink" | "risk" | "solar" | "recover"> = {
    neutral: "ink",
    danger: "risk",
    warning: "solar",
    success: "recover",
  };
  return (
    <Card className="p-4">
      <Stat label={label} value={value} sub={sub} tone={map[tone]} />
    </Card>
  );
}

const RISK_STYLES: Record<BreakingRisk, string> = {
  normal: "bg-line/60 text-muted",
  watch: "bg-solar-soft text-solar",
  likely_breaking: "bg-[#fbe0d6] text-risk",
  urgent: "bg-risk text-white",
};

const RISK_LABEL: Record<BreakingRisk, string> = {
  normal: "Normal",
  watch: "Watch",
  likely_breaking: "Likely breaking",
  urgent: "Urgent",
};

export function RiskBadge({ risk }: { risk: BreakingRisk }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${RISK_STYLES[risk]}`}
    >
      {RISK_LABEL[risk]}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "success";
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-ink text-paper hover:bg-ink/85",
    success:
      "bg-recover text-white shadow-[0_8px_22px_-10px_rgba(29,122,77,0.9)] hover:brightness-110",
    ghost: "bg-panel text-ink border border-line hover:bg-line/30",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Small provenance note shown under each section so judges know which figures are
 * real (cited) and which are illustrative demo values.
 */
export function DataNote({
  real,
  illustrative,
  source,
}: {
  real: string;
  illustrative: string;
  source: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-start gap-x-2 gap-y-1 rounded-lg border border-line bg-paper/60 px-4 py-2.5 text-[12px] leading-snug text-muted">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-recover">
        ● Real
      </span>
      <span className="text-ink/70">{real}</span>
      <span className="font-mono text-[10px] text-muted">·</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-solar">
        ◌ Illustrative
      </span>
      <span className="text-ink/70">{illustrative}</span>
      <span className="w-full font-mono text-[10px] uppercase tracking-wide text-muted/80">
        Source: {source}
      </span>
    </div>
  );
}

/** Section header: numbered step chip + mono eyebrow + bold display title. */
export function SectionLead({
  step,
  eyebrow,
  title,
  subtitle,
}: {
  step: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7 max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-mono text-sm font-semibold text-paper">
          {step}
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-3 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.01em] text-ink md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      )}
    </div>
  );
}
