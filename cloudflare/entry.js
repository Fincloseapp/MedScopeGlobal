import worker from "../.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";

function pulsePaths() {
  const paths = ["/api/cron/agent-arena"];
  if (new Date().getUTCMinutes() % 15 === 0) {
    paths.push("/api/cron/growth-sprint?light=1");
  }
  return paths;
}

async function runArenaRacePulse(env) {
  const secret = env.CRON_SECRET;
  if (!secret) return;
  const origin = (env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com").replace(/\/$/, "");
  const fetcher = env.WORKER_SELF_REFERENCE?.fetch?.bind(env.WORKER_SELF_REFERENCE) ?? fetch;
  await Promise.all(
    pulsePaths().map((path) =>
      fetcher(
        new Request(`${origin}${path}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${secret}` },
        })
      )
    )
  );
}

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, env, ctx);
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(runArenaRacePulse(env));
  },
};
