import { runV24Pipeline, runV24SectionBatch } from "@/lib/v24/orchestrator";
import type { V24ContentDraft, V24PipelineResult, V24SectionId } from "@/lib/v24/types";
import { runV25Autofix } from "@/lib/v25/autofix";
import { emitV25Alert } from "@/lib/v25/alert";
import { runV25Redeploy } from "@/lib/v25/redeploy";
import { runV25Rollback } from "@/lib/v25/rollback";
import { verifyV25Apis, verifyV25Homepage } from "@/lib/v25/verify";
import { setCronStatus, updateV25TestStatus } from "@/lib/v25/system-state";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";
import type { V25EnterpriseResult } from "@/lib/v25/types";
import {
  runInlineLinkTest,
  runInlineNavMonitor,
  runInlineScreenshotManifest,
} from "@/lib/v25/runners/post-pipeline";

export async function runV25PostPipeline(): Promise<V25EnterpriseResult> {
  const t0 = Date.now();
  const phases: V25EnterpriseResult["phases"] = {};
  const errors: string[] = [];
  let autofixAttempted = false;
  let redeployTriggered = false;
  let rollbackTriggered = false;

  const verifyApi = await verifyV25Apis();
  phases.verify = { ok: verifyApi.ok };
  if (!verifyApi.ok) errors.push("verify: api health fail");

  const homeOk = await verifyV25Homepage();
  phases.homepage = { ok: homeOk };
  if (!homeOk) errors.push("verify: homepage fail");

  updateV25TestStatus({ verifyEngine: verifyApi.ok && homeOk ? "ok" : "fail" });

  const link = await runInlineLinkTest();
  phases.linktest = { ok: link.ok, detail: link.broken ? `${link.broken} broken` : undefined };
  if (!link.ok) errors.push(`linktest: ${link.broken} broken links`);

  const shots = await runInlineScreenshotManifest();
  phases.screenshots = { ok: shots.ok, detail: `${shots.count} pages` };
  if (!shots.ok) errors.push("screenshots: manifest capture fail");

  const nav = await runInlineNavMonitor();
  phases.navmonitor = { ok: nav.ok, detail: nav.broken ? `${nav.broken} broken` : undefined };
  if (!nav.ok) errors.push(`navmonitor: ${nav.broken} nav failures`);

  if (errors.length > 0) {
    autofixAttempted = true;
    for (const err of errors) {
      const [mod] = err.split(":");
      runV25Autofix({ module: mod, errorType: mod, detail: err });
    }
    const redeploy = await runV25Redeploy(errors.join("; "));
    redeployTriggered = true;
    phases.redeploy = { ok: redeploy.ok, detail: redeploy.detail };

    if (!redeploy.ok) {
      rollbackTriggered = true;
      const rb = runV25Rollback("post-autofix redeploy failed");
      phases.rollback = { ok: rb.ok, detail: rb.detail };
      emitV25Alert("rollback", rb.detail, "v25-rollback.log");
    }
  }

  const ok = errors.length === 0;
  setCronStatus("v25-enterprise", ok ? "ok" : "fail", Date.now() - t0, errors.join("; ") || undefined);

  return {
    ok,
    version: V25_ENGINE_VERSION,
    phases,
    autofixAttempted,
    redeployTriggered,
    rollbackTriggered,
    errors,
  };
}

/** v24 pipeline + v25 enterprise post-checks */
export async function runV251Pipeline(
  draft: V24ContentDraft,
  existingTitles: string[] = []
): Promise<V24PipelineResult & { enterprise?: V25EnterpriseResult }> {
  const result = await runV24Pipeline(draft, existingTitles);
  let enterprise: V25EnterpriseResult | undefined;

  if (result.published) {
    enterprise = await runV25PostPipeline();
  }

  return { ...result, enterprise };
}

export async function runV251SectionBatch(sectionId: V24SectionId) {
  const batch = await runV24SectionBatch(sectionId);
  const enterprise = await runV25PostPipeline();
  return { ...batch, enterprise };
}

export async function runV251EnterpriseCron() {
  return runV25PostPipeline();
}
