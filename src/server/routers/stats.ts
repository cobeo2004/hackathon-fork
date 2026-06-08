import { publicProcedure, router } from "../trpc";
import { VIC_FACTS, VIC_INSTALLS } from "~/data/victoria";

export const statsRouter = router({
  // Problem section: real Victorian install wave + headline facts.
  problem: publicProcedure.query(() => ({
    facts: VIC_FACTS,
    installs: VIC_INSTALLS,
  })),
});
