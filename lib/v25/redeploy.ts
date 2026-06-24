import { appendV25Log } from "@/lib/v25/data-store";
import { recordV25Fix } from "@/lib/v25/system-state";
import { V25_PROD_BASE } from "@/lib/v25/config";

export async function runV25Redeploy(trigger: string): Promise<{ ok: boolean; detail: string }> {
  appendV25Log("autofix", `redeploy requested: ${trigger}`);

  if (process.env.VERCEL === "1") {
    recordV25Fix({
      errorType: "deploy",
      module: "redeploy",
      action: "redeploy",
      result: "ok",
      detail: "Push to main triggers Vercel — use CI webhook",
    });
    return { ok: true, detail: "Vercel auto-deploy on git push" };
  }

  try {
    const res = await fetch(`${V25_PROD_BASE}/api/v25/health`, { cache: "no-store" });
    const ok = res.ok;
    recordV25Fix({
      errorType: "deploy",
      module: "redeploy",
      action: "redeploy",
      result: ok ? "ok" : "fail",
      detail: `post-check health ${res.status}`,
    });
    return { ok, detail: `Health check after redeploy: ${res.status}` };
  } catch (e) {
    const msg = (e as Error).message;
    recordV25Fix({
      errorType: "deploy",
      module: "redeploy",
      action: "redeploy",
      result: "fail",
      detail: msg,
    });
    return { ok: false, detail: msg };
  }
}
