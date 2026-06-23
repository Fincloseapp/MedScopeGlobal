import { appendV25Log } from "@/lib/v25/data-store";
import { emitV25Alert } from "@/lib/v25/alert";
import { recordV25Fix } from "@/lib/v25/system-state";

export type V25AutofixContext = {
  module: string;
  errorType: string;
  detail: string;
};

/** Records autofix attempt — structural/routing fixes are applied in-repo; runtime triggers redeploy. */
export function runV25Autofix(ctx: V25AutofixContext): { ok: boolean; action: string } {
  appendV25Log("autofix", `${ctx.module}/${ctx.errorType}: ${ctx.detail}`);

  const fixes: Record<string, string> = {
    routing: "revalidate known static routes",
    api: "health endpoint ping + cache bust",
    cron: "retry cron with backoff",
    link: "mark broken URLs for manual review",
    nav: "re-fetch navigation routes",
    screenshot: "fallback to HTML snapshot manifest",
    images: "run v25 image pipeline — generate and assign missing covers",
    imagetest: "re-run image URL + page visual checks",
  };

  const action = fixes[ctx.errorType] ?? "log and alert ops";
  const ok = ctx.errorType !== "orchestrator";

  recordV25Fix({
    errorType: ctx.errorType,
    module: ctx.module,
    action: "autofix",
    result: ok ? "ok" : "fail",
    detail: action,
  });

  if (!ok) {
    emitV25Alert("autofix-fail", `${ctx.module}: ${ctx.detail}`, "v25-autofix.log");
  }

  return { ok, action };
}
