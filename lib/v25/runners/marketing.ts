import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { setCronStatus } from "@/lib/v25/system-state";

export type MarketingPipelineResult = {
  ok: boolean;
  detail?: string;
  marketers?: Record<string, { ok: boolean; proposals?: number }>;
  coordination?: { ok: boolean; approved?: number; rejected?: number; leftPending?: number };
  report?: { ok: boolean; report?: unknown };
  studentAds?: { ok: boolean; detail?: string; updated?: number };
  proAds?: { ok: boolean; detail?: string; updated?: number };
};

async function importMjs(relativePath: string) {
  return import(pathToFileURL(join(process.cwd(), relativePath)).href);
}

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
  let studentAds: MarketingPipelineResult["studentAds"];
  let proAds: MarketingPipelineResult["proAds"];

  if (!options?.skipMarketers) {
    try {
      const publicMod = await importMjs("lib/v25/marketers/marketer-public.mjs");
      const studentMod = await importMjs("lib/v25/marketers/marketer-students.mjs");
      const proMod = await importMjs("lib/v25/marketers/marketer-pro.mjs");
      const coordMod = await importMjs("lib/v25/marketers/marketing-coordinator.mjs");

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

      if (!coord.ok) errors.push("marketing-coordinator failed");
    } catch (e) {
      errors.push(`marketers: ${(e as Error).message}`);
    }
  }

  if (!options?.skipAds) {
    try {
      const studentMod = await importMjs("lib/v25/ads/student-ad-engine.mjs");
      const proMod = await importMjs("lib/v25/ads/pro-ad-engine.mjs");
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
      fetched: (marketers?.public?.proposals ?? 0) + (marketers?.students?.proposals ?? 0) + (marketers?.pro?.proposals ?? 0),
      updates: (studentAds?.updated ?? 0) + (proAds?.updated ?? 0),
    }
  );

  return {
    ok,
    detail: ok ? "marketing pipeline complete" : errors.join("; "),
    marketers,
    coordination,
    report,
    studentAds,
    proAds,
  };
}

export async function runStudentAdEngineStep(options?: { limit?: number }) {
  const mod = await importMjs("lib/v25/ads/student-ad-engine.mjs");
  return mod.runStudentAdEngine(options);
}

export async function runProAdEngineStep(options?: { limit?: number }) {
  const mod = await importMjs("lib/v25/ads/pro-ad-engine.mjs");
  return mod.runProAdEngine(options);
}

export async function runMarketingCoordinatorStep(options?: { forceReport?: boolean }) {
  const mod = await importMjs("lib/v25/marketers/marketing-coordinator.mjs");
  return mod.runMarketingCoordinator(options);
}
