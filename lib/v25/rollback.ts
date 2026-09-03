import { appendV25Log } from "@/lib/v25/data-store";
import { emitV25Alert } from "@/lib/v25/alert";
import { recordV25Fix } from "@/lib/v25/system-state";
import { isCloudflareRuntime } from "@/lib/config/runtime";

export function runV25Rollback(reason: string): { ok: boolean; detail: string } {
  appendV25Log("rollback", reason);
  const detail = isCloudflareRuntime()
    ? "Cloudflare rollback: wrangler rollback or GitHub Actions redeploy on main"
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
