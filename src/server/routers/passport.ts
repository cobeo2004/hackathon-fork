import { publicProcedure, router } from "../trpc";
import { PASSPORT_EVENTS } from "~/data/asset";

export const passportRouter = router({
  events: publicProcedure.query(() => PASSPORT_EVENTS),
});
