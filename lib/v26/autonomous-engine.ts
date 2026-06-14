import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { runV26RewriteBackfill } from "@/lib/v26/backfill";
import { runV26ForeignNewsIngest } from "@/lib/v26/foreign-news-ingest";
import { runImagesFetch } from "@/lib/v25/runners/images";
import { runV25TestSuite } from "@/lib/v25/tests/run-suite";
import { verifyV25Apis, verifyV25Homepage } from "@/lib/v25/verify";
import { V26_ENGINE_VERSION } from "@/lib/v26/version";
import { V25_PROD_BASE } from "@/lib/v25/config";

export interface V26AutonomousPhase {
  ok: boolean;
  detail?: string;
}

export interface V26AutonomousResult {
  ok: boolean;
  version: string;
  phases: Record<string, V26AutonomousPhase>;
  errors: string[];
  deploy?: { sha?: string; url?: string };
  retries: number;
}

const MAX_DEPLOY_RETRIES = 2;

async function runSmokeOnProduction(): Promise<V26AutonomousPhase> {
  try {
    const suite = await runV25TestSuite(V25_PROD_BASE);
    return {
      ok: suite.ok,
      detail: suite.cases.map((c) => `${c.id}:${c.ok ? "ok" : "fail"}`).join(", "),
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

function runLocalPredeploy(): V26AutonomousPhase {
  if (process.env.VERCEL === "1") {
    return { ok: true, detail: "skipped on Vercel" };
  }
  const script = join(process.cwd(), "scripts/run-predeploy-gates.mjs");
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    timeout: 600_000,
    cwd: process.cwd(),
  });
  return {
    ok: result.status === 0,
    detail: result.status === 0 ? "predeploy gates passed" : result.stderr?.slice(0, 200),
  };
}

function runLocalPush(): V26AutonomousPhase & { sha?: string } {
  if (process.env.VERCEL === "1") {
    return { ok: true, detail: "push via CI only" };
  }
  const msg = process.env.DEPLOY_COMMIT_MESSAGE ?? "feat: MedScope v26 autonomous deploy";
  const ps1 = join(process.cwd(), "scripts/push-d-to-github.ps1");
  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1],
    {
      encoding: "utf8",
      timeout: 600_000,
      cwd: process.cwd(),
      env: { ...process.env, DEPLOY_COMMIT_MESSAGE: msg },
    }
  );
  const shaMatch = result.stdout?.match(/[0-9a-f]{7,40}/i);
  return {
    ok: result.status === 0,
    detail: result.status === 0 ? "pushed to main" : result.stderr?.slice(0, 300),
    sha: shaMatch?.[0],
  };
}

async function pollVercelReady(): Promise<V26AutonomousPhase> {
  if (process.env.VERCEL === "1") {
    return { ok: true, detail: "running on Vercel" };
  }
  try {
    const script = join(process.cwd(), "scripts/trigger-vercel-production.mjs");
    const result = spawnSync(process.execPath, [script], {
      encoding: "utf8",
      timeout: 900_000,
      cwd: process.cwd(),
    });
    return {
      ok: result.status === 0,
      detail: result.stdout?.includes("READY") ? "Vercel READY" : result.stderr?.slice(0, 200),
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

export async function runV26AutonomousEngine(options?: {
  skipDeploy?: boolean;
  rewriteBatch?: number;
}): Promise<V26AutonomousResult> {
  const phases: Record<string, V26AutonomousPhase> = {};
  const errors: string[] = [];
  let retries = 0;

  const healthApi = await verifyV25Apis();
  phases.healthApi = { ok: healthApi.ok, detail: healthApi.ok ? "API ok" : "API fail" };
  if (!healthApi.ok) errors.push("health: api");

  const healthHome = await verifyV25Homepage();
  phases.healthHome = { ok: healthHome, detail: healthHome ? "homepage ok" : "homepage fail" };
  if (!healthHome) errors.push("health: homepage");

  const rewrite = await runV26RewriteBackfill({ batchSize: options?.rewriteBatch ?? 6 });
  phases.rewrite = {
    ok: rewrite.updated > 0 || rewrite.processed === 0,
    detail: `updated ${rewrite.updated}/${rewrite.processed}`,
  };
  if (rewrite.errors.length) errors.push(...rewrite.errors.slice(0, 3));

  const foreign = await runV26ForeignNewsIngest({ maxArticles: 6 });
  phases.foreignIngest = {
    ok: foreign.errors.length === 0 || foreign.created > 0,
    detail: `created ${foreign.created}, skipped ${foreign.skipped}`,
  };
  if (foreign.errors.length) errors.push(...foreign.errors.slice(0, 3));

  const images = await runImagesFetch({ maxGenerate: 12, backfillMax: 12 });
  phases.images = { ok: images.ok, detail: images.detail };
  if (!images.ok) errors.push("images: pipeline");

  if (!options?.skipDeploy && process.env.VERCEL !== "1") {
    let deployOk = false;
    while (retries <= MAX_DEPLOY_RETRIES && !deployOk) {
      const predeploy = runLocalPredeploy();
      phases[`predeploy_${retries}`] = predeploy;
      if (!predeploy.ok) {
        errors.push("predeploy failed");
        retries++;
        continue;
      }

      const push = runLocalPush();
      phases[`push_${retries}`] = push;
      if (!push.ok) {
        errors.push("git push failed");
        retries++;
        continue;
      }

      const vercel = await pollVercelReady();
      phases[`vercel_${retries}`] = vercel;
      if (!vercel.ok) {
        errors.push("vercel not ready");
        retries++;
        continue;
      }

      deployOk = true;
    }
  } else {
    phases.deploy = { ok: true, detail: "deploy skipped or Vercel runtime" };
  }

  const smoke = await runSmokeOnProduction();
  phases.smoke = smoke;
  if (!smoke.ok) errors.push("smoke tests failed");

  const ok =
    healthApi.ok &&
    healthHome &&
    smoke.ok &&
    (phases.deploy?.ok !== false) &&
    errors.filter((e) => !e.includes("foreign")).length < 5;

  return {
    ok,
    version: V26_ENGINE_VERSION,
    phases,
    errors,
    retries,
  };
}
