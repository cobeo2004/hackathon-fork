import { useEffect, useMemo, useState } from "react";
import {
  FEATURED_ASSET,
  LATEST_READING,
  PASSPORT_EVENTS,
} from "../data/asset";
import type { BreakingRisk } from "../data/types";
import { TwoStagePipeline } from "../components/TwoStagePipeline";
import { PassportPanel } from "../components/PassportPanel";
import { Pipeline } from "../components/Pipeline";
import { Card, DataNote, RiskBadge, SectionLead } from "../components/ui";
import {
  FALLBACK_PV_FAULT_PREDICTION,
  healthReadingToPvTelemetry,
  predictPvFault,
  type PvFaultPrediction,
  type PvFaultTelemetry,
} from "../lib/pvFaultModel";
import { breakingRiskMessage } from "../lib/risk";

type Scenario = {
  label: string;
  telemetry: PvFaultTelemetry;
};

// Scenario telemetry: "Wyndham live" is synthetic (follows Lotus degradation range).
// All other scenarios are real rows from the Lotus PV Fault Benchmark dataset
// (one representative row per fault class). Normal = low-irradiance nighttime state.
const MODEL_SCENARIOS: Scenario[] = [
  {
    label: "Wyndham live",
    telemetry: healthReadingToPvTelemetry(LATEST_READING),
  },
  {
    label: "Normal",
    telemetry: {
      vdc1: 0.7143,
      vdc2: 0.555,
      idc1: 0.0608,
      idc2: 0.0073,
      irradiance: 1.3729,
      pv_module_temperature: 2.3816,
    },
  },
  {
    label: "Shorted string",
    telemetry: {
      vdc1: 260.113,
      vdc2: 259.548,
      idc1: 9.4255,
      idc2: 0.5214,
      irradiance: 988.662,
      pv_module_temperature: 43.4267,
    },
  },
  {
    label: "Degradation",
    telemetry: {
      vdc1: 257.838,
      vdc2: 272.454,
      idc1: 7.8061,
      idc2: 5.9036,
      irradiance: 801.12,
      pv_module_temperature: 46.0245,
    },
  },
  {
    label: "Open circuit",
    telemetry: {
      vdc1: 258.875,
      vdc2: 0.7887,
      idc1: 7.7816,
      idc2: 0.0423,
      irradiance: 801.019,
      pv_module_temperature: 45.9675,
    },
  },
  {
    label: "Shadowing",
    telemetry: {
      vdc1: 348.113,
      vdc2: 349.77,
      idc1: 0.2255,
      idc2: 0.0511,
      irradiance: 305.43,
      pv_module_temperature: 5.3711,
    },
  },
];

const INITIAL_TELEMETRY = MODEL_SCENARIOS[3].telemetry;

function riskBandFromScore(score: number): BreakingRisk {
  if (score >= 0.85) return "urgent";
  if (score >= 0.7) return "likely_breaking";
  if (score >= 0.45) return "watch";
  return "normal";
}

function roundInput(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function SolutionSection() {
  const [telemetry, setTelemetry] = useState<PvFaultTelemetry>(INITIAL_TELEMETRY);
  const [activeScenario, setActiveScenario] = useState("Degradation");
  const [mlPrediction, setMlPrediction] = useState<PvFaultPrediction>(
    FALLBACK_PV_FAULT_PREDICTION,
  );
  const [modelStatus, setModelStatus] = useState<"live" | "fallback" | "scoring">(
    "fallback",
  );

  useEffect(() => {
    let cancelled = false;
    setModelStatus((status) => (status === "fallback" ? "fallback" : "scoring"));

    predictPvFault(telemetry)
      .then((prediction) => {
        if (!cancelled) {
          setMlPrediction(prediction);
          setModelStatus("live");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMlPrediction({
            ...FALLBACK_PV_FAULT_PREDICTION,
            ...telemetry,
          });
          setModelStatus("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [telemetry]);

  const predictedFaultType =
    mlPrediction.predicted_fault_type || FEATURED_ASSET.predicted_fault_type;
  const displayFaultClass =
    mlPrediction.predicted_binary_label === "normal"
      ? "normal"
      : predictedFaultType.replace(/_/g, " ");
  const mlBreakingRisk = riskBandFromScore(mlPrediction.fault_risk_score);
  const faultConfidence = mlPrediction.fault_type_confidence_percent;
  const stageTwoDisplay =
    mlPrediction.predicted_binary_label === "normal"
      ? "No fault"
      : faultConfidence == null
        ? "Pending"
        : `${faultConfidence.toFixed(0)}%`;
  const modelStatusLabel =
    modelStatus === "live"
      ? "live XGBoost API"
      : modelStatus === "scoring"
        ? "scoring"
        : "demo fallback";

  const faultProbabilities = useMemo(
    () => [
      {
        label: "short",
        value: mlPrediction.fault_probability_short_circuit_percent,
      },
      {
        label: "degrade",
        value: mlPrediction.fault_probability_degradation_percent,
      },
      {
        label: "open",
        value: mlPrediction.fault_probability_open_circuit_percent,
      },
      {
        label: "shadow",
        value: mlPrediction.fault_probability_shadowing_percent,
      },
    ],
    [mlPrediction],
  );

  function applyScenario(scenario: Scenario) {
    setTelemetry(scenario.telemetry);
    setActiveScenario(scenario.label);
  }

  function updateTelemetry(key: keyof PvFaultTelemetry, value: number) {
    setActiveScenario("Custom");
    setTelemetry((current) => ({
      ...current,
      [key]: roundInput(value),
    }));
  }

  return (
    <div>
      <SectionLead
        step={2}
        eyebrow="The solution"
        title="Predict the failure, then plan the smartest collection"
        subtitle="Telemetry becomes a calibrated fault risk score, a fault type, a collection job, and a verifiable record automatically."
      />

      <Card className="p-5">
        <Pipeline />
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-display text-base font-extrabold tracking-tight text-ink">
                Victoria Demo Site: Wyndham 3029
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Synthetic site, real postcode context | PV benchmark telemetry | {modelStatusLabel}
              </div>
            </div>
            <RiskBadge risk={mlBreakingRisk} />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <Metric
              label="Stage 1 risk"
              value={`${mlPrediction.fault_risk_percent.toFixed(0)}%`}
              tone="risk"
            />
            <Metric label="Fault class" value={displayFaultClass} />
            <Metric
              label="Type confidence"
              value={stageTwoDisplay}
              tone="solar"
            />
          </div>

          <div className="mb-4 rounded-lg border border-solar/30 bg-solar-soft px-3 py-2.5 text-[13px] font-medium text-[#8a4a06]">
            {breakingRiskMessage(mlBreakingRisk, displayFaultClass)}{" "}
            <span className="font-mono text-[11px] uppercase tracking-wide">
              Normal confidence {mlPrediction.normal_confidence_percent.toFixed(0)}%.
            </span>
          </div>

          <div className="mb-5 rounded-lg border border-line bg-paper/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-solar">
                    Fault console
                  </span>
                  <span className="rounded bg-line/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
                    Synthetic · Lotus benchmark
                  </span>
                </div>
                <div className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
                  {activeScenario}
                  {activeScenario === "Normal" && (
                    <span className="ml-2 font-mono text-[10px] font-normal normal-case tracking-normal text-muted">
                      low-irradiance state (near-dark)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {MODEL_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.label}
                    type="button"
                    onClick={() => applyScenario(scenario)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                      activeScenario === scenario.label
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-panel text-muted hover:border-solar hover:text-solar"
                    }`}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-3 rounded border border-line bg-paper/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted">
              <span className="font-semibold text-ink/60">Synthetic data disclaimer:</span>{" "}
              &quot;Wyndham live&quot; is generated from a synthetic asset whose values follow
              the Lotus PV Fault Benchmark degradation pattern. All other scenarios are real
              rows from the Lotus benchmark dataset (one row per fault class). No live IoT feed
              is connected.
            </p>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                <TelemetrySlider
                  label="String 1 DC voltage"
                  value={telemetry.vdc1}
                  min={0}
                  max={380}
                  step={0.5}
                  unit="V"
                  onChange={(value) => updateTelemetry("vdc1", value)}
                />
                <TelemetrySlider
                  label="String 2 DC voltage"
                  value={telemetry.vdc2}
                  min={0}
                  max={380}
                  step={0.5}
                  unit="V"
                  onChange={(value) => updateTelemetry("vdc2", value)}
                />
                <TelemetrySlider
                  label="String 1 DC current"
                  value={telemetry.idc1}
                  min={0}
                  max={12}
                  step={0.05}
                  unit="A"
                  onChange={(value) => updateTelemetry("idc1", value)}
                />
                <TelemetrySlider
                  label="String 2 DC current"
                  value={telemetry.idc2}
                  min={0}
                  max={12}
                  step={0.05}
                  unit="A"
                  onChange={(value) => updateTelemetry("idc2", value)}
                />
                <TelemetrySlider
                  label="Irradiance"
                  value={telemetry.irradiance}
                  min={0}
                  max={1100}
                  step={1}
                  unit="W/m2"
                  onChange={(value) => updateTelemetry("irradiance", value)}
                />
                <TelemetrySlider
                  label="Module temp"
                  value={telemetry.pv_module_temperature}
                  min={0}
                  max={90}
                  step={0.25}
                  unit="C"
                  onChange={(value) => updateTelemetry("pv_module_temperature", value)}
                />
              </div>

              <div className="rounded-lg border border-line bg-panel p-3">
                <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Fault-type probabilities
                </div>
                <div className="space-y-3">
                  {faultProbabilities.map((probability) => (
                    <ProbabilityBar
                      key={probability.label}
                      label={probability.label}
                      value={probability.value ?? 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <TwoStagePipeline mlPrediction={mlPrediction} telemetry={telemetry} />
        </Card>

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
        illustrative="this asset's identity, telemetry adapter, model score & passport events (no public live-IoT feed exists)"
        source="two-stage calibrated XGBoost model trained on the public PV fault benchmark; lifespans per manufacturer / Sustainability Victoria guidance"
      />
    </div>
  );
}

const ALGO_STEPS = [
  {
    tag: "Predict",
    name: "Two-stage XGBoost",
    detail: "Normal/faulty risk, then fault type",
    formula: "P(faulty) -> class confidence",
  },
  {
    tag: "Filter",
    name: "Greedy knapsack",
    detail: "Pack stops under truck mass capacity",
    formula: "sum mass <= 2,500 kg, priority-first",
  },
  {
    tag: "Optimize",
    name: "Exact brute-force TSP",
    detail: "Shortest depot to stops to centre",
    formula: "min over all permutations (greedy NN fallback)",
  },
  {
    tag: "Measure",
    name: "Haversine distance",
    detail: "Great-circle km between sites",
    formula: "distance over lat/lon pairs",
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

function TelemetrySlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-lg border border-line bg-panel px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <span className="font-display text-base font-extrabold tabular-nums text-ink">
          {value.toFixed(step < 1 ? 2 : 0)}
          <span className="ml-1 font-mono text-[10px] font-semibold uppercase text-muted">
            {unit}
          </span>
        </span>
      </div>
      <input
        className="mt-2 h-2 w-full accent-solar"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ProbabilityBar({ label, value }: { label: string; value: number }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <span className="font-mono text-[10px] font-semibold tabular-nums text-ink">
          {clampedValue.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-risk transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
