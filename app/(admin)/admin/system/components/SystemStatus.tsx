import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { V25ApiStatus, V25CronStatus, V25FixRecord, V25TestSuite } from "@/lib/v25/types";
import { cn } from "@/lib/utils";

function badge(status: string) {
  const map: Record<string, string> = {
    ok: "bg-emerald-100 text-emerald-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    skipped: "bg-slate-100 text-slate-600",
    partial: "bg-orange-100 text-orange-800",
  };
  return map[status] ?? map.pending;
}

function lastByAction(history: V25FixRecord[], action: V25FixRecord["action"]) {
  return history.find((h) => h.action === action) ?? null;
}

export function SystemStatus({
  tests,
  apis,
  crons,
  fixHistory,
}: {
  tests: V25TestSuite;
  apis: V25ApiStatus[];
  crons: V25CronStatus[];
  fixHistory: V25FixRecord[];
}) {
  const apiOk = apis.length > 0 ? apis.every((a) => a.ok) : false;
  const cronOk = crons.every((c) => c.status === "ok" || c.status === "pending");
  const orchestratorCron = crons.find((c) => c.cronId === "v25-enterprise");
  const orchestratorStatus =
    orchestratorCron?.status === "ok"
      ? "ok"
      : orchestratorCron?.status === "fail"
        ? "fail"
        : tests.verifyEngine;

  const items = [
    { label: "Build", status: tests.buildStatus },
    { label: "CI", status: tests.ciStatus },
    { label: "Orchestrátor", status: orchestratorStatus },
    { label: "API", status: apiOk ? "ok" : apis.length ? "fail" : "pending" },
    { label: "CRON", status: cronOk ? "ok" : "fail" },
    {
      label: "Poslední auto-fix",
      status: lastByAction(fixHistory, "autofix")?.result ?? "pending",
      detail: lastByAction(fixHistory, "autofix")?.at,
    },
    {
      label: "Poslední rollback",
      status: lastByAction(fixHistory, "rollback")?.result ?? "pending",
      detail: lastByAction(fixHistory, "rollback")?.at,
    },
    {
      label: "Poslední redeploy",
      status: lastByAction(fixHistory, "redeploy")?.result ?? "pending",
      detail: lastByAction(fixHistory, "redeploy")?.at,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-semibold uppercase",
                badge(item.status)
              )}
            >
              {item.status}
            </span>
            {item.detail ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(item.detail).toLocaleString("cs-CZ")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
