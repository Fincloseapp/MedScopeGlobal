import { runV25ImagePipeline } from "@/lib/v25/images/pipeline";
import { setCronStatus } from "@/lib/v25/system-state";

export async function runImagesFetch(options?: { maxGenerate?: number }) {
  const t0 = Date.now();
  const result = await runV25ImagePipeline(options);
  setCronStatus(
    "v25-images",
    result.ok ? "ok" : "fail",
    Date.now() - t0,
    result.detail,
    {
      generated: result.report.generated,
      failed: result.report.failed,
      ok: result.report.assigned,
    }
  );
  return {
    ok: result.ok,
    detail: result.detail,
    generated: result.report.generated,
    assigned: result.report.assigned,
    failed: result.report.failed,
    missingBefore: result.report.missingBefore,
  };
}
