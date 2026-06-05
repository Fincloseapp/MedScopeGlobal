import { NextResponse } from "next/server";
import { preDeployCheck } from "@/edge/v17/pre-deploy-check";
import { getVersion } from "@/lib/v17/versioning/version";
import { spawnSync } from "node:child_process";
import path from "node:path";

function runProductionDeployScript() {
  const script = path.join(process.cwd(), "scripts/deploy/vercel_production.mjs");
  const result = spawnSync(process.execPath, [script, "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });

  const output = result.stdout?.trim() || result.stderr?.trim();
  if (!output) {
    return { deployed: false, status: "error", error: "deploy produced no output" };
  }

  try {
    return JSON.parse(output);
  } catch {
    return { deployed: false, status: "error", error: "invalid deploy JSON output" };
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: getVersion(),
  });
}

/** Pre-deploy readiness check (legacy POST contract). */
export async function PUT() {
  try {
    const result = await preDeployCheck();
    return NextResponse.json(result, { status: result.ready ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        issues: [error instanceof Error ? error.message : String(error)],
      },
      { status: 500 }
    );
  }
}

/** Trigger V17 production deploy pipeline. */
export async function POST() {
  try {
    const result = runProductionDeployScript();
    const httpStatus = result.deployed ? 200 : 503;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    return NextResponse.json(
      {
        deployed: false,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
