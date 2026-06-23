import { appendV24Log } from "@/lib/v24/data-store";

export type V24CronHealth = {
  cronId: string;
  status: "ok" | "error" | "partial";
  durationMs: number;
  metrics: Record<string, number>;
  error?: string;
};

export function recordCronHealth(health: V24CronHealth) {
  appendV24Log("cron", `${health.cronId} ${health.status} ${health.durationMs}ms ${JSON.stringify(health.metrics)}`);
  if (health.error) appendV24Log("errors", `${health.cronId}: ${health.error}`);
  if (health.status !== "ok") {
    appendV24Log("alerts", `ALERT ${health.cronId} ${health.status} — ${health.error ?? "partial run"}`);
  }
  return health;
}

export function recordContentHealth(section: string, score: number, published: number) {
  appendV24Log("contentHealth", `${section} qa=${score} published=${published}`);
}
