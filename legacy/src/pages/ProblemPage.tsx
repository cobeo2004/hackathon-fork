import { InstallWaveChart } from "../components/InstallWaveChart";
import { Card, DataNote, SectionLead, Stat } from "../components/ui";
import { VIC_FACTS } from "../data/victoria";

export function ProblemSection() {
  const f = VIC_FACTS;
  return (
    <div>
      <SectionLead
        step={1}
        eyebrow="The problem — real Victorian data"
        title="A decade-old solar boom is now hitting end-of-life"
        subtitle="Victoria installed hundreds of thousands of rooftop systems in 2011–2014. Those inverters are failing now — and there's no coordinated plan to find, recover, or recycle them."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* The real CER install wave is the hero visual. */}
        <Card className="p-5 lg:col-span-3">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Victorian rooftop solar — systems installed per year
          </div>
          <InstallWaveChart height={262} />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-muted">
            <Legend color="#cf3d29" text="12+ yrs — failing now" />
            <Legend color="#e07c08" text="ageing (≤5 yrs to EOL)" />
            <Legend color="#c9bfa8" text="still in service" />
          </div>
        </Card>

        {/* The numbers that make the problem undeniable. */}
        <div className="lg:col-span-2">
          <Card className="flex h-full flex-col justify-between gap-5 p-6">
            <Stat
              label="Rooftop systems in Victoria"
              value={f.totalSystems.toLocaleString()}
              sub={`~${f.vicShareOfNationalPct}% of every solar system in Australia`}
              tone="ink"
            />
            <div className="h-px bg-line" />
            <Stat
              label="Already 12+ years old"
              value={`${Math.round(f.eolNowSystems / 1000)}k`}
              sub="installed by 2014 — at inverter end-of-life right now"
              tone="risk"
            />
            <div className="h-px bg-line" />
            <Stat
              label="PV waste by 2035"
              value={`${(f.wasteTonnes2035 / 1000).toFixed(0)}k t/yr`}
              sub={`up from ${(f.wasteTonnes2021 / 1000).toFixed(0)}k t in 2021 — +${f.wasteCagrPct}% every year`}
              tone="solar"
            />
          </Card>
        </div>
      </div>

      <DataNote
        real="Victorian install counts per year (CER) and state PV waste projections (Sustainability Victoria)"
        illustrative="age-band split is our estimate from install year + typical 10–15 yr inverter life"
        source="Clean Energy Regulator (to Apr 2026) · Sustainability Victoria — PV material flow analysis"
      />
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {text}
    </span>
  );
}
