"use client";

import dynamic from "next/dynamic";
import type { ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { ArrowsClockwise, Play } from "@phosphor-icons/react/dist/ssr";
import { useSimulation } from "./useSimulation";
import { useRoadRoutes } from "~/hooks/useRoadRoutes";
import { BASELINE_ROUTE, OPTIMIZED_ROUTE } from "~/data/demo";
import { buildComparison } from "~/lib/cost";
import { Button, Card, DataNote, Disclaimer, SectionLead } from "~/components/ui";
import { formatNumber } from "~/lib/format";
import { TruckStat } from "./TruckStat";
import { CompareTable } from "./CompareTable";
import { RouteTrace } from "./RouteTrace";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });

export function DemoSection() {
  const trpc = useTRPC();
  const { data: routes } = useQuery(trpc.routes.pair.queryOptions());
  const { data: featured } = useQuery(trpc.health.featured.queryOptions());

  const sim = useSimulation();
  const { status, series, start, reset, subscribe, speedMultiplier, setSpeedMultiplier } = sim;

  // Real road geometry (OSRM) for the drawn route lines, with a straight-line
  // fallback so the demo still works offline.
  const road = useRoadRoutes();

  if (!routes) return null;

  const comparison = road.comparison;

  const failDays = featured?.asset.estimated_failure_window_days ?? 21;

  const latest = series[series.length - 1];

  // Distance: scale sim's canonical km to OSRM km via progress ratio.
  // Cost: use the sim's step-function values (which jump at each collection stop and
  // each depot dispatch), scaled so they land on the OSRM-based final cost.
  const preview = status === "idle";

  const baseProg =
    status === "done" || preview
      ? 1
      : Math.min(1, (latest?.baselineDist ?? 0) / BASELINE_ROUTE.total_distance_km);
  const optProg =
    status === "done" || preview
      ? 1
      : Math.min(1, (latest?.optimizedDist ?? 0) / OPTIMIZED_ROUTE.total_distance_km);

  const baseDist = baseProg * comparison.baselineDistance;
  const optDist = optProg * comparison.optimizedDistance;

  // Fixed scale: sim computes cost against canonical km; OSRM km differ.
  // Dividing by the canonical final cost and multiplying by the OSRM final cost
  // preserves the step-function shape while landing on the correct OSRM total.
  const canonical = buildComparison();
  const baseCostScale = canonical.baselineCost > 0
    ? comparison.baselineCost / canonical.baselineCost
    : 1;
  const optCostScale = canonical.optimizedCost > 0
    ? comparison.optimizedCost / canonical.optimizedCost
    : 1;

  const baseCost =
    status === "done" || preview
      ? comparison.baselineCost
      : (latest?.baselineCost ?? 0) * baseCostScale;
  const optCost =
    status === "done" || preview
      ? comparison.optimizedCost
      : (latest?.optimizedCost ?? 0) * optCostScale;

  return (
    <div>
      <SectionLead
        step={3}
        eyebrow="The demo"
        title="Same job, same truck. Watch ours finish cheaper"
        subtitle="Same postcode demand areas, same payload, no duplicate postcode pickups. Red pays for 4 reactive depot-to-recycler trips as fault reports arrive; blue is one AI-planned collection campaign."
      />

      <Disclaimer label="No real mass data">
        This dataset has no weighed mass. Every kg figure shown (per-site EOL mass,
        recovered totals) is a synthetic estimate derived from CER install and pre-2011 EOL
        cohort counts, not a measured quantity.
      </Disclaimer>

      <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
        <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
          ◌ Data provenance
        </span>
        Phase 1 uses real public datasets for postcode-level solar installation context,
        product mix, and facility locations.{" "}
        <strong>
          Site locations, risk scores, collection status, and mass are illustrative demo
          scenarios. CER data only supports postcode-level install counts and age
          cohorts, so each postcode demand area is collected once in both routes.
        </strong>{" "}
        Facility locations are real. Solar-specific acceptance and daily processing
        capacity are assumptions unless separately verified with the operator.
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wide text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: routes.baseline.color }}
            />
            Reactive (today)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: routes.optimized.color }}
            />
            SolarCycle AI
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SpeedControl value={speedMultiplier} onChange={setSpeedMultiplier} />
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted"
            title={road.error}
          >
            {road.status === "loading"
              ? "◌ Routing roads…"
              : road.status === "ready"
                ? "● Road network (OSRM)"
                : "◌ Straight-line fallback"}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {status === "idle"
              ? "● Ready"
              : status === "running"
                ? "● Running…"
                : "● Complete"}
          </span>
          {status === "idle" ? (
            <Button onClick={start} variant="success">
              <Play size={14} weight="fill" /> Run live demo
            </Button>
          ) : (
            <Button
              onClick={() => {
                reset();
                start();
              }}
              variant="ghost"
            >
              <ArrowsClockwise size={14} weight="bold" /> Replay
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <MapView
            height={520}
            showRoutes
            networkGraph
            status={status}
            subscribe={subscribe}
            baselineRoad={road.baseline}
            optimizedRoad={road.optimized}
          />
          <RouteTrace
            comparison={comparison}
            baselineRoad={road.baseline}
            optimizedRoad={road.optimized}
          />
        </Card>

        <div className="space-y-4">
          <TruckStat
            color={routes.baseline.color}
            title="Reactive (today)"
            distance={baseDist}
            cost={baseCost}
          />
          <TruckStat
            color={routes.optimized.color}
            title="SolarCycle AI"
            distance={optDist}
            cost={optCost}
          />

          {status === "done" ? (
            <Card className="border-recover/40 bg-[#e7f3ec] p-5">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-recover">
                Result
              </div>
              <div className="mt-1 font-display text-6xl font-extrabold leading-none tracking-tight text-recover">
                −{comparison.costReductionPct.toFixed(0)}%
              </div>
              <div className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-recover">
                logistics cost
              </div>
              <div className="mt-3 text-[13px] leading-snug text-[#2a5f43]">
                −{comparison.distanceReductionPct.toFixed(0)}% distance · same{" "}
                {formatNumber(comparison.collectedMassKg)} kg recovered
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-[13px] leading-relaxed text-muted">
              Press{" "}
              <strong className="text-ink">Run live demo</strong> to dispatch both
              trucks. Watch the blue route finish shorter and cheaper than the red
              one.
            </Card>
          )}
        </div>
      </div>

      <CompareTable
        comparison={comparison}
        baselineColor={routes.baseline.color}
        optimizedColor={routes.optimized.color}
        failDays={failDays}
        baseDist={baseDist}
        optDist={optDist}
        baseCost={baseCost}
        optCost={optCost}
      />

      <DataNote
        real="depot & recycling centre locations (Cleanaway Laverton; Lotus Recycling, Campbellfield); postcode install counts & pre-2011 EOL cohort (Clean Energy Regulator)"
        illustrative="site risk scores, mass estimates, status, EOL windows, collection windows, route distances/costs, and facility processing capacity. All illustrative demo assumptions"
        source="Cleanaway & Lotus Recycling (public sites); CER SRES postcode data (to Apr 2026); road geometry via OSRM public router, straight-line fallback when offline"
      />
    </div>
  );
}

const SPEED_PRESETS = [0.5, 1, 1.5, 2];

// Drag or tap a preset to scale the truck speed live (0.25x–2.5x). The simulation
// reads the value per-frame, so changes take effect mid-run without a jump.
function SpeedControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const handleSlider = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Speed
      </div>
      <input
        aria-label="Truck speed"
        type="range"
        min="0.25"
        max="2.5"
        step="0.25"
        value={value}
        onChange={handleSlider}
        className="h-1.5 w-24 accent-recover"
      />
      <div className="w-10 text-right font-mono text-[11px] font-semibold tabular-nums text-ink">
        {value.toFixed(2).replace(/\.00$/, "")}x
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-md px-2 py-1 font-mono text-[10px] font-semibold tabular-nums transition-colors ${
              Math.abs(value - preset) < 0.01
                ? "bg-ink text-paper"
                : "bg-paper text-muted hover:bg-line/60 hover:text-ink"
            }`}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  );
}
