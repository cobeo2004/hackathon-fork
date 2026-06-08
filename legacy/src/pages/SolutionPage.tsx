import {
  FEATURED_ASSET,
  LATEST_BREAKING_RISK,
  LATEST_RISK,
  PASSPORT_EVENTS,
} from "../data/asset";
import { HealthChart } from "../components/HealthChart";
import { PassportPanel } from "../components/PassportPanel";
import { Pipeline } from "../components/Pipeline";
import { Card, DataNote, RiskBadge, SectionLead } from "../components/ui";
import { breakingRiskMessage } from "../lib/risk";

export function SolutionSection() {
  return (
    <div>
      <SectionLead
        step={2}
        eyebrow="The solution"
        title="Predict the failure, then plan the smartest collection"
        subtitle="Inverter health data becomes a risk score, a failure window, a collection job, and a verifiable record — automatically."
      />

      <Card className="p-5">
        <Pipeline />
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Featured asset: one real example the judge can follow end to end. */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-display text-base font-extrabold tracking-tight text-ink">
                {FEATURED_ASSET.site_name}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                {FEATURED_ASSET.lga} · inverter {FEATURED_ASSET.serial_number}
              </div>
            </div>
            <RiskBadge risk={LATEST_BREAKING_RISK} />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <Metric label="Risk score" value={LATEST_RISK.toFixed(2)} tone="risk" />
            <Metric label="State of health" value={`${FEATURED_ASSET.state_of_health}%`} />
            <Metric
              label="Fails in"
              value={`~${FEATURED_ASSET.estimated_failure_window_days} days`}
              tone="solar"
            />
          </div>

          <div className="mb-4 rounded-lg border border-solar/30 bg-solar-soft px-3 py-2.5 text-[13px] font-medium text-[#8a4a06]">
            ⚠️ {breakingRiskMessage(LATEST_BREAKING_RISK, FEATURED_ASSET.predicted_fault_type)}
          </div>

          <HealthChart />
        </Card>

        {/* Digital passport: the verifiable record that follows the asset. */}
        <Card className="flex flex-col p-5">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Digital passport
          </div>
          <div className="flex-1">
            <PassportPanel events={PASSPORT_EVENTS} />
          </div>
        </Card>
      </div>

      <AlgorithmStrip />

      <DataNote
        real="solar lifespan assumptions (25-yr panels) & the end-of-life cohort from CER install-age data"
        illustrative="this inverter's identity, live telemetry, risk score & passport events (no public live-IoT feed exists)"
        source="rule-based engine on synthetic telemetry; lifespans per manufacturer / Sustainability Victoria guidance"
      />
    </div>
  );
}

// "Under the hood" — names the four algorithms behind the pipeline, slide-style.
const ALGO_STEPS = [
  {
    tag: "Predict",
    name: "Rule-based risk score",
    detail: "Weighted signals → breaking-risk band",
    formula: "0.30·temp + 0.25·THD + 0.20·eff + 0.15·volt + 0.10·age",
  },
  {
    tag: "Filter",
    name: "Greedy knapsack",
    detail: "Pack stops under truck mass capacity",
    formula: "Σ mass ≤ 2,500 kg, priority-first",
  },
  {
    tag: "Optimize",
    name: "Exact brute-force TSP",
    detail: "Shortest depot → stops → centre",
    formula: "min over all permutations (greedy NN fallback)",
  },
  {
    tag: "Measure",
    name: "Haversine distance",
    detail: "Great-circle km between sites",
    formula: "2r·asin(√hav(Δφ,Δλ))",
  },
];

function AlgorithmStrip() {
  return (
    <Card className="mt-5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-solar">
          Under the hood
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
          the algorithms that turn data into a plan
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {ALGO_STEPS.map((a, i) => (
          <div
            key={a.tag}
            className="flex flex-col rounded-lg border border-line bg-paper/60 p-4"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted">0{i + 1}</span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-recover">
                {a.tag}
              </span>
            </div>
            <div className="mt-1.5 font-display text-[15px] font-extrabold tracking-tight text-ink">
              {a.name}
            </div>
            <div className="mt-1 text-[12px] leading-snug text-muted">{a.detail}</div>
            <code className="mt-2 block rounded bg-ink/[0.04] px-2 py-1 font-mono text-[10px] leading-snug text-ink/70">
              {a.formula}
            </code>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "risk" | "solar";
}) {
  const tones: Record<string, string> = {
    neutral: "text-ink",
    risk: "text-risk",
    solar: "text-solar",
  };
  return (
    <div className="rounded-lg border border-line bg-paper/60 px-3 py-2.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${tones[tone]}`}>
        {value}
      </div>
    </div>
  );
}
