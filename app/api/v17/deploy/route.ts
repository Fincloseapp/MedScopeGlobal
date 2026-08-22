import { NextResponse } from "next/server";
import { preDeployCheck } from "@/edge/v17/pre-deploy-check";
import { getVersion } from "@/lib/v17/versioning/version";

const AUTO_DEPLOY = {
  method: "npm run deploy",
  domain: "https://medscopeglobal.com",
  provider: "Cloudflare Workers OpenNext",
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

/** Production upload is Cloudflare Workers from D: — `npm run deploy`. */
export async function POST() {
  return NextResponse.json(
    {
      deployed: false,
      status: "auto_deploy",
      message: "Production is Cloudflare Workers. From D: run npm run deploy (or npm run upload if .open-next exists).",
      instructions: ["cd D:\\MedScopeGlobal\\marketing-hub-deploy", "npm run deploy"],
      ...AUTO_DEPLOY,
    },
    { status: 200 }
  );
}
