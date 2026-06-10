"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineMath } from "react-katex";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { HealthChart } from "./HealthChart";
import { PassportPanel } from "./PassportPanel";
import { Pipeline } from "./Pipeline";
import { TwoStagePipeline } from "./TwoStagePipeline";
import { Card, DataNote, Disclaimer, RiskBadge, SectionLead } from "~/components/ui";
import { LiveHealthBadge } from "./LiveHealthBadge";
import type { BreakingRisk } from "~/data/types";
import {
  FALLBACK_PV_FAULT_PREDICTION,
  healthReadingToPvTelemetry,
  predictPvFault,
  type PvFaultPrediction,
  type PvFaultTelemetry,
} from "~/lib/pvFaultModel";
import { breakingRiskMessage } from "~/lib/risk";

// Debounce a rapidly-changing value so downstream effects (here: the network
// scoring call) only fire once motion settles, instead of on every slider tick.
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type Scenario = {
  label: string;
  telemetry: PvFaultTelemetry;
};

// Scenario telemetry: "Wyndham live" is synthetic (follows Lotus degradation range).
// All other scenarios are real rows from the Lotus PV Fault Benchmark dataset
// (one representative row per fault class). Normal = low-irradiance nighttime state.
const BENCHMARK_SCENARIOS: Scenario[] = [
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
  const trpc = useTRPC();
  const { data: featured } = useQuery(trpc.health.featured.queryOptions());
  const { data: passport } = useQuery(trpc.passport.events.queryOptions());

  // "Wyndham live" scenario is seeded from the featured asset's latest reading
  // (server data), with the benchmark rows appended after.
  const scenarios = useMemo<Scenario[]>(() => {
    if (!featured) return BENCHMARK_SCENARIOS;
    const latest = featured.readings[featured.readings.length - 1];
    return [
      { label: "Wyndham live", telemetry: healthReadingToPvTelemetry(latest) },
      ...BENCHMARK_SCENARIOS,
    ];
  }, [featured]);

  const [telemetry, setTelemetry] = useState<PvFaultTelemetry>(
    BENCHMARK_SCENARIOS[2].telemetry,
  );
  const [activeScenario, setActiveScenario] = useState("Degradation");
  const [mlPrediction, setMlPrediction] = useState<PvFaultPrediction>(
    FALLBACK_PV_FAULT_PREDICTION,
  );
  const [modelStatus, setModelStatus] = useState<
    "live" | "fallback" | "scoring"
  >("fallback");

  // Slider drags update `telemetry` continuously (so the UI stays responsive),
  // but we only POST to the model once the value settles — debounced — to avoid
  // a burst of requests per drag.
  const scoredTelemetry = useDebouncedValue(telemetry, 280);

  useEffect(() => {
    let cancelled = false;
    setModelStatus((status) => (status === "fallback" ? "fallback" : "scoring"));

    predictPvFault(scoredTelemetry)
      .then((prediction) => {
        if (!cancelled) {
          setMlPrediction(prediction);
          setModelStatus("live");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMlPrediction({ ...FALLBACK_PV_FAULT_PREDICTION, ...scoredTelemetry });
          setModelStatus("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scoredTelemetry]);

  const displayFaultClass =
    mlPrediction.predicted_binary_label === "normal"
      ? "normal"
      : (mlPrediction.predicted_fault_type || "fault").replace(/_/g, " ");
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
      ? "live model API"
      : modelStatus === "scoring"
        ? "scoring"
        : "demo fallback";

  const faultProbabilities = useMemo(
    () => [
      { label: "short", value: mlPrediction.fault_probability_short_circuit_percent },
      { label: "degrade", value: mlPrediction.fault_probability_degradation_percent },
      { label: "open", value: mlPrediction.fault_probability_open_circuit_percent },
      { label: "shadow", value: mlPrediction.fault_probability_shadowing_percent },
    ],
    [mlPrediction],
  );

  function applyScenario(scenario: Scenario) {
    setTelemetry(scenario.telemetry);
    setActiveScenario(scenario.label);
  }

  function updateTelemetry(key: keyof PvFaultTelemetry, value: number) {
    setActiveScenario("Custom");
    setTelemetry((current) => ({ ...current, [key]: roundInput(value) }));
  }

  if (!featured || !passport) return null;

  return (
    <div>
      <SectionLead
        step={2}
        eyebrow="The solution"
        title="Predict the failure, then plan the smartest collection"
        subtitle="Telemetry becomes a calibrated fault risk score, a fault type, a collection job, and a verifiable record, automatically."
      />

      <Disclaimer label="Not live data">
        The asset health data on this page is illustrative, not live. Telemetry comes from a
        public benchmark dataset (Lotus PV Fault Benchmark) sourced from the internet, not a
        real asset. No live IoT feed is connected.
      </Disclaimer>

      <Card className="p-5">
        <Pipeline />
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-display text-base font-extrabold tracking-tight text-ink">
                {featured.asset.site_name}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                {featured.asset.lga} · PV benchmark telemetry · {modelStatusLabel}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LiveHealthBadge />
              <RiskBadge risk={mlBreakingRisk} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <Metric
              label="Stage 1 risk"
              value={`${mlPrediction.fault_risk_percent.toFixed(0)}%`}
              tone="risk"
            />
            <Metric label="Fault class" value={displayFaultClass} />
            <Metric label="Type confidence" value={stageTwoDisplay} tone="solar" />
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
                {scenarios.map((scenario) => (
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
              <span className="font-semibold text-ink/60">
                Synthetic data disclaimer:
              </span>{" "}
              &quot;Wyndham live&quot; is generated from a synthetic asset whose
              values follow the Lotus PV Fault Benchmark degradation pattern. All
              other scenarios are real rows from the Lotus benchmark dataset (one
              row per fault class). No live IoT feed is connected.
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
                  unit="W/m²"
                  onChange={(value) => updateTelemetry("irradiance", value)}
                />
                <TelemetrySlider
                  label="Module temp"
                  value={telemetry.pv_module_temperature}
                  min={0}
                  max={90}
                  step={0.25}
                  unit="°C"
                  onChange={(value) =>
                    updateTelemetry("pv_module_temperature", value)
                  }
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
            <PassportPanel events={passport} />
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <div className="mb-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Inverter health trend (featured asset)
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted/60">
            Wyndham synthetic session · not real sensor data
          </div>
        </div>
        <HealthChart readings={featured.readings} />
      </Card>

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
    formula: "P(\\text{faulty}) \\rightarrow \\text{class confidence}",
    note: null,
  },
  {
    tag: "Filter",
    name: "Greedy knapsack",
    detail: "Pack stops under truck mass capacity",
    formula: "\\sum \\text{mass} \\le 2{,}500\\ \\text{kg}",
    note: "priority-first",
  },
  {
    tag: "Optimize",
    name: "Exact brute-force TSP",
    detail: "Shortest depot → stops → centre",
    formula: "\\min_{\\text{perms}} \\sum d_{i,i+1}",
    note: "greedy NN fallback",
  },
  {
    tag: "Measure",
    name: "Haversine distance",
    detail: "Great-circle km between sites",
    formula: "2r\\,\\arcsin\\!\\sqrt{\\operatorname{hav}(\\Delta\\varphi,\\Delta\\lambda)}",
    note: null,
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
            <div className="mt-1 text-[12px] leading-snug text-muted">
              {a.detail}
            </div>
            <div className="algo-formula mt-2 flex items-center overflow-x-auto rounded bg-ink/[0.04] px-2 py-1.5 text-ink/75">
              <InlineMath math={a.formula} />
            </div>
            {a.note ? (
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted/80">
                {a.note}
              </div>
            ) : null}
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
      <div
        className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${tones[tone]}`}
      >
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
