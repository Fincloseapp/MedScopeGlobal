import { NextResponse } from "next/server";
import { spawnSync } from "node:child_process";
import path from "node:path";

function runRollbackScript() {
  const script = path.join(process.cwd(), "scripts/deploy/vercel_rollback.mjs");
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (!result.stdout?.trim()) {
    return {
      status: "error",
      error: result.stderr || "rollback produced no output",
    };
  }

  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    return { status: "error", error: "invalid rollback JSON output" };
  }
}

export async function POST() {
  try {
    const result = runRollbackScript();
    const ok = Boolean(result.rolledBackTo);
    return NextResponse.json(result, { status: ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
