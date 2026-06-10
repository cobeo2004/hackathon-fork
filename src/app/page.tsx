// Landing page — RSC shell (no "use client") so the route stays static-prerendered
// (PPR). Motion lives in the client-island bands below; the static HTML still ships
// the content, and the scroll-linked motion hydrates over it.

import { CursorGlow } from "./_components/CursorGlow";
import { ScrollProgress } from "./_components/ScrollProgress";
import { GrainOverlay } from "./_components/GrainOverlay";
import { HeroBand } from "./_components/HeroBand";
import { TelemetryMarquee } from "./_components/TelemetryMarquee";
import { StatScrollband } from "./_components/StatScrollband";
import { PanelExplodedBand } from "./_components/PanelExplodedBand";
import { StorySteps } from "./_components/StorySteps";
import { ResultsBand } from "./_components/ResultsBand";
import { CtaBand } from "./_components/CtaBand";

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Home-only scroll-progress rail + cursor spotlight + film grain (fixed layers). */}
      <ScrollProgress />
      <CursorGlow />
      <GrainOverlay />
      {/* Content sits above the spotlight (which is fixed z-0). */}
      <div className="relative z-10">
        <HeroBand />
        {/* Live telemetry ticker — bridges the hero into the numbers. */}
        <TelemetryMarquee />
        {/* Sticky scrubbed centerpiece — owns its own tall scroll height. */}
        <StatScrollband />
        {/* Calmer bands, generous negative space between them. */}
        <div className="space-y-28 py-20 md:space-y-40 md:py-28">
          {/* Sticky exploded panel — the recovery story, layer by layer. */}
          <PanelExplodedBand />
          <StorySteps />
          <ResultsBand />
          <CtaBand />
        </div>
      </div>
    </div>
  );
}
