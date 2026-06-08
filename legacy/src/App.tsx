import { DemoSection } from "./pages/DemoPage";
import { ProblemSection } from "./pages/ProblemPage";
import { SolutionSection } from "./pages/SolutionPage";
import { useSimulation } from "./hooks/useSimulation";

const SECTIONS = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "demo", label: "Demo" },
] as const;

export default function App() {
  const sim = useSimulation();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-[1000] border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-lg">
              🔆
            </span>
            <div className="leading-none">
              <div className="font-display text-[17px] font-extrabold tracking-tight text-ink">
                SolarCycle<span className="text-solar"> AI</span>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Predict · Plan · Recover
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-md px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-ink hover:text-paper"
              >
                <span className="mr-1.5 text-solar">{i + 1}</span>
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Pitch framing: one sentence that tells the judge the whole story. */}
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-2">
        <p className="reveal font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
          Solar lifecycle &amp; recovery, Melbourne west &amp; north
        </p>
        <h1
          className="reveal mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]"
          style={{ animationDelay: "0.08s" }}
        >
          We predict which solar assets fail next —
          <span className="text-solar"> and recover them on the cheapest possible route.</span>
        </h1>
        <p
          className="reveal mt-4 max-w-2xl text-base leading-relaxed text-muted"
          style={{ animationDelay: "0.16s" }}
        >
          Aging panels and inverters fail unpredictably. Today collection is reactive and
          wasteful. SolarCycle AI turns health data into a plan — in three steps.
        </p>
      </section>

      <main className="mx-auto max-w-6xl space-y-24 px-5 py-14">
        <section id="problem" className="scroll-mt-24">
          <ProblemSection />
        </section>
        <section id="solution" className="scroll-mt-24">
          <SolutionSection />
        </section>
        <section id="demo" className="scroll-mt-24">
          <DemoSection sim={sim} />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        SolarCycle AI · Hackathon MVP · deterministic demo data
      </footer>
    </div>
  );
}
