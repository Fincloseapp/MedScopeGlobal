import { NextResponse } from "next/server";

/** Rollback via Cloudflare Dashboard — Workers → medscopeglobal → Deployments → rollback. */
export async function POST() {
  return NextResponse.json(
    {
      rolledBackTo: null,
      status: "use_cloudflare_dashboard",
      message:
        "Use Cloudflare Dashboard → Workers → medscopeglobal → Deployments to roll back, or re-run GitHub Actions cloudflare-deploy.yml.",
      domain: "https://medscopeglobal.com",
      dashboard: "https://dash.cloudflare.com",
    },
    { status: 200 }
  );
}
