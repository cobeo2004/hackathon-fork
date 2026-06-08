// Landing page — RSC shell (no "use client") so the route stays static-prerendered
// (PPR). Motion lives in the client-island bands below; the static HTML still ships
// the content, and the scroll-linked motion hydrates over it.

import { HeroBand } from "./_components/HeroBand";
import { StatScrollband } from "./_components/StatScrollband";
import { StorySteps } from "./_components/StorySteps";
import { ResultsBand } from "./_components/ResultsBand";
import { CtaBand } from "./_components/CtaBand";

export default function LandingPage() {
  return (
    <div>
      <HeroBand />
      {/* Sticky scrubbed centerpiece — owns its own tall scroll height. */}
      <StatScrollband />
      {/* Calmer bands, generous negative space between them. */}
      <div className="space-y-28 py-20 md:space-y-40 md:py-28">
        <StorySteps />
        <ResultsBand />
        <CtaBand />
      </div>
    </div>
  );
}
