import { publicProcedure, router } from "../trpc";
import { VIC_FACTS, VIC_INSTALLS, VIC_TOP_POSTCODES } from "~/data/victoria";

export const statsRouter = router({
  // Problem section: real Victorian install wave + headline facts.
  problem: publicProcedure.query(() => ({
    facts: VIC_FACTS,
    installs: VIC_INSTALLS,
  })),

  // Top Victorian postcodes by all-time rooftop solar installs (CER).
  topPostcodes: publicProcedure.query(() => VIC_TOP_POSTCODES),
});
