"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { ArrowsClockwise, Play } from "@phosphor-icons/react/dist/ssr";
import { useSimulation } from "./useSimulation";
import { useRoadRoutes } from "~/hooks/useRoadRoutes";
import { Button, Card, DataNote, SectionLead } from "~/components/ui";
import { formatNumber } from "~/lib/format";
import { TruckStat } from "./TruckStat";
import { CompareTable } from "./CompareTable";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });

export function DemoSection() {
  const trpc = useTRPC();
  const { data: routes } = useQuery(trpc.routes.pair.queryOptions());
  const { data: comparison } = useQuery(trpc.comparison.summary.queryOptions());
  const { data: featured } = useQuery(trpc.health.featured.queryOptions());

  const sim = useSimulation();
  const { status, series, start, reset, subscribe } = sim;

  // Real road geometry (OSRM) for the drawn route lines, with a straight-line
  // fallback so the demo still works offline.
  const road = useRoadRoutes();

  if (!routes || !comparison) return null;

  const failDays = featured?.asset.estimated_failure_window_days ?? 21;

  const latest = series[series.length - 1];

  // Live figures: while idle, preview the planned route totals so the cards are never
  // a confusing "0"; once running they follow the live totals and settle on the result.
  const preview = status === "idle";
  const baseDist =
    latest?.baselineDist ?? (preview ? routes.baseline.total_distance_km : 0);
  const optDist =
    latest?.optimizedDist ?? (preview ? routes.optimized.total_distance_km : 0);
  const baseCost =
    latest?.baselineCost ?? (preview ? routes.baseline.total_cost_aud : 0);
  const optCost =
    latest?.optimizedCost ?? (preview ? routes.optimized.total_cost_aud : 0);

  return (
    <div>
      <SectionLead
        step={3}
        eyebrow="The demo"
        title="Same job, same truck. Watch ours finish cheaper"
        subtitle="Both trucks recover the same 1,980 kg. Red is today's reactive route; blue is SolarCycle AI. Only the routing strategy changes."
      />

      <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
        <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
          ◌ Data provenance
        </span>
        Phase 1 uses real public datasets for postcode-level solar installation context,
        product mix, and facility locations.{" "}
        <strong>
          Site locations, risk scores, collection status, and mass are illustrative demo
          scenarios. CER data only supports postcode-level install counts and age
          cohorts.
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
        <div className="flex items-center gap-3">
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
      />

      <DataNote
        real="depot & recycling centre locations (Cleanaway Laverton; Lotus Recycling, Campbellfield); postcode install counts & pre-2011 EOL cohort (Clean Energy Regulator)"
        illustrative="site risk scores, mass estimates, status, EOL windows, collection windows, route distances/costs, and facility processing capacity. All illustrative demo assumptions"
        source="Cleanaway & Lotus Recycling (public sites); CER SRES postcode data (to Apr 2026); road geometry via OSRM public router, straight-line fallback when offline"
      />
    </div>
  );
}
