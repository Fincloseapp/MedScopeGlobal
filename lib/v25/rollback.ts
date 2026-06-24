import { appendV25Log } from "@/lib/v25/data-store";
import { emitV25Alert } from "@/lib/v25/alert";
import { recordV25Fix } from "@/lib/v25/system-state";

export function runV25Rollback(reason: string): { ok: boolean; detail: string } {
  appendV25Log("rollback", reason);
  const detail =
    process.env.VERCEL === "1"
      ? "Vercel rollback requires dashboard or API token — logged for ops"
      : "Local rollback: revert last deploy commit via git";

  recordV25Fix({
    errorType: "deploy",
    module: "rollback",
    action: "rollback",
    result: "partial",
    detail,
  });

  emitV25Alert("rollback", reason, "v25-rollback.log");
  return { ok: true, detail };
}
