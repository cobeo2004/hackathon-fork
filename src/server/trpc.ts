import { initTRPC } from "@trpc/server";

/**
 * Request context. Accepts `headers` so it can be reused by both the RSC server
 * caller (passing `next/headers`) and the API route handler (passing the request
 * headers). Today empty; later: db client, auth/session.
 */
export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    sse: {
      ping: { enabled: true, intervalMs: 2000 },
      client: { reconnectAfterInactivityMs: 5000 },
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
