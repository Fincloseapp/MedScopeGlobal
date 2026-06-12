import { runV24Pipeline, runV24SectionBatch } from "@/lib/v24/orchestrator";
import type { V24ContentDraft, V24PipelineResult, V24SectionId } from "@/lib/v24/types";
import { runV25Autofix } from "@/lib/v25/autofix";
import { emitV25Alert } from "@/lib/v25/alert";
import { runV25Redeploy } from "@/lib/v25/redeploy";
import { runV25Rollback } from "@/lib/v25/rollback";
import { verifyV25Apis, verifyV25Homepage } from "@/lib/v25/verify";
import {
  recordV25PipelineSkippedFixes,
  saveV25SystemStateAsync,
  setCronStatus,
  updateV25TestStatus,
  loadV25SystemState,
  hydrateV25SystemStateFromDb,
} from "@/lib/v25/system-state";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";
import type { V25EnterpriseResult } from "@/lib/v25/types";
import {
  runInlineLinkTest,
  runInlineNavMonitor,
  runInlineScreenshotManifest,
} from "@/lib/v25/runners/post-pipeline";
import { runInlineImageTest } from "@/lib/v25/images/image-test";
import { runUniversitiesFetch } from "@/lib/v25/runners/universities";
import { runImagesFetch } from "@/lib/v25/runners/images";
import { runPublicArticlesFetch, runPublicAdEngineStep } from "@/lib/v25/runners/public";
import {
  runStudentAdEngineStep,
  runProAdEngineStep,
  runMarketingCoordinatorStep,
} from "@/lib/v25/runners/marketing";
import { runV25TestSuite } from "@/lib/v25/tests/run-suite";

export type V25PipelineMode = "full" | "quick" | "suite";

/** Rychlé QA testy pro admin — bez backfillu obrázků a sběru univerzit. */
export async function runV25QuickPipeline(): Promise<V25EnterpriseResult> {
  await hydrateV25SystemStateFromDb();
  const t0 = Date.now();
  const phases: V25EnterpriseResult["phases"] = {};
  const errors: string[] = [];

  const verifyApi = await verifyV25Apis();
  phases.verify = { ok: verifyApi.ok };
  if (!verifyApi.ok) errors.push("verify: api health fail");

  const homeOk = await verifyV25Homepage();
  phases.homepage = { ok: homeOk };
  if (!homeOk) errors.push("verify: homepage fail");

  updateV25TestStatus({ verifyEngine: verifyApi.ok && homeOk ? "ok" : "fail" });

  const link = await runInlineLinkTest({ skipImageUrls: true });
  phases.linktest = { ok: link.ok, detail: link.broken ? `${link.broken} broken` : undefined };
  if (!link.ok) errors.push(`linktest: ${link.broken} broken links`);

  const shots = await runInlineScreenshotManifest();
  phases.screenshots = { ok: shots.ok, detail: `${shots.count} pages` };
  if (!shots.ok) errors.push("screenshots: manifest capture fail");

  const nav = await runInlineNavMonitor();
  phases.navmonitor = { ok: nav.ok, detail: nav.broken ? `${nav.broken} broken` : undefined };
  if (!nav.ok) errors.push(`navmonitor: ${nav.broken} nav failures`);

  updateV25TestStatus({ imagePipeline: "skipped" });

  const imageTest = await runInlineImageTest();
  phases.imageTest = {
    ok: imageTest.ok,
    detail: `${imageTest.report.urlsOk}/${imageTest.report.urlsChecked} URL · ${imageTest.report.pagesOk}/${imageTest.report.pagesChecked.length} stránek`,
  };
  if (!imageTest.ok) errors.push(`imagetest: ${imageTest.report.urlsBroken.length} broken urls`);

  const publicArticles = await runPublicArticlesFetch({ limitPerWriter: 1 });
  phases.publicArticles = {
    ok: publicArticles.ok,
    detail: publicArticles.detail ?? `${publicArticles.generated ?? 0} článků`,
  };
  if (!publicArticles.ok) errors.push(`public-articles: ${publicArticles.detail ?? "fetch failed"}`);

  const publicAds = await runPublicAdEngineStep({ limit: 24 });
  phases.publicAdEngine = {
    ok: publicAds.ok,
    detail: publicAds.detail ?? `${publicAds.updated ?? 0} patched`,
  };
  if (!publicAds.ok) errors.push(`public-ad-engine: ${publicAds.detail ?? "failed"}`);

  const studentAds = await runStudentAdEngineStep({ limit: 24 });
  phases.studentAdEngine = {
    ok: studentAds.ok,
    detail: studentAds.detail ?? `${studentAds.updated ?? 0} patched`,
  };
  if (!studentAds.ok) errors.push(`student-ad-engine: ${studentAds.detail ?? "failed"}`);

  const proAds = await runProAdEngineStep({ limit: 24 });
  phases.proAdEngine = {
    ok: proAds.ok,
    detail: proAds.detail ?? `${proAds.updated ?? 0} patched`,
  };
  if (!proAds.ok) errors.push(`pro-ad-engine: ${proAds.detail ?? "failed"}`);

  const marketing = await runMarketingCoordinatorStep();
  phases.marketingCoordinator = {
    ok: marketing.ok,
    detail: `approved ${marketing.coordination?.approved ?? 0}, pending ${marketing.coordination?.leftPending ?? 0}`,
  };
  if (!marketing.ok) errors.push("marketing-coordinator: failed");

  const ok = errors.length === 0;
  setCronStatus("v25-enterprise", ok ? "ok" : "fail", Date.now() - t0, errors.join("; ") || undefined);

  if (ok) {
    recordV25PipelineSkippedFixes();
  }

  const persisted = await saveV25SystemStateAsync(loadV25SystemState());
  if (!persisted) {
    errors.push("persist: v25_system_snapshot — spusťte npm run db:setup");
  }

  return {
    ok: ok && persisted,
    version: V25_ENGINE_VERSION,
    phases: { ...phases, persist: { ok: persisted } },
    autofixAttempted: false,
    redeployTriggered: false,
    rollbackTriggered: false,
    errors,
    persisted,
  };
}

export async function runV25PostPipeline(options?: { mode?: V25PipelineMode }): Promise<V25EnterpriseResult> {
  if (options?.mode === "suite") {
    const suite = await runV25TestSuite();
    return {
      ok: suite.ok && suite.persisted !== false,
      version: V25_ENGINE_VERSION,
      phases: Object.fromEntries(
        suite.cases.map((c) => [c.id, { ok: c.ok, detail: c.detail }])
      ),
      autofixAttempted: false,
      redeployTriggered: false,
      rollbackTriggered: false,
      errors: suite.cases.filter((c) => !c.ok).map((c) => `${c.id}: ${c.detail ?? "fail"}`),
      persisted: suite.persisted,
    };
  }

  if (options?.mode === "quick") {
    return runV25QuickPipeline();
  }

  await hydrateV25SystemStateFromDb();
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

  const universities = await runUniversitiesFetch();
  phases.universities = { ok: universities.ok, detail: universities.detail };
  if (!universities.ok) errors.push("universities: provider fetch failed");

  const images = await runImagesFetch({ maxGenerate: 48 });
  phases.image = { ok: images.ok, detail: images.detail };
  if (!images.ok) {
    errors.push(`images: ${images.detail ?? "pipeline failed"}`);
    runV25Autofix({ module: "images", errorType: "images", detail: images.detail ?? "missing images" });
    const retry = await runImagesFetch({ maxGenerate: 8 });
    phases.imageRetry = { ok: retry.ok, detail: retry.detail };
    if (retry.ok) {
      errors.pop();
      phases.image = { ok: true, detail: retry.detail };
    }
  }

  const imageTest = await runInlineImageTest();
  phases.imageTest = {
    ok: imageTest.ok,
    detail: `${imageTest.report.urlsOk}/${imageTest.report.urlsChecked} URL · ${imageTest.report.pagesOk}/${imageTest.report.pagesChecked.length} stránek`,
  };
  if (!imageTest.ok) errors.push(`imagetest: ${imageTest.report.urlsBroken.length} broken urls`);

  const publicArticles = await runPublicArticlesFetch({ limitPerWriter: 1 });
  phases.publicArticles = {
    ok: publicArticles.ok,
    detail: publicArticles.detail ?? `${publicArticles.generated ?? 0} článků`,
  };
  if (!publicArticles.ok) errors.push(`public-articles: ${publicArticles.detail ?? "fetch failed"}`);

  const publicAds = await runPublicAdEngineStep({ limit: 24 });
  phases.publicAdEngine = {
    ok: publicAds.ok,
    detail: publicAds.detail ?? `${publicAds.updated ?? 0} patched`,
  };
  if (!publicAds.ok) errors.push(`public-ad-engine: ${publicAds.detail ?? "failed"}`);

  const studentAds = await runStudentAdEngineStep({ limit: 24 });
  phases.studentAdEngine = {
    ok: studentAds.ok,
    detail: studentAds.detail ?? `${studentAds.updated ?? 0} patched`,
  };
  if (!studentAds.ok) errors.push(`student-ad-engine: ${studentAds.detail ?? "failed"}`);

  const proAds = await runProAdEngineStep({ limit: 24 });
  phases.proAdEngine = {
    ok: proAds.ok,
    detail: proAds.detail ?? `${proAds.updated ?? 0} patched`,
  };
  if (!proAds.ok) errors.push(`pro-ad-engine: ${proAds.detail ?? "failed"}`);

  const marketing = await runMarketingCoordinatorStep();
  phases.marketingCoordinator = {
    ok: marketing.ok,
    detail: `approved ${marketing.coordination?.approved ?? 0}, pending ${marketing.coordination?.leftPending ?? 0}`,
  };
  if (!marketing.ok) errors.push("marketing-coordinator: failed");

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

  if (ok) {
    recordV25PipelineSkippedFixes();
  }

  const persisted = await saveV25SystemStateAsync(loadV25SystemState());
  if (!persisted) {
    errors.push("persist: v25_system_snapshot — spusťte npm run db:setup");
  }

  return {
    ok: ok && persisted,
    version: V25_ENGINE_VERSION,
    phases: { ...phases, persist: { ok: persisted } },
    autofixAttempted,
    redeployTriggered,
    rollbackTriggered,
    errors,
    persisted,
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
