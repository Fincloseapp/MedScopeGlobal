import { importMjs } from "@/lib/v25/import-mjs";
import { setCronStatus } from "@/lib/v25/system-state";

export type MarketingPipelineResult = {
  ok: boolean;
  detail?: string;
  marketers?: Record<string, { ok: boolean; proposals?: number }>;
  coordination?: { ok: boolean; approved?: number; rejected?: number; leftPending?: number };
  report?: { ok: boolean; report?: unknown };
  manualAds?: { ok: boolean; detail?: string; updated?: number };
  studentAds?: { ok: boolean; detail?: string; updated?: number };
  proAds?: { ok: boolean; detail?: string; updated?: number };
};

type MarketerRunResult = { ok: boolean; proposals?: number };
type CoordinatorRunResult = {
  ok: boolean;
  coordination?: MarketingPipelineResult["coordination"];
  report?: MarketingPipelineResult["report"];
};
type AdEngineRunResult = { ok: boolean; detail?: string; updated?: number };

export async function runMarketingPipeline(options?: {
  skipMarketers?: boolean;
  skipAds?: boolean;
  forceReport?: boolean;
  adLimit?: number;
}): Promise<MarketingPipelineResult> {
  const t0 = Date.now();
  const errors: string[] = [];
  let marketers: MarketingPipelineResult["marketers"];
  let coordination: MarketingPipelineResult["coordination"];
  let report: MarketingPipelineResult["report"];
  let manualAds: MarketingPipelineResult["manualAds"];
  let studentAds: MarketingPipelineResult["studentAds"];
  let proAds: MarketingPipelineResult["proAds"];

  if (!options?.skipMarketers) {
    try {
      const publicMod = await importMjs<{ runPublicMarketer: () => Promise<MarketerRunResult> }>(
        "lib/v25/marketers/marketer-public.mjs"
      );
      const studentMod = await importMjs<{ runStudentMarketer: () => Promise<MarketerRunResult> }>(
        "lib/v25/marketers/marketer-students.mjs"
      );
      const proMod = await importMjs<{ runProMarketer: () => Promise<MarketerRunResult> }>(
        "lib/v25/marketers/marketer-pro.mjs"
      );
      const coordMod = await importMjs<{
        runMarketingCoordinator: (opts?: { forceReport?: boolean }) => Promise<CoordinatorRunResult>;
      }>("lib/v25/marketers/marketing-coordinator.mjs");

      const [pub, stu, pro] = await Promise.all([
        publicMod.runPublicMarketer(),
        studentMod.runStudentMarketer(),
        proMod.runProMarketer(),
      ]);

      marketers = {
        public: { ok: pub.ok, proposals: pub.proposals },
        students: { ok: stu.ok, proposals: stu.proposals },
        pro: { ok: pro.ok, proposals: pro.proposals },
      };

      const coord = await coordMod.runMarketingCoordinator({ forceReport: options?.forceReport });
      coordination = coord.coordination;
      report = coord.report ?? undefined;

      if (!options?.skipAds) {
        const manualMod = await importMjs<{
          runManualAdInserter: (opts?: { limit?: number }) => Promise<AdEngineRunResult>;
        }>("lib/v25/ads/manual-ad-inserter.mjs");
        manualAds = await manualMod.runManualAdInserter({ limit: options?.adLimit ?? 24 });
        if (!manualAds.ok) errors.push(`manual-ads: ${manualAds.detail}`);
      }

      if (!coord.ok) errors.push("marketing-coordinator failed");
    } catch (e) {
      errors.push(`marketers: ${(e as Error).message}`);
    }
  }

  if (!options?.skipAds) {
    try {
      if (!manualAds) {
        const manualMod = await importMjs<{
          runManualAdInserter: (opts?: { limit?: number }) => Promise<AdEngineRunResult>;
        }>("lib/v25/ads/manual-ad-inserter.mjs");
        manualAds = await manualMod.runManualAdInserter({ limit: options?.adLimit ?? 24 });
        if (!manualAds.ok) errors.push(`manual-ads: ${manualAds.detail}`);
      }

      const studentMod = await importMjs<{
        runStudentAdEngine: (opts?: { limit?: number }) => Promise<AdEngineRunResult>;
      }>("lib/v25/ads/student-ad-engine.mjs");
      const proMod = await importMjs<{
        runProAdEngine: (opts?: { limit?: number }) => Promise<AdEngineRunResult>;
      }>("lib/v25/ads/pro-ad-engine.mjs");
      studentAds = await studentMod.runStudentAdEngine({ limit: options?.adLimit ?? 24 });
      proAds = await proMod.runProAdEngine({ limit: options?.adLimit ?? 24 });
      if (!studentAds.ok) errors.push(`student-ads: ${studentAds.detail}`);
      if (!proAds.ok) errors.push(`pro-ads: ${proAds.detail}`);
    } catch (e) {
      errors.push(`ad-engines: ${(e as Error).message}`);
    }
  }

  const ok = errors.length === 0;
  setCronStatus(
    "marketing",
    ok ? "ok" : "fail",
    Date.now() - t0,
    errors.join("; ") || `marketers + ads complete`,
    {
      fetched:
        (marketers?.public?.proposals ?? 0) + (marketers?.students?.proposals ?? 0) + (marketers?.pro?.proposals ?? 0),
      updates: (manualAds?.updated ?? 0) + (studentAds?.updated ?? 0) + (proAds?.updated ?? 0),
    }
  );

  return {
    ok,
    detail: ok ? "marketing pipeline complete" : errors.join("; "),
    marketers,
    coordination,
    report,
    manualAds,
    studentAds,
    proAds,
  };
}

export async function runManualAdInserterStep(options?: { limit?: number }): Promise<AdEngineRunResult> {
  const mod = await importMjs<{ runManualAdInserter: (opts?: { limit?: number }) => Promise<AdEngineRunResult> }>(
    "lib/v25/ads/manual-ad-inserter.mjs"
  );
  return mod.runManualAdInserter(options);
}

export async function runStudentAdEngineStep(options?: { limit?: number }): Promise<AdEngineRunResult> {
  const mod = await importMjs<{ runStudentAdEngine: (opts?: { limit?: number }) => Promise<AdEngineRunResult> }>(
    "lib/v25/ads/student-ad-engine.mjs"
  );
  return mod.runStudentAdEngine(options);
}

export async function runProAdEngineStep(options?: { limit?: number }): Promise<AdEngineRunResult> {
  const mod = await importMjs<{ runProAdEngine: (opts?: { limit?: number }) => Promise<AdEngineRunResult> }>(
    "lib/v25/ads/pro-ad-engine.mjs"
  );
  return mod.runProAdEngine(options);
}

export async function runMarketingCoordinatorStep(options?: { forceReport?: boolean }): Promise<CoordinatorRunResult> {
  const mod = await importMjs<{
    runMarketingCoordinator: (opts?: { forceReport?: boolean }) => Promise<CoordinatorRunResult>;
  }>("lib/v25/marketers/marketing-coordinator.mjs");
  return mod.runMarketingCoordinator(options);
}
