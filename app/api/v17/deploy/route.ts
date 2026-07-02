import { NextResponse } from "next/server";
import { preDeployCheck } from "@/edge/v17/pre-deploy-check";
import { getVersion } from "@/lib/v17/versioning/version";

const AUTO_DEPLOY = {
  method: "git push origin main",
  domain: "https://medscopeglobal.com",
  provider: "Vercel Git Integration",
  productionBranch: "main",
};

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: getVersion(),
    autoDeploy: AUTO_DEPLOY,
  });
}

/** Pre-deploy readiness check. */
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

/** Deploy is handled by Vercel on push to main — no local script. */
export async function POST() {
  return NextResponse.json(
    {
      deployed: false,
      status: "auto_deploy",
      message: "Production deploys via Vercel Git Integration on push to main.",
      instructions: ["git add -A", 'git commit -m "feat: update"', "git push origin main"],
      ...AUTO_DEPLOY,
    },
    { status: 200 }
  );
}
