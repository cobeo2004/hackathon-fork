import Link from "next/link";

export default function LandingPage() {
  return (
    <section>
      <p className="reveal font-mono text-xs font-semibold uppercase tracking-[0.22em] text-solar">
        Solar lifecycle &amp; recovery, Melbourne west &amp; north
      </p>
      <h1
        className="reveal mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]"
        style={{ animationDelay: "0.08s" }}
      >
        We predict which solar assets fail next —
        <span className="text-solar">
          {" "}
          and recover them on the cheapest possible route.
        </span>
      </h1>
      <p
        className="reveal mt-4 max-w-2xl text-base leading-relaxed text-muted"
        style={{ animationDelay: "0.16s" }}
      >
        Aging panels and inverters fail unpredictably. Today collection is
        reactive and wasteful. SolarCycle AI turns health data into a plan — in
        three steps.
      </p>
      <nav
        className="reveal mt-8 flex flex-wrap gap-3"
        style={{ animationDelay: "0.24s" }}
      >
        <Link
          href="/problem"
          className="rounded-lg bg-ink px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-solar"
        >
          See the problem →
        </Link>
        <Link
          href="/demo"
          className="rounded-lg border border-line px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
        >
          Jump to the live demo
        </Link>
      </nav>
    </section>
  );
}
