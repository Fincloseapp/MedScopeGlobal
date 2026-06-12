import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { importMjs } from "@/lib/v25/import-mjs";
import { setCronStatus } from "@/lib/v25/system-state";

export type PublicArticlesFetchResult = {
  ok: boolean;
  detail?: string;
  generated?: number;
  persisted?: { files: number; db: number; failed: number };
  adEngine?: { ok: boolean; detail?: string; updated?: number };
};

export async function runPublicArticlesFetch(options?: {
  limitPerWriter?: number;
  skipAds?: boolean;
}): Promise<PublicArticlesFetchResult> {
  const t0 = Date.now();

  if (process.env.VERCEL === "1") {
    const writersMod = await importMjs<{ runPublicWriters: (opts?: object) => Promise<{
      ok: boolean;
      articles?: { length: number } & unknown[];
      persisted?: { db?: number };
    }> }>("lib/v25/writers/run-public-writers.mjs");
    const report = await writersMod.runPublicWriters({
      limitPerWriter: options?.limitPerWriter ?? 1,
      skipAds: options?.skipAds ?? false,
    });

    let adEngine: PublicArticlesFetchResult["adEngine"];
    if (!options?.skipAds) {
      const adsMod = await importMjs<{ runPublicAdEngine: (opts?: object) => Promise<PublicArticlesFetchResult["adEngine"]> }>(
        "lib/v25/ads/public-ad-engine.mjs"
      );
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
      persisted: report.persisted,
      adEngine,
    };
  }

  const script = join(process.cwd(), "lib/v25/writers/run-public-writers.mjs");
  const result = spawnSync(process.execPath, [script], { encoding: "utf8", timeout: 300000 });
  const ok = result.status === 0;
  setCronStatus("public-articles", ok ? "ok" : "fail", Date.now() - t0, result.stderr || undefined);
  return { ok, detail: ok ? "local run complete" : result.stderr?.slice(0, 200) };
}

export async function runPublicAdEngineStep(options?: { limit?: number }) {
  const adsMod = await importMjs<{ runPublicAdEngine: (opts?: object) => Promise<PublicArticlesFetchResult["adEngine"]> }>(
    "lib/v25/ads/public-ad-engine.mjs"
  );
  return adsMod.runPublicAdEngine(options);
}
