import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { SITES } from "~/data/demo";

export const sitesRouter = router({
  list: publicProcedure.query(() => SITES),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const site = SITES.find((s) => s.site_id === input.id);
      if (!site) throw new Error(`Unknown site: ${input.id}`);
      return site;
    }),
});
