import { runLegacyImageBackfill } from "@/lib/v25/images/backfill-legacy";
import { runV25ImagePipeline } from "@/lib/v25/images/pipeline";
import { runInlineImageTest } from "@/lib/v25/images/image-test";
import { setCronStatus } from "@/lib/v25/system-state";

export async function runImagesFetch(options?: { maxGenerate?: number; backfillMax?: number }) {
  const t0 = Date.now();
  const backfill = await runLegacyImageBackfill(options?.backfillMax ?? 48);
  const result = await runV25ImagePipeline(options);
  const test = await runInlineImageTest();
  setCronStatus(
    "v25-images",
    result.ok && test.ok ? "ok" : "fail",
    Date.now() - t0,
    `backfill ${backfill.updated}/${backfill.legacyFound}; ${result.detail}; test: ${test.report.pagesOk}/${test.report.pagesChecked.length} pages`,
    {
      generated: result.report.generated,
      failed: result.report.failed,
      ok: result.report.assigned,
    }
  );
  return {
    ok: result.ok && test.ok,
    detail: result.detail,
    backfill,
    imageTest: test.report,
    generated: result.report.generated,
    assigned: result.report.assigned,
    failed: result.report.failed,
    missingBefore: result.report.missingBefore,
  };
}
