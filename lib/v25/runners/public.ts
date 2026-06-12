import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { setCronStatus } from "@/lib/v25/system-state";

export type PublicArticlesFetchResult = {
  ok: boolean;
  detail?: string;
  generated?: number;
  persisted?: { files: number; db: number; failed: number };
  adEngine?: { ok: boolean; detail?: string; updated?: number };
};

export type AdEngineStepResult = { ok: boolean; detail?: string; updated?: number };

type PublicWritersReport = {
  ok: boolean;
  articles?: { length: number };
  persisted?: { files?: number; db?: number; failed?: number };
};

type PublicWritersModule = {
  runPublicWriters: (opts?: object) => Promise<PublicWritersReport>;
};

type PublicAdEngineModule = {
  runPublicAdEngine: (opts?: object) => Promise<AdEngineStepResult | undefined>;
};

export async function runPublicArticlesFetch(options?: {
  limitPerWriter?: number;
  skipAds?: boolean;
}): Promise<PublicArticlesFetchResult> {
  const t0 = Date.now();

  if (process.env.VERCEL === "1") {
    const writersMod = (await import("../writers/run-public-writers.mjs")) as unknown as PublicWritersModule;
    const report = await writersMod.runPublicWriters({
      limitPerWriter: options?.limitPerWriter ?? 1,
      skipAds: options?.skipAds ?? false,
    });

    let adEngine: PublicArticlesFetchResult["adEngine"];
    if (!options?.skipAds) {
      const adsMod = (await import("../ads/public-ad-engine.mjs")) as unknown as PublicAdEngineModule;
      adEngine = await adsMod.runPublicAdEngine({ limit: 24 });
    }

    const ok = report.ok && (adEngine?.ok !== false);
    setCronStatus(
      "public-articles",
      ok ? "ok" : "fail",
      Date.now() - t0,
      `generated ${report.articles?.length ?? 0}; db ${report.persisted?.db ?? 0}`,
      { newArticles: report.persisted?.db ?? 0, fetched: report.articles?.length ?? 0 }
    );

    return {
      ok,
      detail: `${report.articles?.length ?? 0} článků`,
      generated: report.articles?.length,
      persisted: report.persisted
        ? {
            files: report.persisted.files ?? 0,
            db: report.persisted.db ?? 0,
            failed: report.persisted.failed ?? 0,
          }
        : undefined,
      adEngine,
    };
  }

  const script = join(process.cwd(), "lib/v25/writers/run-public-writers.mjs");
  const result = spawnSync(process.execPath, [script], { encoding: "utf8", timeout: 300000 });
  const ok = result.status === 0;
  setCronStatus("public-articles", ok ? "ok" : "fail", Date.now() - t0, result.stderr || undefined);
  return { ok, detail: ok ? "local run complete" : result.stderr?.slice(0, 200) };
}

export async function runPublicAdEngineStep(options?: { limit?: number }): Promise<AdEngineStepResult> {
  const adsMod = (await import("../ads/public-ad-engine.mjs")) as unknown as PublicAdEngineModule;
  const result = await adsMod.runPublicAdEngine(options);
  return result ?? { ok: false, detail: "public-ad-engine returned no result" };
}
