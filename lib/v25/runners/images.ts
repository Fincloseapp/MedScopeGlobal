import { runV25ImagePipeline } from "@/lib/v25/images/pipeline";
import { runInlineImageTest } from "@/lib/v25/images/image-test";
import { setCronStatus } from "@/lib/v25/system-state";

export async function runImagesFetch(options?: { maxGenerate?: number }) {
  const t0 = Date.now();
  const result = await runV25ImagePipeline(options);
  const test = await runInlineImageTest();
  setCronStatus(
    "v25-images",
    result.ok && test.ok ? "ok" : "fail",
    Date.now() - t0,
    `${result.detail}; test: ${test.report.pagesOk}/${test.report.pagesChecked.length} pages`,
    {
      generated: result.report.generated,
      failed: result.report.failed,
      ok: result.report.assigned,
    }
  );
  return {
    ok: result.ok && test.ok,
    detail: result.detail,
    imageTest: test.report,
    generated: result.report.generated,
    assigned: result.report.assigned,
    failed: result.report.failed,
    missingBefore: result.report.missingBefore,
  };
}
