// SolarCycle AI in four phases — the whole product in one glance for the pitch.

const STEPS = [
  { icon: "📡", label: "Sense", detail: "Ingest inverter health telemetry" },
  { icon: "⚠️", label: "Predict", detail: "Risk score + end-of-life window" },
  { icon: "🚚", label: "Plan", detail: "Capacity-aware collection route" },
  { icon: "🔗", label: "Prove", detail: "Append verifiable passport event" },
];

export function Pipeline() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
      {STEPS.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-3 md:gap-0">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-line bg-paper/60 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-panel text-xl shadow-sm">
              {s.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted">0{i + 1}</span>
                <span className="font-display text-base font-extrabold tracking-tight text-ink">
                  {s.label}
                </span>
              </div>
              <div className="mt-0.5 text-xs leading-snug text-muted">{s.detail}</div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <span className="hidden px-1 font-display text-lg font-bold text-solar md:inline">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
