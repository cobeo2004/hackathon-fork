// Landing page — RSC shell (no "use client") so the route stays static-prerendered
// (PPR). Motion lives in the client-island bands below; the static HTML still ships
// the content, and animation hydrates over it.

import { HeroBand } from "./_components/HeroBand";
import { StatCounters } from "./_components/StatCounters";
import { StorySteps } from "./_components/StorySteps";
import { ResultsBand } from "./_components/ResultsBand";
import { CtaBand } from "./_components/CtaBand";

export default function LandingPage() {
  return (
    <div className="space-y-16 md:space-y-20">
      <HeroBand />
      <StatCounters />
      <StorySteps />
      <ResultsBand />
      <CtaBand />
    </div>
  );
}
