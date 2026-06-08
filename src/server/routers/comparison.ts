import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { buildComparison } from "~/lib/cost";

export const comparisonRouter = router({
  summary: publicProcedure
    .input(z.object({ stops: z.number().int().positive() }).optional())
    .query(({ input }) => buildComparison(input?.stops ?? 4)),
});
