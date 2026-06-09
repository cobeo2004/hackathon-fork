import { InstallWaveChart } from "../components/InstallWaveChart";
import { TopPostcodesChart } from "../components/TopPostcodesChart";
import { Card, DataNote, SectionLead, Stat } from "../components/ui";
import { VIC_FACTS, VIC_TOP_POSTCODES } from "../data/victoria";

export function ProblemSection() {
  const f = VIC_FACTS;
  return (
    <div>
      <SectionLead
        step={1}
        eyebrow="The problem - real Victorian data"
        title="A decade-old solar boom is now hitting end-of-life"
        subtitle="Victoria installed hundreds of thousands of rooftop systems in 2011-2014. Those inverters are failing now, and there is no coordinated plan to find, recover, or recycle them."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Victorian rooftop solar - systems installed per year
          </div>
          <InstallWaveChart height={262} />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-muted">
            <Legend color="#cf3d29" text="12+ yrs - failing now" />
            <Legend color="#e07c08" text="ageing, 5 yrs to EOL" />
            <Legend color="#c9bfa8" text="still in service" />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="flex h-full flex-col gap-4 p-5">
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
              sub="installed by 2014 - at inverter end-of-life right now"
              tone="risk"
            />
            <div className="h-px bg-line" />
            <Stat
              label="PV waste by 2035"
              value={`${(f.wasteTonnes2035 / 1000).toFixed(0)}k t/yr`}
              sub={`up from ${(f.wasteTonnes2021 / 1000).toFixed(0)}k t in 2021 - +${f.wasteCagrPct}% every year`}
              tone="solar"
            />
          </Card>
        </div>

        <Card className="p-5 lg:col-span-3">
          <TopPostcodesChart />
        </Card>

        <div className="lg:col-span-2">
          <PostcodeInsights />
        </div>
      </div>

      <DataNote
        real="Victorian install counts per year and top postcode totals (CER), plus state PV waste projections (Sustainability Victoria)"
        illustrative="age-band split is our estimate from install year + typical 10-15 yr inverter life"
        source="Clean Energy Regulator (to Apr 2026) | Sustainability Victoria - PV material flow analysis | SolarQuotes/CER and PEXA for 3029 context"
      />
    </div>
  );
}

function PostcodeInsights() {
  const topFive = VIC_TOP_POSTCODES.slice(0, 5);
  const leader = topFive[0];
  const runnerUp = topFive[1];
  const leaderGap = leader.installs - runnerUp.installs;
  const leaderGapPct = Math.round((leader.installs / runnerUp.installs - 1) * 100);
  const topFiveTotal = topFive.reduce((sum, row) => sum + row.installs, 0);
  const topFifteenTotal = VIC_TOP_POSTCODES.reduce((sum, row) => sum + row.installs, 0);
  const topFiveShare = Math.round((topFiveTotal / topFifteenTotal) * 100);

  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <Insight
        label="Top 5 postcode names"
        value={topFive.map((row) => row.postcode).join(" / ")}
        sub={topFive.map((row) => row.name).join("; ")}
        tone="ink"
      />
      <div className="h-px bg-line" />
      <Insight
        label="Chart insight"
        value={`${topFiveShare}%`}
        sub={`of the top-15 install base sits in the first five postcodes; 3029 is ${leaderGap.toLocaleString()} systems ahead of 3977.`}
        tone="solar"
      />
      <div className="h-px bg-line" />
      <Insight
        label="Why 3029 leads"
        value={`+${leaderGapPct}%`}
        sub="3029 combines Hoppers Crossing, Tarneit and Truganina: a fast-growth housing corridor with above-average solar uptake."
        tone="risk"
      />
      <div className="rounded-lg border border-line bg-paper/70 px-3 py-2 text-[11px] leading-snug text-muted">
        Source context:{" "}
        <a
          className="font-semibold text-ink underline decoration-line underline-offset-2"
          href="https://www.solarquotes.com.au/location/truganina-3029-vic/"
          target="_blank"
          rel="noreferrer"
        >
          SolarQuotes/CER
        </a>{" "}
        reports 66 systems per 100 dwellings in 3029;{" "}
        <a
          className="font-semibold text-ink underline decoration-line underline-offset-2"
          href="https://www.pexa.com.au/content-hub/the-story-behind-australias-fastest-growing-suburb/"
          target="_blank"
          rel="noreferrer"
        >
          PEXA
        </a>{" "}
        describes Tarneit and Truganina as Urban Growth Zone suburbs.
      </div>
    </Card>
  );
}

function Insight({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "ink" | "risk" | "solar";
}) {
  const tones: Record<typeof tone, string> = {
    ink: "text-ink",
    risk: "text-risk",
    solar: "text-solar",
  };

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className={`mt-1 font-display text-2xl font-extrabold leading-none ${tones[tone]}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[13px] leading-snug text-muted">{sub}</div>
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
