import type { PvFaultPrediction, PvFaultTelemetry } from "~/lib/pvFaultModel";

const FAULT_LABELS: Record<string, string> = {
  short_circuit: "Short circuit",
  degradation: "Degradation",
  open_circuit: "Open circuit",
  shadowing: "Shadowing",
};

export function TwoStagePipeline({
  mlPrediction,
  telemetry,
}: {
  mlPrediction: PvFaultPrediction;
  telemetry: PvFaultTelemetry;
}) {
  const isNormal = mlPrediction.predicted_binary_label === "normal";
  const faultLabel = mlPrediction.predicted_fault_type
    ? (FAULT_LABELS[mlPrediction.predicted_fault_type] ?? mlPrediction.predicted_fault_type)
    : "n/a";

  return (
    <div>
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        Two-stage XGBoost · live prediction
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden items-stretch gap-2 md:flex">
        <InputNode telemetry={telemetry} />
        <Connector label="6 features" active />
        <Stage1Node prediction={mlPrediction} isNormal={isNormal} />
        <Connector label={isNormal ? "bypassed" : "classify"} active={!isNormal} />
        <Stage2Node faultLabel={faultLabel} prediction={mlPrediction} bypassed={isNormal} />
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-1.5 md:hidden">
        <InputNode telemetry={telemetry} />
        <MobileArrow active />
        <Stage1Node prediction={mlPrediction} isNormal={isNormal} />
        <MobileArrow active={!isNormal} label={isNormal ? "bypassed" : undefined} />
        <Stage2Node faultLabel={faultLabel} prediction={mlPrediction} bypassed={isNormal} />
      </div>
    </div>
  );
}

function InputNode({ telemetry }: { telemetry: PvFaultTelemetry }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line bg-paper/60 p-3">
      <div className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
        Sensor input
      </div>
      <div className="space-y-1.5">
        <TRow label="Vdc1" value={`${telemetry.vdc1.toFixed(1)} V`} />
        <TRow label="Idc1" value={`${telemetry.idc1.toFixed(2)} A`} />
        <TRow label="Vdc2" value={`${telemetry.vdc2.toFixed(1)} V`} />
        <TRow label="Irr" value={`${telemetry.irradiance.toFixed(0)} W/m²`} />
      </div>
    </div>
  );
}

function Stage1Node({
  prediction,
  isNormal,
}: {
  prediction: PvFaultPrediction;
  isNormal: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-lg border p-3 transition-colors duration-300 ${
        isNormal
          ? "border-recover/40 bg-recover/5"
          : "border-solar/50 bg-solar-soft"
      }`}
    >
      <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
        Stage 1 · Binary
      </div>
      <div
        className={`font-display text-3xl font-extrabold tabular-nums tracking-tight transition-all duration-300 ${
          isNormal ? "text-recover" : "text-solar"
        }`}
      >
        {prediction.fault_risk_percent.toFixed(0)}%
      </div>
      <div
        className={`font-mono text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
          isNormal ? "text-recover" : "text-[#8a4a06]"
        }`}
      >
        {isNormal ? "Normal" : "Faulty"}
      </div>
      <div className="mt-auto pt-2 font-mono text-[9px] text-muted">
        {isNormal
          ? `${prediction.normal_confidence_percent.toFixed(0)}% normal conf.`
          : `${(100 - prediction.normal_confidence_percent).toFixed(0)}% fault conf.`}
      </div>
    </div>
  );
}

function Stage2Node({
  faultLabel,
  prediction,
  bypassed,
}: {
  faultLabel: string;
  prediction: PvFaultPrediction;
  bypassed: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-lg border p-3 transition-all duration-300 ${
        bypassed ? "border-line bg-paper/40 opacity-40" : "border-risk/40 bg-risk/5"
      }`}
    >
      <div className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
        Stage 2 · Fault type
      </div>
      {bypassed ? (
        <div className="mt-1 font-mono text-[11px] italic text-muted">
          No fault · bypassed
        </div>
      ) : (
        <>
          <div className="font-display text-2xl font-extrabold tracking-tight text-risk transition-all duration-300">
            {faultLabel}
          </div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-wide text-risk/70">
            {prediction.fault_type_confidence_percent != null
              ? `${prediction.fault_type_confidence_percent.toFixed(0)}% confidence`
              : "pending"}
          </div>
          <div className="mt-auto pt-2 font-mono text-[9px] text-muted">
            XGBoost multiclass
          </div>
        </>
      )}
    </div>
  );
}

function Connector({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex w-10 shrink-0 flex-col items-center justify-center gap-0.5 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-25"
      }`}
    >
      <span className="text-center font-mono text-[8px] uppercase leading-none tracking-wide text-muted">
        {label}
      </span>
      <span className="font-display text-base font-bold leading-none text-solar">→</span>
    </div>
  );
}

function MobileArrow({ active, label }: { active: boolean; label?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 py-0.5 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-25"
      }`}
    >
      {label && (
        <span className="font-mono text-[8px] uppercase tracking-wide text-muted">{label}</span>
      )}
      <span className="font-display text-base font-bold leading-none text-solar">↓</span>
    </div>
  );
}

function TRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-mono text-[9px] uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-[10px] font-semibold tabular-nums text-ink transition-all duration-150">
        {value}
      </span>
    </div>
  );
}
